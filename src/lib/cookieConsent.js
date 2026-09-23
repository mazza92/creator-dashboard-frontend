export const CONSENT_COOKIE = 'nc_consent';
export const CONSENT_STORAGE = 'nc_consent';
export const LEGACY_STORAGE = 'cookiePreferences';
export const CONSENT_VERSION = 2;
export const OPEN_COOKIE_SETTINGS_EVENT = 'nc-open-cookie-settings';
export const CONSENT_MAX_AGE_SEC = 395 * 24 * 60 * 60; // 13 months (CNIL)

export const GA_MEASUREMENT_ID = 'G-5RET5C6MZ8';
export const CLARITY_ID = 'x4wh02dum8';
export const META_PIXEL_ID = '2008333943133119';
export const TIKTOK_PIXEL_ID = 'D8RDMRBC77U5P88O6G70';

const NON_GDPR_EUROPE_TZ = new Set([
  'Europe/Moscow',
  'Europe/Minsk',
  'Europe/Kyiv',
  'Europe/Kiev',
  'Europe/Simferopol',
  'Europe/Istanbul',
  'Europe/Kaliningrad',
  'Europe/Samara',
  'Europe/Volgograd',
  'Europe/Saratov',
  'Europe/Ulyanovsk',
  'Europe/Astrakhan',
  'Europe/Kirov',
  'Europe/Belgrade',
  'Europe/Podgorica',
  'Europe/Sarajevo',
  'Europe/Skopje',
  'Europe/Tirane',
  'Europe/Chisinau',
]);

const GDPR_OVERSEAS_TZ = new Set([
  'Atlantic/Canary',
  'Atlantic/Madeira',
  'Atlantic/Azores',
  'Atlantic/Reykjavik',
  'Atlantic/Faroe',
  'Atlantic/Jan_Mayen',
  'Arctic/Longyearbyen',
  'America/Martinique',
  'America/Guadeloupe',
  'America/Cayenne',
  'America/Miquelon',
  'America/Marigot',
  'America/St_Barthelemy',
  'Indian/Reunion',
  'Indian/Mayotte',
  'Pacific/Noumea',
  'Pacific/Tahiti',
  'Pacific/Wallis',
]);

const CONSENT_LANG_REGION = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL',
  'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'UK', 'CH',
]);

export function isConsentRegion() {
  if (typeof window === 'undefined') return true;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.startsWith('Europe/') && !NON_GDPR_EUROPE_TZ.has(tz)) return true;
    if (GDPR_OVERSEAS_TZ.has(tz)) return true;
    const langs = [
      ...(navigator.languages || []),
      navigator.language || '',
    ];
    for (const lang of langs) {
      const match = String(lang).match(/-([A-Za-z]{2})$/);
      if (match && CONSENT_LANG_REGION.has(match[1].toUpperCase())) return true;
    }
  } catch {
    return true;
  }
  return false;
}

function cookieDomainAttr() {
  if (typeof window === 'undefined') return '';
  const host = window.location.hostname;
  if (host === 'newcollab.co' || host.endsWith('.newcollab.co')) {
    return '; domain=.newcollab.co';
  }
  return '';
}

function readCookie(name) {
  if (typeof document === 'undefined') return '';
  const parts = `; ${document.cookie}`.split(`; ${name}=`);
  if (parts.length < 2) return '';
  return decodeURIComponent(parts.pop().split(';').shift());
}

function parseConsent(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!('analytics' in parsed) && !('marketing' in parsed)) return null;
    return {
      v: CONSENT_VERSION,
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      ts: parsed.ts || Date.now(),
    };
  } catch {
    return null;
  }
}

export function readConsent() {
  if (typeof window === 'undefined') return null;
  const fromCookie = parseConsent(readCookie(CONSENT_COOKIE));
  if (fromCookie) return fromCookie;
  try {
    const fromStorage = parseConsent(window.localStorage.getItem(CONSENT_STORAGE));
    if (fromStorage) return fromStorage;
    return parseConsent(window.localStorage.getItem(LEGACY_STORAGE));
  } catch {
    return null;
  }
}

export function writeConsent({ analytics, marketing }) {
  const payload = {
    v: CONSENT_VERSION,
    necessary: true,
    analytics: !!analytics,
    marketing: !!marketing,
    ts: Date.now(),
  };
  const raw = JSON.stringify(payload);
  try {
    window.localStorage.setItem(CONSENT_STORAGE, raw);
    window.localStorage.removeItem(LEGACY_STORAGE);
  } catch {
    /* private mode */
  }
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(raw)}; path=/; max-age=${CONSENT_MAX_AGE_SEC}; SameSite=Lax${cookieDomainAttr()}${secure}`;
  window.__ncConsent = { analytics: payload.analytics, marketing: payload.marketing };
  return payload;
}

function ensureGtag() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
}

export function updateGtagConsent({ analytics, marketing }) {
  ensureGtag();
  window.gtag('consent', 'update', {
    analytics_storage: analytics ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied',
  });
}

function loadClarity() {
  if (typeof window === 'undefined' || window.__ncClarityLoaded) return;
  window.__ncClarityLoaded = true;
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = `https://www.clarity.ms/tag/${i}`;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);
}

function loadMetaPixel() {
  if (typeof window === 'undefined' || window.__ncMetaLoaded) return;
  window.__ncMetaLoaded = true;
  if (!window.fbq) {
    /* eslint-disable */
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
  }
  window.fbq('consent', 'grant');
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function loadTikTokPixel() {
  if (typeof window === 'undefined' || window.__ncTikTokLoaded) return;
  window.__ncTikTokLoaded = true;
  const t = 'ttq';
  const w = window;
  const d = document;
  w.TiktokAnalyticsObject = t;
  const ttq = w[t] = w[t] || [];
  ttq.methods = [
    'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once',
    'ready', 'alias', 'group', 'enableCookie', 'disableCookie',
    'holdConsent', 'revokeConsent', 'grantConsent',
  ];
  ttq.setAndDefer = function (obj, method) {
    obj[method] = function () {
      obj.push([method].concat(Array.prototype.slice.call(arguments, 0)));
    };
  };
  for (let i = 0; i < ttq.methods.length; i += 1) {
    ttq.setAndDefer(ttq, ttq.methods[i]);
  }
  ttq.instance = function (id) {
    const inst = ttq._i[id] || [];
    for (let n = 0; n < ttq.methods.length; n += 1) {
      ttq.setAndDefer(inst, ttq.methods[n]);
    }
    return inst;
  };
  ttq.load = function (e, n) {
    const r = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    ttq._i = ttq._i || {};
    ttq._i[e] = [];
    ttq._i[e]._u = r;
    ttq._t = ttq._t || {};
    ttq._t[e] = +new Date();
    ttq._o = ttq._o || {};
    ttq._o[e] = n || {};
    const script = d.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `${r}?sdkid=${e}&lib=${t}`;
    const first = d.getElementsByTagName('script')[0];
    first.parentNode.insertBefore(script, first);
  };
  ttq.load(TIKTOK_PIXEL_ID);
  if (typeof ttq.grantConsent === 'function') ttq.grantConsent();
  ttq.page();
}

function revokeLoadedPixels({ analytics, marketing }) {
  if (!analytics && typeof window.clarity === 'function') {
    try { window.clarity('consent', false); } catch { /* noop */ }
  }
  if (!marketing) {
    try {
      if (typeof window.fbq === 'function') window.fbq('consent', 'revoke');
    } catch { /* noop */ }
    try {
      if (window.ttq && typeof window.ttq.revokeConsent === 'function') {
        window.ttq.revokeConsent();
      }
    } catch { /* noop */ }
  }
}

function clearCookiesByName(dropFn) {
  if (typeof document === 'undefined') return;
  const names = document.cookie.split(';').map((part) => part.split('=')[0].trim()).filter(Boolean);
  names.forEach((name) => {
    if (!dropFn(name)) return;
    document.cookie = `${name}=; path=/; max-age=0`;
    const domain = cookieDomainAttr();
    if (domain) document.cookie = `${name}=; path=/${domain}; max-age=0`;
  });
}

export function applyConsent({ analytics, marketing }) {
  updateGtagConsent({ analytics, marketing });
  if (analytics) loadClarity();
  if (marketing) {
    loadMetaPixel();
    loadTikTokPixel();
  }
  if (!analytics || !marketing) {
    revokeLoadedPixels({ analytics, marketing });
  }
  if (!analytics) {
    clearCookiesByName((name) => (
      name === '_ga'
      || name === '_gid'
      || name === '_gat'
      || name.startsWith('_ga_')
      || name === '_clck'
      || name === '_clsk'
    ));
  }
  if (!marketing) {
    clearCookiesByName((name) => (
      name.startsWith('_gcl_')
      || name === '_fbp'
      || name === '_fbc'
      || name === '_ttp'
      || name === '_tt_enable_cookie'
    ));
  }
}

export function saveAndApplyConsent({ analytics, marketing }) {
  const prev = window.__ncConsent || readConsent();
  const next = writeConsent({ analytics, marketing });
  applyConsent(next);
  const withdrew = (prev?.analytics && !analytics) || (prev?.marketing && !marketing);
  if (withdrew && (window.__ncClarityLoaded || window.__ncMetaLoaded || window.__ncTikTokLoaded)) {
    window.location.reload();
  }
  return next;
}

export function openCookieSettings() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT));
}

export function defaultDenied() {
  return { necessary: true, analytics: false, marketing: false };
}

export function defaultGranted() {
  return { necessary: true, analytics: true, marketing: true };
}
