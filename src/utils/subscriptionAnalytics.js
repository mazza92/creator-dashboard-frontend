/**
 * GA4 subscription funnel events for Google Ads (begin_checkout → purchase).
 * Uses window.gtag directly so it works from CRA and Next entry points.
 */

const PRO_PRICE_USD = 19;
const ELITE_PRICE_USD = 49;

function tierValue(tier) {
  return tier === 'elite' ? ELITE_PRICE_USD : PRO_PRICE_USD;
}

function tierItemName(tier) {
  return tier === 'elite' ? 'NewCollab Elite' : 'NewCollab Pro';
}

export function trackProBeginCheckout({ tier = 'pro', source } = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  const value = tierValue(tier);
  window.gtag('event', 'begin_checkout', {
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
 */
export function trackProPurchase({ sessionId, tier = 'pro' } = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  if (!sessionId) return;

  const storageKey = `ga4_purchase_${sessionId}`;
  try {
    if (window.sessionStorage.getItem(storageKey)) return;
  } catch (_) {
    /* ignore */
  }

  const value = tierValue(tier);
  window.gtag('event', 'purchase', {
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

  try {
    window.sessionStorage.setItem(storageKey, '1');
  } catch (_) {
    /* ignore */
  }
}
