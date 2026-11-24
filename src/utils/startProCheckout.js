import { rememberCheckoutReturn } from './checkoutReturn';

// Pro (monthly) for screens that already explain Pro (the waiting room, Polly's Pro buttons): opens the on-site
// checkout page (creator-portal/CheckoutPage), which embeds Stripe Checkout and falls back to the hosted page when
// embedding isn't set up. The backend decides the free week. In-app navigation, no reload.
export function checkoutPath(source) {
  const src = String(source || 'direct').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 40);
  return `/creator/dashboard/checkout?source=${encodeURIComponent(src)}`;
}

export async function startProCheckout(source) {
  rememberCheckoutReturn();
  const path = checkoutPath(source);
  if (typeof window === 'undefined') return;
  window.history.pushState({}, '', path);
  // react-router's BrowserRouter listens to popstate: this renders the checkout route without a page reload.
  window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
}
