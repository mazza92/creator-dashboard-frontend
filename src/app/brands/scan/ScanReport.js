// Brand Scan conversation + report UI, shared by the public /brands/scan page (Next) and the brand
// workspace (CRA). No framework imports: callers pass their own start/poll functions to useScanTurns.
import React, { useCallback, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowRight, Bookmark, BookmarkCheck, Check, Eye, Lock, Play, Sparkles, Users, TrendingUp } from 'lucide-react';
import { trackBrandCtaClick } from '../_cluster/catalog';
import { POLL_MS, POLL_TIMEOUT_MS, trackScan } from './scanApi';
import { TYPE_LABEL, scan } from './theme';

// ============================================================================
// CONVERSATION
// ============================================================================

export const Turn = styled.section`
  margin-bottom: 48px;
  scroll-margin-top: 110px;
`;

export const Ask = styled.div`
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
  position: relative;
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

export const ErrorBox = styled.div`
  border: 1px solid #fbd5de;
  background: ${scan.accentSoft};
  color: ${scan.ink2};
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 14px;
`;

const SaveBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.$on ? scan.accent : scan.line)};
  background: ${(p) => (p.$on ? scan.accentSoft : '#fff')};
  color: ${(p) => (p.$on ? scan.accent : scan.muted)};
  display: grid;
  place-items: center;
  cursor: pointer;
`;

const Locked = styled.div`
  position: relative;
  margin-top: -1px;
  border: 1px solid ${scan.line};
  border-top: 0;
  border-radius: 0 0 14px 14px;
  overflow: hidden;

  .rows {
    filter: blur(5px);
    opacity: 0.6;
    user-select: none;
  }

  .rows div {
    display: grid;
    grid-template-columns: 1fr 90px 70px 90px;
    padding: 11px 16px;
    font-size: 14px;
    color: ${scan.ink};
    border-top: 1px solid ${scan.lineSoft};
  }

  .over {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 16px;
    text-align: center;
    font-size: 14px;
    color: ${scan.ink2};
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.55) 0%, rgba(255, 255, 255, 0.92) 100%);
  }

  .over svg {
    flex: 0 0 auto;
    color: ${scan.accent};
  }

  .over a {
    color: ${scan.accent};
    font-weight: 600 !important;
  }
`;

const GateBox = styled.div`
  border: 1px solid #fbd5de;
  background: ${scan.accentSoft};
  border-radius: 18px;
  padding: 22px;

  > svg {
    color: ${scan.accent};
    margin-bottom: 8px;
  }

  p {
    font-size: 15px;
    line-height: 1.6;
    color: ${scan.ink2};
    margin-bottom: 16px;
  }
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

export function Thinking({ step, line }) {
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

function MatchCard({ c, saved, onSave }) {
  const name = c.handle || 'Vetted creator';
  const toggle = onSave && c.handle ? (
    <SaveBtn
      type="button"
      aria-label={saved ? 'Remove from saved creators' : 'Save creator'}
      $on={saved}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSave(c, !saved); }}
    >
      {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
    </SaveBtn>
  ) : null;
  const inner = (
    <>
      {toggle}
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

function BridgeCard({ report, brand, cta, savedRefs, onSave }) {
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
          {m.creators.map((c, i) => (
            <MatchCard key={c.preview_url || i} c={c} onSave={onSave}
              saved={Boolean(savedRefs && c.handle && savedRefs.has(c.handle.toLowerCase()))} />
          ))}
        </MatchGrid>
      )}
      <Cta
        href={(cta && cta.href) || m.cta_url}
        onClick={(e) => {
          trackBrandCtaClick('brand_scan', 'scan_bridge');
          if (cta && cta.onClick) { e.preventDefault(); cta.onClick(); }
        }}
      >
        {(cta && cta.label) || 'Try your first campaign free'} <ArrowRight size={16} />
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

function LockedCreators({ count, brand, href }) {
  return (
    <Locked>
      <div className="rows" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i}><span>@creator_handle_{i}</span><span>24.1K</span><span>3</span><span>182K</span></div>
        ))}
      </div>
      <div className="over">
        <Lock size={16} />
        <span>
          <b>{count} more creators</b> post for {brand}.{' '}
          <a href={href} onClick={() => trackBrandCtaClick('brand_scan', 'scan_locked_creators')}>
            Try your first campaign free
          </a>{' '}to see them all.
        </span>
      </div>
    </Locked>
  );
}

export function GateCard({ gate, cta }) {
  const showCta = gate.gate !== 'pending';
  return (
    <GateBox>
      <Lock size={18} />
      <p>{gate.message}</p>
      {showCta && (
        <Cta
          href={(cta && cta.href) || gate.cta_url}
          onClick={(e) => {
            trackBrandCtaClick('brand_scan', `scan_gate_${gate.gate}`);
            if (cta && cta.onClick) { e.preventDefault(); cta.onClick(); }
          }}
        >
          {(cta && cta.label) || 'Try your first campaign free'} <ArrowRight size={16} />
        </Cta>
      )}
    </GateBox>
  );
}

/**
 * Report props:
 *  turn       {brand, scan}
 *  cta        optional {label, href, onClick} for the bridge card (workspace swaps the signup CTA)
 *  savedRefs  optional Set of saved creator handles (lowercase); onSave(card, save) shows bookmark toggles
 */
export function Report({ turn, cta, savedRefs, onSave }) {
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
          {r.locked && (r.unlock || {}).creators > 0 && (
            <LockedCreators count={r.unlock.creators} brand={name} href={(r.matches || {}).cta_url} />
          )}
        </Block>
      )}

      <BridgeCard report={r} brand={name} cta={cta} savedRefs={savedRefs} onSave={onSave} />
    </Answer>
  );
}


// ============================================================================
// SCAN RUNNER
// ============================================================================

let turnSeq = 0;

/**
 * Conversation state for scans. start(brand) / poll(scanId) return the API's `scan` object.
 * Statuses: searching → done | gated | error. onDone(turn, result) runs after a report or gate arrives.
 */
export function useScanTurns({ start, poll, onDone, source = 'scan_page' }) {
  const [turns, setTurns] = useState([]);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  const update = useCallback((id, patch) => {
    setTurns((all) => all.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const run = useCallback(async (brand) => {
    const id = ++turnSeq;
    setTurns((all) => [...all, { id, brand, status: 'searching', step: 1, line: '' }]);
    trackScan('brand_scan_run', { brand, ref: source });
    try {
      let result = await start(brand);
      const began = Date.now();
      while (result.status === 'searching') {
        update(id, { step: result.step || 1, line: result.line || '' });
        if (Date.now() - began > POLL_TIMEOUT_MS) {
          throw new Error('This one is taking longer than usual. Try again in a minute.');
        }
        await new Promise((r) => setTimeout(r, POLL_MS));
        result = await poll(result.scan_id);
      }
      const status = result.status === 'gated' ? 'gated' : 'done';
      update(id, { status, scan: result });
      trackScan(status === 'gated' ? 'brand_scan_gated' : 'brand_scan_ready',
        { brand, status: result.status, gate: result.gate, videos: (result.stats || {}).videos || 0 });
      if (doneRef.current) doneRef.current({ id, brand }, result);
    } catch (err) {
      update(id, { status: 'error', error: err.message });
    }
  }, [poll, source, start, update]);

  const reset = useCallback(() => setTurns([]), []);
  const show = useCallback((brand, result) => {
    const id = ++turnSeq;
    setTurns([{ id, brand, status: result.status === 'gated' ? 'gated' : 'done', scan: result }]);
  }, []);

  return { turns, run, reset, show, busy: turns.some((t) => t.status === 'searching') };
}

/** One conversation turn: the ask bubble, then thinking / report / gate / error. */
export function ScanTurn({ turn, cta, savedRefs, onSave }) {
  return (
    <Turn id={`turn-${turn.id}`}>
      <Ask><span>Scan {turn.brand}</span></Ask>
      {turn.status === 'searching' && <Thinking step={turn.step} line={turn.line} />}
      {turn.status === 'error' && <ErrorBox>{turn.error}</ErrorBox>}
      {turn.status === 'gated' && <GateCard gate={turn.scan} cta={cta} />}
      {turn.status === 'done' && <Report turn={turn} cta={cta} savedRefs={savedRefs} onSave={onSave} />}
    </Turn>
  );
}
