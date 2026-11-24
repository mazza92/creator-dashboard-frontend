'use client';

// Homepage "How it works" motion (Nov 2026): the creator keeps posting UGC (real TikToks, our stored copies) while
// Polly runs the outreach around the phone: scans brands running ads, sends pitches, follows up, brings back
// replies. Brand moments are true to Newcollab data: Anua and Rhode answer creators who pitch them (public
// /api/public/brands-replying); logos come from the same feed. Loops while on screen; reduced motion shows the end.
import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { AutoTikTok } from '../../creator-portal/PromoteVisuals';
import { getRuntimeApiUrl } from '../../config/api';

const VIDEOS = [
  { id: '7702541231523384598', handle: 'alicia_ugc' },
  { id: '7702427286099856662', handle: 'ugcbysahara' },
  { id: '7701405744498773270', handle: 'ugc.with.viki' },
];

// Brands that reply to creators on Newcollab, shown as "running ads now" (logos from the replying feed).
const BRANDS = [
  { slug: 'anua', name: 'Anua' }, { slug: 'rhode-skin', name: 'rhode' }, { slug: 'skin1004', name: 'SKIN1004' },
  { slug: 'mac-cosmetics', name: 'MAC' }, { slug: 'tarte-cosmetics', name: 'tarte' }, { slug: 'aveeno', name: 'Aveeno' },
];

let MSG_ID = 0;
const msg = (who, html) => ({ id: ++MSG_ID, who, html });

const STEPS = [
  { at: 300, me: 'Pitch skincare brands for me while I film' },
  { at: 1100, polly: 'On it. Checking <b>3,000+ brands</b> for the ones running ads right now.', note: 'scan' },
  { at: 2300, marks: true },
  { at: 3700, polly: '<b>6 brands</b> fit you. Writing a pitch for each one.' },
  { at: 5300, polly: 'Sent from your Gmail, one pitch per brand. I’ll follow up.', note: 'pitch', pitches: 6 },
  { at: 7500, note: 'follow', hide: 'scan', pitches: 42 },
  { at: 9700, polly: '<b>Anua replied</b> and wants to collab. Your answer is drafted.', note: 'reply', hide: 'pitch', replies: 6 },
  { at: 11700, polly: 'Also matched a <b>paid brief: $250</b> for 2 skincare videos.', note: 'paid', deals: 3 },
];
const LOOP_MS = 17500;
const FINAL = { msgs: [msg('me', STEPS[0].me), msg('polly', STEPS[4].polly), msg('polly', STEPS[6].polly), msg('polly', STEPS[7].polly)],
  notes: ['scan', 'pitch', 'follow', 'reply', 'paid'], marks: true, pitches: 42, replies: 6, deals: 3 };
const EMPTY = { msgs: [], notes: [], marks: false, pitches: 0, replies: 0, deals: 0 };

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
          const next = { ...prev };
          if (st.me) next.msgs = [...prev.msgs, msg('me', st.me)].slice(-5);
          if (st.polly) next.msgs = [...(next.msgs || prev.msgs), msg('polly', st.polly)].slice(-5);
          if (st.note) next.notes = [...prev.notes.filter((n) => n !== st.hide), st.note];
          else if (st.hide) next.notes = prev.notes.filter((n) => n !== st.hide);
          if (st.marks) next.marks = true;
          ['pitches', 'replies', 'deals'].forEach((k) => { if (st[k] != null) next[k] = st[k]; });
          return next;
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
  return (
    <Stage ref={ref} aria-label="You keep creating UGC while Polly finds brands, sends pitches, follows up and brings back replies and paid offers">
      <AutoTikTok {...VIDEOS[0]} className="vid v1" radius={20} link={false} branded={false} />
      <AutoTikTok {...VIDEOS[1]} className="vid v2" radius={20} link={false} branded={false} />
      <AutoTikTok {...VIDEOS[2]} className="vid v3" radius={20} link={false} branded={false} />
      <div className="you"><span className="rec"><i /></span>You: filming today’s video</div>

      <div className="phone" aria-hidden="true">
        <div className="screen">
          <div className="notch"><i /></div>
          <div className="top"><span className="av">P</span><div><b>Polly</b><small>Autopilot on</small></div><span className="toggle" /></div>
          <div className="gmail"><GmailLogo size={14} /><span>From <b>your Gmail</b></span><i className={s.pitches ? 'live' : ''}>{s.pitches ? `${s.pitches} sent` : 'Connected'}</i></div>
          <div className="msgs">
            {s.msgs.map((m) => (
              // eslint-disable-next-line react/no-danger
              <p key={m.id} className={m.who} dangerouslySetInnerHTML={{ __html: m.html }} />
            ))}
          </div>
          <div className="input">Ask Polly anything<span /></div>
        </div>
      </div>

      <div className={`note scan wide ${on('scan') ? 'show' : ''}`}>
        <div className="row"><b>Brands running ads now</b><small>{s.marks ? '6 fit you' : 'Checking 3,000+'}</small></div>
        <div className="marks">
          {BRANDS.map((b, i) => (
            <span key={b.slug} className={`mark ${s.marks ? 'on' : ''}`} style={{ transitionDelay: `${i * 0.15}s` }}>
              {logos[b.slug] ? <img src={logos[b.slug]} alt={b.name} loading="lazy" /> : null}
              <em>{b.name}</em>
            </span>
          ))}
        </div>
      </div>
      <Note gmail className={`pitch ${on('pitch') ? 'show' : ''}`} logo={logos.anua} name="Anua" title="Sent from your Gmail" sub="Pitch to Anua · p•••@anua.com" />
      <Note gmail className={`follow ${on('follow') ? 'show' : ''}`} logo={logos['rhode-skin']} name="rhode" title="Follow-up sent to rhode" sub="Day 4 · from your Gmail" />
      <Note className={`reply win ${on('reply') ? 'show' : ''}`} logo={logos.anua} name="Anua" title="Anua replied" sub="Wants to collab · your answer is drafted" />
      <div className={`note paid win ${on('paid') ? 'show' : ''}`}>
        <span className="ic money">$</span>
        <div><b>Paid UGC brief matched</b><small>$250 for 2 videos · skincare</small></div>
      </div>

      <div className="ribbon">
        <span className="t">You create. <b>Polly runs your brand outreach.</b></span>
        <span className="counters"><span><i>{s.pitches}</i>pitches</span><span><i>{s.replies}</i>replies</span><span><i>{s.deals}</i>deals</span></span>
      </div>
    </Stage>
  );
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

function Note({ className, logo, name, title, sub, gmail = false }) {
  return (
    <div className={`note ${className}`}>
      <span className={`ic ${gmail ? 'gm' : ''}`}>
        {gmail ? <GmailLogo size={20} /> : null}
        {logo ? <img className={gmail ? 'badge' : ''} src={logo} alt={name} loading="lazy" /> : (gmail ? null : name.slice(0, 2).toUpperCase())}
      </span>
      <div><b>{title}</b><small>{sub}</small></div>
    </div>
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
  position: relative; width: 100%; max-width: 560px; height: 600px; justify-self: center; border-radius: 28px; overflow: hidden;
  background: radial-gradient(70% 70% at 10% 15%, #e7e4fb 0%, rgba(231,228,251,0) 60%), radial-gradient(70% 70% at 90% 85%, #dff4ea 0%, rgba(223,244,234,0) 60%), linear-gradient(180deg, #f4f3fb, #f2f8f5);
  border: 1px solid var(--line);

  .vid { position: absolute; width: 150px; border: 3px solid #fff; animation: ${float} 6s ease-in-out infinite; z-index: 1; }
  .v1 { left: 16px; top: 46px; rotate: -8deg; }
  .v2 { right: 16px; top: 70px; rotate: 7deg; animation-delay: -2s; }
  .v3 { left: 40px; top: 330px; width: 128px; rotate: 5deg; animation-delay: -4s; }

  .you { position: absolute; left: 14px; bottom: 82px; z-index: 3; display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--line); border-radius: 999px; padding: 6px 12px 6px 6px; font-size: 12.5px; font-weight: 700; box-shadow: 0 10px 24px rgba(18,20,26,.08); }
  .rec { width: 22px; height: 22px; border-radius: 50%; background: #ffe3e3; display: grid; place-items: center; }
  .rec i { width: 8px; height: 8px; border-radius: 50%; background: #e5484d; animation: ${pulse} 1.4s infinite; }

  .phone { position: absolute; left: 50%; top: 22px; width: 236px; height: 478px; margin-left: -118px; border-radius: 40px; background: #0e0f12; padding: 9px; box-shadow: 0 28px 60px rgba(18,20,26,.28); z-index: 2; }
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
  .ic.gm { background: #fff; border: 1px solid var(--line); position: relative; overflow: visible; }
  .ic .badge { position: absolute; right: -5px; bottom: -5px; width: 16px; height: 16px; border-radius: 5px; border: 1.5px solid #fff; background: #fff; object-fit: contain; }
  .msgs { flex: 1; padding: 10px; display: flex; flex-direction: column; gap: 7px; justify-content: flex-end; overflow: hidden; }
  .msgs p { margin: 0; max-width: 92%; padding: 7px 10px; border-radius: 12px; font-size: 11.5px; line-height: 1.4; animation: ${rise} .35s ease-out both; }
  .msgs p.me { align-self: flex-end; background: var(--ink); color: #fff; border-bottom-right-radius: 4px; }
  .msgs p.polly { align-self: flex-start; background: #f3f2ef; color: var(--ink); border-top-left-radius: 4px; }
  .msgs p.polly b { color: var(--green-deep); }
  .input { margin: 0 10px 12px; height: 34px; border-radius: 10px; border: 1px solid var(--line); display: flex; align-items: center; padding: 0 5px 0 10px; font-size: 11.5px; color: #8a8f99; }
  .input span { margin-left: auto; width: 24px; height: 24px; border-radius: 7px; background: var(--ink); }

  .note { position: absolute; z-index: 4; width: 236px; background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 9px 11px; display: flex; gap: 9px; align-items: center; box-shadow: 0 14px 30px rgba(18,20,26,.12); font-size: 12px; line-height: 1.3; opacity: 0; transform: translateY(10px) scale(.96); transition: opacity .4s, transform .4s; pointer-events: none; }
  .note.show { opacity: 1; transform: none; }
  .note.win { border: 1.5px solid var(--green); box-shadow: 0 16px 34px rgba(13,122,95,.22); }
  .note b { display: block; font-size: 12.5px; color: var(--ink); }
  .note small { color: #4b5563; font-size: 11.5px; }
  .ic { flex: none; width: 32px; height: 32px; border-radius: 9px; background: #f3f2ef; display: grid; place-items: center; overflow: hidden; font-size: 11px; font-weight: 800; color: #2a2e38; }
  .ic img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
  .ic.money { background: #d8f4c3; color: #2f5a14; font-size: 14px; }
  .note.wide { flex-direction: column; align-items: stretch; width: 250px; }
  .row { display: flex; justify-content: space-between; align-items: center; }
  .row small { color: var(--green); font-weight: 700; }
  .marks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .mark { height: 34px; border-radius: 9px; border: 1px solid var(--line); background: #fff; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 0 6px; transition: border-color .3s, background .3s; overflow: hidden; }
  .mark img { height: 18px; max-width: 60px; object-fit: contain; }
  .mark em { font-style: normal; font-size: 11.5px; font-weight: 700; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .mark img + em { display: none; }
  .mark.on { border-color: var(--green); background: var(--green-soft); }

  .scan { left: 12px; top: 150px; }
  .pitch { right: 12px; top: 300px; }
  .follow { right: 12px; top: 220px; }
  .reply { left: 12px; top: 268px; }
  .paid { right: 12px; top: 382px; }

  .ribbon { position: absolute; left: 12px; right: 12px; bottom: 12px; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; background: var(--ink); color: #fff; border-radius: 18px; padding: 10px 10px 10px 14px; box-shadow: 0 14px 32px rgba(18,20,26,.25); }
  .ribbon .t { font-size: 13px; font-weight: 600; }
  .ribbon .t b { color: var(--mint); }
  .counters { display: flex; gap: 5px; }
  .counters span { background: rgba(255,255,255,.1); border-radius: 999px; padding: 5px 9px; font-size: 11.5px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .counters i { font-style: normal; color: var(--mint); margin-right: 3px; }

  @media (max-width: 520px) {
    height: 640px;
    .vid { width: 112px; } .v1 { left: -10px; top: 40px; } .v2 { right: -10px; top: 60px; } .v3 { display: none; }
    .phone { transform: scale(.9); transform-origin: top center; }
    .note, .note.wide { left: 12px; right: 12px; width: auto; top: 400px; }
    .you { bottom: 98px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .vid, .rec i, .top small::before { animation: none; }
    .note, .mark, .msgs p { transition: none; animation: none; }
  }
`;
