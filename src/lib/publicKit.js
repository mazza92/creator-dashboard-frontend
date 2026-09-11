import { normalizeCategory } from '../constants/brandCategories';
import { parseKitNiches, resolveKitSocialProfiles } from './kitBrandCta';

export function formatKitNumber(n) {
  const num = Number(n);
  if (!num) return null;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(Math.round(num));
}

export function formatRegionName(region) {
  const labels = {
    NA: 'North America',
    SA: 'South America',
    EU: 'Europe',
    OCE: 'Oceania',
    ME: 'Middle East',
    US: 'United States',
    UK: 'United Kingdom',
  };
  const raw = String(region || '').trim();
  return labels[raw] || raw;
}

function rateFromList(rates, needle) {
  if (!Array.isArray(rates)) return 0;
  const hit = rates.find((r) => String(r.name || '').toLowerCase().includes(needle));
  return hit ? Number(hit.price) || 0 : 0;
}

export function normalizePublicKit(raw) {
  if (!raw) return null;
  const socialProfiles = resolveKitSocialProfiles(raw);
  const followerCount = Number(raw.total_followers ?? raw.follower_count ?? 0) || 0;
  const profiles = socialProfiles.map((profile) => {
    if (profile.followers) return profile;
    if (socialProfiles.length === 1 && followerCount) {
      return { ...profile, followers: followerCount };
    }
    return profile;
  });

  const posts = Array.isArray(raw.posts) ? raw.posts : [];
  const collabBrands = [
    ...new Set(
      [
        ...(raw.collaborations || []).map((c) => c && c.brand),
        ...posts.filter((p) => p.brand_name && p.collab_type !== 'own').map((p) => p.brand_name),
      ].filter(Boolean),
    ),
  ];

  const ratesReel = Number(raw.rates_reel) || rateFromList(raw.rates, 'reel');
  const ratesTiktok = Number(raw.rates_tiktok) || rateFromList(raw.rates, 'tiktok');
  const ratesPhoto = Number(raw.rates_photo) || rateFromList(raw.rates, 'photo');
  const gifted = raw.rates_gifted === true || raw.accepts_gifted === true;

  return {
    username: raw.username,
    displayName: raw.display_name || raw.first_name || raw.username,
    avatarUrl: raw.profile_photo_url || raw.avatar_url || '',
    bio: raw.bio || null,
    tagline: raw.tagline || null,
    niches: [...new Set(
      parseKitNiches(raw.niches)
        .map((n) => normalizeCategory(n) || String(n).trim().toLowerCase())
        .filter(Boolean)
    )],
    regions: (Array.isArray(raw.regions) ? raw.regions : []).map(formatRegionName).filter(Boolean),
    primaryAgeRange: String(raw.primary_age_range || '').trim(),
    followerCount,
    engagementRate: Number(raw.engagement_rate) || 0,
    socialProfiles: profiles,
    posts,
    postsSource: raw.posts_source || (posts.length ? 'portfolio' : null),
    ratesReel,
    ratesTiktok,
    ratesPhoto,
    gifted,
    isPro: !!raw.is_pro,
    kitViews: raw.kit_views,
    brands: collabBrands,
  };
}
