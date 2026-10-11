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
function alreadyDecided(status) {
  const value = String(status || '').toLowerCase();
  return value === 'approved' || value === 'pro_approved' || value === 'rejected';
}

export function creatorPostAuthPath({ approval_status, onboarding_complete, profile_incomplete, needs_onboarding } = {}) {
  if (!alreadyDecided(approval_status) && (profile_incomplete || needs_onboarding || onboarding_complete === false)) {
    return '/onboarding';
  }
  if (needsWaitlistGate(approval_status)) {
    return WAITLIST_PATH;
  }
  return '/creator/dashboard/for-you';
}

function nicheHasValue(raw) {
  if (raw == null) return false;
  if (Array.isArray(raw)) return raw.some((item) => String(item || '').trim());
  const text = String(raw).trim();
  if (!text || ['[]', 'null', 'none', '""'].includes(text.toLowerCase())) return false;
  if (text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) && parsed.some((item) => String(item || '').trim());
    } catch {
      return true;
    }
  }
  return true;
}

/** Same rule as login: a creator is finished once they have a username and a niche. */
export function onboardingCompleteFromProfile(profile = {}) {
  const role = profile.user_role || profile.role;
  if (role && role !== 'creator') return true;
  const username = String(profile.username || '').trim();
  const extra = profile.creator_niches;
  const hasNiche = nicheHasValue(profile.niche) || (Array.isArray(extra) && nicheHasValue(extra));
  return Boolean(username && hasNiche);
}

export function onboardingCompleteFromAuth(data = {}) {
  const role = data.user_role || data.role;
  if (role && role !== 'creator') return true;
  if (data.needs_onboarding || data.profile_incomplete || data.onboarding_complete === false) return false;
  return true;
}

export function creatorNeedsOnboarding(user) {
  return user?.role === 'creator'
    && user?.onboarding_complete === false
    && !alreadyDecided(user?.approval_status);
}

export function creatorHomePath(user) {
  if (creatorNeedsOnboarding(user)) return '/onboarding';
  if (user?.role === 'creator' && needsWaitlistGate(user.approval_status)) return WAITLIST_PATH;
  if (user?.role === 'brand') return '/brand/dashboard/overview';
  return '/creator/dashboard/for-you';
}
