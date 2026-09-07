/** Creator waitlist / approval helpers */

export const WAITLIST_PATH = '/creator/waitlist';

export function isCreatorApproved(status) {
  return status === 'approved' || status === 'pro_approved';
}

/** Pending or rejected creators stay out of the product dashboard. */
export function needsWaitlistGate(status) {
  return status === 'pending' || status === 'rejected';
}

/**
 * Null/undefined status fail-opens (grandfathered / pre-migration rows).
 * Only explicit pending/rejected are gated.
 */
export function creatorPostAuthPath({ approval_status, onboarding_complete, profile_incomplete, needs_onboarding } = {}) {
  if (profile_incomplete || needs_onboarding || onboarding_complete === false) {
    return '/onboarding';
  }
  if (needsWaitlistGate(approval_status)) {
    return WAITLIST_PATH;
  }
  return '/creator/dashboard/for-you';
}
