import api from '../config/api';
import { rememberCheckoutReturn } from './checkoutReturn';
import { trackProBeginCheckout } from './subscriptionAnalytics';

// Pro for Directory access ($19/mo, 500 brand unlocks a month, no free week). Goes straight to Stripe's hosted page:
// the on-site checkout page sells Polly, which directory creators don't get. Returns false when checkout can't start.
export async function startDirectoryCheckout(source = 'directory') {
  const src = String(source || 'directory').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 40);
  trackProBeginCheckout({ tier: 'pro', source: src, interval: 'monthly' });
  try {
    const { data } = await api.post('/api/subscription/create-checkout', {
      tier: 'pro',
      interval: 'monthly',
      source: src,
    });
    if (data && data.checkout_url) {
      rememberCheckoutReturn();
      window.location.href = data.checkout_url;
      return true;
    }
  } catch (err) {
    console.error('Directory checkout failed:', err);
  }
  return false;
}

export default startDirectoryCheckout;
