// First-touch signup attribution: remember where a visitor came from (TikTok ad, Google, email),
// then send it once after they sign up so we can report cost per approved creator per campaign/ad.
const KEY = 'nc_first_touch';
const SENT_KEY = 'nc_first_touch_sent';
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_content', 'utm_term', 'ttclid', 'gclid'];
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function captureAttribution(search, pathname = '') {
  try {
    const params = search instanceof URLSearchParams ? search : new URLSearchParams(search || '');
    const found = {};
    PARAMS.forEach((k) => {
      const v = params.get(k);
      if (v) found[k] = v.slice(0, 300);
    });
    if (!Object.keys(found).length) return null;
    const existing = readAttribution();
    if (existing && Date.now() - (existing.ts || 0) < MAX_AGE_MS) return existing; // first touch wins
    const touch = { ...found, landing: pathname.slice(0, 200), ts: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(touch));
    return touch;
  } catch {
    return null;
  }
}

export function readAttribution() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Called on navigation: once a user is logged in, post the first touch one time.
export async function sendAttributionOnce(post) {
  try {
    if (localStorage.getItem(SENT_KEY) || !localStorage.getItem('userId')) return false;
    const touch = readAttribution();
    if (!touch) return false;
    localStorage.setItem(SENT_KEY, '1');
    await post('/api/me/attribution', { ...touch, ts: String(touch.ts || '') });
    return true;
  } catch {
    return false;
  }
}
