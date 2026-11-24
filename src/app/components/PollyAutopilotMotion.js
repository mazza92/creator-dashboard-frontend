'use client';

// Homepage "How it works" motion (Nov 2026). Answers the three UGC creator pains in order, one beat each:
//   1. Finding brands  -> brands running ads, matched to the creator's niche, size and country
//   2. Pitching        -> pitches go out from their own Gmail
//   3. Lack of time    -> the week is scheduled (pitches, day-4 follow-ups) and every pitch is tracked
//   4. ...and a daily brief says what got done and what needs them
// Real UGC TikToks (our stored copies) float around the Polly phone. Brand moments are true to Newcollab data:
// Anua and Rhode answer creators who pitch them; logos come from /api/public/brands-replying.
// Loops while on screen; reduced motion shows the end state.
import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { BarChart3, CalendarDays, Clock, Search, Send, Sun } from 'lucide-react';
import { AutoTikTok } from '../../creator-portal/PromoteVisuals';
import { getRuntimeApiUrl } from '../../config/api';

const VIDEOS = [
  { id: '7702541231523384598', handle: 'alicia_ugc' },
  { id: '7702427286099856662', handle: 'ugcbysahara' },
  { id: '7701405744498773270', handle: 'ugc.with.viki' },
];

// Brands that reply to creators on Newcollab, shown as matches (logos from the replying feed).
const BRANDS = [
  { slug: 'anua', name: 'Anua', fit: 98 }, { slug: 'rhode-skin', name: 'rhode', fit: 96 },
  { slug: 'skin1004', name: 'SKIN1004', fit: 95 }, { slug: 'mac-cosmetics', name: 'MAC', fit: 92 },
  { slug: 'tarte-cosmetics', name: 'tarte', fit: 91 }, { slug: 'aveeno', name: 'Aveeno', fit: 90 },
];

const BEATS = [
  { key: 'find', label: 'Find brands', Icon: Search },
  { key: 'pitch', label: 'Pitch', Icon: Send },
  { key: 'plan', label: 'Schedule & track', Icon: CalendarDays },
  { key: 'brief', label: 'Daily brief', Icon: Sun },
];

let MSG_ID = 0;
const msg = (who, html) => ({ id: ++MSG_ID, who, html });

// Each step merges into the state. notes = cards shown around the phone.
const STEPS = [
  { at: 200, beat: 0, me: 'Find skincare brands for me and pitch them while I film' },
  { at: 1000, polly: 'Checking <b>3,000+ brands</b> for ones running ads that fit you.', notes: ['match'] },
  { at: 2300, matched: true, counters: { brands: 6 } },
  { at: 3600, polly: '<b>6 brands</b> match your niche, size and country.' },
  { at: 5200, beat: 1, polly: 'Pitches written for each brand and sent from your Gmail.', notes: ['match', 'pitch'], counters: { pitches: 6 } },
  { at: 7000, counters: { pitches: 42 } },
  { at: 8600, beat: 2, polly: 'Your week is planned: 20 pitches a day, follow-ups on day 4.', notes: ['plan', 'track'], counters: { hours: 9 } },
  { at: 10400, tracked: true, counters: { replies: 6 } },
  { at: 12800, beat: 3, polly: '<b>Anua replied</b> and wants to collab. Your answer is drafted.', notes: ['track', 'brief'], counters: { hours: 12 } },
  { at: 14200, briefDone: true },
];
const LOOP_MS = 20500;
const EMPTY = { beat: -1, msgs: [], notes: [], matched: false, tracked: false, briefDone: false,
  counters: { brands: 0, pitches: 0, replies: 0, hours: 0 } };
const FINAL = { beat: 3, msgs: [msg('me', STEPS[0].me), msg('polly', STEPS[3].polly), msg('polly', STEPS[6].polly), msg('polly', STEPS[8].polly)],
  notes: ['track', 'brief'], matched: true, tracked: true, briefDone: true, counters: { brands: 6, pitches: 42, replies: 6, hours: 12 } };

function useBrandLogos() {
  const [logos, setLogos] = useState({});
  useEffect(() => {
    let alive = true;
    fetch(`${getRuntimeApiUrl() || ''}/api/public/brands-replying`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        const out = {};
        (d.brands || []).forEach((b) => { if (b.slug && b.logo) out[b.slug] = b.logo; });
        setLogos(out);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return logos;
}

// Gmail's mark: pitches go out from the creator's own Gmail.
function GmailLogo({ size = 18 }) {
  return (
    <svg width={size} height={size * 0.75} viewBox="52 42 88 66" aria-label="Gmail" role="img">
      <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
      <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
      <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
      <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
      <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
    </svg>
  );
}

function Logo({ src, name }) {
  return src ? <img src={src} alt={name} loading="lazy" /> : <em>{name}</em>;
}

export default function PollyAutopilotMotion() {
  const ref = useRef(null);
  const [s, setS] = useState(EMPTY);
  const logos = useBrandLogos();

  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setS(FINAL); return undefined; }
    let timers = [];
    let running = false;
    const clear = () => { timers.forEach(clearTimeout); timers = []; };
    const run = () => {
      clear(); setS(EMPTY);
      STEPS.forEach((st) => {
        timers.push(setTimeout(() => setS((prev) => {
          let msgs = prev.msgs;
          if (st.me) msgs = [...msgs, msg('me', st.me)];
          if (st.polly) msgs = [...msgs, msg('polly', st.polly)];
          return {
            ...prev,
            beat: st.beat != null ? st.beat : prev.beat,
            msgs: msgs.slice(-5),
            notes: st.notes || prev.notes,
            matched: prev.matched || !!st.matched,
            tracked: prev.tracked || !!st.tracked,
            briefDone: prev.briefDone || !!st.briefDone,
            counters: { ...prev.counters, ...(st.counters || {}) },
          };
        }), st.at));
      });
      timers.push(setTimeout(run, LOOP_MS));
    };
    // Only animate while on screen: no work for visitors who never scroll here.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; run(); }
      else if (!e.isIntersecting && running) { running = false; clear(); }
    }, { threshold: 0.25 });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); clear(); };
  }, []);

  const on = (n) => s.notes.includes(n);
  const c = s.counters;
  return (
    <Stage ref={ref} aria-label="Polly finds brands that match you, pitches them from your Gmail, schedules and tracks every follow-up, and sends you a daily brief while you create">
      <ol className="steps" aria-hidden="true">
        {BEATS.map(({ key, label, Icon }, i) => (
          <li key={key} className={i === s.beat ? 'now' : i < s.beat ? 'done' : ''}><Icon size={13} />{label}</li>
        ))}
      </ol>

      <AutoTikTok {...VIDEOS[0]} className="vid v1" radius={20} link={false} branded={false} />
      <AutoTikTok {...VIDEOS[1]} className="vid v2" radius={20} link={false} branded={false} />
      <AutoTikTok {...VIDEOS[2]} className="vid v3" radius={20} link={false} branded={false} />

      <div className="phone" aria-hidden="true">
        <div className="screen">
          <div className="notch"><i /></div>
          <div className="top"><span className="av">P</span><div><b>Polly</b><small>Autopilot on</small></div><span className="toggle" /></div>
          <div className="gmail"><GmailLogo size={14} /><span>From <b>your Gmail</b></span><i className={c.pitches ? 'live' : ''}>{c.pitches ? `${c.pitches} sent` : 'Connected'}</i></div>
          <div className="msgs">
            {s.msgs.map((m) => (
              // eslint-disable-next-line react/no-danger
              <p key={m.id} className={m.who} dangerouslySetInnerHTML={{ __html: m.html }} />
            ))}
          </div>
          <div className="input">Ask Polly anything<span /></div>
        </div>
      </div>

      {/* 1. Find: matched to the creator */}
      <div className={`note match ${on('match') ? 'show' : ''}`}>
        <div className="row"><b>Matched to you</b><small>{s.matched ? '6 brands' : 'Checking 3,000+'}</small></div>
        <div className="me-chip">Skincare · TikTok · 8.4k · US</div>
        <div className="marks">
          {BRANDS.map((b, i) => (
            <span key={b.slug} className={`mark ${s.matched ? 'on' : ''}`} style={{ transitionDelay: `${i * 0.12}s` }}>
              <Logo src={logos[b.slug]} name={b.name} /><i>{b.fit}%</i>
            </span>
          ))}
        </div>
        <div className="why">Running ads now · ship to the US · work with creators your size</div>
      </div>

      {/* 2. Pitch: from their Gmail */}
      <div className={`note pitch ${on('pitch') ? 'show' : ''}`}>
        <span className="ic gm"><GmailLogo size={20} />{logos.anua ? <img className="badge" src={logos.anua} alt="Anua" loading="lazy" /> : null}</span>
        <div><b>Sent from your Gmail</b><small>Pitch to Anua · p•••@anua.com</small></div>
      </div>

      {/* 3. Schedule & track */}
      <div className={`note plan wide ${on('plan') ? 'show' : ''}`}>
        <div className="row"><b><CalendarDays size={13} /> This week, planned</b><small>Autopilot</small></div>
        <div className="week">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
            <span key={d} className={i < 2 ? 'past' : ''}>
              <b>{d}</b><i>20 pitches</i>{i >= 3 ? <em>+ follow-ups</em> : null}
            </span>
          ))}
        </div>
      </div>
      <div className={`note track wide ${on('track') ? 'show' : ''}`}>
        <div className="row"><b><BarChart3 size={13} /> Every pitch tracked</b><small>This week</small></div>
        {[['Pitched', 42, 100], ['Opened', 18, 43], ['Replied', 6, 14], ['Deals', 3, 7]].map(([label, n, pct]) => (
          <div key={label} className="bar">
            <span>{label}</span>
            <i><u style={{ width: s.tracked ? `${Math.max(pct, 6)}%` : '0%' }} /></i>
            <b>{s.tracked ? n : 0}</b>
          </div>
        ))}
      </div>

      {/* 4. Daily brief */}
      <div className={`note brief wide win ${on('brief') ? 'show' : ''}`}>
        <div className="row"><b><Sun size={13} /> Your daily brief · 8:00 AM</b><small>Today</small></div>
        <ul>
          <li className="ok">20 pitches sent, 8 follow-ups sent</li>
          <li className="ok">Anua replied: your answer is drafted</li>
          <li className={s.briefDone ? 'ok' : ''}>1 paid brief matched: $250 for 2 videos</li>
          <li className="you">Your part today: approve 1 reply (2 min)</li>
        </ul>
      </div>

      <div className="ribbon">
        <span className="t">You create. <b>Polly finds, pitches and follows up, all tracked.</b></span>
        <span className="counters">
          <span><i>{c.brands}</i>matched</span><span><i>{c.pitches}</i>pitches</span>
          <span><i>{c.replies}</i>replies</span><span><Clock size={11} /><i>{c.hours}h</i>saved</span>
        </span>
      </div>
    </Stage>
  );
}

const float = keyframes`
  0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; } 50% { opacity: .35; }
`;
const rise = keyframes`
  from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }
`;

const Stage = styled.div`
  --ink: #12141a; --line: #e4e2dc; --green: #0d7a5f; --green-deep: #095a46; --green-soft: #eef6f3; --mint: #7ce0b8;
  position: relative; width: 100%; max-width: 560px; height: 660px; justify-self: center; border-radius: 28px; overflow: hidden;
  background: radial-gradient(70% 70% at 10% 15%, #e7e4fb 0%, rgba(231,228,251,0) 60%), radial-gradient(70% 70% at 90% 85%, #dff4ea 0%, rgba(223,244,234,0) 60%), linear-gradient(180deg, #f4f3fb, #f2f8f5);
  border: 1px solid var(--line);

  .steps { position: absolute; top: 12px; left: 12px; right: 12px; z-index: 6; margin: 0; padding: 0; list-style: none; display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
  .steps li { display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 10px; border-radius: 999px; background: rgba(255,255,255,.75); border: 1px solid var(--line); color: #6b7280; font-size: 11.5px; font-weight: 700; transition: background .3s, color .3s, border-color .3s; }
  .steps li.done { color: var(--green-deep); border-color: #cfe7df; background: var(--green-soft); }
  .steps li.now { background: var(--ink); border-color: var(--ink); color: #fff; }

  .vid { position: absolute; width: 146px; border: 3px solid #fff; animation: ${float} 6s ease-in-out infinite; z-index: 1; }
  .v1 { left: 14px; top: 70px; rotate: -8deg; }
  .v2 { right: 14px; top: 92px; rotate: 7deg; animation-delay: -2s; }
  .v3 { left: 34px; top: 360px; width: 124px; rotate: 5deg; animation-delay: -4s; }

  .phone { position: absolute; left: 50%; top: 56px; width: 236px; height: 478px; margin-left: -118px; border-radius: 40px; background: #0e0f12; padding: 9px; box-shadow: 0 28px 60px rgba(18,20,26,.28); z-index: 2; }
  .screen { width: 100%; height: 100%; border-radius: 32px; background: #fff; overflow: hidden; display: flex; flex-direction: column; }
  .notch { height: 24px; display: flex; justify-content: center; align-items: center; }
  .notch i { width: 72px; height: 18px; border-radius: 999px; background: #0e0f12; }
  .top { padding: 6px 12px 8px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--line); }
  .top .av { width: 28px; height: 28px; border-radius: 8px; background: var(--green); color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 13px; }
  .top b { font-size: 13px; display: block; }
  .top small { font-size: 10.5px; font-weight: 700; color: var(--green); display: flex; gap: 4px; align-items: center; }
  .top small::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: ${pulse} 1.6s infinite; }
  .toggle { margin-left: auto; width: 34px; height: 20px; border-radius: 999px; background: var(--green); position: relative; }
  .toggle::after { content: ''; position: absolute; right: 3px; top: 3px; width: 14px; height: 14px; border-radius: 50%; background: #fff; }
  .gmail { display: flex; align-items: center; gap: 6px; margin: 8px 10px 0; padding: 6px 8px; white-space: nowrap; border-radius: 10px; background: #f6f8fc; border: 1px solid #e3e8f4; font-size: 10.5px; color: #3c4043; }
  .gmail span { overflow: hidden; text-overflow: ellipsis; }
  .gmail b { font-weight: 700; }
  .gmail i { margin-left: auto; font-style: normal; font-weight: 700; color: #5f6368; font-variant-numeric: tabular-nums; }
  .gmail i.live { color: var(--green); }
  .msgs { flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 7px; justify-content: flex-end; overflow: hidden; }
  .msgs p { margin: 0; max-width: 92%; padding: 7px 10px; border-radius: 12px; font-size: 11.5px; line-height: 1.4; animation: ${rise} .35s ease-out both; }
  .msgs p.me { align-self: flex-end; background: var(--ink); color: #fff; border-bottom-right-radius: 4px; }
  .msgs p.polly { align-self: flex-start; background: #f3f2ef; color: var(--ink); border-top-left-radius: 4px; }
  .msgs p.polly b { color: var(--green-deep); }
  .input { margin: 0 10px 12px; height: 34px; border-radius: 10px; border: 1px solid var(--line); display: flex; align-items: center; padding: 0 5px 0 10px; font-size: 11.5px; color: #8a8f99; }
  .input span { margin-left: auto; width: 24px; height: 24px; border-radius: 7px; background: var(--ink); }

  .note { position: absolute; z-index: 4; width: 236px; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 10px 12px; display: flex; gap: 9px; align-items: center; box-shadow: 0 14px 30px rgba(18,20,26,.12); font-size: 12px; line-height: 1.3; opacity: 0; transform: translateY(10px) scale(.96); transition: opacity .4s, transform .4s; pointer-events: none; }
  .note.show { opacity: 1; transform: none; }
  .note.win { border: 1.5px solid var(--green); box-shadow: 0 16px 34px rgba(13,122,95,.22); }
  .note.wide, .note.match { flex-direction: column; align-items: stretch; width: 262px; gap: 8px; }
  .note b { color: var(--ink); font-size: 12.5px; }
  .note small { color: #4b5563; font-size: 11.5px; }
  .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .row b { display: inline-flex; align-items: center; gap: 5px; }
  .row small { color: var(--green); font-weight: 700; white-space: nowrap; }

  .me-chip { align-self: flex-start; font-size: 11px; font-weight: 700; color: #3c3f47; background: #f3f2ef; border-radius: 999px; padding: 4px 9px; }
  .marks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .mark { position: relative; height: 38px; border-radius: 9px; border: 1px solid var(--line); background: #fff; display: flex; align-items: center; justify-content: center; padding: 0 6px; transition: border-color .3s, background .3s; overflow: hidden; }
  .mark img { height: 18px; max-width: 58px; object-fit: contain; }
  .mark em { font-style: normal; font-size: 11.5px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mark i { position: absolute; right: 3px; top: 2px; font-style: normal; font-size: 8.5px; font-weight: 800; color: var(--green-deep); opacity: 0; transition: opacity .3s; }
  .mark.on { border-color: var(--green); background: var(--green-soft); }
  .mark.on i { opacity: 1; }
  .why { font-size: 10.5px; color: #6b7280; }

  .ic { flex: none; width: 34px; height: 34px; border-radius: 9px; background: #fff; border: 1px solid var(--line); display: grid; place-items: center; position: relative; }
  .ic .badge { position: absolute; right: -5px; bottom: -5px; width: 16px; height: 16px; border-radius: 5px; border: 1.5px solid #fff; background: #fff; object-fit: contain; }
  .pitch > div { display: grid; gap: 1px; }

  .week { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 5px; }
  .week span { border: 1px solid var(--line); border-radius: 9px; padding: 6px 4px; display: grid; gap: 2px; text-align: center; }
  .week span b { font-size: 11px; }
  .week span i { font-style: normal; font-size: 9.5px; color: var(--green-deep); font-weight: 700; }
  .week span em { font-style: normal; font-size: 9px; color: #6b7280; }
  .week span.past { background: var(--green-soft); border-color: #cfe7df; }

  .bar { display: grid; grid-template-columns: 54px 1fr 24px; align-items: center; gap: 8px; font-size: 11px; }
  .bar span { color: #4b5563; font-weight: 600; }
  .bar i { height: 8px; border-radius: 999px; background: #f0eeea; overflow: hidden; }
  .bar u { display: block; height: 100%; border-radius: 999px; background: var(--green); transition: width .9s ease-out; }
  .bar b { text-align: right; font-size: 11.5px; font-variant-numeric: tabular-nums; }

  .brief ul { margin: 0; padding: 0; list-style: none; display: grid; gap: 5px; }
  .brief li { font-size: 11.5px; color: #3c3f47; display: flex; gap: 6px; align-items: baseline; }
  .brief li::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--line); flex: none; transform: translateY(-1px); }
  .brief li.ok::before { background: var(--green); }
  .brief li.you { font-weight: 700; color: var(--ink); }
  .brief li.you::before { background: #f59e0b; }

  .match { left: 12px; top: 120px; }
  .pitch { right: 12px; top: 330px; }
  .plan { left: 12px; top: 150px; }
  .track { right: 12px; top: 300px; }
  .brief { left: 12px; top: 436px; }

  .ribbon { position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; background: var(--ink); color: #fff; border-radius: 18px; padding: 10px 10px 10px 14px; box-shadow: 0 14px 32px rgba(18,20,26,.25); }
  .ribbon .t { font-size: 12.5px; font-weight: 600; }
  .ribbon .t b { color: var(--mint); }
  .counters { display: flex; gap: 5px; flex-wrap: wrap; }
  .counters span { display: inline-flex; align-items: center; gap: 3px; background: rgba(255,255,255,.1); border-radius: 999px; padding: 5px 9px; font-size: 11px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .counters i { font-style: normal; color: var(--mint); }

  @media (max-width: 520px) {
    height: 812px;
    .steps li { height: 26px; padding: 0 8px; font-size: 10.5px; }
    .vid { width: 108px; } .v1 { left: -12px; top: 96px; } .v2 { right: -12px; top: 110px; } .v3 { display: none; }
    .phone { top: 82px; transform: scale(.88); transform-origin: top center; }
    .note, .note.wide, .note.match { left: 12px; right: 12px; width: auto; top: 404px; }
    .note.pitch, .note.track { top: 530px; }
    .ribbon .t { font-size: 12px; }
    .counters span { padding: 4px 8px; font-size: 10.5px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .vid, .top small::before { animation: none; }
    .note, .mark, .msgs p, .bar u, .steps li { transition: none; animation: none; }
  }
`;
