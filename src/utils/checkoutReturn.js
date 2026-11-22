// Where to send a creator who backs out of Stripe checkout: the screen they were on (Polly, a brand, the
// tracker...), not a stand-alone page. Saved right before the redirect to Stripe; read once on the cancel route.
const KEY = 'nc_checkout_return';
const MAX_AGE_MS = 3 * 60 * 60 * 1000;
export const DEFAULT_RETURN = '/creator/dashboard/for-you';

function stores() {
  const out = [];
  try { if (typeof sessionStorage !== 'undefined') out.push(sessionStorage); } catch (_) { /* blocked */ }
  try { if (typeof localStorage !== 'undefined') out.push(localStorage); } catch (_) { /* blocked */ }
  return out;
}

export function rememberCheckoutReturn(path) {
  const where = path || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : '');
  if (!where || !where.startsWith('/creator/') || where.includes('/subscription/')) return;
  const value = JSON.stringify({ path: where, at: Date.now() });
  stores().forEach((s) => { try { s.setItem(KEY, value); } catch (_) { /* full or blocked */ } });
}

export function takeCheckoutReturn(now = Date.now()) {
  let found = null;
  stores().forEach((s) => {
    try {
      const raw = s.getItem(KEY);
      s.removeItem(KEY);
      if (!raw || found) return;
      const { path, at } = JSON.parse(raw);
      if (typeof path === 'string' && path.startsWith('/creator/') && now - Number(at) < MAX_AGE_MS) found = path;
    } catch (_) { /* ignore */ }
  });
  return found || DEFAULT_RETURN;
}

export function withCheckoutCancelled(path) {
  const [base, query = ''] = String(path || DEFAULT_RETURN).split('?');
  const params = new URLSearchParams(query);
  params.set('checkout', 'cancelled');
  return `${base}?${params.toString()}`;
}
