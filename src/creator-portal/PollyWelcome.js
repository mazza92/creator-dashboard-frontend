import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowRight } from 'lucide-react';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

// First visit to Polly: one question, one button. The creator confirms what they post about, then the first
// brand matches load (the server starts ranking them while this card is on screen). Offer type, ship-to and the
// rest of the pitch facts use defaults and are asked later, when a pitch actually needs them.

const NICHE_LABEL = (id) => String(id || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const MAX = 3;

function fmt(n) {
  const v = Number(n) || 0;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return String(v);
}

export default function PollyWelcome({ facts, firstName, avatar, onDone }) {
  const [niches, setNiches] = useState(() => (facts?.niches || []).slice(0, MAX));
  const [saving, setSaving] = useState(false);
  const options = Array.from(new Set([...(facts?.niches || []), ...(facts?.niche_options || [])]));

  const toggle = (id) => setNiches((cur) => (
    cur.includes(id) ? cur.filter((n) => n !== id) : (cur.length >= MAX ? cur : [...cur, id])
  ));

  const go = async () => {
    setSaving(true);
    try {
      await apiClient.post('/api/polly/pitch-facts', { niches, confirm: true });
    } catch (_) {
      // Never block the first matches on this: brands still load on the niches we had.
    }
    onDone(niches);
  };

  return (
    <Card aria-labelledby="polly-welcome-title">
      <Top>
        {avatar ? <img src={avatar} alt="" /> : null}
        <div>
          <h2 id="polly-welcome-title">{firstName ? `Hi ${firstName}, I'm Polly` : "Hi, I'm Polly"} 👋</h2>
          <p>
            I find brands that send PR and pay creators like you, write your pitches and follow up.
            {facts?.followers ? <> I see <b>{fmt(facts.followers)} followers</b> on your profile.</> : null}
          </p>
        </div>
      </Top>
      <Q>What do you post about?</Q>
      <Hint>Pick up to {MAX}. I match brands on these.</Hint>
      <Chips role="group" aria-label="Your niches">
        {options.map((id) => {
          const on = niches.includes(id);
          return (
            <button key={id} type="button" aria-pressed={on} disabled={!on && niches.length >= MAX} onClick={() => toggle(id)}>
              {on ? '✓ ' : ''}{NICHE_LABEL(id)}
            </button>
          );
        })}
      </Chips>
      <Go type="button" onClick={go} disabled={saving || niches.length === 0}>
        {saving ? 'Finding your brands…' : 'Find my brands'} <ArrowRight size={18} />
      </Go>
      <Fine>You can change this any time in Settings.</Fine>
    </Card>
  );
}

const rise = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;

const Card = styled.section`
  width: 100%;
  max-width: 560px;
  margin: 24px auto 0;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 22px;
  padding: 24px;
  display: grid;
  gap: 12px;
  box-shadow: 0 18px 40px rgba(18, 20, 26, 0.06);
  animation: ${rise} 0.35s ease both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
  @media (max-width: 480px) { padding: 18px; border-radius: 18px; margin-top: 12px; }
`;
const Top = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  img { width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0; object-fit: cover; }
  h2 { margin: 2px 0 6px; font-size: 21px; line-height: 1.2; color: ${t.ink}; }
  p { margin: 0; color: ${t.muted}; font-size: 15px; line-height: 1.5; }
  p b { color: ${t.ink}; }
`;
const Q = styled.div`
  margin-top: 6px;
  font-weight: 800;
  font-size: 16px;
  color: ${t.ink};
`;
const Hint = styled.div`
  margin-top: -8px;
  font-size: 13px;
  color: ${t.muted};
`;
const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  button {
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    padding: 8px 13px;
    border-radius: 999px;
    border: 1px solid ${t.line};
    background: ${t.white};
    color: ${t.ink};
    cursor: pointer;
  }
  button[aria-pressed='true'] { background: ${t.accentSoft}; border-color: ${t.accent}; color: ${t.accentDeep}; }
  button:disabled { opacity: 0.4; cursor: default; }
  button:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
`;
const Go = styled.button`
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 14px;
  padding: 14px 18px;
  background: ${t.ink};
  color: #fff;
  font: inherit;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
`;
const Fine = styled.p`
  margin: 0;
  text-align: center;
  font-size: 12.5px;
  color: ${t.muted};
`;
