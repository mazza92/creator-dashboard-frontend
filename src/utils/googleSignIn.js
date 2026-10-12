import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import api from './api';

const IN_APP_BROWSER_RE =
  /Instagram|FBAN|FBAV|FB_IAB|FBIOS|TikTok|musical_ly|Bytedance|BytedanceWebview|Snapchat|LinkedInApp|Pinterest|Line\/|Twitter|MicroMessenger|GSA\/|GoogleApp|Ecosia|DuckDuckGo/i;

const REDIRECT_FLAG = 'nc_google_redirect';
const POPUP_TIMEOUT_MS = 40000;
const STEP_TIMEOUT_MS = 20000;

export function inAppBrowserName(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  if (!ua || !IN_APP_BROWSER_RE.test(ua)) return null;
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/TikTok|musical_ly|Bytedance/i.test(ua)) return 'TikTok';
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return 'Facebook';
  if (/Snapchat/i.test(ua)) return 'Snapchat';
  if (/LinkedInApp/i.test(ua)) return 'LinkedIn';
  if (/Pinterest/i.test(ua)) return 'Pinterest';
  if (/GSA\/|GoogleApp/i.test(ua)) return 'Google';
  if (/Ecosia/i.test(ua)) return 'Ecosia';
  if (/DuckDuckGo/i.test(ua)) return 'DuckDuckGo';
  return 'this app';
}

export function isAndroid(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  return /Android/i.test(ua);
}

export function isIOS(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  return /iPhone|iPad|iPod/i.test(ua);
}

export function shouldUseGoogleRedirect(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  // iOS treats the Google popup as a new tab and never resolves signInWithPopup.
  return isIOS(ua);
}

export function openInSystemBrowserUrl(href = typeof window !== 'undefined' ? window.location.href : '') {
  if (!href || !isAndroid()) return null;
  const url = new URL(href);
  return `intent://${url.host}${url.pathname}${url.search}#Intent;scheme=${url.protocol.replace(':', '')};package=com.android.chrome;end`;
}

export function inAppGoogleMessage(appName) {
  return `Google sign-in doesn't work inside ${appName}'s browser. Open this page in ${
    isAndroid() ? 'Chrome' : 'Safari'
  } or sign up with your email below.`;
}

export function googleSignInErrorMessage(err) {
  const code = err?.code || '';
  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the Google window. Allow pop-ups for newcollab.co, or sign up with your email.';
  }
  if (code === 'auth/popup-timeout' || code === 'auth/redirect-timeout') {
    return "Google sign-in didn't finish. Try again, or sign up with your email below.";
  }
  if (code === 'auth/operation-not-supported-in-this-environment' || code === 'auth/web-storage-unsupported') {
    return "Google sign-in isn't supported in this browser. Open newcollab.co in Safari or Chrome, or sign up with your email.";
  }
  if (code === 'auth/network-request-failed') {
    return 'Network issue while contacting Google. Check your connection and try again.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'This email already has an account. Sign in with your email and password.';
  }
  return err?.response?.data?.error || 'Google sign-in failed. Please try again or use your email.';
}

export function googleRedirectPending() {
  try {
    return Boolean(sessionStorage.getItem(REDIRECT_FLAG));
  } catch {
    return false;
  }
}

function googleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

function popupWithTimeout(auth, provider, ms) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      const err = new Error("Google sign-in didn't finish");
      err.code = 'auth/popup-timeout';
      reject(err);
    }, ms);
    signInWithPopup(auth, provider).then(
      (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(result);
      },
      (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

function withTimeout(promise, ms, code) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error("Google sign-in didn't finish");
      err.code = code;
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function reportGoogleStep(step, err) {
  try {
    const code = err?.code || err?.response?.status || '';
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 180) : '';
    const host = typeof window !== 'undefined' ? window.location.host : '';
    api.post('/api/track-event', {
      event: 'google_signin',
      location: `${step}|${code}|${host}|${ua}`,
    }).catch(() => {});
  } catch {
    // never block sign-in on telemetry
  }
}

function clearRedirectFlag() {
  try {
    sessionStorage.removeItem(REDIRECT_FLAG);
  } catch {
    // ignore
  }
}

export async function startGoogleSignIn(auth) {
  const provider = googleProvider();
  if (shouldUseGoogleRedirect()) {
    try {
      sessionStorage.setItem(REDIRECT_FLAG, window.location.pathname + window.location.search);
    } catch {
      // sessionStorage can be blocked; redirect still works.
    }
    reportGoogleStep('redirect_start');
    try {
      // Resolves only if the browser never leaves the page.
      await withTimeout(signInWithRedirect(auth, provider), STEP_TIMEOUT_MS, 'auth/redirect-timeout');
    } catch (err) {
      clearRedirectFlag();
      reportGoogleStep('redirect_start_failed', err);
      throw err;
    }
    return { redirected: true, user: null };
  }
  const result = await popupWithTimeout(auth, provider, POPUP_TIMEOUT_MS);
  return { redirected: false, user: result.user };
}

let redirectResultPromise = null;
let redirectUserClaimed = false;

function loadRedirectUser(auth) {
  if (!redirectResultPromise) {
    const pending = googleRedirectPending();
    if (pending) reportGoogleStep('redirect_return');
    redirectResultPromise = withTimeout(getRedirectResult(auth), STEP_TIMEOUT_MS, 'auth/redirect-timeout')
      .then((result) => {
        clearRedirectFlag();
        const user = result?.user || (pending ? auth.currentUser : null) || null;
        if (pending) reportGoogleStep(user ? 'redirect_user' : 'redirect_no_user');
        return user;
      })
      .catch((err) => {
        clearRedirectFlag();
        if (pending) reportGoogleStep('redirect_error', err);
        throw err;
      });
  }
  return redirectResultPromise;
}

// Returns the Google user once per page load. Callers that unmount before the
// result arrives leave it for the next caller.
export async function consumeGoogleRedirectResult(auth, isCancelled = () => false) {
  if (!auth) return null;
  const user = await loadRedirectUser(auth);
  if (!user || redirectUserClaimed || isCancelled()) return null;
  redirectUserClaimed = true;
  return user;
}

export function isIgnorableGoogleCancel(err) {
  const code = err?.code || '';
  return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request';
}

export function isRegionBlockedError(err, msg = '') {
  const text = String(msg || err?.response?.data?.error || err?.message || '').toLowerCase();
  return err?.response?.status === 403 && (text.includes('region') || text.includes('restricted'));
}
