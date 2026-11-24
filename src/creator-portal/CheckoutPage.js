import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ArrowLeft, Check, ChevronDown, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import api from '../config/api';
import Logo from '../components/Logo';
import { trackProBeginCheckout } from '../utils/subscriptionAnalytics';
import { getEmailCampaign } from '../utils/upgradeDeeplink';
import { DEFAULT_RETURN, rememberCheckoutReturn, takeCheckoutReturn } from '../utils/checkoutReturn';
import { PRO_PERKS } from './SubscriptionSuccess';
import { creatorTokens as t } from '../theme/creatorTokens';
import { checkoutFaq, trustTicks } from './checkoutCopy';

// On-site Pro checkout (Nov 2026). Stripe's embedded Checkout, mounted next to what Pro does and the answers people
// look for before paying. The hosted stripe.com page said only the price, and the direct Pro buttons that sent
// creators there converted 0 of 11. Same session, same webhooks and the same free-week rule as before; when the
// backend can't embed (no publishable key yet), this page hands over to the hosted page.

const stripeCache = {};
function stripeFor(key) {
  if (!stripeCache[key]) stripeCache[key] = loadStripe(key);
  return stripeCache[key];
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const source = String(params.get('source') || 'checkout_page').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 40);
  const [state, setState] = useState({ status: 'loading' });
  const [open, setOpen] = useState(0);

  const start = useCallback(async () => {
    setState({ status: 'loading' });
    trackProBeginCheckout({ tier: 'pro', source, interval: 'monthly' });
    const payload = { tier: 'pro', interval: 'monthly', source, embedded: true };
    const campaign = getEmailCampaign();
    if (campaign) payload.email_campaign = campaign;
    try {
      const { data } = await api.post('/api/subscription/create-checkout', payload);
      if (data && data.client_secret && data.publishable_key) {
        setState({
          status: 'ready',
          clientSecret: data.client_secret,
          stripe: stripeFor(data.publishable_key),
          trialDays: Number(data.trial_days) || 0,
          trialEndsOn: data.trial_ends_on || null,
        });
        return;
      }
      if (data && data.checkout_url) {
        window.location.href = data.checkout_url; // not set up for on-site checkout yet: the hosted page
        return;
      }
      setState({ status: 'error' });
    } catch (err) {
      const paused = err?.response?.data?.paused;
      setState({ status: 'error', paused: Boolean(paused) });
    }
  }, [source]);

  useEffect(() => { start(); }, [start]);

  const back = () => {
    const to = takeCheckoutReturn();
    navigate(to || DEFAULT_RETURN);
  };

  const trialDays = state.trialDays || 0;
  const faq = useMemo(() => checkoutFaq(trialDays, state.trialEndsOn), [trialDays, state.trialEndsOn]);
  const options = useMemo(() => (state.clientSecret ? { clientSecret: state.clientSecret } : null),
    [state.clientSecret]);

  return (
    <Page>
      <Top>
        <Logo />
        <BackBtn type="button" onClick={back}><ArrowLeft size={16} aria-hidden="true" />Back</BackBtn>
      </Top>
      <Grid>
        <Main>
          <Eyebrow>Newcollab Pro</Eyebrow>
          <H1>Put Polly to work for you</H1>
          <Lede>Polly finds brands that fit you, writes every pitch, sends it and follows up. You answer the yeses.</Lede>
          <Ticks>
            {trustTicks(trialDays).map((line) => (
              <li key={line}><Check size={16} aria-hidden="true" />{line}</li>
            ))}
          </Ticks>

          <Pay aria-busy={state.status === 'loading'}>
            {state.status === 'ready' && options && (
              <EmbeddedCheckoutProvider stripe={state.stripe} options={options}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
            {state.status === 'loading' && (
              <Loading><span /><span /><span /><p>Opening secure checkout…</p></Loading>
            )}
            {state.status === 'error' && (
              <ErrorBox role="alert">
                {state.paused ? (
                  <>
                    <p>Your Pro is paused. Resume it from Settings instead of starting a new plan.</p>
                    <button type="button" onClick={() => navigate('/creator/dashboard/settings')}>Open Settings</button>
                  </>
                ) : (
                  <>
                    <p>Checkout didn&apos;t load. Nothing was charged.</p>
                    <button type="button" onClick={start}>Try again</button>
                  </>
                )}
              </ErrorBox>
            )}
            <Secure><Lock size={13} aria-hidden="true" />Payments are processed by Stripe. Newcollab never sees your card.</Secure>
          </Pay>
        </Main>

        <Side>
          <Card>
            <CardTitle>What Pro does</CardTitle>
            <Perks>
              {PRO_PERKS.slice(0, 5).map(([, text]) => (
                <li key={text}><Check size={16} aria-hidden="true" />{text}</li>
              ))}
            </Perks>
          </Card>
          <Faq>
            {faq.map((item, i) => (
              <FaqItem key={item.q}>
                <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                  {item.q}
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
                {open === i && <p>{item.a}</p>}
              </FaqItem>
            ))}
          </Faq>
        </Side>
      </Grid>
    </Page>
  );
};

// Before leaving for this page: where "Back" returns to.
export function openCheckoutPage(navigate, source) {
  rememberCheckoutReturn();
  const src = String(source || 'direct').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 40);
  navigate(`/creator/dashboard/checkout?source=${encodeURIComponent(src)}`);
}

export default CheckoutPage;

const Page = styled.div`
  min-height: 100vh;
  background: ${t.paper};
  color: ${t.ink};
  font-family: ${t.fontSans};
`;

const Top = styled.header`
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${t.white};
  border-bottom: 1px solid ${t.line};
  @media (max-width: 640px) { padding: 0 16px; height: 58px; }
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${t.line};
  background: ${t.white};
  color: ${t.ink};
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: ${t.subtle}; }
`;

const Grid = styled.main`
  max-width: 1180px;
  margin: 0 auto;
  padding: 36px 24px 64px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 40px;
  align-items: start;
  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); gap: 28px; padding: 24px 16px 48px; }
`;

const Main = styled.section`
  min-width: 0;
`;

const Eyebrow = styled.div`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${t.pro};
`;

const H1 = styled.h1`
  margin: 8px 0 10px;
  font-family: ${t.fontDisplay};
  font-weight: 800;
  letter-spacing: -0.025em;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.1;
  color: ${t.ink};
`;

const Lede = styled.p`
  margin: 0 0 18px;
  font-size: 16px;
  line-height: 1.55;
  color: ${t.inkSoft || '#4b5563'};
  max-width: 560px;
`;

const Ticks = styled.ul`
  list-style: none;
  margin: 0 0 22px;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  li {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 14px;
    font-weight: 600;
  }
  svg { color: ${t.pro}; flex: none; }
`;

const Pay = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 10px 28px rgba(18, 20, 26, 0.06);
  min-height: 420px;
  @media (max-width: 640px) { padding: 10px; border-radius: 18px; }
`;

const Loading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;
  span {
    display: block;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(90deg, ${t.subtle} 0%, #fafafa 50%, ${t.subtle} 100%);
    background-size: 200% 100%;
    animation: shimmer 1.2s linear infinite;
  }
  span:nth-child(2) { height: 120px; }
  p { margin: 4px 0 0; font-size: 14px; color: ${t.muted || '#6b7280'}; text-align: center; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
`;

const ErrorBox = styled.div`
  padding: 40px 16px;
  text-align: center;
  p { margin: 0 0 14px; font-size: 15px; }
  button {
    height: 44px;
    padding: 0 20px;
    border: 0;
    border-radius: 12px;
    background: ${t.ink};
    color: ${t.white};
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
`;

const Secure = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 12px 0 2px;
  font-size: 12.5px;
  color: ${t.muted || '#6b7280'};
`;

const Side = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 24px;
  @media (max-width: 960px) { position: static; }
`;

const Card = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 22px;
  padding: 20px;
`;

const CardTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

const Perks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  li { display: flex; gap: 9px; font-size: 14px; line-height: 1.45; }
  svg { color: ${t.pro}; flex: none; margin-top: 2px; }
`;

const Faq = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FaqItem = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 15px 16px;
    border: 0;
    background: none;
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    color: ${t.ink};
    text-align: left;
    cursor: pointer;
  }
  button[aria-expanded='true'] svg { transform: rotate(180deg); }
  p { margin: 0; padding: 0 16px 15px; font-size: 14px; line-height: 1.55; color: ${t.inkSoft || '#4b5563'}; }
`;
