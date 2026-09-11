export const KIT_BRAND_CTA =
  'https://app.newcollab.co/for-brands?utm_source=public_kit&utm_medium=share&utm_campaign=get-in-touch';

export function kitBrandCta(username) {
  const url = new URL(KIT_BRAND_CTA);
  if (username) url.searchParams.set('creator', String(username).replace(/^@/, ''));
  return url.toString();
}

export function parseKitNiches(niches) {
  if (!niches) return [];
  if (Array.isArray(niches)) {
    const looksBroken = niches.some((n) => /[[\]"]/.test(String(n)));
    if (looksBroken) {
      try {
        const joined = niches.join(',');
        const parsed = JSON.parse(joined.trim().startsWith('[') ? joined : `[${joined}]`);
        if (Array.isArray(parsed)) {
          return parsed.map((n) => String(n).trim()).filter(Boolean);
        }
      } catch {
        return niches.map((n) => String(n).replace(/[[\]"]/g, '').trim()).filter(Boolean);
      }
    }
    return niches.map((n) => String(n).trim()).filter(Boolean);
  }
  if (typeof niches === 'string') {
    const trimmed = niches.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.map((n) => String(n).trim()).filter(Boolean) : [trimmed];
      } catch {
        // fall through
      }
    }
    return trimmed.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  return [String(niches)];
}

const SOCIAL_URLS = {
  instagram: (h) => `https://instagram.com/${h}`,
  tiktok: (h) => `https://tiktok.com/@${h}`,
  youtube: (h) => `https://youtube.com/@${h}`,
  twitter: (h) => `https://x.com/${h}`,
  x: (h) => `https://x.com/${h}`,
};

export function profilesFromSocialLinks(links) {
  if (!Array.isArray(links)) return [];
  const out = [];
  const seen = new Set();
  links.forEach((link) => {
    if (!link || typeof link !== 'object') return;
    const platform = String(link.platform || '').trim().toLowerCase();
    if (!platform) return;
    const handle = String(link.handle || link.username || '').trim().replace(/^@+/, '');
    let url = String(link.url || link.profile_url || '').trim();
    if (!url && handle && SOCIAL_URLS[platform]) url = SOCIAL_URLS[platform](handle);
    if (!url && !handle) return;
    const key = `${platform}:${(handle || url).toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    const item = {
      platform,
      handle: handle ? `@${handle}` : null,
      url: url || null,
    };
    const followers = link.followersCount ?? link.followers;
    if (followers != null && followers !== '') {
      const n = Number(followers);
      if (!Number.isNaN(n)) item.followers = n;
    }
    out.push(item);
  });
  return out;
}

export function resolveKitSocialProfiles(kit) {
  if (!kit) return [];
  if (Array.isArray(kit.social_profiles) && kit.social_profiles.length) {
    return kit.social_profiles.filter((p) => p && (p.url || p.handle));
  }
  const fromLinks = profilesFromSocialLinks(kit.social_links);
  if (fromLinks.length) return fromLinks;
  const socials = kit.socials && typeof kit.socials === 'object' ? kit.socials : {};
  const fromMap = Object.entries(socials)
    .filter(([, url]) => url)
    .map(([platform, url]) => ({ platform, url, handle: null }));
  if (fromMap.length) return fromMap;

  const handle = String(kit.social_handle || '').trim().replace(/^@+/, '');
  const platform = String(kit.social_platform || '').trim().toLowerCase();
  if (handle && SOCIAL_URLS[platform]) {
    return [{ platform, handle: `@${handle}`, url: SOCIAL_URLS[platform](handle) }];
  }
  return [];
}

export function kitApiOrigin(apiBase) {
  return String(apiBase || 'https://api.newcollab.co').replace(/\/$/, '').replace(/\/api$/i, '');
}

export function mergeKitWithPublicProfile(kit, profile) {
  if (!kit) return kit;
  const next = { ...kit };
  delete next.contact_email;
  if (!profile || typeof profile !== 'object' || profile.error) return next;

  const kitProfiles = resolveKitSocialProfiles(next);
  const fromProfile = profilesFromSocialLinks(profile.social_links);
  const social_profiles = kitProfiles.length ? kitProfiles : fromProfile;
  const socials = { ...(next.socials && typeof next.socials === 'object' ? next.socials : {}) };
  social_profiles.forEach((p) => {
    if (p.platform && p.url && !socials[p.platform]) socials[p.platform] = p.url;
  });

  const username = String(next.username || profile.username || '').replace(/^@/, '').toLowerCase();
  const currentName = String(next.first_name || next.display_name || '').trim();
  const profileName = String(profile.display_name || '').trim();
  const betterName = currentName && currentName.toLowerCase() !== username
    ? currentName
    : (profileName || currentName);

  return {
    ...next,
    social_links: Array.isArray(profile.social_links) ? profile.social_links : next.social_links,
    social_profiles,
    socials,
    bio: next.bio || profile.bio || null,
    first_name: betterName || next.first_name,
    display_name: betterName || next.display_name,
  };
}
