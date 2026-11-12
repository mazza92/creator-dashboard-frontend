import React from 'react';
import styled from 'styled-components';
import { creatorTokens as t } from '../theme/creatorTokens';
import HotTag from './HotTag';
import { money } from './tracker/trackerModel';

// Free pitches used (backend kind "upsell", after a pitch was sent): the creator's own plan waiting, what Pro does
// right now, their goal, one clear CTA. Pattern from in-context upgrade moments (celebrate the win, show what's
// waiting for *them*, make the free trial the obvious next step, keep "wait" as the slow option).

export default function PollyUpsellCard({ upsell, chips = [], onChip, disabled }) {
  if (!upsell) return null;
  const unlock = chips.find((c) => c.action === 'unlock_pro') || { id: 'unlock_pro', action: 'unlock_pro', label: 'Start my free week' };
  const later = chips.find((c) => c.action !== 'unlock_pro');
  const waiting = upsell.waiting || [];
  const count = Number(upsell.waiting_count) || waiting.length;
  const more = Math.max(0, count - waiting.length);
  const hours = Number(upsell.hours) || 0;
  return (
    <Card aria-label="Keep pitching with Pro">
      <span className="win">🎉 Your free pitches are out. Nice start!</span>
      <h3>{count ? <>Your plan has <b>{count} brands</b> ready to pitch.</> : <>Keep the momentum going.</>}</h3>
      {upsell.kit_views ? (
        <p className="proof">{upsell.kit_views} brand{upsell.kit_views === 1 ? ' has' : 's have'} already opened your kit.</p>
      ) : null}

      {waiting.length ? (
        <Waiting>
          {waiting.map((b) => (
            <li key={b.brand_id}>
              <span className="nm">{b.meta_ads ? <HotTag /> : null}{b.brand_name}</span>
              <span className={b.offer === 'paid' ? 'tag paid' : 'tag'}>{b.offer === 'paid' ? 'Paid ask' : 'Gifted'}</span>
              <span className="lock" aria-label="Sends on Pro">🔒</span>
            </li>
          ))}
          {more ? <li className="more">+{more} more lined up</li> : null}
        </Waiting>
      ) : null}

      <Value>
        <li><b>Sends your whole plan</b> from your Gmail, on schedule</li>
        <li><b>Follows up on day 4 and 10</b>, so no pitch goes quiet</li>
        <li><b>Adds fresh 🔥 brands</b> running ads, every day</li>
        {hours ? <li><b>About {hours} hour{hours === 1 ? '' : 's'} of outreach</b> done for you</li> : null}
      </Value>

      {upsell.goal_cents ? (
        <Goal>{money(upsell.goal_cents)} goal · {upsell.days_left} day{upsell.days_left === 1 ? '' : 's'} left. Pro keeps you on pace.</Goal>
      ) : null}

      <button type="button" className="cta" disabled={disabled} onClick={() => onChip && onChip(unlock)}>
        {upsell.trial ? 'Start my free week' : 'Keep pitching for me · $19/mo'}
      </button>
      <p className="fine">
        {upsell.trial ? '7 days free, then $19/mo. ' : ''}Cancel anytime. Replies to brands are always free.
      </p>
      <div className="alt">
        {later ? (
          <button type="button" className="link" disabled={disabled} onClick={() => onChip && onChip(later)}>{later.label}</button>
        ) : null}
        {upsell.reset ? <span>Or wait until {upsell.reset} for 3 more free pitches.</span> : null}
      </div>
    </Card>
  );
}

const Card = styled.div`
  margin-top: 10px;
  width: 100%;
  max-width: 560px;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid ${t.line};
  border-radius: 18px;
  background: ${t.white};
  padding: 16px;
  display: grid;
  gap: 12px;
  font-family: ${t.fontSans};
  color: ${t.ink};

  .win { justify-self: start; font-size: 12.5px; font-weight: 700; color: ${t.accentDeep}; background: ${t.accentSoft}; border-radius: 999px; padding: 4px 10px; }
  h3 { margin: 0; font-size: 20px; line-height: 1.25; font-weight: 700; letter-spacing: -0.01em; }
  h3 b { color: ${t.accentDeep}; }
  .proof { margin: 0; font-size: 13.5px; color: ${t.inkSoft}; }
  .cta {
    border: 0; border-radius: 999px; padding: 14px 16px; background: #e8395f; color: #fff;
    font: inherit; font-size: 15.5px; font-weight: 800; cursor: pointer;
    box-shadow: 0 6px 18px rgba(232, 57, 95, 0.28);
  }
  .cta:disabled { opacity: .6; cursor: default; }
  .fine { margin: -4px 0 0; text-align: center; font-size: 12.5px; color: ${t.muted}; }
  .alt { display: grid; gap: 4px; justify-items: center; text-align: center; font-size: 12.5px; color: ${t.muted}; }
  .link { border: 0; background: none; padding: 2px; font: inherit; font-size: 13px; font-weight: 600; color: ${t.inkSoft}; text-decoration: underline; cursor: pointer; }
`;

const Waiting = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
  li {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 8px;
    align-items: center;
    padding: 9px 11px;
    border-radius: 12px;
    background: ${t.paper};
    border: 1px solid ${t.line};
    font-size: 14px;
  }
  .nm { font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tag { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #fbf0dd; color: #9a5b00; }
  .tag.paid { background: ${t.accentSoft}; color: ${t.accentDeep}; }
  .lock { font-size: 12px; opacity: .7; }
  li.more { display: block; background: none; border: 0; padding: 2px 4px; font-size: 13px; color: ${t.muted}; font-weight: 600; }
`;

const Value = styled.ul`
  list-style: none;
  margin: 0;
  padding: 12px 0 0;
  border-top: 1px solid ${t.line};
  display: grid;
  gap: 8px;
  li { position: relative; padding-left: 24px; font-size: 14px; line-height: 1.45; color: ${t.inkSoft}; }
  li b { color: ${t.ink}; }
  li::before {
    content: "✓"; position: absolute; left: 0; top: 1px; width: 17px; height: 17px; border-radius: 50%;
    background: ${t.accent}; color: ${t.white}; font-size: 10.5px; font-weight: 800; display: grid; place-items: center;
  }
`;

const Goal = styled.p`
  margin: 0;
  font-size: 13.5px;
  color: ${t.inkSoft};
  background: ${t.subtle};
  border-radius: 10px;
  padding: 8px 11px;
`;
