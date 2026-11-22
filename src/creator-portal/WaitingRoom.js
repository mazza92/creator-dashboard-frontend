import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import api from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

// Out of free pitches: instead of a dead end, what the 3 pitches are doing, free things to do meanwhile, and the
// next pitches Polly already drafted (Pro sends them). The follow-up follows Autopilot's timing: it's the main
// action only from day 4; before that the card says when it opens and shows no button.

const CHECK = {
  rates: (i) => ({
    icon: '💵', title: i.done ? 'Your rates are set' : 'Set your rates',
    sub: i.band ? `Creators your size: ${i.band}` : 'So brands that pay know your price', cta: i.done ? 'Review →' : '2 min →',
  }),
  pulse: (i) => ({ icon: '🎬', title: "Film today's hook", sub: `“${i.hook}”`, cta: 'See it →' }),
  kit: () => ({ icon: '🖼️', title: 'Make your kit stronger', sub: 'Pin your best videos: brands open it from your pitch', cta: 'Edit →' }),
  gigs: (i) => ({
    icon: '💸', title: `${i.count} paid UGC gig${i.count === 1 ? '' : 's'} match${i.count === 1 ? 'es' : ''} you`,
    sub: 'Briefs with pay attached', cta: 'Browse →',
  }),
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "Dec 1": when free pitches come back (balance reset_at, else the 1st of next month, UTC).
export function resetLabel(balance, now = new Date()) {
  const raw = balance?.reset_at ? new Date(balance.reset_at) : null;
  const d = raw && !Number.isNaN(raw.getTime()) ? raw : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function trackWaitingRoom(action, extra = {}) {
  api.post('/api/polly/waiting-room/event', { action, ...extra }).catch(() => {});
}

function initials(name) {
  const w = String(name || '').replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/);
  return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || '').slice(0, 2)).toUpperCase();
}

export function FollowUp({ followup, onFollowup, disabled }) {
  if (!followup) return null;
  const name = followup.brand_name;
  if (followup.auto) {
    // Sent through Gmail: Polly sends the day-4 follow-up itself (free plan too), so nothing to do here.
    return (
      <div className="fu wait" data-testid="followup-auto">
        <span className="clock" aria-hidden="true">📬</span>
        <span>
          Polly follows up with <b>{name}</b> on <b>{followup.opens_on}</b>, from your Gmail, in the same thread.
          {followup.opened_kit ? ' They already opened your kit.' : ''} Nothing to do.
        </span>
      </div>
    );
  }
  if (!followup.due) {
    return (
      <div className="fu wait" data-testid="followup-wait">
        <span className="clock" aria-hidden="true">⏳</span>
        <span>
          <b>{name}</b> got your pitch {followup.day === 0 ? 'today' : followup.day === 1 ? 'yesterday' : `${followup.day} days ago`}.
          {' '}Follow-up opens <b>{followup.opens_on}</b> (day 4), so it doesn&apos;t land too soon.
        </span>
      </div>
    );
  }
  return (
    <div className="fu due">
      <p>
        {followup.opened_kit
          ? <><b>{name}</b> opened your kit. Day {followup.day} is the best moment for a short follow-up.</>
          : <>It's day {followup.day} since you pitched <b>{name}</b>: time for a short follow-up.</>}
      </p>
      <button type="button" className="main" disabled={disabled} onClick={() => onFollowup && onFollowup(followup)}>
        Draft my {name} follow-up <span className="free">FREE</span>
      </button>
    </div>
  );
}

export default function WaitingRoom({ room: initial, trial = false, onUpgrade, onFollowup, onOpen, disabled, source = 'chat', live = false, fallback = null }) {
  // The card in chat was built when the free pitches ran out; on a later visit its numbers (and whether the
  // follow-up is due) are refreshed from the server.
  const [fresh, setFresh] = useState(null);
  const viewed = useRef(false);
  useEffect(() => {
    if (!live) return undefined;
    let on = true;
    api.get('/api/polly/waiting-room')
      .then(({ data }) => { if (on && data?.waiting_room) setFresh(data.waiting_room); })
      .catch(() => {});
    return () => { on = false; };
  }, [live]);
  const room = fresh || initial;
  const due = !!room?.followup?.due;
  useEffect(() => {
    if (!room || viewed.current) return;
    viewed.current = true;
    trackWaitingRoom('view', { source, followup_due: due });
  }, [room, source, due]);
  // No room yet (an older card saved without one, or the fetch failed): show the fallback card meanwhile.
  if (!room) return fallback;
  const meta = { source, followup_due: due };
  const m = room.momentum || {};
  const fu = room.followup;
  const leadIsFollowup = !!(fu && fu.due);
  const items = (room.checklist || []).map((i) => ({ ...i, ...(CHECK[i.id] ? CHECK[i.id](i) : {}) })).filter((i) => i.title);
  const drafts = room.drafts || [];
  const cta = trial ? 'Start my free week' : `${drafts.length ? 'Send these + resume my plan' : 'Keep pitching for me'} · $19/mo`;
  return (
    <Card aria-label="While your pitches are out">
      <section className="momentum">
        <div className="hd"><b>Your pitches so far</b><span>Replies usually take 2–4 weeks</span></div>
        <div className="stats">
          <div><b>{m.sent || 0}</b><span>sent</span></div>
          <div><b>{m.opened || 0}</b><span>opened your kit</span></div>
          <div><b>{m.replied || 0}</b><span>{m.replied ? 'replied' : 'replied yet'}</span></div>
        </div>
        <FollowUp followup={fu} onFollowup={(f) => { trackWaitingRoom('followup', meta); if (onFollowup) onFollowup(f); }} disabled={disabled} />
      </section>

      {items.length ? (
        <section>
          <div className="hd"><b>While you wait</b><span>all free</span></div>
          <ul className="todo">
            {items.map((i, n) => (
              <li key={i.id}>
                <button type="button" className={!leadIsFollowup && n === 0 ? 'row lead' : 'row'}
                  onClick={() => { trackWaitingRoom('checklist', { ...meta, item: i.id }); if (onOpen) onOpen(i.path, i.id); }}>
                  <span className="ic" aria-hidden="true">{i.done ? '✅' : i.icon}</span>
                  <span className="tx"><b>{i.title}</b><span>{i.sub}</span></span>
                  <span className="go">{i.cta}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="ready">
        <div className="hd"><b>Ready for you</b><span className="pro">Pro</span></div>
        {drafts.length ? (
          <>
            <h4>I&apos;ve drafted your next {drafts.length === 1 ? 'pitch' : `${drafts.length} pitches`}</h4>
            <p className="sub">Matched to you, ready to send from your Gmail.{room.reset ? ` Your free pitches come back ${room.reset}.` : ''} Or start them today.</p>
            <ul className="drafts">
              {drafts.map((d) => (
                <li key={d.brand_id}>
                  <span className="av" aria-hidden="true">{initials(d.brand_name)}</span>
                  <span className="tx">
                    <b>{d.brand_name}</b>
                    <span className="subj">{d.subject}</span>
                    <span className="blur" aria-hidden="true">{d.opener}</span>
                  </span>
                  <span className={d.meta_ads ? 'tag hot' : d.offer === 'paid' ? 'tag paid' : 'tag'}>
                    {d.meta_ads ? '🔥 Running UGC ads' : d.offer === 'paid' ? 'Paid ask' : 'Gifted'}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <h4>Polly can keep pitching while you create</h4>
        )}
        {room.plan_count ? (
          <p className="paused">⏸️ Your plan has <b>{room.plan_count} brand{room.plan_count === 1 ? '' : 's'} lined up{room.reset ? ` before ${room.reset}` : ''}</b>, paused on the free plan. Pro picks up where it stopped.</p>
        ) : null}
        <button type="button" className={leadIsFollowup ? 'cta soft' : 'cta'} disabled={disabled} onClick={() => { trackWaitingRoom('upgrade', meta); if (onUpgrade) onUpgrade(); }}>
          {cta}
        </button>
        <p className="fine">
          {trial ? '7 days free, then $19/mo · ' : ''}Up to 20 brand pitches daily, follow-ups included · Cancel anytime
          {room.reset ? ` · Or wait until ${room.reset} for 3 more` : ''}
        </p>
      </section>
    </Card>
  );
}

const Card = styled.div`
  margin-top: 10px; width: 100%; max-width: 560px; min-width: 0; box-sizing: border-box;
  border: 1px solid ${t.line}; border-radius: 18px; background: ${t.white}; padding: 16px;
  display: grid; gap: 16px; font-family: ${t.fontSans}; color: ${t.ink};
  section { display: grid; gap: 10px; min-width: 0; }
  section + section { padding-top: 14px; border-top: 1px solid ${t.line}; }
  .hd { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; font-size: 14px; }
  .hd span { font-size: 12px; color: ${t.muted}; }
  .hd .pro { font-weight: 800; color: #fff; background: #e8395f; border-radius: 999px; padding: 2px 8px; font-size: 11px; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .stats div { background: ${t.paper}; border: 1px solid ${t.line}; border-radius: 12px; padding: 10px; display: grid; gap: 2px; }
  .stats b { font-size: 22px; line-height: 1; }
  .stats span { font-size: 12px; color: ${t.muted}; }
  .fu { border-radius: 12px; padding: 10px 12px; font-size: 13.5px; line-height: 1.45; }
  .fu.wait { display: flex; gap: 8px; background: ${t.subtle}; color: ${t.inkSoft}; }
  .fu.due { background: ${t.accentSoft}; display: grid; gap: 10px; }
  .fu p { margin: 0; }
  .main {
    border: 0; border-radius: 999px; padding: 12px 14px; background: ${t.ink}; color: #fff; font: inherit;
    font-size: 14.5px; font-weight: 800; cursor: pointer; display: inline-flex; gap: 8px; justify-content: center; align-items: center;
  }
  .main .free { font-size: 10.5px; background: ${t.accent}; color: #fff; border-radius: 999px; padding: 2px 6px; }
  .todo, .drafts { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  .row {
    width: 100%; display: grid; grid-template-columns: 26px minmax(0, 1fr) auto; gap: 10px; align-items: center;
    text-align: left; border: 1px solid ${t.line}; background: #fff; border-radius: 12px; padding: 9px 11px;
    font: inherit; color: inherit; cursor: pointer;
  }
  .row.lead { border-color: ${t.ink}; box-shadow: 0 0 0 1px ${t.ink}; }
  .row .ic { font-size: 18px; }
  .tx { display: grid; gap: 2px; min-width: 0; font-size: 13.5px; }
  .tx > span {
    font-size: 12.5px; color: ${t.muted}; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  .go { font-size: 12.5px; font-weight: 700; color: ${t.accentDeep}; white-space: nowrap; }
  h4 { margin: 0; font-size: 17px; line-height: 1.3; }
  .sub { margin: -4px 0 0; font-size: 13px; color: ${t.inkSoft}; }
  .drafts li {
    display: grid; grid-template-columns: 34px minmax(0, 1fr); gap: 4px 10px; align-items: start;
    border: 1px solid ${t.line}; border-radius: 12px; padding: 10px 11px; background: ${t.paper};
  }
  .av { width: 34px; height: 34px; border-radius: 10px; background: ${t.subtle}; display: grid; place-items: center; font-size: 12px; font-weight: 800; color: ${t.inkSoft}; }
  .subj { color: ${t.ink} !important; font-weight: 600; }
  .blur { filter: blur(3.5px); user-select: none; }
  .tag { grid-column: 2; justify-self: start; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: #fbf0dd; color: #9a5b00; }
  .tag.paid { background: ${t.accentSoft}; color: ${t.accentDeep}; }
  .tag.hot { background: #fde8ec; color: #b3203f; }
  .paused { margin: 0; font-size: 13.5px; color: ${t.inkSoft}; background: ${t.subtle}; border-radius: 10px; padding: 9px 11px; }
  .cta {
    border: 0; border-radius: 999px; padding: 14px 16px; background: #e8395f; color: #fff; font: inherit;
    font-size: 15.5px; font-weight: 800; cursor: pointer; box-shadow: 0 6px 18px rgba(232, 57, 95, 0.28);
  }
  .cta.soft { box-shadow: none; }
  .cta:disabled, .main:disabled { opacity: .6; cursor: default; }
  .fine { margin: -4px 0 0; text-align: center; font-size: 12px; color: ${t.muted}; }
`;
