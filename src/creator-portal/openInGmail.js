// "View in Gmail": on a phone, open the Gmail app (a web link opens a browser tab instead). Gmail's app has no
// public link to one email, so it opens on the app; desktop keeps the exact thread on the web.
export function isPhone() {
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return '';
}

export function openInGmail(event, webUrl) {
  const phone = isPhone();
  if (!phone) return; // let the normal link open the thread on the web
  event.preventDefault();
  if (phone === 'android') {
    window.location.href = `intent://#Intent;scheme=googlegmail;package=com.google.android.gm;S.browser_fallback_url=${encodeURIComponent(webUrl)};end`;
    return;
  }
  const started = Date.now();
  window.location.href = 'googlegmail://';
  setTimeout(() => {
    // Still here (no Gmail app): open the web version instead.
    if (document.visibilityState === 'visible' && Date.now() - started < 2500) window.location.href = webUrl;
  }, 1200);
}
