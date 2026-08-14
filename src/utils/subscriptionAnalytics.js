/**
 * GA4 subscription funnel events for Google Ads (begin_checkout → purchase).
 * Uses window.gtag directly so it works from CRA and Next entry points.
 */

const GA_MEASUREMENT_ID = 'G-5RET5C6MZ8';

// Monthly pricing
const PRO_PRICE_USD = 19;
const ELITE_PRICE_USD = 49;
const PACK_BUNDLE_PRICE_USD = 9;

// Annual pricing (with 33% discount)
const PRO_ANNUAL_PRICE_USD = 152;  // Save 33% ($228 → $152)
const ELITE_ANNUAL_PRICE_USD = 392;  // Save 33% if we add Elite annual

function tierValue(tier, interval = 'monthly') {
  if (interval === 'yearly') {
    return tier === 'elite' ? ELITE_ANNUAL_PRICE_USD : PRO_ANNUAL_PRICE_USD;
  }
  return tier === 'elite' ? ELITE_PRICE_USD : PRO_PRICE_USD;
}

function tierItemName(tier, interval = 'monthly') {
  const base = tier === 'elite' ? 'NewCollab Elite' : 'NewCollab Pro';
  return interval === 'yearly' ? `${base} Annual` : base;
}

function gtagReady() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

function fbqReady() {
  return typeof window !== 'undefined' && typeof window.fbq === 'function';
}

export function trackProBeginCheckout({ tier = 'pro', source, interval = 'monthly' } = {}) {
  const value = tierValue(tier, interval);

  // GA4 begin_checkout
  if (gtagReady()) {
    window.gtag('event', 'begin_checkout', {
      send_to: GA_MEASUREMENT_ID,
      currency: 'USD',
      value,
      items: [
        {
          item_id: `subscription_${tier}_${interval}`,
          item_name: tierItemName(tier, interval),
          item_category: 'subscription',
          item_variant: interval,
          price: value,
          quantity: 1,
        },
      ],
      ...(source ? { checkout_source: source } : {}),
      billing_interval: interval,
    });
  }

  // Meta Pixel InitiateCheckout
  if (fbqReady()) {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_type: 'product',
        content_ids: [`subscription_${tier}_${interval}`],
        content_name: tierItemName(tier, interval),
        value,
        currency: 'USD',
        num_items: 1,
      });
    } catch (_) { /* pixel blockers must not break checkout */ }
  }
}

/**
 * Fire once per Stripe session_id (survives success-page refresh).
 * Call as soon as the success page loads — do not wait on API confirm.
 */
export function trackProPurchase({ sessionId, tier = 'pro', interval = 'monthly' } = {}) {
  if (!sessionId) return;

  const value = tierValue(tier, interval);

  // GA4 purchase (deduped by session_id)
  if (gtagReady()) {
    const ga4Key = `ga4_purchase_${sessionId}`;
    try {
      if (!window.sessionStorage.getItem(ga4Key)) {
        window.sessionStorage.setItem(ga4Key, '1');
        window.gtag('event', 'purchase', {
          send_to: GA_MEASUREMENT_ID,
          transaction_id: sessionId,
          currency: 'USD',
          value,
          items: [
            {
              item_id: `subscription_${tier}_${interval}`,
              item_name: tierItemName(tier, interval),
              item_category: 'subscription',
              item_variant: interval,
              price: value,
              quantity: 1,
            },
          ],
          billing_interval: interval,
        });
      }
    } catch (_) { /* ignore */ }
  }

  // Meta Pixel Purchase (deduped by session_id)
  if (fbqReady()) {
    const fbqKey = `fbq_purchase_${sessionId}`;
    try {
      if (!window.sessionStorage.getItem(fbqKey)) {
        window.sessionStorage.setItem(fbqKey, '1');
        window.fbq('track', 'Purchase', {
          content_type: 'product',
          content_ids: [`subscription_${tier}_${interval}`],
          content_name: tierItemName(tier, interval),
          value,
          currency: 'USD',
          num_items: 1,
        });
      }
    } catch (_) { /* ignore */ }
  }
}

export function trackPackBeginCheckout({ source } = {}) {
  const value = PACK_BUNDLE_PRICE_USD;

  if (gtagReady()) {
    window.gtag('event', 'begin_checkout', {
      send_to: GA_MEASUREMENT_ID,
      currency: 'USD',
      value,
      items: [
        {
          item_id: 'pack_bundle_3',
          item_name: 'NewCollab 3 Packs',
          item_category: 'packs',
          price: value,
          quantity: 1,
        },
      ],
      ...(source ? { checkout_source: source } : {}),
    });
  }

  if (fbqReady()) {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_type: 'product',
        content_ids: ['pack_bundle_3'],
        content_name: 'NewCollab 3 Packs',
        value,
        currency: 'USD',
        num_items: 1,
      });
    } catch (_) { /* pixel blockers must not break checkout */ }
  }
}

export function trackPackPurchase({ sessionId } = {}) {
  if (!sessionId) return;

  const value = PACK_BUNDLE_PRICE_USD;

  if (gtagReady()) {
    const ga4Key = `ga4_purchase_${sessionId}`;
    try {
      if (!window.sessionStorage.getItem(ga4Key)) {
        window.sessionStorage.setItem(ga4Key, '1');
        window.gtag('event', 'purchase', {
          send_to: GA_MEASUREMENT_ID,
          transaction_id: sessionId,
          currency: 'USD',
          value,
          items: [
            {
              item_id: 'pack_bundle_3',
              item_name: 'NewCollab 3 Packs',
              item_category: 'packs',
              price: value,
              quantity: 1,
            },
          ],
        });
      }
    } catch (_) { /* ignore */ }
  }

  if (fbqReady()) {
    const fbqKey = `fbq_purchase_${sessionId}`;
    try {
      if (!window.sessionStorage.getItem(fbqKey)) {
        window.sessionStorage.setItem(fbqKey, '1');
        window.fbq('track', 'Purchase', {
          content_type: 'product',
          content_ids: ['pack_bundle_3'],
          content_name: 'NewCollab 3 Packs',
          value,
          currency: 'USD',
          num_items: 1,
        });
      }
    } catch (_) { /* ignore */ }
  }
}
