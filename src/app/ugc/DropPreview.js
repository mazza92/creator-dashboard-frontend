'use client';

// A product capture of the brand dashboard for /ugc. Example campaign with an invented brand and creators,
// labelled as a preview: it shows what brands get without claiming a real customer.
import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Megaphone, Play } from 'lucide-react';

const t = {
  ink: '#12141a', muted: '#5c6470', line: '#e4e2dc', paper: '#f7f5f0', white: '#fff',
  accent: '#0d7a5f', accentSoft: '#eef6f3', mint: '#7ce0b8', hot: '#e85d3b',
};

const POSTS = [
  { who: 'maya.makes', plat: 'TikTok', hook: 'I stopped double cleansing and this happened', views: '48.2K', paid: '$40', ago: '3d', bg: 'linear-gradient(160deg,#5aa391 0%,#1f4d44 55%,#0d1f1b 100%)', ad: true },
  { who: 'routine.with.rae', plat: 'Reel', hook: 'Texture check: sea minerals?', views: '31.4K', paid: '$40', ago: '2d', bg: 'linear-gradient(160deg,#c9a27c 0%,#6e4f38 55%,#1d140e 100%)' },
  { who: 'jules.ugc', plat: 'TikTok', hook: '$28 vs $68 cleanser, honest take', views: '22.9K', paid: '$40', ago: '2d', bg: 'linear-gradient(160deg,#8f7bc4 0%,#43356b 55%,#120e1d 100%)' },
  { who: 'skinbykayla', plat: 'Reel', hook: 'Week 1, no tight skin', views: '12.1K', paid: '$24', ago: '1d', bg: 'linear-gradient(160deg,#d48aa0 0%,#7a3b4f 55%,#200e14 100%)' },
  { who: 'naomi.edits', plat: 'TikTok', hook: 'Gym bag essentials in 30 sec', views: '6.8K', paid: '$14', ago: '9h', bg: 'linear-gradient(160deg,#7fa7d6 0%,#34507a 55%,#0e1622 100%)' },
];

export default function DropPreview() {
  return (
    <Wrap aria-label="Product preview of the Newcollab brand dashboard">
      <Frame>
        <Chrome aria-hidden="true"><i /><i /><i /><span>app.newcollab.co/brand/campaigns</span></Chrome>
        <Body>
          <Top>
            <div className="who">
              <span className="lg">S</span>
              <div><b>Sea Mineral Cleanser</b><span>Pay per view · $2.50 per 1,000 views</span></div>
            </div>
            <span className="live"><i /> Live · day 9</span>
          </Top>
          <Kpis>
            <div><span>Posts</span><b>34</b></div>
            <div><span>Views</span><b>196K</b></div>
            <div><span>Spent</span><b>$490</b></div>
            <div><span>Cost per 1K views</span><b>$2.50</b></div>
          </Kpis>
          <Budget><span>Budget</span><div className="bar"><i /></div><span>$490 of $600</span></Budget>
          <Posts>
            {POSTS.map((p) => (
              <article key={p.who}>
                <div className="th" style={{ background: p.bg }}>
                  <span className="pl">{p.plat}</span>
                  <span className="ago">{p.ago}</span>
                  <Play size={22} className="pp" />
                  <span className="hook">{p.hook}</span>
                  <span className="views">▶ {p.views}</span>
                </div>
                <div className="meta">
                  <b>@{p.who}</b>
                  <span className={p.ad ? 'ad' : 'paid'}>{p.ad ? <><Megaphone size={11} /> Ad</> : `${p.paid} paid`}</span>
                </div>
              </article>
            ))}
          </Posts>
        </Body>
      </Frame>
      <Caption>Product preview · example campaign. Brand and creators are illustrative.</Caption>
    </Wrap>
  );
}

const pulse = keyframes`50% { opacity: 0.35; }`;

const Wrap = styled.figure`margin: 0; display: grid; gap: 10px; min-width: 0;`;
const Frame = styled.div`
  background: ${t.white}; border: 1px solid ${t.line}; border-radius: 22px; overflow: hidden;
  box-shadow: 0 30px 70px rgba(18, 20, 26, 0.12), 0 2px 6px rgba(18, 20, 26, 0.04); min-width: 0;
`;
const Chrome = styled.div`
  display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: ${t.paper}; border-bottom: 1px solid ${t.line};
  i { width: 10px; height: 10px; border-radius: 50%; background: #e2ded5; }
  span { margin-left: 10px; font-size: 12px; color: ${t.muted}; background: ${t.white}; border: 1px solid ${t.line}; border-radius: 8px; padding: 3px 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
`;
const Body = styled.div`padding: 18px; display: grid; gap: 14px; min-width: 0; @media (max-width: 560px) { padding: 12px; }`;
const Top = styled.div`
  display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;
  .who { display: flex; gap: 10px; align-items: center; min-width: 0; }
  .lg { width: 40px; height: 40px; border-radius: 11px; background: #c3e6dc; display: grid; place-items: center; font-weight: 800; color: ${t.ink}; flex-shrink: 0; }
  .who div { display: grid; min-width: 0; }
  .who b { font-size: 16px; }
  .who span { font-size: 12.5px; color: ${t.muted}; }
  .live { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: ${t.accent}; background: ${t.accentSoft}; padding: 5px 10px; border-radius: 999px; }
  .live i { width: 7px; height: 7px; border-radius: 50%; background: ${t.accent}; animation: ${pulse} 1.4s infinite; }
  @media (prefers-reduced-motion: reduce) { .live i { animation: none; } }
`;
const Kpis = styled.div`
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px;
  div { background: ${t.paper}; border-radius: 12px; padding: 10px 12px; display: grid; }
  span { font-size: 11.5px; color: ${t.muted}; }
  b { font-size: 20px; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
  @media (max-width: 560px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;
const Budget = styled.div`
  display: grid; grid-template-columns: auto 1fr auto; gap: 10px; align-items: center; font-size: 12.5px; color: ${t.muted};
  .bar { height: 8px; border-radius: 999px; background: ${t.line}; overflow: hidden; }
  .bar i { display: block; height: 100%; width: 82%; background: ${t.accent}; border-radius: 999px; }
`;
const Posts = styled.div`
  display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px;
  article { display: grid; gap: 6px; min-width: 0; }
  .th { position: relative; aspect-ratio: 9 / 14; max-width: 100%; border-radius: 12px; overflow: hidden; color: #fff; }
  .th::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7)); }
  .th > * { position: absolute; z-index: 1; }
  .pl { left: 7px; top: 7px; font-size: 10px; font-weight: 800; background: rgba(255,255,255,0.92); color: ${t.ink}; padding: 2px 7px; border-radius: 999px; }
  .ago { right: 7px; top: 7px; font-size: 10px; font-weight: 700; background: rgba(0,0,0,0.45); padding: 2px 6px; border-radius: 999px; }
  .pp { left: 50%; top: 42%; transform: translate(-50%, -50%); opacity: 0.75; }
  .hook { left: 8px; right: 8px; bottom: 26px; font-size: 11.5px; font-weight: 700; line-height: 1.25; text-shadow: 0 1px 3px rgba(0,0,0,0.6); }
  .views { left: 8px; bottom: 7px; font-size: 11px; font-weight: 800; }
  .meta { display: flex; justify-content: space-between; align-items: center; gap: 6px; font-size: 11.5px; min-width: 0; }
  .meta b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .paid { color: ${t.accent}; font-weight: 800; white-space: nowrap; }
  .ad { display: inline-flex; align-items: center; gap: 3px; background: ${t.ink}; color: #fff; font-weight: 800; padding: 1px 7px; border-radius: 999px; white-space: nowrap; }
  @media (max-width: 860px) { grid-template-columns: repeat(3, minmax(0, 1fr)); article:nth-child(n+4) { display: none; } }
`;
const Caption = styled.figcaption`font-size: 12.5px; color: ${t.muted}; text-align: center;`;
