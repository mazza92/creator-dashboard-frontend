// "Looking for more creators?" on the brand roster: scan a competitor's TikTok creators, or find more creators in
// the brand's niche, in the brand workspace. The typed competitor rides the same nc_free_scan cookie as the public
// Brand Scan, so it runs as their first scan right after signup (/brand/workspace?welcome=1).
import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowRight, Eye, Search, Sparkles, TrendingUp, Users } from 'lucide-react';

function saveScan(name) {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const domain = host.endsWith('newcollab.co') ? '; domain=.newcollab.co' : '';
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `nc_free_scan=${encodeURIComponent(name)}; path=/; max-age=2592000; SameSite=Lax${domain}${secure}`;
}

function signupUrl(source, niche) {
  const q = new URLSearchParams({ ref: 'roster_upsell', utm_source: 'roster', utm_medium: 'upsell', utm_campaign: source });
  if (niche) q.set('niche', niche);
  return `/for-brands?${q.toString()}`;
}

const PREVIEW = [
  { h: '@g••••••', f: '18.2K', v: '412K', hook: '"I tried it for 7 days…"', c: '#f4c7c3' },
  { h: '@m•••••••', f: '6.9K', v: '128K', hook: '"POV: your skin finally…"', c: '#c3e0f4' },
  { h: '@s••••', f: '41K', v: '96K', hook: '"Nobody talks about this"', c: '#d8f4c3' },
];

export default function FindMoreCreators({ brandName, niche }) {
  const [competitor, setCompetitor] = useState('');
  const nicheLabel = niche && !/^other$/i.test(niche) ? String(niche).toLowerCase() : '';

  const go = (e) => {
    e.preventDefault();
    const name = competitor.trim();
    if (name) saveScan(name);
    window.location.href = signupUrl(name ? 'competitor_scan' : 'competitor_empty', nicheLabel);
  };

  return (
    <Wrap aria-label="Find more creators">
      <Glow aria-hidden="true" />
      <Copy>
        <Eyebrow><span className="dot" /> Looking for more creators?</Eyebrow>
        <h2>See who's making your <em>competitors</em> go viral.</h2>
        <p>
          Scan any brand to see every TikTok creator posting about it, the hooks they reuse and the videos that took
          off. Then gift the creators you want{brandName ? ` for ${brandName}` : ''}.
        </p>
        <Form onSubmit={go}>
          <Search size={18} aria-hidden="true" />
          <input value={competitor} onChange={(e) => setCompetitor(e.target.value)} maxLength={80}
            placeholder="Type a competitor, e.g. Glow Recipe or @glowrecipe" aria-label="Competitor to scan" />
          <button type="submit">See their creators <ArrowRight size={16} /></button>
        </Form>
        <Alt href={signupUrl('niche_creators', nicheLabel)}>
          <Users size={15} /> Or find more {nicheLabel || 'creators in your niche'}{nicheLabel ? ' creators' : ''} on TikTok <ArrowRight size={14} />
        </Alt>
        <Fine>Free brand workspace · live TikTok data · no card needed</Fine>
      </Copy>

      <Preview aria-hidden="true">
        <PreviewHead>
          <span><Sparkles size={13} /> Competitor scan</span>
          <b>Live</b>
        </PreviewHead>
        {PREVIEW.map((r, i) => (
          <Row key={r.h} style={{ animationDelay: `${i * 0.12}s` }}>
            <Av style={{ background: r.c }} />
            <div className="who">
              <b>{r.h}</b>
              <span>{r.f} followers</span>
            </div>
            <div className="views"><Eye size={12} /> {r.v}</div>
            <div className="hook">{r.hook}</div>
          </Row>
        ))}
        <Lock>
          <TrendingUp size={15} />
          <span>Top hooks, formats and every creator, unlocked in your workspace</span>
        </Lock>
      </Preview>
    </Wrap>
  );
}

const rise = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.35; }`;

const Wrap = styled.section`
  position: relative;
  overflow: hidden;
  margin: 22px 0 6px;
  border-radius: 22px;
  padding: 28px;
  background: #0d0f14;
  color: #fff;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 26px;
  align-items: center;
  @media (max-width: 860px) { grid-template-columns: 1fr; padding: 22px 18px; }
`;
const Glow = styled.div`
  position: absolute;
  inset: -40% -10% auto auto;
  width: 520px;
  height: 520px;
  background: radial-gradient(closest-side, rgba(232, 57, 95, 0.45), rgba(232, 57, 95, 0) 70%);
  pointer-events: none;
`;
const Copy = styled.div`
  position: relative;
  min-width: 0;
  h2 { margin: 10px 0 10px; font-size: clamp(24px, 3.4vw, 34px); line-height: 1.1; letter-spacing: -0.02em; }
  h2 em { font-style: normal; background: linear-gradient(90deg, #ff7a9a, #ffb36b); -webkit-background-clip: text; background-clip: text; color: transparent; }
  p { margin: 0 0 18px; color: rgba(255, 255, 255, 0.72); font-size: 15px; line-height: 1.55; max-width: 520px; }
`;
const Eyebrow = styled.div`
  display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.06em;
  text-transform: uppercase; color: #ff9db3;
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #e8395f; animation: ${pulse} 1.6s ease-in-out infinite; }
`;
const Form = styled.form`
  display: flex; align-items: center; gap: 8px; background: #fff; border-radius: 14px; padding: 6px 6px 6px 14px;
  color: #6b6f78; box-shadow: 0 10px 30px rgba(232, 57, 95, 0.25);
  input { flex: 1; min-width: 0; border: 0; outline: 0; font: inherit; font-size: 15px; color: #16171b; background: none; padding: 8px 0; }
  button {
    display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 10px; padding: 11px 16px;
    background: #e8395f; color: #fff; font: inherit; font-weight: 700; font-size: 14.5px; cursor: pointer; white-space: nowrap;
  }
  button:hover { background: #d42c51; }
  @media (max-width: 520px) {
    flex-wrap: wrap; padding: 10px;
    input { flex-basis: calc(100% - 30px); }
    button { width: 100%; justify-content: center; }
  }
`;
const Alt = styled.a`
  display: inline-flex; align-items: center; gap: 6px; margin-top: 14px; color: #fff; font-weight: 600; font-size: 14.5px;
  text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(255, 255, 255, 0.35);
`;
const Fine = styled.div`margin-top: 10px; font-size: 12.5px; color: rgba(255, 255, 255, 0.5);`;
const Preview = styled.div`
  position: relative; min-width: 0; background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px; padding: 14px; display: grid; gap: 8px; backdrop-filter: blur(6px);
`;
const PreviewHead = styled.div`
  display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; color: rgba(255, 255, 255, 0.7);
  span { display: inline-flex; align-items: center; gap: 6px; }
  b { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: rgba(15, 157, 88, 0.2); color: #6fe3a5; }
`;
const Row = styled.div`
  display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; grid-template-rows: auto auto; column-gap: 10px; row-gap: 4px;
  align-items: center; background: rgba(255, 255, 255, 0.07); border-radius: 12px; padding: 10px 12px;
  animation: ${rise} 0.5s ease both;
  .who { min-width: 0; display: grid; }
  .who b { font-size: 14px; }
  .who span { font-size: 12px; color: rgba(255, 255, 255, 0.55); }
  .views { display: inline-flex; align-items: center; gap: 4px; font-size: 12.5px; font-weight: 700; color: #ffb36b; }
  .hook { grid-column: 2 / 4; font-size: 12.5px; color: rgba(255, 255, 255, 0.75); filter: blur(2.5px); }
`;
const Av = styled.span`grid-row: 1 / 3; width: 34px; height: 34px; border-radius: 50%; filter: blur(1.5px);`;
const Lock = styled.div`
  display: flex; align-items: center; gap: 8px; margin-top: 2px; font-size: 12.5px; color: rgba(255, 255, 255, 0.75);
  svg { color: #ff9db3; flex-shrink: 0; }
`;
