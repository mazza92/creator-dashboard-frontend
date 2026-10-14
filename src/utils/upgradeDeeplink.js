const STORAGE_KEY = 'openUpgradeModal';
const EMAIL_CAMPAIGN_KEY = 'lastEmailCampaign';
const EMAIL_CAMPAIGN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const UPGRADE_FEATURE_MAP = {
  pro: 'limit_reached',
  founder_sprint: 'limit_reached',
  gifting_guarantee: 'limit_reached',
  winback: 'winback',
  pitch_limit: 'limit_reached',
  kit_views: 'kit_views',
  unlock_paywall: 'unlock_paywall',
  last_unlock: 'last_unlock',
  credits: 'credits',
};

let rememberedUpgrade = null;

function asParams(search) {
  if (search instanceof URLSearchParams) return search;
  const raw = search == null ? (typeof window !== 'undefined' ? window.location.search : '') : search;
  return new URLSearchParams(typeof raw === 'string' && raw.startsWith('?') ? raw.slice(1) : raw || '');
}

function resolveUpgradeToken(params) {
  const upgrade = params.get('upgrade');
  const ref = params.get('ref');
  if (upgrade === 'winback' || ref === 'winback') return 'winback';
  return upgrade;
}

export function captureUpgradeDeeplink(search) {
  const upgrade = resolveUpgradeToken(asParams(search));
  if (!upgrade) return null;
  rememberedUpgrade = upgrade;
  try {
    sessionStorage.setItem(STORAGE_KEY, upgrade);
  } catch {
    /* ignore quota / private mode */
  }
  return upgrade;
}

export function consumeUpgradeDeeplink(search) {
  const fromUrl = resolveUpgradeToken(asParams(search));
  let fromStore = null;
  try {
    fromStore = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    fromStore = null;
  }
  const upgrade = fromUrl || fromStore || rememberedUpgrade;
  if (!upgrade) return null;
  rememberedUpgrade = upgrade;
  return UPGRADE_FEATURE_MAP[upgrade] || 'limit_reached';
}

export function isWinbackUpgradePending() {
  try {
    if (rememberedUpgrade === 'winback') return true;
    return sessionStorage.getItem(STORAGE_KEY) === 'winback';
  } catch {
    return rememberedUpgrade === 'winback';
  }
}

export function dismissUpgradeDeeplink() {
  rememberedUpgrade = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

// Last lifecycle email clicked, so checkout can credit it (last touch, 7 days).
export function captureEmailCampaign(search) {
  const params = asParams(search);
  if (params.get('utm_medium') !== 'lifecycle') return null;
  const campaign = String(params.get('utm_campaign') || '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 40);
  if (!campaign) return null;
  try {
    localStorage.setItem(EMAIL_CAMPAIGN_KEY, JSON.stringify({ campaign, at: Date.now() }));
  } catch {
    /* ignore quota / private mode */
  }
  return campaign;
}

export function getEmailCampaign() {
  try {
    const saved = JSON.parse(localStorage.getItem(EMAIL_CAMPAIGN_KEY) || 'null');
    if (!saved?.campaign || Date.now() - Number(saved.at || 0) > EMAIL_CAMPAIGN_TTL_MS) return null;
    return saved.campaign;
  } catch {
    return null;
  }
}

export function stripUpgradeQuery(search) {
  const next = new URLSearchParams(asParams(search));
  let changed = false;
  ['upgrade', 'ref', 'utm_source', 'utm_medium', 'utm_campaign'].forEach((key) => {
    if (next.has(key)) {
      next.delete(key);
      changed = true;
    }
  });
  return { next, changed };
}

export function safeInternalPath(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let path = raw.trim();
  try {
    if (/^https?:\/\//i.test(path)) {
      const parsed = new URL(path);
      if (typeof window !== 'undefined' && parsed.origin !== window.location.origin) {
        return null;
      }
      path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    return null;
  }
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/login')) {
    return null;
  }
  return path;
}

export function loginUrlWithReturn(location) {
  const returnTo = `${location.pathname || '/'}${location.search || ''}${location.hash || ''}`;
  captureUpgradeDeeplink(location.search);
  captureEmailCampaign(location.search);
  return `/login?redirect=${encodeURIComponent(returnTo)}`;
}
