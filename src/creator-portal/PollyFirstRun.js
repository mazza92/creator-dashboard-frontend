import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { creatorTokens as t } from '../theme/creatorTokens';
import scrollChatTo from './scrollChatTo';
import { money } from './tracker/trackerModel';

// A new creator's first visit (GET /api/polly/bootstrap -> first_run): one screen that shows how Newcollab works
// for them. Their goal, the brands Polly already lined up (teaser), how Polly gets them there, and one choice:
// Polly contacts brands from their Gmail, or they pitch the brands themselves. Nothing else posts until they pick.

const MONO_COLORS = ['#1f2937', '#b4436c', '#2563eb', '#7c3aed', '#0f766e', '#9a5b00'];

function initials(name) {
  const words = String(name || '').replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || '?').slice(0, 2)).toUpperCase();
}

function nicheText(niches) {
  const list = (niches || []).slice(0, 2).map((n) => String(n).replace(/_/g, ' ').toLowerCase());
  return list.length ? list.join(' and ') : '';
}

export default function PollyFirstRun({ data, firstName, avatar, onStart, busy }) {
  const ref = useRef(null);
  useEffect(() => {
    // The chat scrolls to its bottom; the welcome starts at its top.
    const id = setTimeout(() => scrollChatTo(ref.current), 60);
    return () => clearTimeout(id);
  }, []);
  if (!data?.brands?.length) return null;
  const goal = money(data.goal_cents);
  const niche = nicheText(data.niches);
  const free = data.free_left;
  const startIds = data.brands.map((b) => b.brand_id).slice(0, free == null ? 3 : Math.max(1, Math.min(3, free)));
  return (
    <Wrap ref={ref} aria-label="Welcome">
      <Hello>
        <span className="who">{avatar ? <img src={avatar} alt="" /> : null}Polly · your manager</span>
        <h2>Hi{firstName ? ` ${firstName}` : ''}, your first brands are lined up.</h2>
        <p>{niche ? `I matched them to your ${niche} content. ` : ''}Here&apos;s how we get you to {goal} in {data.month}.</p>
      </Hello>

      <Teaser>
        <div className="kick"><span>Lined up for you</span><span>{data.this_week} this week</span></div>
        <Deck>
          {data.brands.map((b, i) => (
            <Brand key={b.brand_id}>
              {b.hot ? <span className="hot">🔥 Hot</span> : null}
              {b.logo ? <img className="mono" src={b.logo} alt="" /> : (
                <span className="mono" style={{ background: MONO_COLORS[i % MONO_COLORS.length] }}>{initials(b.brand_name)}</span>
              )}
              <span className="nm">{b.brand_name}</span>
              <Tag $paid={b.offer === 'paid'}>{b.offer === 'paid' ? 'Paid ask' : 'Gifted'}</Tag>
              <span className="why">{b.reason}</span>
              <span className="st"><i />Ready to pitch</span>
            </Brand>
          ))}
        </Deck>

        <How>
          <h3>How we get you to {goal}</h3>
          <Step><span className="n">1</span><span className="t"><b>I find brands that fit you</b> every weekday, checked for real ads and a working inbox.</span></Step>
          <Step><span className="n">2</span><span className="t"><b>I write each pitch</b> with your media kit link, so you see who opens it.</span></Step>
          <Step><span className="n">3</span><span className="t"><b>They go out on schedule</b> from your Gmail, with follow-ups.</span></Step>
          <Step $you><span className="n">4</span><span className="t"><b>You answer replies and get paid.</b> I draft your answers too.</span></Step>
        </How>
        {data.reply_one_in && data.deal_one_in ? (
          <PlanMath>
            About <b>{data.per_week} brands a week</b> gets you there. Usually 1 in {data.reply_one_in} brands writes back,
            and 1 in {data.deal_one_in} of those says yes.
          </PlanMath>
        ) : null}
      </Teaser>

      <Actions>
        <button type="button" className="primary" disabled={busy} onClick={() => onStart('gmail', startIds)}>
          <span className="g" aria-hidden="true" />Start contacting brands for me
        </button>
        <button type="button" className="ghost" disabled={busy} onClick={() => onStart('manual', data.brands.map((b) => b.brand_id))}>
          I&apos;ll pitch brands myself
        </button>
        <p>
          {free != null ? `Your first ${free === 1 ? 'pitch is' : `${free || 3} pitches are`} free. ` : ''}
          You check each pitch before anything is sent.
        </p>
      </Actions>
    </Wrap>
  );
}

const Wrap = styled.section`
  display: grid;
  gap: 14px;
  width: 100%;
  max-width: 600px;
  margin: 4px auto 8px;
  font-family: ${t.fontSans};
  color: ${t.ink};
  scroll-margin-top: 12px;
`;

const Hello = styled.div`
  display: grid;
  gap: 6px;
  .who { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: ${t.muted}; }
  .who img { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; }
  h2 { margin: 0; font-size: 26px; line-height: 1.15; font-weight: 700; letter-spacing: -0.02em; text-wrap: balance; }
  p { margin: 0; font-size: 15px; line-height: 1.5; color: ${t.inkSoft}; }
  @media (max-width: 480px) { h2 { font-size: 23px; } }
`;

const Teaser = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 18px;
  padding: 14px;
  display: grid;
  gap: 12px;
  min-width: 0;
  .kick { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${t.accent}; }
  .kick span:last-child { color: ${t.muted}; letter-spacing: 0; text-transform: none; font-weight: 600; }
`;

const Deck = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  margin: 0 -14px;
  padding: 0 14px 4px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const Brand = styled.div`
  position: relative;
  flex: 0 0 156px;
  scroll-snap-align: start;
  display: grid;
  gap: 6px;
  align-content: start;
  padding: 11px;
  border-radius: 14px;
  border: 1px solid ${t.line};
  background: ${t.paper};
  .mono { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; font-weight: 800; font-size: 13px; color: #fff; object-fit: cover; background: ${t.white}; }
  .nm { font-weight: 700; font-size: 14px; line-height: 1.2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .why { font-size: 12px; color: ${t.muted}; line-height: 1.35; }
  .st { display: flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 600; color: ${t.inkSoft}; }
  .st i { width: 6px; height: 6px; border-radius: 50%; background: ${t.accent}; display: inline-block; }
  .hot { position: absolute; top: 9px; right: 9px; font-size: 11px; font-weight: 700; color: ${t.hot}; }
`;

const Tag = styled.span`
  width: max-content;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${(p) => (p.$paid ? t.accentSoft : '#fbf0dd')};
  color: ${(p) => (p.$paid ? t.accentDeep : '#9a5b00')};
`;

const How = styled.div`
  display: grid;
  border-top: 1px solid ${t.line};
  padding-top: 10px;
  h3 { margin: 0 0 4px; font-size: 14px; }
`;

const Step = styled.div`
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  padding: 5px 0;
  .n {
    width: 21px; height: 21px; border-radius: 50%; display: grid; place-items: center; font-size: 11px; font-weight: 700;
    border: 1.5px solid ${(p) => (p.$you ? t.accent : t.ink)}; color: ${(p) => (p.$you ? t.accent : t.ink)};
  }
  .t { font-size: 13.5px; line-height: 1.45; color: ${t.inkSoft}; }
  .t b { color: ${t.ink}; }
`;

const PlanMath = styled.p`
  margin: 0;
  background: ${t.subtle};
  border-radius: 12px;
  padding: 9px 11px;
  font-size: 13px;
  line-height: 1.5;
  color: ${t.inkSoft};
  b { color: ${t.ink}; }
`;

const Actions = styled.div`
  display: grid;
  gap: 8px;
  button {
    border-radius: 999px;
    padding: 13px 16px;
    font: inherit;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    gap: 9px;
    justify-content: center;
    align-items: center;
  }
  button:disabled { opacity: .6; cursor: default; }
  .primary { background: ${t.ink}; color: ${t.white}; border: 1px solid ${t.ink}; }
  .ghost { background: ${t.white}; color: ${t.ink}; border: 1px solid ${t.line}; }
  .g { width: 16px; height: 16px; border-radius: 4px; background: conic-gradient(#ea4335 0 25%, #fbbc05 0 50%, #34a853 0 75%, #4285f4 0); }
  p { margin: 0; text-align: center; font-size: 12.5px; color: ${t.muted}; }
`;
