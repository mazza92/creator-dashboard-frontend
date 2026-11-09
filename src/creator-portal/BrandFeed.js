import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Check, ChevronDown, ChevronRight, ChevronUp, Play, Plus } from 'lucide-react';
import api from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import { GigSheet, gigTitles, payText } from './PaidGigs';
import UpgradeModal from './UpgradeModal';
import { mixFeed } from './brandFeedMix';

// Brands tab "For you": full-screen TikTok posts of creators a brand gifted or paid, each with the brand's
// card and two actions (Pitch for me, + Target). Paid UGC gigs and directory brands are mixed in so the
// feed is never short. "Directory" switches back to the classic search.

function kFollowers(n) {
  const v = Number(n) || 0;
  if (v >= 1e6) return `${(v / 1e6).toFixed(1).replace(/\.0$/, '')}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return v ? String(v) : '';
}

function ago(iso) {
  const d = Date.parse(iso || '');
  if (!d) return '';
  const days = Math.floor((Date.now() - d) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

function regionsText(regions) {
  let list = regions;
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch (_) { list = list.split(','); }
  }
  list = (Array.isArray(list) ? list : []).map((r) => String(r).trim()).filter(Boolean);
  if (!list.length) return '';
  return list.length > 2 ? `${list.slice(0, 2).join(', ')} +${list.length - 2}` : list.join(', ');
}

function cap(text) {
  const s = String(text || '');
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/);
  return ((parts[0] || '?')[0] + ((parts[1] || '')[0] || '')).toUpperCase();
}

function Logo({ brand, size = 44 }) {
  const [broken, setBroken] = useState(false);
  return (
    <LogoBox $size={size}>
      {brand.logo_url && !broken
        ? <img src={brand.logo_url} alt="" onError={() => setBroken(true)} />
        : <span aria-hidden="true">{initials(brand.name)}</span>}
    </LogoBox>
  );
}

function BrandCard({ brand, onOpen }) {
  const facts = [
    brand.product_value ? { v: `~$${brand.product_value}`, k: 'PR box' } : null,
    regionsText(brand.regions) ? { v: regionsText(brand.regions), k: 'ships to' } : null,
    Number(brand.min_followers) > 0 ? { v: `${kFollowers(brand.min_followers)}+`, k: 'followers' } : { v: 'Any size', k: 'followers' },
  ].filter(Boolean);
  const line = brand.creators_30d > 1
    ? `${brand.creators_30d} creators gifted or paid this month`
    : (brand.hero_product || brand.category || '');
  return (
    <Card type="button" onClick={() => onOpen(brand)} aria-label={`Open ${brand.name}`}>
      <CardTop>
        <Logo brand={brand} />
        <CardHead>
          <span className="name">
            {brand.name}
            {brand.gifting_confirmed ? <Badge>Accepting PR</Badge> : null}
          </span>
          {line ? <span className="line">{brand.category && brand.creators_30d > 1 ? `${cap(brand.category)} · ` : ''}{cap(line)}</span> : null}
        </CardHead>
        <ChevronRight size={18} color={t.muted} aria-hidden="true" />
      </CardTop>
      {facts.length ? (
        <Facts $n={facts.length}>
          {facts.map((f) => <div key={f.k}><b>{f.v}</b><span>{f.k}</span></div>)}
        </Facts>
      ) : null}
    </Card>
  );
}

function Actions({ brand, busy, onPitch, onTarget }) {
  return (
    <ActionRow>
      <PitchBtn type="button" onClick={() => onPitch(brand)}>Pitch for me</PitchBtn>
      <TargetBtn type="button" $on={brand.targeted} disabled={busy} onClick={() => onTarget(brand)}
        aria-pressed={brand.targeted}>
        {brand.targeted ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
        {brand.targeted ? 'Saved' : 'Save'}
      </TargetBtn>
    </ActionRow>
  );
}

function PostSlide({ item, ...rest }) {
  const { post, brand } = item;
  const [coverOk, setCoverOk] = useState(Boolean(post.cover_url));
  const kind = post.signal === 'paid' ? 'Paid' : 'Gifted';
  return (
    <Slide>
      <Cover>
        {coverOk ? <img src={post.cover_url} alt="" loading="lazy" onError={() => setCoverOk(false)} /> : <CoverFallback>{brand.name}</CoverFallback>}
      </Cover>
      <Shade />
      {post.url ? (
        <PlayLink href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch @${post.creator_handle}'s post on TikTok`}>
          <Play size={26} fill="#fff" aria-hidden="true" />
        </PlayLink>
      ) : null}
      <Bottom>
        <Who>
          <div className="handle">
            <b>@{post.creator_handle}</b>
            {post.creator_followers ? <span>{kFollowers(post.creator_followers)} followers</span> : null}
          </div>
          <div className="chips">
            <Chip $tone={kind === 'Paid' ? 'paid' : 'gift'}>{kind}</Chip>
            {post.posted_at ? <Chip>{ago(post.posted_at)}</Chip> : null}
          </div>
          {post.caption ? <p>{post.caption}</p> : null}
        </Who>
        <BrandCard brand={brand} onOpen={rest.onOpen} />
        <Actions brand={brand} {...rest} />
      </Bottom>
    </Slide>
  );
}

function BrandSlide({ item, ...rest }) {
  const { brand } = item;
  return (
    <Slide $plain>
      <BrandHero>
        <Logo brand={brand} size={88} />
        <span className="kicker">{brand.gifting_confirmed ? 'Giving out boxes' : 'Brand to pitch'}</span>
        <h2>{brand.name}</h2>
        {brand.category ? <span className="cat">{brand.category}</span> : null}
        {brand.hero_product ? <p>Known for {brand.hero_product}</p> : null}
      </BrandHero>
      <Bottom>
        <BrandCard brand={brand} onOpen={rest.onOpen} />
        <Actions brand={brand} {...rest} />
      </Bottom>
    </Slide>
  );
}

function GigSlide({ item, onOpenGig }) {
  const { gig } = item;
  const { title, subtitle } = gigTitles(gig);
  return (
    <Slide $gig>
      <GigBody>
        <span className="kicker">Paid UGC gig</span>
        <span className="pay">{payText(gig)}</span>
        <h2>{gig.locked ? 'A brand is hiring creators' : title}</h2>
        {!gig.locked && subtitle ? <p>{subtitle}</p> : null}
        <div className="chips">
          {gig.deliverable ? <Chip $light>{gig.deliverable}</Chip> : null}
          {gig.location ? <Chip $light>{gig.location}</Chip> : null}
          {gig.is_match ? <Chip $light>Your niche</Chip> : null}
        </div>
      </GigBody>
      <Bottom>
        <PitchBtn type="button" onClick={() => onOpenGig(gig)} style={{ width: '100%' }}>
          {gig.locked ? 'Unlock this gig' : gig.already_applied ? 'Applied · view' : 'See the gig'}
        </PitchBtn>
      </Bottom>
    </Slide>
  );
}

// Scroll discovery (TikTok / Reels pattern): a swipe-up coachmark on the first card until the creator scrolls once,
// a one-time "peek" nudge that lifts the feed to show the next card, and up/down controls + arrow keys on desktop.
const SCROLLED_KEY = 'nc_feed_scrolled';

function readFlag(key) {
  try { return window.localStorage.getItem(key) === '1'; } catch (_) { return false; }
}

function writeFlag(key) {
  try { window.localStorage.setItem(key, '1'); } catch (_) { /* storage blocked */ }
}

function prefersReducedMotion() {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; }
}

export default function BrandFeed({ onDirectory, onOpenBrand }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);
  const [openGig, setOpenGig] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [height, setHeight] = useState(null);
  const boxRef = useRef(null);
  const req = useRef(0);
  const [index, setIndex] = useState(0);
  const [scrolled, setScrolled] = useState(() => readFlag(SCROLLED_KEY));
  const nudged = useRef(false);

  useLayoutEffect(() => {
    const fit = () => {
      const top = boxRef.current ? boxRef.current.getBoundingClientRect().top + window.scrollY : 0;
      setHeight(Math.max(480, window.innerHeight - top));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const load = useCallback(async () => {
    const id = ++req.current;
    setLoading(true);
    setError('');
    try {
      const [feedRes, gigRes] = await Promise.allSettled([
        api.get('/api/pr-crm/feed', { timeout: 30000 }),
        api.get('/api/opportunities/paid-gigs', { params: { view: 'for_you', limit: 12 }, timeout: 30000 }),
      ]);
      if (id !== req.current) return;
      if (feedRes.status !== 'fulfilled' || !feedRes.value.data?.success) throw new Error('feed');
      const data = feedRes.value.data;
      const gigs = gigRes.status === 'fulfilled' ? (gigRes.value.data?.gigs || []) : [];
      setItems(mixFeed(data.items || [], gigs));
      setTargets(Number(data.targets) || 0);
      if (boxRef.current) boxRef.current.scrollTo({ top: 0 });
    } catch (_) {
      if (id === req.current) setError('The feed did not load. Try again in a moment.');
    } finally {
      if (id === req.current) setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onScroll = useCallback(() => {
    const box = boxRef.current;
    if (!box || !box.clientHeight) return;
    const i = Math.round(box.scrollTop / box.clientHeight);
    setIndex(i);
    if (i > 0 && !scrolled) {
      setScrolled(true);
      writeFlag(SCROLLED_KEY);
    }
  }, [scrolled]);

  const goTo = useCallback((i) => {
    const box = boxRef.current;
    if (!box) return;
    const total = box.children.length;
    const next = Math.max(0, Math.min(total - 1, i));
    box.scrollTo({ top: next * box.clientHeight, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, []);

  // Peek nudge: first visit, still on card 1 after a moment -> lift the feed to reveal the next card, then settle.
  useEffect(() => {
    if (scrolled || loading || items.length < 2 || nudged.current || prefersReducedMotion()) return undefined;
    const box = boxRef.current;
    if (!box) return undefined;
    let back;
    const timer = window.setTimeout(() => {
      if (box.scrollTop > 4) return;
      nudged.current = true;
      box.style.scrollSnapType = 'none';
      box.scrollTo({ top: Math.round(box.clientHeight * 0.16), behavior: 'smooth' });
      back = window.setTimeout(() => {
        box.scrollTo({ top: 0, behavior: 'smooth' });
        window.setTimeout(() => { box.style.scrollSnapType = ''; }, 450);
      }, 650);
    }, 1800);
    return () => { window.clearTimeout(timer); if (back) window.clearTimeout(back); };
  }, [scrolled, loading, items.length]);

  // Arrow keys / j k move one card on desktop (ignored while typing).
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return;
      if (openGig || showUpgrade) return;
      if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); goTo(index + 1); }
      if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); goTo(index - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, index, openGig, showUpgrade]);

  const pitch = useCallback((brand) => {
    const params = new URLSearchParams({ chip: 'pitch_brand', brand_id: String(brand.id), brand_name: brand.name || '' });
    navigate(`/creator/dashboard/for-you?${params.toString()}`);
  }, [navigate]);

  const pitchTargets = useCallback(() => {
    navigate('/creator/dashboard/for-you?chip=pitch_targets');
  }, [navigate]);

  const target = useCallback(async (brand) => {
    const on = !brand.targeted;
    setBusyId(brand.id);
    const mark = (v) => setItems((prev) => prev.map((it) => (it.brand?.id === brand.id ? { ...it, brand: { ...it.brand, targeted: v } } : it)));
    mark(on);
    try {
      const { data } = await api({ method: on ? 'post' : 'delete', url: `/api/pr-crm/targets/${brand.id}`, data: { source: 'feed' } });
      const n = Number(data?.targets) || 0;
      setTargets(n);
      setToast(on
        ? { text: `${brand.name} saved · ${n}`, sub: 'Tap Pitch my saved brands when you\'re ready', undo: brand }
        : { text: `${brand.name} removed from your saved brands` });
    } catch (_) {
      mark(!on);
      setToast({ text: 'Could not save that. Try again.' });
    } finally {
      setBusyId(null);
    }
  }, []);

  const openGigSheet = useCallback((gig) => {
    if (gig.locked) setShowUpgrade(true);
    else setOpenGig(gig);
  }, []);

  const slides = useMemo(() => items.map((item) => {
    const props = { item, busy: busyId === item.brand?.id, onPitch: pitch, onTarget: target, onOpen: onOpenBrand };
    if (item.type === 'post') return <PostSlide key={item.key} {...props} />;
    if (item.type === 'brand') return <BrandSlide key={item.key} {...props} />;
    return <GigSlide key={item.key} item={item} onOpenGig={openGigSheet} />;
  }), [items, busyId, pitch, target, onOpenBrand, openGigSheet]);

  return (
    <Wrap>
      <TopBar>
        <ModeSwitch role="tablist" aria-label="Brands view">
          <button type="button" role="tab" aria-selected="true" className="on">For you</button>
          <button type="button" role="tab" aria-selected="false" onClick={onDirectory}>Directory</button>
        </ModeSwitch>
        {targets ? (
          <TargetCount type="button" onClick={pitchTargets}>
            Pitch my {targets} saved →
          </TargetCount>
        ) : null}
      </TopBar>

      <Scroller ref={boxRef} style={height ? { height: `${height}px` } : undefined} aria-busy={loading}
        onScroll={onScroll} tabIndex={-1} aria-label="Creators who got PR and brand deals. Scroll for more.">
        {loading && !items.length ? <Slide $plain><Center>Finding brands gifting creators like you…</Center></Slide> : null}
        {error ? (
          <Slide $plain>
            <Center>
              <span>{error}</span>
              <GhostBtn type="button" onClick={() => load()}>Try again</GhostBtn>
            </Center>
          </Slide>
        ) : null}
        {!error ? slides : null}
        {!loading && !error ? (
          <Slide $plain>
            <Center>
              <b>You&apos;re all caught up</b>
              <span>New posts land every day as Polly scans TikTok.</span>
              <GhostBtn type="button" onClick={onDirectory}>Browse the full directory</GhostBtn>
            </Center>
          </Slide>
        ) : null}
      </Scroller>

      {!scrolled && !loading && !error && items.length > 1 && index === 0 ? (
        <SwipeHint aria-hidden="true">
          <span className="arrows"><ChevronUp size={22} strokeWidth={2.6} /><ChevronUp size={22} strokeWidth={2.6} /></span>
          <b>Swipe up</b>
          <small>More creators who just got PR</small>
        </SwipeHint>
      ) : null}

      {!loading && !error && items.length > 1 ? (
        <SideNav aria-label="Feed navigation">
          <NavBtn type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous">
            <ChevronUp size={20} />
          </NavBtn>
          <Pos>{Math.min(index + 1, items.length)} / {items.length}</Pos>
          <NavBtn type="button" $primary={!scrolled} onClick={() => goTo(index + 1)} disabled={index >= slides.length + 1 - 1} aria-label="Next">
            <ChevronDown size={20} />
          </NavBtn>
        </SideNav>
      ) : null}

      {toast ? (
        <Toast role="status">
          <span><b>{toast.text}</b>{toast.sub ? <small>{toast.sub}</small> : null}</span>
          {toast.undo ? <button type="button" onClick={() => { setToast(null); target({ ...toast.undo, targeted: true }); }}>Undo</button> : null}
        </Toast>
      ) : null}

      {openGig ? (
        <GigSheet
          gig={openGig}
          onClose={() => setOpenGig(null)}
          onApplied={(gigId) => setItems((prev) => prev.map((it) => (it.gig?.id === gigId ? { ...it, gig: { ...it.gig, already_applied: true } } : it)))}
          onUpgrade={() => { setOpenGig(null); setShowUpgrade(true); }}
        />
      ) : null}
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} source="brand_feed" />
    </Wrap>
  );
}

const rise = keyframes`
  0% { transform: translateY(8px); opacity: 0; }
  35% { opacity: 1; }
  70% { transform: translateY(-6px); opacity: 1; }
  100% { transform: translateY(-12px); opacity: 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translate(-50%, 6px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`;

const SwipeHint = styled.div`
  position: absolute;
  z-index: 3;
  left: 50%;
  top: 46%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 16px 11px;
  border-radius: 16px;
  background: rgba(15, 17, 21, 0.55);
  backdrop-filter: blur(8px);
  color: #fff;
  text-align: center;
  pointer-events: none;
  animation: ${fadeIn} 0.35s ease-out 0.6s both;
  .arrows { display: flex; flex-direction: column; align-items: center; line-height: 0; height: 30px; }
  .arrows svg { margin-top: -10px; animation: ${rise} 1.4s ease-in-out infinite; }
  .arrows svg:last-child { animation-delay: 0.18s; }
  b { font-size: 15px; font-weight: 800; letter-spacing: 0.01em; }
  small { font-size: 12px; opacity: 0.85; white-space: nowrap; }
  @media (max-width: 560px) {
    top: 40%;
    padding: 8px 14px 9px;
    small { font-size: 11.5px; }
  }
  @media (max-width: 560px) and (max-height: 780px) { top: 31%; }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    .arrows svg { animation: none; }
  }
`;

const SideNav = styled.div`
  position: absolute;
  z-index: 3;
  top: 50%;
  right: -64px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  @media (max-width: 700px) { display: none; }
`;

const NavBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid ${(p) => (p.$primary ? 'transparent' : 'rgba(15, 17, 21, 0.12)')};
  background: ${(p) => (p.$primary ? '#7ce0b8' : '#fff')};
  color: ${t.ink};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 17, 21, 0.08);
  transition: transform 0.15s ease, background 0.15s ease;
  &:hover:not(:disabled) { transform: scale(1.06); }
  &:disabled { opacity: 0.35; cursor: default; }
  &:focus-visible { outline: 2px solid #7ce0b8; outline-offset: 2px; }
`;

const Pos = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${t.ink};
  opacity: 0.6;
  font-variant-numeric: tabular-nums;
`;

const Wrap = styled.div`
  position: relative;
  max-width: 520px;
  margin: 0 auto;
`;

const TopBar = styled.div`
  position: absolute;
  z-index: 3;
  top: 10px;
  left: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  pointer-events: none;
  > * { pointer-events: auto; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
`;

const ModeSwitch = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  background: rgba(15, 17, 21, 0.55);
  backdrop-filter: blur(8px);
  button {
    border: 0;
    border-radius: 999px;
    padding: 8px 12px;
    min-height: 36px;
    background: transparent;
    color: #fff;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    cursor: pointer;
  }
  button.on { background: #fff; color: ${t.ink}; font-weight: 700; }
  button:focus-visible { outline: 2px solid #7ce0b8; outline-offset: 2px; }
`;


const TargetCount = styled.button`
  border: 0;
  font-family: inherit;
  cursor: pointer;
  min-height: 36px;
  margin-left: auto;
  flex-shrink: 0;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 12.5px;
  font-weight: 700;
  padding: 9px 10px;
  border-radius: 999px;
  background: rgba(124, 224, 184, 0.92);
  color: #0f1115;
`;

const Scroller = styled.div`
  height: calc(100dvh - 140px);
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  overscroll-behavior-y: contain;
  border-radius: 18px;
  background: #0f1115;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  @media (max-width: 560px) { border-radius: 0; margin: 0 -16px; }
`;

const Slide = styled.section`
  position: relative;
  height: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: ${(p) => (p.$gig ? '#0d3b2e' : p.$plain ? '#171a21' : '#0f1115')};
  color: #fff;
`;

const Cover = styled.div`
  position: absolute;
  inset: 0;
  background: #262a33;
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const CoverFallback = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.35);
`;

const Shade = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 11, 14, 0.55) 0%, rgba(10, 11, 14, 0) 22%, rgba(10, 11, 14, 0) 38%, rgba(10, 11, 14, 0.94) 72%);
`;

const PlayLink = styled.a`
  position: absolute;
  top: 34%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  &:focus-visible { outline: 2px solid #7ce0b8; outline-offset: 3px; }
`;

const Bottom = styled.div`
  position: relative;
  z-index: 2;
  padding: 0 12px 16px;
  display: grid;
  gap: 10px;
`;

const Who = styled.div`
  display: grid;
  gap: 6px;
  padding: 0 4px;
  .handle { display: flex; align-items: baseline; gap: 8px; }
  .handle b { font-size: 15px; }
  .handle span { font-size: 13px; color: #c9ccd3; }
  .chips { display: flex; gap: 6px; flex-wrap: wrap; }
  p {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.45;
    color: #e3e5ea;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

const Chip = styled.span`
  font-size: 12px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 999px;
  background: ${(p) => (p.$tone === 'gift' ? '#7ce0b8' : p.$tone === 'paid' ? '#f5c46b' : 'rgba(255,255,255,0.16)')};
  color: ${(p) => (p.$tone ? '#0f1115' : '#fff')};
`;

const Card = styled.button`
  width: 100%;
  text-align: left;
  border: 0;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  color: ${t.ink};
  font: inherit;
  display: grid;
  gap: 10px;
  cursor: pointer;
  &:focus-visible { outline: 2px solid #7ce0b8; outline-offset: 2px; }
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const CardHead = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
  flex: 1;
  .name { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 16.5px; font-weight: 800; }
  .line { font-size: 12.5px; color: ${t.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;

const Badge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  background: #e7f3ee;
  color: #165c3f;
`;

const LogoBox = styled.span`
  flex-shrink: 0;
  width: ${(p) => p.$size}px;
  height: ${(p) => p.$size}px;
  border-radius: ${(p) => Math.round(p.$size * 0.27)}px;
  background: #f1efe9;
  color: ${t.ink};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-weight: 800;
  font-size: ${(p) => Math.round(p.$size * 0.34)}px;
  img { width: 100%; height: 100%; object-fit: contain; background: #fff; }
`;

const Facts = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$n}, minmax(0, 1fr));
  gap: 6px;
  div { padding: 7px 8px; border-radius: 10px; background: #f6f4ee; display: grid; gap: 1px; min-width: 0; }
  b { font-size: 13.5px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  span { font-size: 11.5px; color: ${t.muted}; }
`;

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 8px;
`;

const PitchBtn = styled.button`
  min-height: 50px;
  border: 0;
  border-radius: 14px;
  background: #7ce0b8;
  color: #0f1115;
  font: inherit;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  &:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
`;

const TargetBtn = styled.button`
  min-height: 50px;
  border-radius: 14px;
  border: 1px solid ${(p) => (p.$on ? '#7ce0b8' : 'rgba(255,255,255,0.28)')};
  background: ${(p) => (p.$on ? 'rgba(124,224,184,0.16)' : 'rgba(255,255,255,0.12)')};
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  &:disabled { opacity: 0.7; }
  &:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
`;

const BrandHero = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 70px 24px 16px;
  text-align: center;
  .kicker { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #7ce0b8; }
  h2 { margin: 0; font-size: 28px; line-height: 1.15; }
  .cat { font-size: 14px; color: #c9ccd3; text-transform: capitalize; }
  p { margin: 4px 0 0; font-size: 14px; color: #c9ccd3; max-width: 300px; }
`;

const GigBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  padding: 70px 24px 16px;
  .kicker { font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: #7ce0b8; }
  .pay { font-size: 44px; font-weight: 800; line-height: 1; }
  h2 { margin: 0; font-size: 22px; line-height: 1.25; }
  p { margin: 0; font-size: 14.5px; color: #cfe3da; }
  .chips { display: flex; gap: 6px; flex-wrap: wrap; }
`;

const Center = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  text-align: center;
  color: #e3e5ea;
  b { font-size: 20px; color: #fff; }
`;

const GhostBtn = styled.button`
  min-height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #fff;
  font: inherit;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
`;

const Toast = styled.div`
  position: absolute;
  z-index: 4;
  top: 58px;
  left: 12px;
  right: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fff;
  color: ${t.ink};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  gap: 10px;
  span { flex: 1; display: grid; gap: 1px; min-width: 0; }
  b { font-size: 14px; }
  small { font-size: 12.5px; color: ${t.muted}; }
  button { border: 0; background: none; font: inherit; font-size: 13.5px; font-weight: 700; color: #165c3f; cursor: pointer; min-height: 36px; }
`;
