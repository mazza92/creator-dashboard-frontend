export const DEFAULT_SCRAPE_TIPS = [
  'Double-check the username spelling',
  'Make sure the account is public, not private',
  'Have at least one public post on the profile',
];

export const ELIGIBILITY_CODES = [
  'below_follower_min',
  'below_post_min',
  'inactive',
  'below_content_quality',
];

export function platformDisplayName(platform) {
  if (platform === 'tiktok') return 'TikTok';
  if (platform === 'youtube') return 'YouTube';
  return 'Instagram';
}

export function profileUrlFor(platform, handle) {
  const h = (handle || '').replace(/^@/, '').trim();
  if (!h) return null;
  if (platform === 'tiktok') return `https://www.tiktok.com/@${h}`;
  if (platform === 'youtube') return `https://www.youtube.com/@${h}`;
  return `https://www.instagram.com/${h}/`;
}

export function scrapeHelpFromError(err, { handle, platform } = {}) {
  const data = err?.response?.data || {};
  const h = (handle || '').replace(/^@/, '').trim();
  const platformName = platformDisplayName(platform);
  const code = data.error_code || (data.is_private ? 'private' : 'unavailable');
  const isEligibility = ELIGIBILITY_CODES.includes(code);
  const tips = Array.isArray(data.tips) && data.tips.length
    ? data.tips
    : DEFAULT_SCRAPE_TIPS;

  return {
    title: data.error || (h ? `We could not verify @${h}` : 'We could not verify this profile'),
    message: data.message || 'Check the username and that the account is public, then try again.',
    tips,
    profileUrl: data.profile_url || profileUrlFor(platform, h),
    profileLabel: h ? `Open ${platformName} profile` : null,
    code,
    isPrivate: Boolean(data.is_private),
    tone: isEligibility ? 'wait' : 'error',
    followerCount: data.follower_count ?? null,
    postCount: data.post_count ?? null,
    minFollowers: data.min_followers || 500,
    minPosts: data.min_posts || 12,
  };
}
