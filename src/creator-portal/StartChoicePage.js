import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import Logo from '../components/Logo';
import { startProCheckout } from '../utils/startProCheckout';
import { creatorTokens as t } from '../theme/creatorTokens';

// Start choice test (Nov 2026, backend services/start_choice.py): half of newly approved creators pick how to start
// on their first dashboard visit. A 7-day Autopilot trial ($0 today, card at checkout) or 3 free pitches they send
// themselves. The dashboard sends them here once (CreatorDashboardLayout); the choice is saved either way.

export const START_CHOICE_PATH = '/creator/dashboard/start';
const DASHBOARD = '/creator/dashboard/for-you';

const TRIAL_POINTS = [
  ['Finds hot brands daily.', 'Scans brands running UGC ads and new UGC gigs that fit you'],
  ['Pitches up to 20 brands a day.', 'Each pitch written for that brand, sent from your Gmail'],
  ['Follows up and tracks everything.', 'Every open, reply and deal in one place'],
  ['Reports to you every morning.', 'A daily brief with what happened and what needs you'],
];

const FREE_POINTS = [
  [true, '3 pitches written for you'],
  [true, 'You send each one'],
  [false, 'No follow-ups'],
];

async function saveChoice(choice) {
  try {
    await api.post('/api/subscription/start-choice', { choice });
  } catch (_) {
    // The choice is for the test's numbers; never block the creator on it.
  }
}

export default function StartChoicePage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState('');
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    let live = true;
    api.get('/api/subscription/start-choice')
      .then(({ data }) => {
        if (!live) return;
        if (!data?.show) navigate(DASHBOARD, { replace: true });
        else setFirstName(String(data.first_name || ''));
      })
      .catch(() => { if (live) navigate(DASHBOARD, { replace: true }); });
    return () => { live = false; };
  }, [navigate]);

  const startTrial = async () => {
    setBusy('trial');
    await saveChoice('trial');
    startProCheckout('start_choice');
  };

  const startFree = async () => {
    setBusy('free');
    await saveChoice('free');
    navigate(DASHBOARD, { replace: true });
  };

  return (
    <Page>
      <Top><Logo /></Top>
      <Main>
        <Eyebrow>You&apos;re approved</Eyebrow>
        <H1>{firstName ? `Welcome in, ${firstName}. ` : 'Welcome in. '}How do you want to start?</H1>
        <Lede>Polly already lined up brands that fit your content.</Lede>

        <Options>
          <TrialCard aria-labelledby="start-trial-title">
            <Badge>Recommended</Badge>
            <CardHead>
              <h2 id="start-trial-title">Polly runs your brand outreach for you</h2>
              <Pill>Free for 7 days</Pill>
            </CardHead>
            <p className="intro">
              Your full-time collab assistant: she finds the brands, pitches them, follows up and tracks every
              reply. <b>You just create.</b>
            </p>
            <List>
              {TRIAL_POINTS.map(([lead, rest]) => (
                <li key={lead}><Check size={18} aria-hidden="true" className="yes" /><span><b>{lead}</b> {rest}</span></li>
              ))}
            </List>
            <Actions>
              <PrimaryBtn type="button" onClick={startTrial} disabled={Boolean(busy)}>
                {busy === 'trial' ? 'Opening checkout…' : 'Start my free week'}
              </PrimaryBtn>
              <Small>$0 today, then $19/mo. Cancel anytime from your settings.</Small>
            </Actions>
          </TrialCard>

          <FreeCard aria-labelledby="start-free-title">
            <CardHead>
              <h2 id="start-free-title">Do it yourself</h2>
              <span className="free">Free</span>
            </CardHead>
            <p className="intro">3 free pitches. Polly writes each one, you send it and follow up yourself.</p>
            <List $muted>
              {FREE_POINTS.map(([yes, text]) => (
                <li key={text}>
                  {yes ? <Check size={18} aria-hidden="true" /> : <X size={18} aria-hidden="true" />}
                  <span>{text}</span>
                </li>
              ))}
            </List>
            <Actions>
              <SecondaryBtn type="button" onClick={startFree} disabled={Boolean(busy)}>
                {busy === 'free' ? 'Opening Polly…' : 'Start with 3 free pitches'}
              </SecondaryBtn>
            </Actions>
          </FreeCard>
        </Options>

        <Proof>Joined by 4,000+ UGC creators</Proof>
      </Main>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background: #f6f5f2;
  color: ${t.ink};
  font-family: Inter, system-ui, -apple-system, sans-serif;
`;

const Top = styled.header`
  display: flex;
  align-items: center;
  padding: 18px 32px;
  background: #ffffff;
  border-bottom: 1px solid ${t.line};
  @media (max-width: 640px) { padding: 14px 16px; }
`;

const Main = styled.main`
  max-width: 980px;
  margin: 0 auto;
  padding: 40px 24px 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 640px) { padding: 22px 16px 40px; align-items: stretch; }
`;

const Eyebrow = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: ${t.accent};
`;

const H1 = styled.h1`
  margin: 10px 0 8px;
  font-size: 36px;
  line-height: 1.15;
  letter-spacing: -0.02em;
  text-align: center;
  @media (max-width: 640px) { font-size: 25px; text-align: left; }
`;

const Lede = styled.p`
  margin: 0 0 30px;
  font-size: 16px;
  color: ${t.muted};
  text-align: center;
  @media (max-width: 640px) { font-size: 14px; text-align: left; margin-bottom: 22px; }
`;

const Options = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 20px;
  align-items: stretch;
  @media (max-width: 820px) { grid-template-columns: minmax(0, 1fr); gap: 16px; }
`;

const CardBase = styled.section`
  position: relative;
  background: #ffffff;
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  .intro { margin: 0; font-size: 15px; line-height: 1.5; color: ${t.inkSoft}; }
  @media (max-width: 640px) { .intro { font-size: 14px; } }
`;

const TrialCard = styled(CardBase)`
  border: 2px solid ${t.accent};
  padding: 28px 28px 24px;
  box-shadow: 0 12px 32px rgba(13, 122, 95, .12);
  @media (max-width: 640px) { padding: 22px 18px 18px; }
`;

const FreeCard = styled(CardBase)`
  border: 1px solid ${t.line};
  padding: 28px 26px 24px;
  .free { font-size: 13px; font-weight: 600; color: ${t.muted}; }
  @media (max-width: 640px) { padding: 18px; }
`;

const Badge = styled.span`
  position: absolute;
  top: -12px;
  left: 24px;
  background: ${t.accent};
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
`;

const CardHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  h2 { margin: 0; font-size: 22px; line-height: 1.25; }
  @media (max-width: 640px) {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 6px;
    h2 { font-size: 19px; }
  }
`;

const Pill = styled.span`
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${t.accent};
  background: ${t.accentSoft};
  padding: 4px 10px;
  border-radius: 999px;
`;

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 11px;
  font-size: 14.5px;
  line-height: 1.45;
  color: ${(p) => (p.$muted ? t.inkSoft : t.ink)};
  li { display: flex; gap: 10px; align-items: flex-start; }
  svg { flex-shrink: 0; margin-top: 1px; color: ${(p) => (p.$muted ? '#8a8a85' : t.accent)}; }
  @media (max-width: 640px) { font-size: 13.5px; gap: 9px; }
`;

const Actions = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PrimaryBtn = styled.button`
  font: inherit;
  font-weight: 700;
  font-size: 16px;
  min-height: 50px;
  border: 0;
  border-radius: 12px;
  background: ${t.pro};
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 8px 20px ${t.proShadow};
  &:hover:not(:disabled) { background: ${t.proHover}; }
  &:disabled { opacity: .7; cursor: wait; }
`;

const SecondaryBtn = styled.button`
  font: inherit;
  font-weight: 600;
  font-size: 15px;
  min-height: 48px;
  border: 1.5px solid #d6d4cf;
  border-radius: 12px;
  background: #ffffff;
  color: ${t.ink};
  cursor: pointer;
  &:hover:not(:disabled) { border-color: ${t.muted}; }
  &:disabled { opacity: .7; cursor: wait; }
`;

const Small = styled.span`
  font-size: 12.5px;
  color: ${t.muted};
  text-align: center;
`;

const Proof = styled.p`
  margin: 26px 0 0;
  font-size: 13.5px;
  color: ${t.muted};
  text-align: center;
`;
