const STORAGE_KEY = 'openUpgradeModal';

const UPGRADE_FEATURE_MAP = {
  pro: 'limit_reached',
  founder_sprint: 'limit_reached',
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

export function captureUpgradeDeeplink(search) {
  const upgrade = asParams(search).get('upgrade');
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
  const fromUrl = asParams(search).get('upgrade');
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

export function dismissUpgradeDeeplink() {
  rememberedUpgrade = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
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
  return `/login?redirect=${encodeURIComponent(returnTo)}`;
}
