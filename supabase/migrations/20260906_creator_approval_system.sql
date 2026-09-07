-- =============================================================================
-- CREATOR APPROVAL SYSTEM
-- Adds waitlist/approval workflow with Pro "skip the line" integration
-- Migration Date: 2026-09-06
-- =============================================================================

-- Add approval status tracking to creators table
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending'
  CHECK (approval_status IN ('pending', 'approved', 'rejected', 'pro_approved')),
ADD COLUMN IF NOT EXISTS approval_queue_position INTEGER,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by INTEGER, -- References users.id (admin who approved)
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approval_email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS waitlist_joined_at TIMESTAMPTZ;

-- Create indexes for efficient approval queue queries
CREATE INDEX IF NOT EXISTS idx_creators_approval_queue
ON creators(approval_status, created_at)
WHERE approval_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_creators_pending_approval
ON creators(approval_status, created_at DESC)
WHERE approval_status = 'pending';

-- =============================================================================
-- APPROVAL AUDIT LOG
-- Track all approval decisions for compliance and analytics
-- =============================================================================

CREATE TABLE IF NOT EXISTS creator_approval_audit (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL REFERENCES creators(id),
  admin_user_id INTEGER, -- NULL for auto-approvals (Pro subscriptions)
  previous_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  reason TEXT,
  metadata JSONB, -- Store additional context (e.g., Pro tier, subscription_id)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approval_audit_creator ON creator_approval_audit(creator_id);
CREATE INDEX IF NOT EXISTS idx_approval_audit_admin ON creator_approval_audit(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_approval_audit_created ON creator_approval_audit(created_at DESC);

-- =============================================================================
-- GRANDFATHER EXISTING CREATORS
-- All existing creators (before this migration) get auto-approved
-- This prevents disruption to current users
-- =============================================================================

-- Grandfather all existing creators by approving those created before this migration
-- Using created_at < NOW() ensures we only approve existing users, not future signups
UPDATE creators
SET
  approval_status = 'approved',
  approved_at = NOW(),
  approved_by = NULL -- NULL indicates system auto-approval
WHERE
  created_at < NOW() -- Approve all creators that exist before this migration runs
  AND approval_status = 'pending'; -- Only update pending status (don't override approved/rejected)

-- Log grandfather approvals in audit table
INSERT INTO creator_approval_audit (creator_id, admin_user_id, previous_status, new_status, reason, metadata)
SELECT
  id, -- Use the primary key 'id' from creators table
  NULL, -- NULL admin_user_id = system approval
  'pending',
  'approved',
  'Grandfathered - existing creator before waitlist system',
  jsonb_build_object('auto_approved', true, 'migration', '20260906_creator_approval_system', 'created_at', created_at::text)
FROM creators
WHERE created_at < NOW() AND approval_status = 'approved' AND approved_at IS NOT NULL;

-- =============================================================================
-- COMMENTS & DOCUMENTATION
-- =============================================================================

COMMENT ON COLUMN creators.approval_status IS 'Creator approval status: pending (in waitlist), approved (manually approved), pro_approved (auto-approved via Pro subscription), rejected (denied access)';
COMMENT ON COLUMN creators.approval_queue_position IS 'Cached position in approval queue (updated by cron job every 15 minutes)';
COMMENT ON COLUMN creators.approved_by IS 'User ID of admin who approved (NULL for auto-approvals via Pro or grandfathering)';
COMMENT ON COLUMN creators.waitlist_joined_at IS 'Timestamp when creator first viewed waitlist page after completing onboarding';
COMMENT ON TABLE creator_approval_audit IS 'Audit log of all approval status changes with admin attribution and reasons';

-- =============================================================================
-- MIGRATION COMPLETE
-- Next steps:
-- 1. Deploy backend API endpoints for approval workflow
-- 2. Deploy frontend components (Waitlist.js, route guards)
-- 3. Set up cron job to update approval_queue_position every 15 minutes
-- =============================================================================
