const IN_APP_BROWSER_RE =
  /Instagram|FBAN|FBAV|FB_IAB|FBIOS|TikTok|musical_ly|Bytedance|BytedanceWebview|Snapchat|LinkedInApp|Pinterest|Line\/|Twitter|MicroMessenger/i;

export function inAppBrowserName(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  if (!ua || !IN_APP_BROWSER_RE.test(ua)) return null;
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/TikTok|musical_ly|Bytedance/i.test(ua)) return 'TikTok';
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return 'Facebook';
  if (/Snapchat/i.test(ua)) return 'Snapchat';
  if (/LinkedInApp/i.test(ua)) return 'LinkedIn';
  if (/Pinterest/i.test(ua)) return 'Pinterest';
  return 'this app';
}

export function isAndroid(ua = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  return /Android/i.test(ua);
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
