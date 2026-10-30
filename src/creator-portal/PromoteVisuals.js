// Visual pieces for Promote Newcollab: autoplaying example TikToks, the earnings slider and the video wall.
// Videos play through TikTok's embed player (muted, looping) and only load while on screen, so a page of them
// stays light on phones.
import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Play } from 'lucide-react';

// UGC-style examples to show the formats that work. Creators post about Newcollab in their own style.
export const EXAMPLES = [
  { id: '7698871086745685278', handle: 'ugcwithalayna' },
  { id: '7680349889833749790', handle: 'siaslife' },
  { id: '7680383985104489741', handle: 'tiareugc' },
  { id: '7653023572985810178', handle: 'kimberleyug_' },
  { id: '7663619669303119117', handle: 'ziaayugi' },
  { id: '7649706301546630421', handle: 'ugc.with.tessa' },
];

const PLAYER_OPTS = 'autoplay=1&mute=1&loop=1&controls=0&progress_bar=0&play_button=0&volume_control=0'
  + '&fullscreen_button=0&timestamp=0&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0';

function useOnScreen(ref, rootMargin = '120px') {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin, threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return on;
}

/** A 9:16 TikTok that plays muted while visible. Tapping opens it on TikTok. */
export function AutoTikTok({ id, handle, tag, radius = 18, className, style, link = true }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  const linkProps = link
    ? { href: `https://www.tiktok.com/@${handle}/video/${id}`, target: '_blank', rel: 'noopener noreferrer',
      'aria-label': `Example video by @${handle} on TikTok` }
    : { as: 'div', 'aria-hidden': true };  // decorative, e.g. inside another link
  return (
    <Clip ref={ref} className={className} style={style} $r={radius} {...linkProps}>
      <Poster aria-hidden="true"><Play size={22} /></Poster>
      {visible && (
        <iframe src={`https://www.tiktok.com/player/v1/${id}?${PLAYER_OPTS}`} title={`@${handle} on TikTok`}
          allow="autoplay; encrypted-media" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" tabIndex={-1} />
      )}
      <Shade aria-hidden="true" />
      <Meta>
        {tag && <span className="tag">{tag}</span>}
        <span className="who">@{handle}</span>
      </Meta>
    </Clip>
  );
}

const Clip = styled.a`
  position: relative;
  display: block;
  aspect-ratio: 9 / 16;
  border-radius: ${(p) => p.$r}px;
  overflow: hidden;
  background: linear-gradient(160deg, #2a2e38, #12141a);
  box-shadow: 0 14px 34px rgba(18, 20, 26, 0.22);
  color: #fff;
  iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; pointer-events: none; }
`;
const Poster = styled.div`
  position: absolute; inset: 0; display: grid; place-items: center; color: rgba(255, 255, 255, 0.55);
`;
const Shade = styled.div`
  position: absolute; inset: auto 0 0 0; height: 38%; pointer-events: none;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.55));
`;
const Meta = styled.div`
  position: absolute; left: 10px; right: 10px; bottom: 10px; display: grid; gap: 4px; pointer-events: none;
  .tag {
    justify-self: start; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px;
    background: rgba(255, 255, 255, 0.9); color: #12141a;
  }
  .who { font-size: 12.5px; font-weight: 600; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5); }
`;

/** Hero visual: three fanned phones with earning chips. */
export function HeroStack({ cpmCents = 250 }) {
  const [a, b, c] = EXAMPLES;
  return (
    <Stack aria-hidden="false">
      <AutoTikTok {...b} className="side left" radius={22} />
      <AutoTikTok {...c} className="side right" radius={22} />
      <AutoTikTok {...a} className="front" radius={24} />
      <Chip className="c1"><b>${(cpmCents / 100).toFixed(cpmCents % 100 ? 2 : 0)}</b> per 1K views</Chip>
      <Chip className="c2"><span className="dot" /> Views update daily</Chip>
      <Chip className="c3">Paid by <b>PayPal</b> or <b>Wise</b></Chip>
    </Stack>
  );
}

const float = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); }`;
const Stack = styled.div`
  position: relative; height: 430px; max-width: 420px; width: 100%; margin: 0 auto;
  .front { position: absolute; left: 50%; top: 0; width: 210px; transform: translateX(-50%); z-index: 3; }
  .side { position: absolute; top: 46px; width: 170px; opacity: 0.92; z-index: 1; }
  .left { left: 0; transform: rotate(-7deg); }
  .right { right: 0; transform: rotate(7deg); }
  @media (max-width: 560px) {
    height: 360px;
    .front { width: 176px; }
    .side { width: 138px; top: 40px; }
  }
`;
const Chip = styled.div`
  position: absolute; z-index: 4; display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px;
  border-radius: 999px; background: #fff; color: #12141a; font-size: 13px; white-space: nowrap;
  box-shadow: 0 10px 26px rgba(18, 20, 26, 0.16); animation: ${float} 4s ease-in-out infinite;
  b { font-weight: 800; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #0d7a5f; }
  &.c1 { left: -6px; top: 40px; background: #0d7a5f; color: #fff; }
  &.c2 { right: -8px; top: 190px; animation-delay: 1.2s; }
  &.c3 { left: 10px; bottom: 18px; animation-delay: 2.1s; }
  @media (max-width: 560px) {
    font-size: 12px; padding: 7px 10px;
    &.c1 { left: 0; } &.c2 { right: 0; } &.c3 { left: 6px; bottom: 6px; }
  }
`;

/** "Drag your views, see your earnings": the quick-win hook. */
export function EarningsSlider({ cpmCents = 250, capCents = 4000, minViews = 2000 }) {
  const steps = [2000, 3000, 5000, 7500, 10000, 12500, 16000, 25000];
  const [i, setI] = useState(4);
  const views = steps[i];
  const raw = views < minViews ? 0 : Math.floor((views * cpmCents) / 1000);
  const cents = Math.min(raw, capCents);
  const capped = raw > capCents;
  return (
    <Calc>
      <div className="top">
        <span>If your video gets</span>
        <b>{views.toLocaleString()} views</b>
      </div>
      <input type="range" min={0} max={steps.length - 1} value={i} onChange={(e) => setI(Number(e.target.value))}
        aria-label="Video views" />
      <div className="out">
        <span>you earn</span>
        <strong>${(cents / 100).toFixed(cents % 100 ? 2 : 0)}</strong>
      </div>
      <small>{capped ? `Max $${capCents / 100} per video. Post another one to keep earning.` : `Pays from ${minViews.toLocaleString()} views. Post 2 or 3 a month to stack it up.`}</small>
    </Calc>
  );
}

const Calc = styled.div`
  background: #12141a; color: #fff; border-radius: 22px; padding: 22px; display: grid; gap: 12px;
  .top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; flex-wrap: wrap; }
  .top span, .out span { color: rgba(255, 255, 255, 0.65); font-size: 14px; }
  .top b { font-size: 20px; }
  .out { display: flex; justify-content: space-between; align-items: baseline; }
  .out strong { font-size: 44px; line-height: 1; letter-spacing: -0.02em; color: #7ce0b8; }
  small { color: rgba(255, 255, 255, 0.55); font-size: 12.5px; }
  input[type='range'] { width: 100%; accent-color: #7ce0b8; height: 28px; }
`;

/** SideShift-style auto-scrolling row of example videos (pauses on hover). */
export function VideoWall({ items = EXAMPLES }) {
  const loop = [...items, ...items];
  return (
    <Wall>
      <div className="track">
        {loop.map((v, i) => <AutoTikTok key={`${v.id}-${i}`} {...v} className="card" radius={16} />)}
      </div>
    </Wall>
  );
}

const slide = keyframes`from { transform: translateX(0); } to { transform: translateX(-50%); }`;
const Wall = styled.div`
  overflow: hidden; margin: 0 -16px; padding: 4px 0 10px; max-width: calc(100% + 32px); contain: layout paint;
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
  .track { display: flex; gap: 12px; width: max-content; animation: ${slide} 48s linear infinite; }
  &:hover .track { animation-play-state: paused; }
  .card { width: 168px; flex-shrink: 0; }
  @media (max-width: 560px) { .card { width: 136px; } }
  @media (prefers-reduced-motion: reduce) { .track { animation: none; } overflow-x: auto; }
`;
