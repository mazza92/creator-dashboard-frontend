/** Creator approval helpers */

// Pending and rejected creators no longer wait on a waitlist: they get the slim Directory access
// (brand directory, contact unlocks, a pitch they send themselves). Old waitlist links redirect here.
export const DIRECTORY_PATH = '/creator/directory';
export const WAITLIST_PATH = '/creator/waitlist';

export function isCreatorApproved(status) {
  return status === 'approved' || status === 'pro_approved';
}

/** Pending or rejected creators get Directory access only, never the full product dashboard. */
export function needsDirectoryAccess(status) {
  return status === 'pending' || status === 'rejected';
}

/** A logged-in creator who is limited to the Directory. */
export function isDirectoryCreator(user) {
  return user?.role === 'creator' && needsDirectoryAccess(user?.approval_status);
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
  if (needsDirectoryAccess(approval_status)) {
    return DIRECTORY_PATH;
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
  if (isDirectoryCreator(user)) return DIRECTORY_PATH;
  if (user?.role === 'brand') return '/brand/workspace';
  return '/creator/dashboard/for-you';
}

const DIRECTORY_ALLOWED_PREFIXES = [
  DIRECTORY_PATH,
  // Stripe returns: Pro for directory creators is checked out on Stripe's hosted page and comes back here.
  '/creator/dashboard/subscription/success',
  '/creator/dashboard/subscription/cancel',
];

/**
 * Where App.js sends a creator who is limited to the Directory, or null to let the route render.
 * Every /creator page except the Directory (and the Stripe return pages) is off limits for them.
 */
export function directoryGateRedirect(user, pathname) {
  if (!isDirectoryCreator(user) || !user.creator_id) return null;
  const path = String(pathname || '');
  if (!path.startsWith('/creator')) return null;
  if (DIRECTORY_ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))) return null;
  return DIRECTORY_PATH;
}
