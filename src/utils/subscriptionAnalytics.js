/**
 * GA4 subscription funnel events for Google Ads (begin_checkout → purchase).
 * Uses window.gtag directly so it works from CRA and Next entry points.
 */

const GA_MEASUREMENT_ID = 'G-5RET5C6MZ8';

// Monthly pricing
const PRO_PRICE_USD = 19;
const ELITE_PRICE_USD = 49;

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

export function trackProBeginCheckout({ tier = 'pro', source, interval = 'monthly' } = {}) {
  if (!gtagReady()) return;

  const value = tierValue(tier, interval);
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

/**
 * Fire once per Stripe session_id (survives success-page refresh).
 * Call as soon as the success page loads — do not wait on API confirm.
 */
export function trackProPurchase({ sessionId, tier = 'pro', interval = 'monthly' } = {}) {
  if (!gtagReady()) return;
  if (!sessionId) return;

  const storageKey = `ga4_purchase_${sessionId}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, '1');
  } catch (_) {
    /* ignore */
  }

  const value = tierValue(tier, interval);
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
