/**
 * Shared helpers for the signup CTAs on organic SEO pages (blog posts, brand pages, directory).
 * Every CTA links to creator signup with context the signup form already reads
 * (ref, brand, source_page, intent) plus utm_* so first-touch attribution credits the page,
 * and fires a GA4 `cta_click` event through the existing content-hub analytics helper.
 */
import { trackContentHubEvent } from '../utils/contentHubAnalytics';
import { dashboardHomeHref, signupHref } from './dashboardLinks';

const clean = (v, max = 120) => String(v == null ? '' : v).trim().slice(0, max);

/**
 * @param {object} opts
 * @param {'blog'|'brand_page'|'directory'} opts.ref  page family
 * @param {string} opts.location  which CTA (e.g. "unlock_gate", "sticky_bar")
 * @param {string} [opts.slug]    blog post slug or page path
 * @param {string} [opts.brand]   brand slug or name the CTA is about
 * @param {string} [opts.method]  "google" | "email": button the visitor picked
 * @param {string} [opts.intent]  signup intent, e.g. "brand_specific"
 * @param {string} [opts.country] ISO country guessed from the browser locale
 */
export function seoSignupHref({ ref, location, slug, brand, method, intent, country } = {}) {
  const params = new URLSearchParams();
  if (ref) params.set('ref', clean(ref, 40));
  if (slug) {
    params.set('slug', clean(slug));
    params.set('source_page', clean(slug));
  }
  if (brand) params.set('brand', clean(brand));
  if (intent) params.set('intent', clean(intent, 40));
  if (method) params.set('method', clean(method, 20));
  if (country) params.set('country', clean(country, 2));
  params.set('utm_source', clean(ref || 'seo', 40));
  params.set('utm_medium', 'seo_cta');
  if (location) params.set('utm_campaign', clean(location, 60));
  if (slug || brand) params.set('utm_content', clean(slug || brand));
  return `${signupHref()}?${params.toString()}`;
}

/** Where a signed-in creator should land instead of signup. */
export function signedInHref(brand) {
  const base = dashboardHomeHref('creator');
  return brand ? `${base}?brand=${encodeURIComponent(clean(brand))}` : base;
}

export function trackCtaClick(params = {}) {
  try {
    trackContentHubEvent('cta_click', {
      location: params.location || 'unknown',
      page: params.page || (typeof window !== 'undefined' ? window.location.pathname : ''),
      ...(params.brand ? { brand: clean(params.brand) } : {}),
      ...(params.method ? { method: params.method } : {}),
      ...(params.variant ? { variant: params.variant } : {}),
    });
  } catch {
    /* analytics must never break navigation */
  }
}

export function trackCtaView(params = {}) {
  try {
    trackContentHubEvent('cta_view', {
      location: params.location || 'unknown',
      page: params.page || (typeof window !== 'undefined' ? window.location.pathname : ''),
    });
  } catch {
    /* ignore */
  }
}

// Storage access throws in private mode / with blocked site data.
export function storageGet(kind, key) {
  try {
    return window[kind].getItem(key);
  } catch {
    return null;
  }
}

export function storageSet(kind, key, value) {
  try {
    window[kind].setItem(key, value);
  } catch {
    /* storage blocked */
  }
}

const COUNTRY_NAMES = {
  US: 'the US',
  GB: 'the UK',
  CA: 'Canada',
  AU: 'Australia',
  NZ: 'New Zealand',
  IE: 'Ireland',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  IT: 'Italy',
  NL: 'the Netherlands',
  SE: 'Sweden',
};

/** Best-effort country from the browser locale ("en-GB" -> GB). Never a network call. */
export function guessCountry() {
  try {
    const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]) || [];
    for (const lang of langs) {
      const m = /^[a-z]{2,3}-([A-Z]{2})\b/.exec(String(lang || ''));
      if (m && COUNTRY_NAMES[m[1]]) return m[1];
    }
  } catch {
    /* ignore */
  }
  return '';
}

export function countryLabel(code) {
  return COUNTRY_NAMES[code] || 'your country';
}
