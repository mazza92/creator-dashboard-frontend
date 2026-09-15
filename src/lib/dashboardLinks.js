const APP_HOST = 'app.newcollab.co';

export function appOrigin() {
  if (typeof window === 'undefined') return `https://${APP_HOST}`;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return window.location.origin;
  if (host === APP_HOST) return window.location.origin;
  return `https://${APP_HOST}`;
}

export function loginHref(nextPath) {
  const origin = appOrigin();
  if (!nextPath) return `${origin}/login`;
  return `${origin}/login?next=${encodeURIComponent(nextPath)}`;
}

export function signupHref() {
  return `${appOrigin()}/register/creator`;
}

export function dashboardHomeHref(role) {
  const origin = appOrigin();
  if (role === 'brand') return `${origin}/brand/dashboard/overview`;
  return `${origin}/creator/dashboard/for-you`;
}

export function editProfileHref(role) {
  const origin = appOrigin();
  if (role === 'brand') return `${origin}/brand/dashboard/overview`;
  return `${origin}/creator/dashboard/profile`;
}

export function editKitHref() {
  return `${appOrigin()}/creator/dashboard/my-kit`;
}

export const GUEST_KIT_SLUG_KEY = 'newcollab_free_portfolio_slug';
export const GUEST_KIT_TOKEN_KEY = 'newcollab_free_portfolio_token';

export function rememberPublishedKitSlug(slug) {
  const clean = String(slug || '').replace(/^@/, '').trim();
  if (!clean || typeof window === 'undefined') return;
  try {
    localStorage.setItem(GUEST_KIT_SLUG_KEY, clean);
  } catch {
    /* ignore */
  }
}

export function isGuestKitOwner(username) {
  if (typeof window === 'undefined') return false;
  const slug = String(username || '').replace(/^@/, '').trim().toLowerCase();
  if (!slug) return false;
  try {
    const stored = String(localStorage.getItem(GUEST_KIT_SLUG_KEY) || '').replace(/^@/, '').trim().toLowerCase();
    const token = localStorage.getItem(GUEST_KIT_TOKEN_KEY);
    return Boolean(stored && token && stored === slug);
  } catch {
    return false;
  }
}
