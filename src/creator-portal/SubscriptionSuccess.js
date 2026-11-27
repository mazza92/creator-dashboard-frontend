import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import { trackProPurchase } from '../utils/subscriptionAnalytics';
import { startProCheckout } from '../utils/startProCheckout';
import { MAX_DAILY_PITCHES } from '../config/proOffer';
import { creatorTokens as t } from '../theme/creatorTokens';

// Right after checkout. Same look and promise as the free flow's Pro card. Gmail is asked for only when it isn't
// connected yet (creators who sent their free pitches from Gmail go straight on to set up Autopilot).

export const PRO_PERKS = [
  ['📨', `Up to ${MAX_DAILY_PITCHES} brand pitches daily, matched to you and sent from your Gmail`],
  ['🔁', 'Follow-ups on day 4 and day 10, sent for you'],
  ['💬', 'Replies answered: Polly drafts your answer, rates included'],
  ['🔥', 'Hot brands running UGC ads, added as they appear'],
  ['💸', 'Paid UGC gigs, gathered in one place'],
  ['☀️', 'A daily brief: what got done and what’s next'],
];

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [gmail, setGmail] = useState(null); // null: checking, then true / false
  const [connecting, setConnecting] = useState(false);
  // Free week: the backend places a $1 hold (released at once). A card with nothing on it ends the trial before it
  // starts, so this page says so and offers another card instead of "You're Pro".
  const [declined, setDeclined] = useState('');
  const [retrying, setRetrying] = useState(false);

  const openPolly = () => navigate('/creator/dashboard/for-you?autopilot=pro_started');

  const connectGmail = async () => {
    setConnecting(true);
    try {
      const res = await api.get('/api/polly/autopilot/gmail/connect');
      if (res.data?.url) {
        window.location.href = res.data.url;
        return;
      }
    } catch (err) {
      console.error('Gmail connect failed', err);
    }
    setConnecting(false);
    openPolly();
  };

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    const trackPurchase = () => {
      if (!sessionId) return;
      trackProPurchase({ sessionId, tier: 'pro' });

      const ttqKey = `ttq_purchase_${sessionId}`;
      try {
        if (!window.sessionStorage.getItem(ttqKey) && window.ttq) {
          window.ttq.track('CompletePayment', {
            content_type: 'product',
            content_id: 'pro_subscription',
            content_name: 'NewCollab Pro',
            value: 19,
            currency: 'USD',
          });
          window.sessionStorage.setItem(ttqKey, '1');
        }
      } catch (_) { /* ignore */ }
    };

    const confirmAndFetchStatus = async () => {
      try {
        if (sessionId) {
          await api.post('/api/subscription/confirm-checkout', { session_id: sessionId });
        }
        trackPurchase();
        await api.get('/api/subscription/status');
      } catch (error) {
        const data = error?.response?.data;
        if (data?.card_declined) {
          setDeclined(data.message || "Your card was declined, so your free week didn't start. Nothing was charged.");
          return;
        }
        trackPurchase();
        console.error('Error confirming checkout:', error);
      }
      try {
        const ap = await api.get('/api/polly/autopilot/status');
        setGmail(Boolean(ap.data?.gmail?.connected));
      } catch (_) {
        setGmail(false);
      }
    };

    const id = setTimeout(confirmAndFetchStatus, 1000);
    return () => clearTimeout(id);
  }, [searchParams]);

  const retry = async () => {
    setRetrying(true);
    try {
      await startProCheckout('card_declined_retry');
    } catch (_) {
      setRetrying(false);
      navigate('/creator/dashboard/for-you');
    }
  };

  if (declined) {
    return (
      <Page>
        <Card>
          <div className="stripe" aria-hidden="true" />
          <div className="inner">
            <span className="badge">Card check</span>
            <h1>That card didn&apos;t go through</h1>
            <p className="sub">{declined}</p>
            <Primary type="button" onClick={retry} disabled={retrying}>
              {retrying ? 'Opening checkout…' : 'Try another card'} <ArrowRight size={18} aria-hidden="true" />
            </Primary>
            <p className="fine">We place a $1 hold to check the card and release it right away. You&apos;re never charged for it.</p>
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <Card>
        <div className="stripe" aria-hidden="true" />
        <div className="inner">
          <span className="badge">★ Pro</span>
          <h1>You&apos;re Pro. Polly&apos;s on it. <span aria-hidden="true">🚀</span></h1>
          <p className="sub">From today she runs your brand outreach on autopilot, so you can focus on creating content.</p>

          <ul>
            {PRO_PERKS.map(([icon, text]) => (
              <li key={text}><span className="ic" aria-hidden="true">{icon}</span>{text}</li>
            ))}
          </ul>

          {gmail === null ? (
            <Primary type="button" disabled>One sec…</Primary>
          ) : gmail ? (
            <>
              <Primary type="button" onClick={openPolly}>Set up my autopilot <ArrowRight size={18} aria-hidden="true" /></Primary>
              <p className="fine">Gmail is connected. Two minutes of setup and your first pitches go out within the hour.</p>
            </>
          ) : (
            <>
              <p className="step">One step left: connect Gmail so Polly can send.</p>
              <Primary type="button" onClick={connectGmail} disabled={connecting}>
                {connecting ? 'Opening Google…' : <>Connect Gmail <ArrowRight size={18} aria-hidden="true" /></>}
              </Primary>
              <p className="fine">Send-only access. Polly can&apos;t read your inbox.</p>
              <button type="button" className="later" onClick={openPolly}>I&apos;ll do it later</button>
            </>
          )}

          <p className="note">Brands usually reply in 2–4 weeks, so a quiet first week is normal.</p>
        </div>
      </Card>
    </Page>
  );
};

export default SubscriptionSuccess;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  background: ${t.paper};
  font-family: ${t.fontSans};
  box-sizing: border-box;
`;

const Card = styled.div`
  width: 100%;
  max-width: 520px;
  background: ${t.ink};
  color: #fff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 16px 40px rgba(18, 20, 26, 0.2);
  .stripe { height: 6px; background: linear-gradient(90deg, #72e1d7, #ff3d8b, #ff5a5f); }
  .inner { padding: 28px 26px 24px; }
  .badge {
    display: inline-block; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
    padding: 6px 12px; border-radius: 999px; background: linear-gradient(90deg, #ff3d8b, #ff5a5f);
  }
  h1 { margin: 16px 0 8px; font-size: 30px; line-height: 1.15; font-weight: 800; letter-spacing: -0.02em; }
  .sub { margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #c9ced8; }
  ul { list-style: none; margin: 0 0 22px; padding: 14px 16px; display: grid; gap: 10px; background: #1f2229; border-radius: 16px; }
  li { display: flex; align-items: center; gap: 12px; font-size: 14.5px; line-height: 1.4; color: #e6e8ec; }
  .ic { width: 30px; height: 30px; border-radius: 9px; background: #2a2e37; flex: none; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; }
  .step { margin: 0 0 12px; text-align: center; font-weight: 600; font-size: 14.5px; }
  .fine { margin: 10px 0 0; text-align: center; font-size: 12.5px; color: #8a909c; }
  .later {
    display: block; margin: 8px auto 0; border: 0; background: none; cursor: pointer; font: inherit;
    font-size: 14px; color: #c9ced8; text-decoration: underline; padding: 6px;
  }
  .note { margin: 18px 0 0; padding-top: 14px; border-top: 1px solid #2a2e37; text-align: center; font-size: 13px; color: #8a909c; }
  @media (max-width: 480px) { .inner { padding: 24px 18px 20px; } h1 { font-size: 26px; } }
`;

const Primary = styled.button`
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  border: 0; border-radius: 14px; padding: 16px; cursor: pointer; font-family: inherit;
  font-size: 16px; font-weight: 800; color: #fff; background: linear-gradient(90deg, #ff3d8b, #ff5a5f);
  &:disabled { opacity: 0.7; cursor: default; }
`;
