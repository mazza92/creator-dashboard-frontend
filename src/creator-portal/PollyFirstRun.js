import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ArrowRight, Check, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { creatorTokens as t } from '../theme/creatorTokens';
import scrollChatTo from './scrollChatTo';

// A new creator's first visit (GET /api/polly/bootstrap -> first_run): one question, two clear paths.
//  1. Run it all for me: Polly writes their first pitches right away (their free pitches), they review and approve,
//     and Gmail is only asked for when they approve (the send).
//  2. I'll pitch brands myself: their top matches as cards, or search any brand in the directory.
// Nothing else posts until they pick.

export const MONO_COLORS = ['#1f2937', '#b4436c', '#2563eb', '#7c3aed', '#0f766e', '#9a5b00'];

export function initials(name) {
  const words = String(name || '').replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] || '?').slice(0, 2)).toUpperCase();
}

export function nicheText(niches) {
  const list = (niches || []).slice(0, 2).map((n) => String(n).replace(/_/g, ' ').toLowerCase());
  return list.length ? list.join(' and ') : '';
}

// Why this brand, in two or three words, from signals we know are true (never the planned ask: the pitch
// carries that).
export function intentTag(brand) {
  if (!brand) return '';
  if (brand.hot || brand.meta_ads) return '🔥 Running UGC ads';
  if (brand.works_with_creators) return '🎁 Works with creators';
  const cat = String(brand.category || '').trim();
  return cat ? `✨ Fits your ${cat.toLowerCase()}` : '✨ Fits your content';
}

// Logo, or the brand's initials when there's none or it fails to load (some logo URLs are dead or blank).
export function BrandLogo({ brand, color, size = 40 }) {
  const [failed, setFailed] = React.useState(false);
  const logo = brand?.logo || brand?.brand_logo;
  if (logo && !failed) {
    return <LogoImg src={logo} alt="" $size={size} onError={() => setFailed(true)} />;
  }
  return <Mono style={{ background: color }} $size={size}>{initials(brand?.brand_name)}</Mono>;
}

// The brand the creator tapped in an email leads the deck (and is in the first pitches); others keep their order.
export function leadWithPick(brands, pick) {
  const list = brands || [];
  const i = pick ? list.findIndex((b) => Number(b.brand_id) === Number(pick)) : -1;
  return i > 0 ? [list[i], ...list.slice(0, i), ...list.slice(i + 1)] : list;
}

const AUTOPILOT_JOBS = [
  ['🎯', 'Find brands that fit your profile'],
  ['📨', 'Pitch them and follow up, from your Gmail'],
  ['🔥', 'Catch hot brands running UGC ads'],
  ['💸', 'Source paid UGC gigs'],
  ['📈', 'Spot UGC trends that are working'],
];

export default function PollyFirstRun({
  data, firstName, avatar, onStart, onBrowse, busy, pick = null,
}) {
  const ref = useRef(null);
  useEffect(() => {
    // The chat scrolls to its bottom; the welcome starts at its top.
    const id = setTimeout(() => scrollChatTo(ref.current), 60);
    return () => clearTimeout(id);
  }, []);
  if (!data?.brands?.length) return null;
  const brands = leadWithPick(data.brands, pick);
  const name = firstName || data.first_name || '';
  const picked = pick && brands[0] && Number(brands[0].brand_id) === Number(pick) ? brands[0].brand_id : null;
  const free = data.free_left;
  const pro = Boolean(data.is_pro) || free == null;
  const n = pro ? 3 : Math.max(1, Math.min(3, free || 3));
  const startIds = brands.map((b) => b.brand_id).slice(0, n);
  const top = brands.slice(0, 3);

  // Matches first (Nov 26 2026, start choice version 2): their matches prove the fit, then activating Polly
  // (the 7-day free week) is THE action; "Preview my first pitch" writes their top pitch (the manual path).
  if (data.start_choice === 'matches_first') {
    return (
      <MatchesFirst
        wrapRef={ref} data={data} brands={brands} picked={picked} busy={busy}
        onTrial={() => onStart('trial', startIds)} onPreview={() => onStart('first_pitch', [brands[0].brand_id])}
      />
    );
  }

  // Picked "Do it yourself" on the version 1 start choice screen: their matches lead, Autopilot is a small option.
  if (data.start_choice === 'free') {
    return (
      <Wrap ref={ref} aria-label="Welcome">
        <Hello>
          <span className="who">{avatar ? <img src={avatar} alt="" /> : null}Polly · your manager</span>
          <h2>Hi{name ? ` ${name}` : ''}, your matches are ready <span aria-hidden="true">👋</span></h2>
          <p>I lined up brands that fit your content. Pick who to pitch first: I write each pitch, you send it.</p>
        </Hello>
        <Manual>
          <span className="tag">Your matches</span>
          <h3>Brands ready to pitch</h3>
          <p className="lead">
            {pro ? 'Pitch as many as you like.' : `You have ${n} free pitch${n === 1 ? '' : 'es'}. Start with your best fit.`}
          </p>
          <Deck>
            {brands.slice(0, 6).map((b, i) => (
              <Brand key={b.brand_id}>
                {b.brand_id === picked ? <span className="pick">💌 Your pick</span> : null}
                <BrandLogo brand={b} color={MONO_COLORS[i % MONO_COLORS.length]} size={52} />
                <span className="nm">{b.brand_name}</span>
                <span className="why">{intentTag(b)}</span>
              </Brand>
            ))}
          </Deck>
          <Secondary type="button" disabled={busy} onClick={() => onStart('manual', brands.map((b) => b.brand_id))}>
            Pitch my matches
            <ArrowRight size={18} aria-hidden="true" />
          </Secondary>
          {onBrowse ? (
            <Browse type="button" onClick={onBrowse}>
              <Search size={15} aria-hidden="true" />
              <span><b>Looking for a specific brand?</b> Search 3,000+ brands</span>
              <ArrowRight size={15} aria-hidden="true" />
            </Browse>
          ) : null}
        </Manual>
        <AutoLink type="button" disabled={busy} onClick={() => onStart('autopilot', startIds)}>
          <span aria-hidden="true">⚡</span>
          <span><b>Want me to do the full job?</b> I find, pitch and follow up on autopilot.</span>
          <span className="go">Start autopilot <ArrowRight size={14} aria-hidden="true" /></span>
        </AutoLink>
      </Wrap>
    );
  }

  return (
    <Wrap ref={ref} aria-label="Welcome">
      <Hello>
        <span className="who">{avatar ? <img src={avatar} alt="" /> : null}Polly · your manager</span>
        <h2>Hi{name ? ` ${name}` : ''}, I&apos;m Polly <span aria-hidden="true">👋</span></h2>
        <p>I&apos;m here to land you brand deals. How do you want to work?</p>
      </Hello>

      <Auto>
        <span className="tag">Recommended</span>
        <h3>Run it all for me</h3>
        <p className="lead">
          {pro ? 'I work for you every day, on autopilot.' : `Use your ${n} free pitch${n === 1 ? '' : 'es'} on autopilot.`}
        </p>
        <ul>
          {AUTOPILOT_JOBS.map(([icon, text]) => (
            <li key={text}><span className="ic" aria-hidden="true">{icon}</span>{text}</li>
          ))}
        </ul>
        <Primary type="button" disabled={busy} onClick={() => onStart('autopilot', startIds)}>
          {pro ? 'Start autopilot' : `Start autopilot with ${n} free pitch${n === 1 ? '' : 'es'}`}
          <ArrowRight size={18} aria-hidden="true" />
        </Primary>
        <p className="fine">No payment needed · You review every pitch before it goes out</p>
      </Auto>

      <Manual>
        <span className="tag">Your choice</span>
        <h3>I&apos;ll pitch brands myself</h3>
        <p className="lead">Your top matches, ready to pitch:</p>
        <Deck>
          {top.map((b, i) => (
            <Brand key={b.brand_id}>
              {b.brand_id === picked ? <span className="pick">💌 Your pick</span> : null}
              <BrandLogo brand={b} color={MONO_COLORS[i % MONO_COLORS.length]} size={52} />
              <span className="nm">{b.brand_name}</span>
              <span className="why">{intentTag(b)}</span>
            </Brand>
          ))}
        </Deck>
        <Secondary type="button" disabled={busy} onClick={() => onStart('manual', brands.map((b) => b.brand_id))}>
          See all my matches
        </Secondary>
        {onBrowse ? (
          <Browse type="button" onClick={onBrowse}>
            <Search size={15} aria-hidden="true" />
            <span><b>Looking for a specific brand?</b> Search 3,000+ brands</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Browse>
        ) : null}
      </Manual>
    </Wrap>
  );
}

const SHOWN = 5;

function capitalize(text) {
  const s = String(text || '').replace(/_/g, ' ');
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// The signal under a matched brand: what we know is true about it, else which of their niches it's in.
export function matchPill(brand) {
  if (brand?.hot || brand?.meta_ads) return ['🔥', 'Running UGC ads'];
  if (brand?.works_with_creators) return ['🎁', 'Works with creators'];
  const niche = brand?.match_niche || brand?.category;
  return ['✨', niche ? `${capitalize(niche)} niche match` : 'Fits your content'];
}

function MatchesFirst({ wrapRef, data, brands, picked, busy, onTrial, onPreview }) {
  const [open, setOpen] = useState(false);
  const total = Number(data.planned_total) || brands.length;
  const niche = nicheText(data.niches);
  const extra = Math.max(0, brands.length - SHOWN);
  const shown = open ? brands : brands.slice(0, SHOWN);
  return (
    <Wrap ref={wrapRef} aria-label="Welcome">
      <Sheet>
        <h2>Your brand matches are ready <span aria-hidden="true">👋</span></h2>
        <p className="sub">
          I found {total} brand{total === 1 ? '' : 's'} that fit your {niche ? `${niche} ` : ''}content.
          {' '}Let&apos;s get your next collaboration started.
        </p>
        <Matches>
          {shown.map((b, i) => {
            const [icon, label] = matchPill(b);
            return (
              <Match key={b.brand_id}>
                {b.brand_id === picked ? <span className="pick">💌 Your pick</span> : null}
                <BrandLogo brand={b} color={MONO_COLORS[i % MONO_COLORS.length]} size={60} />
                <span className="nm">{b.brand_name}</span>
                <span className="pill"><span aria-hidden="true">{icon}</span> {label}</span>
                {b.why ? <span className="why">{b.why}</span> : null}
              </Match>
            );
          })}
        </Matches>
        {extra > 0 ? (
          <More type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? 'Show fewer' : `+ ${extra} more matched brand${extra === 1 ? '' : 's'}`}
            {open ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
          </More>
        ) : null}
        <Pitch>
          <h3>You create. I&apos;ll handle the pitching.</h3>
          <p>I&apos;ll pitch these brands for you, find new opportunities every day and follow up automatically.</p>
          <ul>
            {['Up to 20 personalized pitches daily', 'New brand opportunities every day',
              'Automatic follow-ups and reply tracking'].map((text) => (
                <li key={text}><span className="ok" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>{text}</li>
            ))}
          </ul>
          <Secondary type="button" disabled={busy} onClick={onTrial}>
            Let Polly pitch my brands
            <ArrowRight size={18} aria-hidden="true" />
          </Secondary>
          <Fine>7 days free, then $19/mo. Payment method required. Cancel anytime.</Fine>
          <ManualLink type="button" disabled={busy} onClick={onPreview}>Preview my first pitch</ManualLink>
        </Pitch>
      </Sheet>
    </Wrap>
  );
}

const Sheet = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 22px;
  padding: 24px 22px 20px;
  h2 { margin: 0 0 8px; font-size: 28px; line-height: 1.15; letter-spacing: -0.02em; font-weight: 800; }
  .sub { margin: 0 0 18px; font-size: 16px; line-height: 1.45; color: ${t.muted}; }
  @media (min-width: 700px) { h2 { font-size: 32px; } }
  @media (max-width: 480px) { padding: 20px 16px 18px; h2 { font-size: 25px; } }
`;

const Matches = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Match = styled.div`
  position: relative;
  flex: 1 1 calc(33.333% - 10px);
  min-width: 150px;
  box-sizing: border-box;
  border: 1px solid #ece9e2;
  border-radius: 16px;
  padding: 14px 10px 14px;
  background: #fff;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  .nm { font-size: 15px; font-weight: 750; line-height: 1.25; word-break: break-word; }
  .pill {
    display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 999px; max-width: 100%;
    background: ${t.accentSoft}; color: ${t.accentDeep}; font-size: 12.5px; font-weight: 650; line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box;
  }
  .why { font-size: 13px; line-height: 1.35; color: ${t.muted}; }
  .pick {
    position: absolute; top: -9px; left: 50%; transform: translateX(-50%); white-space: nowrap;
    font-size: 10.5px; font-weight: 700; padding: 2px 8px; border-radius: 999px; background: ${t.ink}; color: #fff;
  }
  @media (max-width: 480px) { min-width: 130px; padding: 12px 6px; .pill { font-size: 11.5px; padding: 4px 8px; } }
`;

const More = styled.button`
  display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%;
  margin-top: 12px; padding: 12px; border: 0; border-radius: 14px; background: ${t.accentSoft};
  color: ${t.accentDeep}; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer;
`;

const Pitch = styled.div`
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid ${t.line};
  h3 { margin: 0 0 6px; font-size: 24px; line-height: 1.2; letter-spacing: -0.015em; font-weight: 800; }
  p { margin: 0 0 12px; font-size: 15.5px; line-height: 1.45; color: ${t.muted}; }
  ul { list-style: none; margin: 0 0 16px; padding: 0; display: grid; gap: 10px; }
  li { display: flex; align-items: center; gap: 10px; font-size: 15.5px; color: ${t.ink}; }
  .ok {
    width: 22px; height: 22px; border-radius: 50%; background: ${t.accent}; color: #fff; flex: none;
    display: inline-flex; align-items: center; justify-content: center;
  }
  @media (max-width: 480px) { h3 { font-size: 21px; } }
`;

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

const Hello = styled.header`
  .who { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: ${t.muted}; }
  .who img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
  h2 { margin: 10px 0 6px; font-size: 28px; line-height: 1.15; letter-spacing: -0.02em; font-weight: 800; }
  p { margin: 0; font-size: 16px; line-height: 1.45; color: ${t.muted}; }
  @media (min-width: 700px) { h2 { font-size: 32px; } }
`;

const CardBase = styled.div`
  border-radius: 20px;
  padding: 20px;
  .tag {
    display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase;
    padding: 5px 10px; border-radius: 999px;
  }
  h3 { margin: 12px 0 4px; font-size: 21px; letter-spacing: -0.01em; font-weight: 800; }
  .lead { margin: 0 0 14px; font-size: 15px; line-height: 1.45; }
  @media (max-width: 480px) { padding: 18px 16px; }
`;

const Auto = styled(CardBase)`
  background: ${t.ink};
  color: #fff;
  box-shadow: 0 10px 30px rgba(18, 20, 26, 0.18);
  .tag { background: linear-gradient(90deg, #ff3d8b, #ff5a5f); color: #fff; }
  .lead { color: #c9ced8; }
  ul { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 9px; }
  li { display: flex; align-items: center; gap: 10px; font-size: 14.5px; line-height: 1.35; }
  .ic {
    width: 28px; height: 28px; border-radius: 8px; background: #252932; flex: none;
    display: inline-flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .fine { margin: 10px 0 0; text-align: center; font-size: 12.5px; color: #8a909c; }
`;

const Manual = styled(CardBase)`
  background: ${t.white};
  border: 1px solid ${t.line};
  .tag { background: ${t.accentSoft}; color: ${t.accentDeep}; }
  .lead { color: ${t.muted}; }
`;

const Btn = styled.button`
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  border: 0; border-radius: 14px; padding: 15px 16px; font-family: inherit; font-size: 16px; font-weight: 800;
  cursor: pointer; text-align: center; line-height: 1.25;
  &:disabled { opacity: 0.6; cursor: default; }
`;

const Primary = styled(Btn)`
  background: linear-gradient(90deg, #ff3d8b, #ff5a5f);
  color: #fff;
  &:hover:not(:disabled) { filter: brightness(1.05); }
`;

const Secondary = styled(Btn)`
  background: ${t.ink};
  color: #fff;
`;

const Deck = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
`;

const Brand = styled.div`
  position: relative;
  border: 1px solid #ece9e2;
  border-radius: 14px;
  padding: 12px 6px 10px;
  background: #fafafa;
  text-align: center;
  min-width: 0;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  .nm {
    font-size: 13px; font-weight: 700; line-height: 1.25; max-width: 100%; overflow: hidden;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: break-word;
  }
  .why { font-size: 11px; font-weight: 600; color: ${t.accent}; }
  .pick {
    position: absolute; top: -9px; left: 50%; transform: translateX(-50%); white-space: nowrap;
    font-size: 10.5px; font-weight: 800; background: #fff; border: 1px solid ${t.line}; border-radius: 999px; padding: 2px 7px;
  }
`;

const LogoImg = styled.img`
  width: ${(p) => p.$size}px; height: ${(p) => p.$size}px; border-radius: ${(p) => Math.round(p.$size / 4)}px;
  object-fit: contain; padding: ${(p) => Math.round(p.$size / 9)}px; box-sizing: border-box;
  background: #fff; border: 1px solid ${t.line}; flex: none;
`;

const Mono = styled.span`
  width: ${(p) => p.$size}px; height: ${(p) => p.$size}px; border-radius: ${(p) => Math.round(p.$size / 4)}px; flex: none;
  display: inline-flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800; font-size: ${(p) => Math.round(p.$size / 3.1)}px;
`;

const Browse = styled.button`
  display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%;
  margin-top: 12px; padding: 8px; border: 0; background: none; cursor: pointer; font-family: inherit;
  font-size: 14px; color: ${t.muted}; text-align: left;
  b { color: ${t.ink}; }
  &:hover b { text-decoration: underline; }
`;

const Fine = styled.p`
  margin: 8px 0 0;
  text-align: center;
  font-size: 13px;
  color: ${t.muted};
`;

const ManualLink = styled.button`
  display: block; width: 100%; margin-top: 12px; padding: 6px 4px;
  border: 0; background: none; font-family: inherit; font-size: 14px; line-height: 1.4;
  color: ${t.accentDeep}; font-weight: 600; text-decoration: underline; text-underline-offset: 3px;
  cursor: pointer; text-align: center;
  &:disabled { opacity: 0.6; cursor: default; }
`;

const AutoLink = styled.button`
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 14px 16px; border: 1px dashed ${t.line}; border-radius: 14px; background: ${t.white};
  font-family: inherit; font-size: 14px; line-height: 1.4; color: ${t.muted}; text-align: left; cursor: pointer;
  b { color: ${t.ink}; }
  .go { margin-left: auto; flex: none; display: inline-flex; align-items: center; gap: 4px; font-weight: 700; color: ${t.accent}; }
  &:hover:not(:disabled) { border-color: ${t.accent}; }
  &:disabled { opacity: 0.6; cursor: default; }
  @media (max-width: 480px) { flex-wrap: wrap; .go { margin-left: 26px; } }
`;
