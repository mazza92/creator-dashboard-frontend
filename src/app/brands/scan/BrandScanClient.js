'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import { ArrowRight, Check, Eye, Lock, Play, Sparkles, Users, Gift, TrendingUp } from 'lucide-react';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';
import { trackBrandCtaClick } from '../_cluster/catalog';
import ScanInput from './ScanInput';
import { POLL_MS, POLL_TIMEOUT_MS, pollScan, startScan, trackScan, unlockScan } from './scanApi';
import { TYPE_LABEL, scan } from './theme';

const PAGE_URL = 'https://newcollab.co/brands/scan';
const EMAIL_KEY = 'nc_brand_scan_email';

function savedEmail() {
  try {
    return window.localStorage.getItem(EMAIL_KEY) || '';
  } catch (e) {
    return '';
  }
}

function rememberEmail(email) {
  try {
    window.localStorage.setItem(EMAIL_KEY, email);
  } catch (e) {
    // private mode: the user just types it again next time
  }
}

// ============================================================================
// LAYOUT
// ============================================================================

const Page = styled.div`
  min-height: 100vh;
  background: ${scan.bg};
  padding: 120px 16px 160px;
`;

const Column = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

const Hero = styled.div`
  text-align: center;
  padding: 8vh 0 32px;

  h1 {
    font-size: clamp(28px, 4.4vw, 40px);
    line-height: 1.15;
    letter-spacing: -0.02em;
    font-weight: 700 !important;
    color: ${scan.ink};
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    line-height: 1.6;
    color: ${scan.muted};
    max-width: 560px;
    margin: 0 auto 28px;
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600 !important;
  color: ${scan.accent};
  background: ${scan.accentSoft};
  border-radius: 999px;
  padding: 5px 12px;
  margin-bottom: 18px;
`;

const Learn = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 40px;
  text-align: left;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  div {
    border: 1px solid ${scan.lineSoft};
    border-radius: 14px;
    padding: 16px;
    background: ${scan.bgSoft};
  }

  strong {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600 !important;
    color: ${scan.ink};
    margin-bottom: 4px;
  }

  span {
    font-size: 13px;
    line-height: 1.5;
    color: ${scan.muted};
  }
`;

const Dock = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px 16px 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 32%);
  z-index: 20;

  > div {
    max-width: 760px;
    margin: 0 auto;
  }
`;

// ============================================================================
// CONVERSATION
// ============================================================================

const Turn = styled.section`
  margin-bottom: 48px;
  scroll-margin-top: 110px;
`;

const Ask = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;

  span {
    background: ${scan.bgSoft};
    border: 1px solid ${scan.lineSoft};
    color: ${scan.ink};
    font-size: 15px;
    padding: 10px 16px;
    border-radius: 18px 18px 4px 18px;
    max-width: 80%;
  }
`;

const Answer = styled.div`
  animation: ${keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`} 0.25s ease;
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
`;

const Steps = styled.ol`
  list-style: none;
  border: 1px solid ${scan.lineSoft};
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 20px;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: ${scan.muted2};
    padding: 4px 0;
  }

  li.done {
    color: ${scan.muted};
  }

  li.now {
    color: ${scan.ink};
  }

  li.now i {
    animation: ${pulse} 1.1s ease-in-out infinite;
  }

  i {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: ${scan.lineSoft};
    color: ${scan.green};
    flex: 0 0 18px;
  }

  li.now i {
    background: ${scan.accent};
  }
`;

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const Skeleton = styled.div`
  height: ${(p) => p.$h || 14}px;
  width: ${(p) => p.$w || '100%'};
  border-radius: 8px;
  margin-bottom: 10px;
  background: linear-gradient(90deg, ${scan.lineSoft} 0%, #fafafb 50%, ${scan.lineSoft} 100%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s linear infinite;
`;

const SkeletonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  overflow: hidden;

  > div {
    flex: 0 0 140px;
    margin: 0;
  }
`;

const Summary = styled.p`
  font-size: 16px;
  line-height: 1.7;
  color: ${scan.ink2};
  margin-bottom: 18px;

  strong {
    font-weight: 650 !important;
    color: ${scan.ink};
  }
`;

const Stats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
`;

const Stat = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  border: 1px solid ${scan.line};
  border-radius: 12px;
  padding: 8px 12px;

  b {
    font-size: 16px;
    font-weight: 700 !important;
    color: ${scan.ink};
  }

  span {
    font-size: 12px;
    color: ${scan.muted};
  }
`;

const Block = styled.div`
  margin-bottom: 32px;
`;

const BlockTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 650 !important;
  color: ${scan.ink};
  margin-bottom: 12px;

  small {
    font-size: 13px;
    font-weight: 400 !important;
    color: ${scan.muted};
  }
`;

const Strip = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${scan.line};
    border-radius: 6px;
  }
`;

// ============================================================================
// CARDS
// ============================================================================

const VCard = styled.a`
  flex: 0 0 150px;
  min-width: 0;
  scroll-snap-align: start;
  text-decoration: none;
  color: inherit;

  &:hover .cover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(16, 17, 20, 0.12);
  }
`;

const Cover = styled.div`
  position: relative;
  aspect-ratio: 9 / 16;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(160deg, #2b2d33 0%, #111214 100%);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .play {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: rgba(255, 255, 255, 0.85);
  }

  .views {
    position: absolute;
    left: 8px;
    bottom: 8px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600 !important;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
`;

const TypeTag = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 10px;
  font-weight: 600 !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #fff;
  border-radius: 999px;
  padding: 3px 8px;
  background: ${(p) => scan[p.$type] || 'rgba(0,0,0,0.55)'};
`;

const VMeta = styled.div`
  padding: 8px 2px 0;

  p {
    font-size: 13px;
    line-height: 1.35;
    color: ${scan.ink};
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    min-height: 35px;
  }

  span {
    display: block;
    font-size: 12px;
    color: ${scan.muted};
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const HookList = styled.div`
  border: 1px solid ${scan.line};
  border-radius: 14px;
  overflow: hidden;
`;

const HookRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;

  & + & {
    border-top: 1px solid ${scan.lineSoft};
  }

  .text {
    flex: 1;
    min-width: 0;
  }

  q {
    display: block;
    font-size: 15px;
    line-height: 1.4;
    color: ${scan.ink};
    font-weight: 550 !important;
    margin-bottom: 4px;
  }

  small {
    font-size: 12px;
    color: ${scan.muted};
  }

  .thumbs {
    display: flex;
    gap: 4px;
    flex: 0 0 auto;
  }

  .thumbs a {
    width: 36px;
    height: 64px;
    border-radius: 6px;
    overflow: hidden;
    background: linear-gradient(160deg, #2b2d33 0%, #111214 100%);
  }

  .thumbs img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 520px) {
    .thumbs a:nth-child(n + 2) {
      display: none;
    }
  }
`;

const CreatorTable = styled.div`
  border: 1px solid ${scan.line};
  border-radius: 14px;
  overflow: hidden;
`;

const CreatorLine = styled.a`
  display: grid;
  grid-template-columns: 1fr 90px 70px 90px;
  gap: 8px;
  align-items: center;
  padding: 11px 16px;
  text-decoration: none;
  color: ${scan.ink};
  font-size: 14px;

  & + & {
    border-top: 1px solid ${scan.lineSoft};
  }

  &:hover {
    background: ${scan.bgSoft};
  }

  &.head {
    font-size: 12px;
    color: ${scan.muted};
    background: ${scan.bgSoft};
    pointer-events: none;
  }

  .h {
    font-weight: 550 !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .n {
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: ${scan.inkSoft};
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr 70px 80px;

    .hide-sm {
      display: none;
    }
  }
`;

const Bridge = styled.div`
  border-radius: 18px;
  padding: 22px;
  background: ${scan.accentSoft};
  border: 1px solid #fbd5de;
  margin-bottom: 28px;

  h3 {
    font-size: 18px;
    line-height: 1.35;
    font-weight: 700 !important;
    color: ${scan.ink};
    margin-bottom: 6px;
  }

  > p {
    font-size: 14px;
    color: ${scan.inkSoft};
    margin-bottom: 16px;
  }
`;

const MatchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 18px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Match = styled.a`
  display: block;
  background: #fff;
  border: 1px solid #f6dbe2;
  border-radius: 12px;
  padding: 10px;
  text-decoration: none;
  color: ${scan.ink};

  .top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .av {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    flex: 0 0 28px;
    background: ${scan.lineSoft};
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 600 !important;
    color: ${scan.muted};
    overflow: hidden;
  }

  .av img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  b {
    display: block;
    font-size: 13px;
    font-weight: 600 !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    font-size: 11px;
    color: ${scan.muted};
  }

  .th {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
  }

  .th span {
    aspect-ratio: 9 / 16;
    border-radius: 5px;
    background: ${scan.lineSoft};
    overflow: hidden;
  }

  .th img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Cta = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${scan.accent};
  color: #fff !important;
  font-size: 15px;
  font-weight: 600 !important;
  padding: 13px 20px;
  border-radius: 12px;
  text-decoration: none;
  transition: background 0.15s ease, transform 0.15s ease;

  &:hover {
    background: ${scan.accentHover};
    transform: translateY(-1px);
  }
`;

const Fine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 12px;
  font-size: 12px;
  color: ${scan.inkSoft};

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`;

const Gate = styled.form`
  position: relative;
  border: 1px solid ${scan.line};
  border-radius: 18px;
  padding: 22px;
  margin-bottom: 28px;
  overflow: hidden;

  .fade {
    margin: -6px 0 16px;
    filter: blur(5px);
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 650 !important;
    color: ${scan.ink};
    margin-bottom: 4px;
  }

  p {
    font-size: 14px;
    color: ${scan.muted};
    margin-bottom: 14px;
  }

  .row {
    display: flex;
    gap: 8px;
  }

  input {
    flex: 1;
    min-width: 0;
    border: 1px solid ${scan.line};
    border-radius: 12px;
    padding: 12px 14px;
    font-size: 15px;
    outline: 0;
  }

  input:focus {
    border-color: ${scan.accent};
    box-shadow: 0 0 0 4px ${scan.accentRing};
  }

  button {
    border: 0;
    border-radius: 12px;
    padding: 0 18px;
    background: ${scan.ink};
    color: #fff;
    font-size: 14px;
    font-weight: 600 !important;
    cursor: pointer;
    white-space: nowrap;
  }

  button:disabled {
    opacity: 0.5;
  }

  .err {
    font-size: 13px;
    color: ${scan.accent};
    margin: 8px 0 0;
  }

  @media (max-width: 520px) {
    .row {
      flex-direction: column;
    }

    button {
      padding: 12px;
    }
  }
`;

const Follow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button,
  a {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid ${scan.line};
    background: #fff;
    color: ${scan.inkSoft};
    border-radius: 999px;
    padding: 8px 14px;
    font-size: 13px;
    cursor: pointer;
    text-decoration: none;
  }

  button:hover,
  a:hover {
    border-color: ${scan.ink};
    color: ${scan.ink};
  }
`;

const Sent = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${scan.green};
  margin: -12px 0 18px;
`;

const ErrorBox = styled.div`
  border: 1px solid #fbd5de;
  background: ${scan.accentSoft};
  color: ${scan.ink2};
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 14px;
`;

// ============================================================================
// PIECES
// ============================================================================

function Md({ text }) {
  const parts = String(text || '').split('**');
  return parts.map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment>));
}

function Thumb({ src, alt }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return null;
  return <img src={src} alt={alt || ''} loading="lazy" referrerPolicy="no-referrer" onError={() => setBroken(true)} />;
}

function VideoCard({ v }) {
  return (
    <VCard href={v.url} target="_blank" rel="noopener noreferrer">
      <Cover className="cover">
        <div className="play"><Play size={28} fill="currentColor" /></div>
        <Thumb src={v.thumb} alt={v.hook} />
        {v.type && v.type !== 'organic' && <TypeTag $type={v.type}>{TYPE_LABEL[v.type]}</TypeTag>}
        <span className="views"><Eye size={13} /> {v.views_label}</span>
      </Cover>
      <VMeta>
        <p>{v.hook || 'Untitled video'}</p>
        <span>{v.creator} · {v.followers_label} · {v.age}</span>
      </VMeta>
    </VCard>
  );
}

const STEPS = ['Searching TikTok for creator posts', 'Pulling the best videos', 'Grouping hooks and matching creators'];

function Thinking({ step, line }) {
  return (
    <>
      <Steps>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const cls = n < step ? 'done' : n === step ? 'now' : '';
          return (
            <li key={label} className={cls}>
              <i>{n < step ? <Check size={11} strokeWidth={3} /> : null}</i>
              {n === step && line ? line : label}
            </li>
          );
        })}
      </Steps>
      <Skeleton $w="92%" />
      <Skeleton $w="78%" />
      <Skeleton $w="64%" />
      <SkeletonRow>
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} $h={230} />)}
      </SkeletonRow>
    </>
  );
}

function MatchCard({ c }) {
  const name = c.handle || 'Vetted creator';
  const inner = (
    <>
      <div className="top">
        <div className="av">{c.avatar_url ? <img src={c.avatar_url} alt="" loading="lazy" /> : name.replace('@', '').slice(0, 1).toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <b>{name}</b>
          <small>{[c.followers, (c.niches || [])[0]].filter(Boolean).join(' · ')}</small>
        </div>
      </div>
      {(c.thumbnails || []).length > 0 && (
        <div className="th">
          {c.thumbnails.slice(0, 3).map((t) => <span key={t}><img src={t} alt="" loading="lazy" /></span>)}
        </div>
      )}
    </>
  );
  return c.preview_url
    ? <Match href={c.preview_url} target="_blank" rel="noopener noreferrer">{inner}</Match>
    : <Match as="div">{inner}</Match>;
}

function BridgeCard({ report, brand }) {
  const m = report.matches;
  if (!m) return null;
  const niche = m.niche ? `${m.niche} ` : '';
  const headline = m.total > 0
    ? `${m.total} Newcollab ${niche}creators fit this profile and are open to gifting your brand.`
    : `Get vetted ${niche}creators posting like this for your brand.`;
  return (
    <Bridge>
      <h3>{headline}</h3>
      <p>Pick creators, ship your product, get 5–10 ad-ready videos back. Same playbook as {brand}, without the agency.</p>
      {(m.creators || []).length > 0 && (
        <MatchGrid>
          {m.creators.map((c, i) => <MatchCard key={c.preview_url || i} c={c} />)}
        </MatchGrid>
      )}
      <Cta href={m.cta_url} onClick={() => trackBrandCtaClick('brand_scan', 'scan_bridge')}>
        Try your first campaign free <ArrowRight size={16} />
      </Cta>
      <Fine>
        <span><Check size={13} /> 5 creators</span>
        <span><Check size={13} /> 5–10 videos</span>
        <span><Check size={13} /> 6-month ad rights</span>
        <span><Check size={13} /> $0 platform fee</span>
      </Fine>
    </Bridge>
  );
}

function UnlockGate({ report, onUnlock }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const u = report.unlock || {};
  if (!report.locked || (!u.videos && !u.hooks && !u.creators)) return null;
  const more = (n, word) => (n ? `${n} more ${word}${n === 1 ? '' : 's'}` : null);
  const extra = [more(u.creators, 'creator'), more(u.videos, 'video'), more(u.hooks, 'hook')]
    .filter(Boolean).join(', ');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onUnlock(email.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Gate onSubmit={submit}>
      <div className="fade" aria-hidden="true">
        <Skeleton $w="70%" />
        <Skeleton $w="85%" />
        <Skeleton $w="60%" />
      </div>
      <h3><Lock size={16} /> See the full report</h3>
      <p>{extra}. Free, sent to your inbox too.</p>
      <div className="row">
        <input type="email" required placeholder="you@brand.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Work email" />
        <button type="submit" disabled={busy || !email.trim()}>{busy ? 'Unlocking…' : 'Unlock full report'}</button>
      </div>
      {error && <p className="err">{error}</p>}
    </Gate>
  );
}

function Report({ turn, onUnlock }) {
  const r = turn.scan;
  const st = r.stats || {};
  const name = (r.brand && r.brand.name) || turn.brand;
  const mix = st.mix || {};
  return (
    <Answer>
      <Summary><Md text={r.summary} /></Summary>
      {r.status === 'ready' && (
        <Stats>
          <Stat><b>{st.creators}</b><span>creators</span></Stat>
          <Stat><b>{st.videos}</b><span>videos</span></Stat>
          <Stat><b>{st.views_label}</b><span>views</span></Stat>
          {st.median_followers ? <Stat><b>{st.median_followers_label}</b><span>median followers</span></Stat> : null}
          {mix.gifted ? <Stat><b>{Math.round(mix.gifted * 100)}%</b><span>gifted</span></Stat> : null}
        </Stats>
      )}

      {(r.top_videos || []).length > 0 && (
        <Block>
          <BlockTitle><TrendingUp size={16} /> Top videos <small>by views</small></BlockTitle>
          <Strip>{r.top_videos.map((v) => <VideoCard key={v.id} v={v} />)}</Strip>
        </Block>
      )}

      {(r.hooks || []).length > 0 && (
        <Block>
          <BlockTitle><Sparkles size={16} /> Hooks that repeat <small>the script creators reuse</small></BlockTitle>
          <HookList>
            {r.hooks.map((h) => (
              <HookRow key={h.hook}>
                <div className="text">
                  <q>{h.hook}</q>
                  <small>{h.videos} videos · {h.creators} creators · {h.views_label} views</small>
                </div>
                <div className="thumbs">
                  {(h.examples || []).map((v) => (
                    <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"><Thumb src={v.thumb} alt="" /></a>
                  ))}
                </div>
              </HookRow>
            ))}
          </HookList>
        </Block>
      )}

      {(r.creators || []).length > 0 && (
        <Block>
          <BlockTitle><Users size={16} /> Creators posting</BlockTitle>
          <CreatorTable>
            <CreatorLine as="div" className="head">
              <span>Creator</span><span className="n">Followers</span><span className="n hide-sm">Posts</span><span className="n">Best views</span>
            </CreatorLine>
            {r.creators.map((c) => (
              <CreatorLine key={c.handle} href={c.url} target="_blank" rel="noopener noreferrer">
                <span className="h">{c.handle}</span>
                <span className="n">{c.followers_label}</span>
                <span className="n hide-sm">{c.videos}</span>
                <span className="n">{c.best_views_label}</span>
              </CreatorLine>
            ))}
          </CreatorTable>
        </Block>
      )}

      <BridgeCard report={r} brand={name} />
      <UnlockGate report={r} onUnlock={onUnlock} />

      {turn.sentTo && (
        <Sent><Check size={14} /> Full report sent to {turn.sentTo}</Sent>
      )}

      <Follow>
        {r.matches && r.matches.cta_url && (
          <a href={r.matches.cta_url} onClick={() => trackBrandCtaClick('brand_scan', 'scan_followup')}>
            <Gift size={14} /> Try your first campaign free
          </a>
        )}
      </Follow>
    </Answer>
  );
}

// ============================================================================
// PAGE
// ============================================================================

let turnSeq = 0;

export default function BrandScanClient() {
  const params = useSearchParams();
  const [turns, setTurns] = useState([]);
  const ref = useRef(params.get('ref') || params.get('utm_source') || 'scan_page');
  const dockRef = useRef(null);
  const started = useRef(false);

  const update = useCallback((id, patch) => {
    setTurns((all) => all.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const unlock = useCallback(async (id, brand, email) => {
    const full = await unlockScan({ brand, email, ref: ref.current });
    rememberEmail(email);
    trackScan('brand_scan_unlock', { brand });
    update(id, { scan: full, sentTo: email });
  }, [update]);

  const finish = useCallback((id, brand, result) => {
    update(id, { status: 'done', scan: result });
    trackScan('brand_scan_ready', { brand, status: result.status, videos: (result.stats || {}).videos || 0 });
    const email = savedEmail();
    if (email && result.locked) {
      unlock(id, brand, email).catch(() => {});
    }
  }, [unlock, update]);

  const run = useCallback(async (brand) => {
    const id = ++turnSeq;
    setTurns((all) => [...all, { id, brand, status: 'searching', step: 1, line: '' }]);
    trackScan('brand_scan_run', { brand, ref: ref.current });
    try {
      let result = await startScan(brand, ref.current);
      const began = Date.now();
      while (result.status === 'searching') {
        update(id, { step: result.step || 1, line: result.line || '' });
        if (Date.now() - began > POLL_TIMEOUT_MS) {
          throw new Error('This one is taking longer than usual. Try again in a minute.');
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
        result = await pollScan(result.scan_id);
      }
      finish(id, brand, result);
    } catch (err) {
      update(id, { status: 'error', error: err.message });
    }
  }, [finish, update]);

  useEffect(() => {
    const b = params.get('b');
    if (b && !started.current) {
      started.current = true;
      run(b);
    }
  }, [params, run]);

  useEffect(() => {
    if (turns.length) {
      const last = document.getElementById(`turn-${turns[turns.length - 1].id}`);
      if (last) last.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [turns.length]);

  const busy = turns.some((t) => t.status === 'searching');

  return (
    <LandingPageLayoutNext canonicalUrl={PAGE_URL}>
      <Page>
        <Column>
          {turns.length === 0 ? (
            <Hero>
              <Badge><Sparkles size={13} /> Brand Scan · free</Badge>
              <h1>Which brand&apos;s creators do you want to see?</h1>
              <p>Type any brand. See the TikTok creators posting about it, the hooks they repeat, and the videos that win. Then get creators like them posting for you.</p>
              <ScanInput onSubmit={run} large autoFocus />
              <Learn>
                <div><strong><Users size={15} /> Every creator</strong><span>Who posts about the brand, their size, and whether they were gifted or paid.</span></div>
                <div><strong><Sparkles size={15} /> Hooks that repeat</strong><span>The opening lines creators reuse. That&apos;s the brand&apos;s creator script.</span></div>
                <div><strong><TrendingUp size={15} /> Videos that win</strong><span>Top posts by views, ready to brief your own creators on.</span></div>
              </Learn>
            </Hero>
          ) : (
            turns.map((t) => (
              <Turn key={t.id} id={`turn-${t.id}`}>
                <Ask><span>Scan {t.brand}</span></Ask>
                {t.status === 'searching' && <Thinking step={t.step} line={t.line} />}
                {t.status === 'error' && <ErrorBox>{t.error}</ErrorBox>}
                {t.status === 'done' && (
                  <Report
                    turn={t}
                    onUnlock={(email) => unlock(t.id, t.brand, email)}
                  />
                )}
              </Turn>
            ))
          )}
        </Column>
      </Page>
      {turns.length > 0 && (
        <Dock ref={dockRef}>
          <div><ScanInput onSubmit={run} busy={busy} chips={false} placeholder="Scan another brand…" /></div>
        </Dock>
      )}
    </LandingPageLayoutNext>
  );
}
