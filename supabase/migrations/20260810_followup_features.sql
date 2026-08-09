-- Follow-up Features Migration
-- Adds columns for AI follow-up generation and auto follow-up notifications

-- =============================================================================
-- CREATOR_PIPELINE TABLE: Store original pitch for follow-up context
-- =============================================================================

-- Store original pitch content so follow-ups can reference it
ALTER TABLE creator_pipeline
ADD COLUMN IF NOT EXISTS original_pitch_subject TEXT,
ADD COLUMN IF NOT EXISTS original_pitch_body TEXT;

-- Track which reminder notifications have been sent
ALTER TABLE creator_pipeline
ADD COLUMN IF NOT EXISTS day_6_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS day_10_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS day_14_reminder_sent BOOLEAN DEFAULT FALSE;

-- Index for efficient follow-up reminder queries
CREATE INDEX IF NOT EXISTS idx_creator_pipeline_followup_reminders
ON creator_pipeline(creator_id, pitched_at, stage)
WHERE stage IN ('waiting', 'pitched') AND send_confirmed = TRUE;

-- =============================================================================
-- CREATORS TABLE: Notification preferences
-- =============================================================================

-- Allow users to opt-out of follow-up reminder notifications
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS followup_notifications_enabled BOOLEAN DEFAULT TRUE;

-- Track last follow-up notification sent (for rate limiting)
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS last_followup_notification_at TIMESTAMPTZ;

-- =============================================================================
-- FOLLOWUP_REMINDER_SENDS TABLE: Audit log for follow-up reminders
-- =============================================================================

CREATE TABLE IF NOT EXISTS followup_reminder_sends (
  id SERIAL PRIMARY KEY,
  creator_id INTEGER NOT NULL,
  pipeline_id INTEGER NOT NULL,
  brand_name TEXT NOT NULL,
  reminder_type VARCHAR(20) NOT NULL, -- 'day_6', 'day_10', 'day_14'
  email_address TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  clicked_at TIMESTAMPTZ,
  followup_sent BOOLEAN DEFAULT FALSE,
  UNIQUE(creator_id, pipeline_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS idx_followup_reminders_creator ON followup_reminder_sends(creator_id);
CREATE INDEX IF NOT EXISTS idx_followup_reminders_pipeline ON followup_reminder_sends(pipeline_id);

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON COLUMN creator_pipeline.original_pitch_subject IS 'Subject line of original pitch for follow-up context';
COMMENT ON COLUMN creator_pipeline.original_pitch_body IS 'Body of original pitch for follow-up context';
COMMENT ON COLUMN creator_pipeline.day_6_reminder_sent IS 'Whether Day 6 follow-up reminder email was sent';
COMMENT ON COLUMN creator_pipeline.day_10_reminder_sent IS 'Whether Day 10 follow-up reminder email was sent';
COMMENT ON COLUMN creator_pipeline.day_14_reminder_sent IS 'Whether Day 14 follow-up reminder email was sent';
COMMENT ON COLUMN creators.followup_notifications_enabled IS 'Whether user wants follow-up reminder emails (Pro only)';
COMMENT ON TABLE followup_reminder_sends IS 'Audit log of follow-up reminder emails sent';
