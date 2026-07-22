/**
 * GA4 subscription funnel events for Google Ads (begin_checkout → purchase).
 * Uses window.gtag directly so it works from CRA and Next entry points.
 */

const GA_MEASUREMENT_ID = 'G-5RET5C6MZ8';
const PRO_PRICE_USD = 19;
const ELITE_PRICE_USD = 49;

function tierValue(tier) {
  return tier === 'elite' ? ELITE_PRICE_USD : PRO_PRICE_USD;
}

function tierItemName(tier) {
  return tier === 'elite' ? 'NewCollab Elite' : 'NewCollab Pro';
}

function gtagReady() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

export function trackProBeginCheckout({ tier = 'pro', source } = {}) {
  if (!gtagReady()) return;

  const value = tierValue(tier);
  window.gtag('event', 'begin_checkout', {
    send_to: GA_MEASUREMENT_ID,
    currency: 'USD',
    value,
    items: [
      {
        item_id: `subscription_${tier}`,
        item_name: tierItemName(tier),
        item_category: 'subscription',
        price: value,
        quantity: 1,
      },
    ],
    ...(source ? { checkout_source: source } : {}),
  });
}

/**
 * Fire once per Stripe session_id (survives success-page refresh).
 * Call as soon as the success page loads — do not wait on API confirm.
 */
export function trackProPurchase({ sessionId, tier = 'pro' } = {}) {
  if (!gtagReady()) return;
  if (!sessionId) return;

  const storageKey = `ga4_purchase_${sessionId}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, '1');
  } catch (_) {
    /* ignore */
  }

  const value = tierValue(tier);
  window.gtag('event', 'purchase', {
    send_to: GA_MEASUREMENT_ID,
    transaction_id: sessionId,
    currency: 'USD',
    value,
    items: [
      {
        item_id: `subscription_${tier}`,
        item_name: tierItemName(tier),
        item_category: 'subscription',
        price: value,
        quantity: 1,
      },
    ],
  });
}
