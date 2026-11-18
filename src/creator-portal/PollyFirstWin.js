import React from 'react';
import styled from 'styled-components';
import { ArrowRight } from 'lucide-react';
import { creatorTokens as t } from '../theme/creatorTokens';
import { PRO_OFFER } from '../config/proOffer';

// Right after the first pitches go out: the win, then Pro as what keeps it going while they wait for replies.

export function listNames(names) {
  const list = (names || []).filter(Boolean);
  if (list.length <= 1) return list[0] || '';
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}

const PRO_UNLOCKS = [
  ['📨', `Up to ${PRO_OFFER?.MAX_DAILY_PITCHES || 20} matched brands pitched every weekday`],
  ['🔁', 'Follow-ups on day 4 and day 10, sent for you'],
  ['🔥', 'Hot brands running UGC ads, added as they appear'],
  ['💸', 'Paid UGC gigs, gathered in one place'],
  ['☀️', 'A daily brief: what got done and what’s next'],
];

export default function PollyFirstWin({ names, freeLeft = 0, isPro = false, onUpgrade, onWait }) {
  const n = (names || []).filter(Boolean).length;
  return (
    <Wrap>
      <Banner role="status">
        <span className="em" aria-hidden="true">🎉</span>
        <div>
          <b>{n} pitch{n === 1 ? '' : 'es'} sent to {listNames(names)}!</b>
          <span>Follow-ups are scheduled for day 4 and day 10. Replies land in your inbox.</span>
        </div>
      </Banner>
      {isPro ? null : (
        <Pro>
          <span className="badge">{freeLeft > 0 ? `${freeLeft} free pitch${freeLeft === 1 ? '' : 'es'} left` : '0 free pitches left'}</span>
          <h3>Keep Polly as your personal assistant so you can focus on creating content</h3>
          <p className="sub">
            Landing consistent UGC deals takes volume and follow-ups. Let Polly handle your brand outreach with up to
            {' '}{PRO_OFFER?.MAX_DAILY_PITCHES || 20} matched brands every day while you focus on filming.
          </p>
          <div className="kick">What unlocks with Pro ($19/month)</div>
          <ul>
            {PRO_UNLOCKS.map(([icon, text]) => (
              <li key={text}><span className="ic" aria-hidden="true">{icon}</span>{text}</li>
            ))}
          </ul>
          <Upgrade type="button" onClick={onUpgrade}>Upgrade to Pro — $19/month <ArrowRight size={17} aria-hidden="true" /></Upgrade>
          <Wait type="button" onClick={onWait}>I&apos;ll wait for replies on these {n} first</Wait>
        </Pro>
      )}
    </Wrap>
  );
}

const Wrap = styled.div`width: 100%; margin-top: 12px; display: grid; gap: 12px; font-family: ${t.fontSans}; color: ${t.ink};`;

const Banner = styled.div`
  display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 16px;
  background: ${t.accentSoft}; border: 1px solid ${t.accentBorder};
  .em { font-size: 22px; line-height: 1; }
  b { display: block; font-size: 15.5px; }
  span { display: block; font-size: 13.5px; color: ${t.accentDeep}; margin-top: 3px; line-height: 1.45; }
`;

const Pro = styled.div`
  background: ${t.ink}; color: #fff; border-radius: 20px; padding: 20px;
  box-shadow: 0 10px 30px rgba(18, 20, 26, 0.18);
  .badge {
    display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase;
    padding: 5px 10px; border-radius: 999px; background: #2a2e37; color: #ffb4cf;
  }
  h3 { margin: 12px 0 8px; font-size: 20px; line-height: 1.25; font-weight: 800; letter-spacing: -0.01em; }
  .sub { margin: 0 0 16px; font-size: 14.5px; line-height: 1.5; color: #c9ced8; }
  .kick { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #72e1d7; margin-bottom: 10px; }
  ul { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 9px; }
  li { display: flex; align-items: center; gap: 10px; font-size: 14px; line-height: 1.35; }
  .ic { width: 28px; height: 28px; border-radius: 8px; background: #252932; flex: none; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; }
  @media (max-width: 480px) { padding: 18px 16px; }
`;

const Upgrade = styled.button`
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; border: 0; border-radius: 14px;
  padding: 15px; background: linear-gradient(90deg, #ff3d8b, #ff5a5f); color: #fff; font-family: inherit;
  font-size: 16px; font-weight: 800; cursor: pointer;
`;

const Wait = styled.button`
  display: block; width: 100%; margin-top: 10px; padding: 8px; border: 0; background: none; cursor: pointer;
  font-family: inherit; font-size: 14px; color: #c9ced8; text-decoration: underline;
`;
