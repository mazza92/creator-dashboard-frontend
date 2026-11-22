import api from '../config/api';
import { trackProBeginCheckout } from './subscriptionAnalytics';
import { getEmailCampaign } from './upgradeDeeplink';
import { rememberCheckoutReturn } from './checkoutReturn';

// Straight to Stripe for Pro (monthly), for screens that already explain Pro (the out-of-free-pitches waiting
// room). The backend decides the free week. Resolves after the redirect starts; throws if checkout can't be
// created, so the caller can fall back to the upgrade window.
export async function startProCheckout(source) {
  const src = String(source || 'direct').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 40);
  trackProBeginCheckout({ tier: 'pro', source: src, interval: 'monthly' });
  const payload = { tier: 'pro', interval: 'monthly', source: src };
  const campaign = getEmailCampaign();
  if (campaign) payload.email_campaign = campaign;
  const { data } = await api.post('/api/subscription/create-checkout', payload);
  if (!data || !data.checkout_url) throw new Error('no checkout url');
  rememberCheckoutReturn();
  window.location.href = data.checkout_url;
}
