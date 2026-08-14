import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import UpgradeModal from './UpgradeModal';
import ProfileScrapingLoader from '../components/ProfileScrapingLoader';
import { UnlockModalV2 } from './unlockV2';

const COACHING_SCAN_FRAMES = [
  { id: 1, text: 'Fetching your profile…', icon: '🔍' },
  { id: 2, text: 'Reading your recent posts…', icon: '📸' },
  { id: 3, text: 'Scoring brand readiness…', icon: '🎯' },
  { id: 4, text: 'Unlocking your UGC coaching…', icon: '✨', done: true },
];

const KIT_BUILD_FRAMES = [
  { id: 1, text: 'Analyzing your last 12 posts…', icon: '✨' },
  { id: 2, text: 'Extracting your best aesthetic…', icon: '🎨' },
  { id: 3, text: 'Building your stats card…', icon: '📊' },
  { id: 4, text: 'Writing your bio…', icon: '✍️' },
  { id: 5, text: 'Selecting your 6 hero pieces…', icon: '🖼️' },
  { id: 6, text: 'Ready ✓', icon: '✓', done: true },
];

const Wrap = styled.div`
  max-width: 980px;
  margin: 0 auto;
  padding: 20px 20px 48px;

  @media (max-width: 640px) {
    padding: 12px 16px 48px;
  }
`;

const Eyebrow = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${t.accent};
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-family: ${t.fontDisplay};
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: ${t.ink};
  margin: 0 0 8px;
  max-width: 16ch;
`;

const Sub = styled.p`
  color: ${t.muted};
  font-size: 15px;
  line-height: 1.5;
  max-width: 48ch;
  margin: 0 0 22px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const Grid3 = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 14px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: ${t.radiusCard};
  box-shadow: ${t.shadowCard};
  padding: 18px;
`;

const Ring = styled.div`
  width: 108px;
  height: 108px;
  border-radius: 50%;
  background: conic-gradient(
    ${t.accent} 0 ${({ $pct }) => $pct}%,
    #e8e4db ${({ $pct }) => $pct}% 100%
  );
  display: grid;
  place-items: center;
  position: relative;
  flex-shrink: 0;
  transition: background 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  ${({ $pulse }) =>
    $pulse &&
    css`
      animation: scoreRingPulse 0.5s ease-out;
    `}
  &::after {
    content: '';
    position: absolute;
    inset: 10px;
    background: ${t.white};
    border-radius: 50%;
  }
  @keyframes scoreRingPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.55);
    }
    100% {
      box-shadow: 0 0 0 16px rgba(16, 185, 129, 0);
    }
  }
`;

const RingNum = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  line-height: 1;
  b {
    display: block;
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: ${t.ink};
  }
  span {
    font-size: 12px;
    font-weight: 700;
    color: ${t.muted};
  }
`;

const DeltaChip = styled.div`
  display: inline-flex;
  align-items: center;
  margin-top: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-size: 12px;
  font-weight: 800;
  animation: deltaPop 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  @keyframes deltaPop {
    0% {
      transform: scale(0.7);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const VisitDelta = styled.div`
  margin: 0 0 2px;
  font-size: 13px;
  font-weight: 750;
  color: ${t.accentDeep};
  line-height: 1.35;
`;

const SCORE_SNAP_KEY = 'nc_ai_manager_score_v1';
const VISIT_DELTA_KEY = 'nc_ai_manager_visit_delta';

function formatSinceLabel(iso) {
  if (!iso) return 'last visit';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'last visit';
    const now = new Date();
    const sameWeek =
      Math.abs(now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
    if (sameWeek) {
      return d.toLocaleDateString(undefined, { weekday: 'long' });
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'last visit';
  }
}

function readScoreSnapshot() {
  try {
    const raw = localStorage.getItem(SCORE_SNAP_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeScoreSnapshot(score, doneIds) {
  try {
    localStorage.setItem(
      SCORE_SNAP_KEY,
      JSON.stringify({
        score: Number(score) || 0,
        at: new Date().toISOString(),
        done_ids: doneIds || [],
      })
    );
  } catch {
    /* ignore */
  }
}

function readVisitDelta() {
  try {
    const raw = sessionStorage.getItem(VISIT_DELTA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeVisitDelta(payload) {
  try {
    if (!payload) sessionStorage.removeItem(VISIT_DELTA_KEY);
    else sessionStorage.setItem(VISIT_DELTA_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

function describeDoneDelta(prevIds, nextIds) {
  const prev = new Set(prevIds || []);
  const added = (nextIds || []).filter((id) => !prev.has(id));
  const labels = {
    bio: 'bio email added',
    kit: 'portfolio published',
    shows_products: 'product proof added',
    whitelisting: 'whitelisting added',
    brand_concept: 'brand concept added',
  };
  if (!added.length) return 'plan updated';
  return labels[added[0]] || 'plan updated';
}

const PeekLabel = styled.div`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${t.muted};
  margin: 10px 0 4px;
`;

const PeekBody = styled.p`
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.45;
  color: ${t.inkSoft};
`;

const FixLocked = styled.p`
  margin: 0 0 10px;
  font-size: 13px;
  color: ${t.muted};
  line-height: 1.4;
`;

const ProHero = styled.div`
  margin-top: 8px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid ${t.accentBorder || t.line};
  background: linear-gradient(165deg, ${t.accentSoft || '#f0fdf4'} 0%, ${t.white} 55%);
`;

const ProHeroTitle = styled.h4`
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 800;
  color: ${t.ink};
`;

const ProPeekItem = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid ${t.line};
  &:last-of-type {
    border-bottom: 0;
    margin-bottom: 8px;
  }
  h5 {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 750;
    color: ${t.ink};
  }
`;

const SuccessStory = styled.div`
  margin: 6px 0 10px;
  padding: 0;
  background: transparent;
  border: none;
`;

const StoryHead = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${t.muted};
  line-height: 1.35;
`;

const StoryHandle = styled.span`
  font-weight: 650;
  color: ${t.inkSoft};
`;

const StoryAvatar = styled.span`
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
`;

const StoryAvatarImg = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
  border: none;
  flex-shrink: 0;
  background: ${t.paper};
  opacity: 0.92;
`;

const StoryStats = styled.div`
  font-size: 12px;
  font-weight: 550;
  color: ${t.accent};
  line-height: 1.4;
  padding-left: 36px;
`;

const StoryQuote = styled.p`
  margin: 4px 0 0;
  padding-left: 36px;
  font-size: 12px;
  line-height: 1.4;
  color: ${t.muted};
  font-style: italic;
`;

const NeedLine = styled.li`
  font-size: 12px;
  color: ${({ $done }) => ($done ? '#166534' : t.muted)};
  line-height: 1.4;
`;

const KitStepList = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 8px;
`;

const KitStepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: ${({ $active, $done }) => ($active || $done ? 650 : 500)};
  color: ${({ $done, $active }) =>
    $done ? '#166534' : $active ? t.ink : t.muted};
  background: ${({ $active }) => ($active ? t.paper : 'transparent')};
`;

function KitBuildSteps() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, KIT_BUILD_FRAMES.length - 1));
    }, 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <KitStepList>
      {KIT_BUILD_FRAMES.map((frame, idx) => (
        <KitStepItem
          key={frame.id}
          $active={idx === step}
          $done={idx < step || (idx === step && frame.done)}
        >
          <span>{frame.icon}</span>
          <span>{frame.text}</span>
        </KitStepItem>
      ))}
    </KitStepList>
  );
}

const ScoreWrap = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`;

const Pill = styled.span`
  font-size: 11px;
  font-weight: 650;
  padding: 5px 9px;
  border-radius: 999px;
  background: ${({ $warn }) => ($warn ? '#fff4f0' : t.accentSoft)};
  color: ${({ $warn }) => ($warn ? '#b33a1f' : t.accentDeep)};
  border: 1px solid ${({ $warn }) => ($warn ? '#f0c4b6' : t.accentBorder)};
`;

const FixList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0;
`;

const FixItem = styled.li`
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 10px;
  align-items: start;
  padding: 10px 0;
  border-bottom: 1px solid ${t.line};
  &:last-child {
    border-bottom: 0;
  }
  ${({ $locked }) =>
    $locked
      ? `
    filter: blur(3px);
    user-select: none;
  `
      : ''}
`;

const FixNum = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: ${t.paper};
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: ${t.muted};
`;

const Btn = styled.button`
  width: 100%;
  border: 0;
  border-radius: ${t.radiusBtn};
  padding: 11px 14px;
  font: 700 13px/1 ${t.fontSans};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${({ $variant }) =>
    $variant === 'accent'
      ? t.proGradient
      : $variant === 'next'
        ? 'linear-gradient(135deg, #e85d3b, #c44a2f)'
        : $variant === 'ghost'
          ? 'transparent'
          : t.action};
  color: ${({ $variant }) => ($variant === 'ghost' ? t.inkSoft : '#fff')};
  border: ${({ $variant }) => ($variant === 'ghost' ? `1px solid ${t.line}` : '0')};
  margin-top: 12px;
  position: relative;
  overflow: hidden;
  transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
  ${({ $variant }) =>
    $variant === 'next'
      ? `
    box-shadow: 0 6px 18px rgba(232, 93, 59, 0.28);
  `
      : ''}
  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: ${({ $loading }) => ($loading ? 1 : 0.55)};
    cursor: not-allowed;
  }
  ${({ $loading, $variant }) =>
    $loading
      ? `
    background: ${$variant === 'ghost' ? t.paper : t.ink};
    color: ${$variant === 'ghost' ? t.ink : '#fff'};
    box-shadow: none;
  `
      : ''}
`;

const spin = `
  @keyframes prBtnSpin {
    to { transform: rotate(360deg); }
  }
`;

const BtnSpinner = styled.span`
  ${spin}
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: prBtnSpin 0.65s linear infinite;
  flex-shrink: 0;
`;

const BtnPulse = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    transparent 30%,
    rgba(255, 255, 255, 0.14) 50%,
    transparent 70%
  );
  background-size: 200% 100%;
  animation: prBtnShimmer 1.1s ease-in-out infinite;
  @keyframes prBtnShimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
  pointer-events: none;
`;

const ActionBtn = ({ busyKey, busy, children, loadingLabel, ...rest }) => {
  const loading = !!busyKey && busy === busyKey;
  return (
    <Btn {...rest} disabled={loading || rest.disabled} $loading={loading}>
      {loading && <BtnPulse />}
      {loading && <BtnSpinner />}
      <span>{loading ? loadingLabel || 'Working…' : children}</span>
    </Btn>
  );
};

const Thumbs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 10px 0;
`;

const ThumbCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Thumb = styled.div`
  aspect-ratio: 1;
  border-radius: 10px;
  background: ${t.subtle} center/cover no-repeat;
  background-image: ${({ $src }) => ($src ? `url(${$src})` : 'none')};
  border: 1px solid ${t.line};
`;

const ThumbStats = styled.div`
  font-size: 10px;
  font-weight: 650;
  color: ${t.muted};
  line-height: 1.25;
  letter-spacing: 0.01em;
`;

const Hook = styled.div`
  background: ${t.paper};
  border: 1px solid ${t.line};
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 8px;
  ${({ $locked }) => ($locked ? 'filter: blur(3px); user-select: none;' : '')}
`;

const HooksGrid = styled.div`
  display: grid;
  gap: 6px;
  margin-top: 10px;
`;

const HookChip = styled.button`
  text-align: left;
  border: 1px solid ${t.line};
  border-radius: 8px;
  background: ${t.white};
  padding: 8px 10px;
  font: 500 11px/1.35 ${t.fontSans};
  color: ${t.inkSoft};
  cursor: pointer;
  ${({ $locked }) => ($locked ? 'filter: blur(3px); user-select: none;' : '')}
  &:hover {
    border-color: ${t.accentBorder};
    background: ${t.accentSoft};
  }
`;

const shimmer = `
  @keyframes prReadyShimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
`;

const Skeleton = styled.div`
  ${shimmer}
  border-radius: ${({ $round }) => ($round ? '999px' : '10px')};
  background: linear-gradient(90deg, #ebe6dc 0%, #f5f1e8 45%, #ebe6dc 90%);
  background-size: 200% 100%;
  animation: prReadyShimmer 1.25s ease-in-out infinite;
  width: ${({ $w }) => $w || '100%'};
  height: ${({ $h }) => $h || '14px'};
  flex-shrink: 0;
`;

const LoadWrap = styled.div`
  max-width: 980px;
  margin: 0 auto;
  padding: 8px 20px 48px;

  @media (max-width: 640px) {
    padding: 8px 16px 48px;
  }
`;

const LoadStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 18px;
  font-size: 13px;
  font-weight: 650;
  color: ${t.muted};
`;

const LoadDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${t.accent};
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
  animation: prReadyPulse 1.4s ease-out infinite;
  @keyframes prReadyPulse {
    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45); }
    70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
  }
`;

const TierChip = styled.span`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $tone }) =>
    $tone === 'pro'
      ? t.hot
      : $tone === 'critical'
        ? '#b45309'
        : $tone === 'open'
          ? t.accentDeep
          : t.muted};
`;

const ProBadge = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 3px 7px;
  border-radius: 6px;
  background: ${t.proGradient || t.accentSoft};
  color: #fff;
`;

const PlanStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  margin: 0 0 16px;
  padding: 0 0 10px;
  background: transparent;
  border: none;
  border-bottom: 1px solid ${t.line};
  border-radius: 0;
`;

const PlanStripLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 14px;
  min-width: 0;
`;

const PlanLabel = styled.span`
  font-size: 13px;
  font-weight: 800;
  color: ${t.ink};
`;

const PlanMeta = styled.span`
  font-size: 12px;
  font-weight: 650;
  color: ${t.muted};
`;

const MeterBar = styled.div`
  margin-top: 8px;
  height: 6px;
  border-radius: 999px;
  background: #e8e4db;
  overflow: hidden;
`;

const MeterFill = styled.div`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct || 0))}%;
  background: ${({ $warn }) => ($warn ? t.hot : t.accent)};
  border-radius: 999px;
  transition: width 0.25s ease;
`;

const ToolList = styled.ul`
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: grid;
  gap: 6px;
`;

const ToolItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
  color: ${({ $locked }) => ($locked ? t.muted : t.inkSoft)};
  padding: 6px 0;
  border-bottom: 1px solid ${t.line};
  &:last-child {
    border-bottom: 0;
  }
`;

const ToolLock = styled.span`
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $locked }) => ($locked ? t.hot : t.accentDeep)};
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  h4 {
    margin: 0;
  }
`;

const ModalScrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(15, 15, 15, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalCard = styled.div`
  position: relative;
  width: min(${({ $wide }) => ($wide ? '520px' : '440px')}, 100%);
  background: #fff;
  border-radius: 18px;
  border: 1px solid ${t.line};
  box-shadow: 0 24px 60px rgba(15, 15, 15, 0.18);
  padding: 22px 20px 20px;
  max-height: min(90vh, 640px);
  overflow: auto;
`;

const ModalClose = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: ${t.muted};
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  &:hover {
    background: ${t.paper};
    color: ${t.ink};
  }
`;

const ModalEyebrow = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${t.accent};
  margin-bottom: 8px;
`;

const ModalTitle = styled.h2`
  font-family: ${t.fontDisplay};
  font-size: 26px;
  font-weight: 400;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  color: ${t.ink};
  line-height: 1.15;
`;

const ModalSub = styled.p`
  margin: 0 0 16px;
  font-size: 14px;
  line-height: 1.45;
  color: ${t.muted};
`;

const PlatformRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const PlatformChip = styled.button`
  border: 1px solid ${({ $active }) => ($active ? t.ink : t.line)};
  background: ${({ $active }) => ($active ? t.paper : t.white)};
  color: ${t.ink};
  border-radius: 10px;
  padding: 11px 12px;
  font: 700 13px/1 ${t.fontSans};
  cursor: pointer;
`;

const HandleInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${t.line};
  border-radius: 10px;
  padding: 11px 12px;
  font-size: 14px;
  outline: none;
  margin-bottom: 12px;
  &:focus {
    border-color: ${t.ink};
  }
`;

const Err = styled.div`
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fff1f3;
  border: 1px solid #fecdd3;
  color: #be123c;
  font-size: 13px;
  line-height: 1.4;
`;

const HeroEmpty = styled.div`
  text-align: center;
  padding: 8px 4px 4px;
`;

const HeroLead = styled.p`
  margin: 0 0 18px;
  font-size: 15px;
  line-height: 1.5;
  color: ${t.muted};
`;

const ScoreInsight = styled.div`
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid ${t.line};
`;

const InsightRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  margin-bottom: 8px;
`;

const InsightStat = styled.div`
  font-size: 12px;
  color: ${t.muted};
  b {
    display: block;
    font-size: 18px;
    font-weight: 800;
    color: ${t.ink};
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
`;

const InsightNote = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: ${t.muted};
`;

const FixWhy = styled.span`
  display: block;
  font-size: 12px;
  line-height: 1.4;
  color: ${t.inkSoft};
  margin-top: 3px;
`;

const PathLine = styled.p`
  margin: -6px 0 18px;
  font-size: 15px;
  font-weight: 650;
  color: ${t.inkSoft};
  max-width: 52ch;
`;

const ManagerGrid = styled.div`
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 14px;
  margin-bottom: 14px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
`;

const Metric = styled.div`
  padding: 10px 12px;
  border-radius: 12px;
  background: ${t.paper};
  border: 1px solid ${t.line};
  font-size: 11px;
  color: ${t.muted};
  b {
    display: block;
    margin-top: 4px;
    font-size: 16px;
    font-weight: 800;
    color: ${t.ink};
    letter-spacing: -0.02em;
  }
`;

const UnlockCard = styled.div`
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid ${t.line};
`;

const ClimbCard = styled.div`
  margin-top: 16px;
  padding: 16px;
  border-radius: 14px;
  background: linear-gradient(180deg, #f4faf7 0%, #eef6f3 100%);
  border: 1px solid ${t.accentBorder};
`;

const ClimbHead = styled.div`
  margin-bottom: 14px;
`;

const ClimbEyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${t.accent};
  margin-bottom: 4px;
`;

const ClimbTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: ${t.ink};
  line-height: 1.25;
`;

const ClimbHero = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 10px;
  margin-bottom: 10px;
`;

const ClimbScoreBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  ${({ $align }) => $align === 'end' && 'align-items: flex-end; text-align: right;'}
`;

const ClimbScoreNum = styled.div`
  font-size: ${({ $lg }) => ($lg ? '28px' : '22px')};
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  color: ${({ $muted }) => ($muted ? t.inkSoft : t.accentDeep)};
`;

const ClimbScoreLabel = styled.div`
  font-size: 11px;
  font-weight: 650;
  color: ${t.muted};
`;

const ClimbArrow = styled.div`
  padding-bottom: 14px;
  font-size: 18px;
  font-weight: 700;
  color: ${t.accent};
  line-height: 1;
`;

const ClimbTrack = styled.div`
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: rgba(13, 92, 72, 0.12);
  overflow: hidden;
  margin-bottom: 14px;
`;

const ClimbFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, ${t.accent} 0%, ${t.accentDeep} 100%);
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct || 0))}%;
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
`;

const ClimbListLabel = styled.div`
  margin: 2px 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${t.muted};
`;

const ClimbSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ClimbStep = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: ${({ $done }) => ($done ? 'rgba(255, 255, 255, 0.55)' : t.white)};
  border: 1px solid
    ${({ $done }) => ($done ? 'rgba(184, 213, 203, 0.45)' : 'rgba(184, 213, 203, 0.7)')};
`;

const ClimbStepNum = styled.span`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: ${({ $done }) => ($done ? t.white : t.accentDeep)};
  background: ${({ $done }) => ($done ? t.accent : t.accentSoft)};
`;

const ClimbStepBody = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${({ $done }) => ($done ? t.muted : t.inkSoft)};
  line-height: 1.3;
`;

const ClimbStepPts = styled.span`
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 800;
  color: ${({ $done }) => ($done ? t.muted : t.accentDeep)};
  background: ${({ $done }) => ($done ? 'rgba(13, 92, 72, 0.08)' : t.accentSoft)};
  padding: 4px 8px;
  border-radius: 999px;
  white-space: nowrap;
`;

const ClimbOutcome = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 8px;
  padding: 8px 4px 0;
  border-top: 1px dashed rgba(13, 92, 72, 0.22);
  color: ${t.accentDeep};
  font-size: 13px;
  font-weight: 650;
  letter-spacing: -0.01em;
  text-align: center;
  line-height: 1.35;
`;

const ClimbOutcomeGain = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(13, 92, 72, 0.1);
  color: ${t.accentDeep};
  font-weight: 800;
  font-size: 12px;
`;

const ClimbRewardLabel = styled.span`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${t.muted};
`;

const ClimbWeekPromise = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(13, 92, 72, 0.22);
`;

const ClimbWeekPromiseTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${t.ink};
  line-height: 1.35;
  margin-bottom: 4px;
`;

const ClimbWeekPromiseSub = styled.div`
  font-size: 12px;
  font-weight: 550;
  color: ${t.muted};
  line-height: 1.4;
`;

const ClimbUnlockBlock = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed rgba(13, 92, 72, 0.22);
  text-align: center;
`;

const ClimbUnlockTitle = styled.div`
  font-size: 13px;
  font-weight: 750;
  color: ${t.accentDeep};
  line-height: 1.35;
  margin-bottom: 4px;
`;

const ClimbUnlockSub = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${t.inkSoft};
  line-height: 1.4;
`;

const EmailHint = styled.p`
  margin: 0 0 10px;
  font-size: 11px;
  color: ${t.muted};
  button {
    border: 0;
    background: none;
    padding: 0;
    color: ${t.accentDeep};
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }
`;

const CoachingCard = styled.div`
  border: 1px solid ${t.line};
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
  background: ${({ $locked }) => ($locked ? '#faf9f6' : t.white)};
  ${({ $locked }) => ($locked ? 'filter: saturate(0.85);' : '')}
`;

const CoachMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin: 6px 0 10px;
  font-size: 11px;
  font-weight: 700;
  color: ${t.muted};
`;

const QuoteBox = styled.div`
  margin: 8px 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${t.paper};
  border: 1px solid ${t.line};
  font-size: 12px;
  line-height: 1.45;
  color: ${t.inkSoft};
  strong {
    display: block;
    margin-bottom: 4px;
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${t.muted};
  }
`;

const MissingList = styled.ul`
  margin: 6px 0 0;
  padding: 0 0 0 16px;
  font-size: 12px;
  color: ${t.muted};
  line-height: 1.45;
`;

const BrandList = styled.div`
  display: grid;
  gap: 10px;
`;

const BrandRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: start;
  padding: 12px;
  border: 1px solid ${({ $focus }) => ($focus ? t.accentBorder || t.accent : t.line)};
  border-radius: 12px;
  background: ${({ $focus }) => ($focus ? t.accentSoft : t.white)};
  box-shadow: ${({ $focus }) => ($focus ? `0 0 0 2px ${t.accentSoft}` : 'none')};
  transition: border-color 0.2s, background 0.2s;
`;

const OptimizedCard = styled.div`
  border: 1px solid #86efac;
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 10px;
  background: linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 55%, #fff 100%);
`;

const OptimizedLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #15803d;
  margin-bottom: 8px;
`;

const OptimizedText = styled.div`
  font-size: 14px;
  line-height: 1.45;
  color: ${t.ink};
  font-weight: 650;
`;

const NextMoveCard = styled.div`
  border: 1px solid #f5e6c8;
  border-radius: 14px;
  padding: 14px 14px 14px 16px;
  margin-bottom: 12px;
  background: #fffbeb;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 4px;
    border-radius: 3px;
    background: #e85d3b;
  }
`;

const NextMoveTitle = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #9a3412;
  margin-bottom: 6px;
`;

const NextMoveHint = styled.p`
  margin: 0 0 10px;
  font-size: 12px;
  color: ${t.muted};
  line-height: 1.4;
`;

const BrandsNextCard = styled(Card)`
  ${({ $emphasize }) =>
    $emphasize
      ? `
    border-color: ${t.line};
    background: ${t.white};
  `
      : ''}
`;

const ProHeroSub = styled.p`
  margin: 4px 0 12px;
  font-size: 13px;
  font-weight: 650;
  color: ${t.inkSoft};
  line-height: 1.4;
`;

const MilestoneDelta = styled.div`
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: ${t.accentDeep};
`;

const EmailField = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${t.line};
  border-radius: 10px;
  padding: 11px 12px;
  font-size: 14px;
  outline: none;
  margin: 8px 0 4px;
  &:focus {
    border-color: ${t.ink};
  }
`;

const EmailFieldAccount = styled(EmailField)`
  background: ${({ $fromAccount }) => ($fromAccount ? '#f3f1ec' : t.white)};
  color: ${({ $fromAccount }) => ($fromAccount ? t.inkSoft : t.ink)};
`;

const PlanDay = styled.div`
  border: 1px solid ${t.line};
  border-radius: 12px;
  padding: 12px;
  background: ${t.white};
  ${({ $locked }) => ($locked ? 'opacity: 0.55; filter: blur(1.5px);' : '')}
`;

const PlanDayHead = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${t.muted};
`;

const Stars = ({ n = 3 }) => '★'.repeat(Math.max(1, Math.min(5, Number(n) || 3)));

const fmtStat = (n) => {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(v >= 10_000 ? 0 : 1)}K`;
  return String(v);
};

/** Onboarding form bios (e.g. "TEST") are not PR rewrites — ignore for coaching UI. */
const isOnboardingBioStub = (bio) => {
  const b = String(bio || '').trim();
  if (!b) return true;
  if (/^(test|testing|asdf|n\/a|na|hello|hi|bio|placeholder)[\s!.]*$/i.test(b)) return true;
  // Real rewrites carry brand-scan cues; short plain text is almost always onboarding
  if (b.length < 48 && !/(ugc|\bpr\b|collab|@[\w.-]+\.\w|💌|📧|gift)/i.test(b)) return true;
  return false;
};

const pickCoachingBio = ({ bioResult, creatorBio, scrapeBio }) => {
  const scrape = String(scrapeBio || '').trim();
  const creator = String(creatorBio || '').trim();
  const fromRewriteSession = !!(bioResult?.bio && (bioResult.why || bioResult.applied || bioResult.persisted));
  if (fromRewriteSession) {
    return {
      displayBio: String(bioResult.bio || creator).trim() || scrape,
      bioIsSaved: true,
      coachingBio: String(bioResult.bio || creator).trim() || scrape,
    };
  }
  if (creator && !isOnboardingBioStub(creator)) {
    return {
      displayBio: creator,
      bioIsSaved: creator !== scrape,
      coachingBio: creator,
    };
  }
  return {
    displayBio: scrape,
    bioIsSaved: false,
    coachingBio: scrape,
  };
};

export default function PRReady() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const focusBrand = searchParams.get('focus_brand') || '';
  const [showOnboardingWelcome] = useState(() => {
    const onboarding = searchParams.get('onboarding') === 'true';
    const setup = searchParams.get('setup') === 'continue';
    return onboarding || setup;
  });
  const [isSetupContinue] = useState(() => searchParams.get('setup') === 'continue');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [pack, setPack] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('pr_ready');
  const [bioResult, setBioResult] = useState(null);
  const [connectPlatform, setConnectPlatform] = useState('instagram');
  const [connectHandle, setConnectHandle] = useState('');
  const [connectError, setConnectError] = useState('');
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [coachModalPhase, setCoachModalPhase] = useState('form'); // form | scanning
  const [nearBrands, setNearBrands] = useState([]);
  const [collabEmail, setCollabEmail] = useState('');
  const [emailFromAccount, setEmailFromAccount] = useState(false);
  const [packOpen, setPackOpen] = useState(false);
  const [displayScore, setDisplayScore] = useState(null);
  const [scorePulse, setScorePulse] = useState(false);
  const [scoreDeltaLabel, setScoreDeltaLabel] = useState('');
  const [visitDelta, setVisitDelta] = useState(null);
  const [kitBuildOpen, setKitBuildOpen] = useState(false);
  const [kitAhaOpen, setKitAhaOpen] = useState(false);
  const [pitchingBrand, setPitchingBrand] = useState(null);
  const scoreAnimRef = useRef(null);

  const openUpgrade = (feature = 'pr_ready') => {
    setUpgradeFeature(feature);
    setUpgradeOpen(true);
  };

  const animateScoreTo = useCallback((from, to, deltaLabel) => {
    const start = Number.isFinite(from) ? from : to;
    const end = Number.isFinite(to) ? to : start;
    if (scoreAnimRef.current) cancelAnimationFrame(scoreAnimRef.current);
    if (end <= start) {
      setDisplayScore(end);
      return;
    }
    setScorePulse(true);
    if (deltaLabel) setScoreDeltaLabel(deltaLabel);
    const duration = 900;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - (1 - p) ** 3;
      setDisplayScore(Math.round(start + (end - start) * eased));
      if (p < 1) {
        scoreAnimRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayScore(end);
        setTimeout(() => setScorePulse(false), 500);
        setTimeout(() => setScoreDeltaLabel(''), 4200);
      }
    };
    scoreAnimRef.current = requestAnimationFrame(tick);
  }, []);

  const openCoachModal = () => {
    setConnectError('');
    setCoachModalPhase('form');
    setCoachModalOpen(true);
  };

  const closeCoachModal = () => {
    if (coachModalPhase === 'scanning') return;
    setCoachModalOpen(false);
    setCoachModalPhase('form');
    setConnectError('');
  };

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/pr-ready');
      setData(res.data);
      if (typeof res.data?.score === 'number') {
        const nextScore = res.data.score;
        const doneIds = (res.data.checklist || [])
          .filter((c) => c.done)
          .map((c) => c.id);
        const snap = readScoreSnapshot();
        if (snap && typeof snap.score === 'number' && snap.score !== nextScore) {
          const delta = nextScore - snap.score;
          if (delta !== 0) {
            const payload = {
              delta,
              since: formatSinceLabel(snap.at),
              reason: describeDoneDelta(snap.done_ids, doneIds),
            };
            setVisitDelta(payload);
            writeVisitDelta(payload);
          }
        } else {
          const cached = readVisitDelta();
          if (cached?.delta) setVisitDelta(cached);
          else setVisitDelta(null);
        }
        setDisplayScore(nextScore);
        writeScoreSnapshot(nextScore, doneIds);
      }
      const existingHandle = (res.data?.creator?.handle || '').replace(/^@/, '');
      if (existingHandle) setConnectHandle(existingHandle);
      // Restore PR rewrite only — skip short onboarding stubs like "TEST"
      const saved = (res.data?.creator?.bio || '').trim();
      const scrapeBio = (res.data?.scrape?.raw_bio || '').trim();
      if (saved && saved !== scrapeBio && !isOnboardingBioStub(saved)) {
        setBioResult((prev) =>
          prev?.bio
            ? prev
            : {
                bio: saved,
                tagline: res.data?.creator?.kit_tagline || '',
                applied: true,
                persisted: true,
              }
        );
      }
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to load PR-Ready');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!data?.has_scrape) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get('/api/pr-crm/for-you');
        const matched = res.data?.matched || [];
        if (cancelled) return;
        const base = matched
          .filter((b) => Number(b.match_score) > 0)
          .slice(0, 4)
          .map((b) => ({
            ...b,
            id: b.id || b.brand_id,
            name: b.name || b.brand_name || 'Brand',
            brand_name: b.brand_name || b.name || 'Brand',
            score: Math.round(Number(b.match_score) || 0),
            category: b.category || '',
            slug: b.slug,
            is_for_you_match: true,
          }));
        setNearBrands(base);
        if (base.length) {
          try {
            const scored = await apiClient.post('/api/pr-ready/brand-scores', {
              brands: base,
            });
            if (!cancelled && scored.data?.brands?.length) {
              const byId = Object.fromEntries(
                scored.data.brands.map((s) => [String(s.id), s])
              );
              setNearBrands(
                base.map((b) => {
                  const s = byId[String(b.id)];
                  return s
                    ? {
                        ...b,
                        score: s.score,
                        needs: s.needs,
                        name: s.name || b.name,
                        category: s.category || b.category,
                      }
                    : b;
                })
              );
            }
          } catch {
            /* keep match_score fallback */
          }
        }
      } catch {
        if (!cancelled) setNearBrands([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [data?.has_scrape, data?.checklist]);

  const pitchNearBrand = async (brand) => {
    if (!brand?.id && !brand?.brand_id) {
      message.error('Brand unavailable');
      return;
    }
    const isProUser = !!data?.is_pro;
    const remaining = data?.plan?.primary_meter?.remaining;
    if (!isProUser && typeof remaining === 'number' && remaining <= 0) {
      openUpgrade('pr_ready');
      return;
    }
    try {
      await apiClient.post('/api/pr-crm/pipeline/save', {
        brand_id: brand.id || brand.brand_id,
        slug: brand.slug,
      });
    } catch {
      /* non-blocking — unlock modal still works */
    }
    setPitchingBrand({ ...brand, is_for_you_match: true });
  };

  const handlePitchSentFromReady = async () => {
    try {
      const prev = Number(localStorage.getItem('nc_unlock_count') || '0');
      localStorage.setItem('nc_unlock_count', String(prev + 1));
    } catch {
      /* ignore */
    }
    await load();
  };

  useEffect(() => {
    const fromBio =
      (data?.checklist || []).find((c) => c.id === 'bio')?.email ||
      data?.scrape?.collab_email_extracted ||
      '';
    const account = (data?.account_email || '').trim();
    setCollabEmail((prev) => {
      if (prev) return prev;
      if (fromBio) {
        setEmailFromAccount(false);
        return fromBio;
      }
      if (account) {
        setEmailFromAccount(true);
        return account;
      }
      return prev;
    });
  }, [data?.checklist, data?.scrape?.collab_email_extracted, data?.account_email]);

  // Persist setup-complete for post-onboarding routing (Mech 3)
  useEffect(() => {
    if (!data) return;
    const checklist = data.checklist || [];
    const kitStatus = data.kit || {};
    const bioDone = checklist.some((c) => c.id === 'bio' && c.done);
    const kitDone =
      checklist.some((c) => c.id === 'kit' && c.done) || !!kitStatus.is_published;
    localStorage.setItem('nc_manager_setup_complete', bioDone && kitDone ? '1' : '0');
  }, [data]);

  // Clear onboarding session flags + strip landing query params (keep focus_brand)
  useEffect(() => {
    if (!showOnboardingWelcome) return;
    sessionStorage.removeItem('justCompletedOnboarding');
    if (!searchParams.has('onboarding') && !searchParams.has('setup')) return;
    const next = new URLSearchParams(searchParams);
    next.delete('onboarding');
    next.delete('setup');
    const q = next.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${q ? `?${q}` : ''}`);
  }, [showOnboardingWelcome, searchParams]);

  // Focus brand from For You fit-lift click
  useEffect(() => {
    if (!focusBrand || !nearBrands.length) return undefined;
    const el = document.getElementById('ai-manager-brands');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const t = setTimeout(() => {
      const row = document.getElementById(`ai-manager-brand-${focusBrand}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        row.dataset.highlight = '1';
      }
    }, 350);
    return () => clearTimeout(t);
  }, [focusBrand, nearBrands]);

  const startCoachScan = () => {
    const handle = connectHandle.trim().replace(/^@+/, '');
    if (!handle) {
      setConnectError('Enter your Instagram or TikTok username');
      return;
    }
    if (handle.includes('..')) {
      setConnectError('Username cannot have consecutive periods');
      return;
    }
    if (!/^[a-zA-Z0-9._]{2,30}$/.test(handle)) {
      setConnectError('Use 2–30 letters, numbers, periods, or underscores');
      return;
    }
    setConnectError('');
    setConnectHandle(handle);
    setCoachModalPhase('scanning');
  };

  const onCoachScanComplete = async (result) => {
    if (result?.warning) message.warning(result.warning);
    else message.success('Coaching unlocked');
    setCoachModalOpen(false);
    setCoachModalPhase('form');
    setConnectError('');
    setLoading(true);
    await load();
  };

  const onCoachScanError = (err) => {
    const msg =
      (typeof err === 'string' && err) ||
      err?.response?.data?.error ||
      err?.message ||
      'Scan failed. Check the handle and try again.';
    setConnectError(msg);
    setCoachModalPhase('form');
  };

  const copyText = async (text, okMsg = 'Copied') => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(okMsg);
    } catch {
      message.info(text);
    }
  };

  const doRewriteBio = async () => {
    const email = collabEmail.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error('Enter a valid creator email');
      return;
    }
    setBusy('bio');
    try {
      const prevScore = displayScore ?? data?.score ?? 0;
      const res = await apiClient.post('/api/pr-ready/rewrite-bio', {
        apply: true,
        ...(email ? { email } : {}),
      });
      setBioResult({ ...res.data, applied: true, persisted: true });
      if (res.data.email) setCollabEmail(res.data.email);
      const nextScore = res.data.score ?? prevScore;
      const deltaLabel =
        res.data.score_delta_label ||
        (res.data.score_delta > 0 ? `+${res.data.score_delta} · bio optimized` : '');
      animateScoreTo(
        res.data.previous_score ?? prevScore,
        nextScore,
        deltaLabel
      );
      if (res.data.score_delta > 0) {
        message.success("First win — your manager's plan just updated.");
        const payload = {
          delta: res.data.score_delta,
          since: 'just now',
          reason: 'bio email added',
        };
        setVisitDelta(payload);
        writeVisitDelta(payload);
        writeScoreSnapshot(
          nextScore,
          (res.data.checklist || []).filter((c) => c.done).map((c) => c.id)
        );
      } else {
        message.success(
          res.data.email
            ? 'Optimized bio saved with your PR email'
            : 'Optimized bio saved to your profile'
        );
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              score: res.data.score ?? prev.score,
              fixes: res.data.fixes || prev.fixes,
              checklist: res.data.checklist || prev.checklist,
              manager: res.data.manager || prev.manager,
              projected_score: res.data.projected_score ?? prev.projected_score,
              creator: {
                ...(prev.creator || {}),
                bio: res.data.bio,
                kit_tagline: res.data.tagline || prev.creator?.kit_tagline,
              },
              scrape: prev.scrape
                ? { ...prev.scrape, raw_bio: res.data.bio }
                : prev.scrape,
            }
          : prev
      );
    } catch (err) {
      if (err.response?.data?.needs_email) {
        message.error(err.response.data.error || 'Add a public creator email first');
      } else {
        message.error(err.response?.data?.error || 'Bio rewrite failed');
      }
    } finally {
      setBusy('');
    }
  };

  const doAutoKit = async () => {
    setBusy('kit');
    setKitBuildOpen(true);
    try {
      const { coachingBio } = pickCoachingBio({
        bioResult,
        creatorBio: data?.creator?.bio,
        scrapeBio: data?.scrape?.raw_bio,
      });
      const prevScore = displayScore ?? data?.score ?? 0;
      const res = await apiClient.post('/api/pr-ready/auto-kit', {
        bio: coachingBio || undefined,
        tagline: bioResult?.tagline || data?.creator?.kit_tagline,
      });
      const nextScore = res.data.score ?? prevScore;
      const deltaLabel =
        res.data.score_delta_label ||
        (res.data.score_delta > 0 ? `+${res.data.score_delta} · portfolio built` : '');
      animateScoreTo(
        res.data.previous_score ?? prevScore,
        nextScore,
        deltaLabel
      );
      if (res.data.score_delta > 0) {
        message.success("First win — your manager's plan just updated.");
      } else if (res.data.published) {
        message.success('Portfolio published — brands can open your link now.');
      }
      const doneIds = (res.data.checklist || []).filter((c) => c.done).map((c) => c.id);
      if (res.data.score_delta > 0 || res.data.published) {
        const payload = {
          delta: res.data.score_delta || 0,
          since: 'just now',
          reason: 'portfolio published',
        };
        if (payload.delta) {
          setVisitDelta(payload);
          writeVisitDelta(payload);
        }
        writeScoreSnapshot(nextScore, doneIds);
      }
      if (res.data.warning) {
        message.warning(res.data.warning);
      }
      setData((prev) =>
        prev
          ? {
              ...prev,
              kit: res.data.kit || prev.kit,
              score: res.data.score ?? prev.score,
              status: res.data.status || prev.status,
              score_capped: res.data.score_capped ?? prev.score_capped,
              scrape: res.data.scrape || prev.scrape,
              checklist: res.data.checklist || prev.checklist,
              fixes: res.data.fixes || prev.fixes,
              manager: res.data.manager || prev.manager,
              projected_score: res.data.projected_score ?? prev.projected_score,
            }
          : prev
      );
      setKitBuildOpen(false);
      setKitAhaOpen(true);
    } catch (err) {
      setKitBuildOpen(false);
      message.error(err.response?.data?.error || 'Auto-kit failed');
    } finally {
      setBusy('');
    }
  };

  const doPitchPack = async () => {
    setBusy('pack');
    try {
      const res = await apiClient.post('/api/pr-ready/pitch-pack');
      setPack(res.data);
      setPackOpen(true);
      if (res.data.upgrade_required) {
        message.info(res.data.upgrade_message || 'Preview only — Pro unlocks the full week');
      }
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not build this week’s plan');
    } finally {
      setBusy('');
    }
  };

  const runManagerAction = (action) => {
    if (action === 'rewrite_bio') return doRewriteBio();
    if (action === 'auto_kit') return doAutoKit();
    if (action === 'pitch_pack') return doPitchPack();
    if (action === 'upgrade') return openUpgrade('pr_ready');
    return undefined;
  };

  if (loading) {
    return (
      <LoadWrap>
        <Skeleton $w="180px" $h="12px" style={{ marginBottom: 10 }} />
        <Skeleton $w="320px" $h="36px" style={{ marginBottom: 10 }} />
        <Skeleton $w="420px" $h="14px" style={{ marginBottom: 18 }} />
        <LoadStatus>
          <LoadDot />
          Scanning your profile for a brand-readiness score…
        </LoadStatus>
        <Row>
          <Card>
            <ScoreWrap>
              <Skeleton $round $w="108px" $h="108px" />
              <div style={{ flex: 1 }}>
                <Skeleton $w="70%" $h="16px" style={{ marginBottom: 10 }} />
                <Skeleton $w="100%" $h="12px" style={{ marginBottom: 6 }} />
                <Skeleton $w="88%" $h="12px" style={{ marginBottom: 12 }} />
                <PillRow>
                  <Skeleton $w="72px" $h="26px" $round />
                  <Skeleton $w="96px" $h="26px" $round />
                  <Skeleton $w="84px" $h="26px" $round />
                </PillRow>
              </div>
            </ScoreWrap>
          </Card>
          <Card>
            <Skeleton $w="40%" $h="16px" style={{ marginBottom: 16 }} />
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '28px 1fr 40px',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: i < 3 ? `1px solid ${t.line}` : '0',
                }}
              >
                <Skeleton $w="28px" $h="28px" />
                <div>
                  <Skeleton $w="65%" $h="12px" style={{ marginBottom: 6 }} />
                  <Skeleton $w="90%" $h="10px" />
                </div>
                <Skeleton $w="36px" $h="12px" />
              </div>
            ))}
          </Card>
        </Row>
        <Grid3>
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <Skeleton $w="45%" $h="14px" style={{ marginBottom: 12 }} />
              <Skeleton $w="100%" $h="11px" style={{ marginBottom: 6 }} />
              <Skeleton $w="80%" $h="11px" style={{ marginBottom: 14 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <Skeleton $h="72px" />
                <Skeleton $h="72px" />
                <Skeleton $h="72px" />
              </div>
              <Skeleton $h="40px" style={{ marginTop: 14 }} />
            </Card>
          ))}
        </Grid3>
      </LoadWrap>
    );
  }

  const score = displayScore ?? data?.score ?? 0;
  const scoreCapped = !!data?.score_capped;
  const freeScoreCap = data?.free_score_cap;
  const scrape = data?.scrape;
  const fixes = data?.fixes || [];
  const freeFixes = fixes.filter((f) => f.free !== false);
  const proFixes = fixes.filter((f) => f.free === false);
  const previewPosts =
    scrape?.recent_posts?.length > 0
      ? scrape.recent_posts.slice(0, 3)
      : (scrape?.recent_thumbnails || []).slice(0, 3).map((src) => ({ thumbnail_url: src }));
  const isPro = !!data?.is_pro;
  const kitStatus = data?.kit || {};
  const kitBuilt = (kitStatus.post_count || 0) > 0;
  const { displayBio, bioIsSaved } = pickCoachingBio({
    bioResult,
    creatorBio: data?.creator?.bio,
    scrapeBio: scrape?.raw_bio,
  });
  const checklist = data?.checklist || [];
  const bioItem = checklist.find((c) => c.id === 'bio') || fixes.find((f) => f.id === 'bio');
  const bioDone = !!bioItem?.done;
  const kitItem = checklist.find((c) => c.id === 'kit');
  const kitDone = !!kitItem?.done || !!kitStatus?.is_published;
  const optimizedBioText = (bioItem?.optimized_bio || (bioDone ? displayBio : '') || '').trim();
  const plan = data?.plan || data?.monetization?.plan;
  const primaryMeter = plan?.primary_meter;
  const secondaryMeter = plan?.secondary_meter;
  const meterPct =
    primaryMeter && !primaryMeter.unlimited && primaryMeter.limit
      ? Math.round((Number(primaryMeter.used || 0) / Number(primaryMeter.limit)) * 100)
      : 0;
  const meterWarn = !isPro && primaryMeter && primaryMeter.remaining === 0;
  const openFixes = fixes.length;
  const projectedScore = data?.projected_score;
  const scoreLabel = data?.score_label || 'Reply Chance';
  const manager = data?.manager || {};
  const freeRunwayDone = !isPro && !!manager.free_runway_done;
  const nextMove = manager.next_move;
  const unlocksLeft =
    primaryMeter && !primaryMeter.unlimited
      ? Math.max(0, Number(primaryMeter.remaining ?? primaryMeter.limit - primaryMeter.used) || 0)
      : null;
  const priority = manager.priority;
  const briefing = manager.briefing;
  const successStory = data?.success_story;
  const kitSlug = data?.creator?.kit_slug;
  const kitShareUrl = kitSlug
    ? `${window.location.origin}/kit/${kitSlug}`
    : null;

  const goPitchBrands = () => {
    const el = document.getElementById('ai-manager-brands');
    if (nearBrands[0]) {
      pitchNearBrand(nearBrands[0]);
      return;
    }
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else navigate('/creator/dashboard/for-you');
  };

  const firstName =
    (data?.creator?.username || data?.creator?.handle || '').replace(/^@/, '').split(/[._]/)[0] ||
    'there';

  return (
    <Wrap>
      <Eyebrow>Your creator manager</Eyebrow>
      {showOnboardingWelcome ? (
        <>
          <Title>
            Welcome{firstName && firstName !== 'there' ? `, ${firstName}` : ''}. Let&apos;s get you{' '}
            <em style={{ fontStyle: 'italic', color: t.accentDeep }}>campaign-ready.</em>
          </Title>
          <Sub>
            I&apos;m your manager. I audited your profile
            {data?.has_scrape ? ' in the last few minutes' : ''}. Here&apos;s what I found and what
            we&apos;ll fix first.
          </Sub>
          <PathLine>
            {isSetupContinue
              ? 'Pick up where you left off — finish free setup, then pitch.'
              : 'Show me my score → scroll down to start with the highest-impact fix.'}
          </PathLine>
        </>
      ) : (
        <>
          <Title>
            Get hired by more{' '}
            <em style={{ fontStyle: 'italic', color: t.accentDeep }}>brands.</em>
          </Title>
          <Sub>
            Your AI manager audits your profile, finds the biggest reasons brands skip you, and gives
            you the next highest-impact actions to land more PR and paid collaborations.
          </Sub>
          {freeRunwayDone ? (
            <PathLine>{manager.path_line}</PathLine>
          ) : openFixes > 0 ? (
            <PathLine>
              Your reply chance is {score}% today. Finish these priorities to become campaign-ready.
            </PathLine>
          ) : (
            <PathLine>{manager.path_line || "Here's your path to your first brand deal."}</PathLine>
          )}
        </>
      )}

      {!isPro && plan && (
        <PlanStrip>
          <PlanStripLeft>
            <PlanLabel>Free plan</PlanLabel>
            {plan.show_tools_counter ? (
              <PlanMeta>
                {plan.tools_unlocked} of {plan.tools_total} tools unlocked
              </PlanMeta>
            ) : null}
            {primaryMeter && !primaryMeter.unlimited && (
              <PlanMeta>
                {Math.max(0, Number(primaryMeter.remaining ?? 0))} of{' '}
                {primaryMeter.limit} PR unlocks left this month
              </PlanMeta>
            )}
          </PlanStripLeft>
        </PlanStrip>
      )}

      {!data?.has_scrape ? (
        <Card>
          <HeroEmpty>
            <ModalTitle as="h3" style={{ fontSize: 28, marginBottom: 10 }}>
              Meet your AI creator manager
            </ModalTitle>
            <HeroLead>
              Scan your Instagram or TikTok once — we score your reply chance and coach the
              gaps that block brand replies.
            </HeroLead>
            <Btn $variant="primary" onClick={openCoachModal}>
              Get my personal UGC coaching
            </Btn>
          </HeroEmpty>
        </Card>
      ) : (
        <>
          <ManagerGrid>
            <div>
              <Card>
                <ScoreWrap>
                  <Ring $pct={Math.min(100, Math.max(0, score))} $pulse={scorePulse}>
                    <RingNum>
                      <b>{score}</b>
                      <span>%</span>
                    </RingNum>
                  </Ring>
                  <div>
                    <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>{scoreLabel}</h3>
                    {scoreDeltaLabel ? <DeltaChip>{scoreDeltaLabel}</DeltaChip> : null}
                    {!scoreDeltaLabel && visitDelta?.delta ? (
                      <VisitDelta>
                        {score}% ({visitDelta.delta > 0 ? '+' : ''}
                        {visitDelta.delta} since {visitDelta.since})
                        {' · ✓ '}
                        {visitDelta.reason || 'plan updated'}
                      </VisitDelta>
                    ) : null}
                    <p style={{ margin: scoreDeltaLabel || visitDelta?.delta ? '8px 0 0' : 0, fontSize: 13, color: t.muted, lineHeight: 1.45 }}>
                      Estimated from your profile · updates weekly. Based on your bio, portfolio,
                      posting consistency, niche match, and pitch readiness — not your follower
                      count.
                    </p>
                  </div>
                </ScoreWrap>
                <MetricGrid>
                  <Metric>
                    Current reply chance
                    <b>{score}%</b>
                  </Metric>
                  <Metric>
                    {freeRunwayDone ? 'Potential with Pro' : "Potential after today's fixes"}
                    <b style={{ color: t.accentDeep }}>{projectedScore ?? score}%</b>
                  </Metric>
                  <Metric>
                    Next milestone
                    <b style={{ fontSize: 13 }}>{manager.milestone || 'Campaign Ready'}</b>
                    {(manager.milestone_points_needed ?? 0) > 0 ? (
                      <MilestoneDelta>
                        You need +{manager.milestone_points_needed} more points
                      </MilestoneDelta>
                    ) : (
                      <MilestoneDelta>You&apos;re at this milestone</MilestoneDelta>
                    )}
                  </Metric>
                  <Metric>
                    Estimated effort
                    <b style={{ fontSize: 13 }}>≈ {manager.effort_minutes || 35} min</b>
                  </Metric>
                </MetricGrid>

                {(manager.score_climb || projectedScore != null) && (() => {
                  const climb = manager.score_climb || {};
                  const currentPct = climb.current ?? score;
                  const potentialPct = climb.potential ?? projectedScore ?? score;
                  const fillPct =
                    (Number(currentPct) / Math.max(1, Number(potentialPct))) * 100;
                  const steps = climb.steps || [];
                  const weekGain = climb.week_gain || 0;
                  const weekScore = climb.week_score;
                  const targetPct = weekScore || potentialPct;
                  const milestoneName = String(manager.milestone || 'Campaign Ready')
                    .replace(/\s*\(.*\)$/, '')
                    .trim();
                  const milestoneNeeded = (manager.milestone_points_needed ?? 0) > 0;
                  const goalReachesMilestone =
                    milestoneNeeded &&
                    Number(targetPct) >= Number(manager.milestone_threshold ?? 65);
                  const goalTitle = goalReachesMilestone
                    ? `Become ${milestoneName} (${targetPct}%)`
                    : freeRunwayDone
                      ? 'Keep your manager working every week'
                      : `Climb from ${currentPct}% to ${targetPct}%`;
                  // On Pro path: don't show finished free tasks — that makes free look bigger than Pro.
                  const doneItems = freeRunwayDone
                    ? []
                    : checklist.filter((c) => c.done).slice(0, 3);
                  const remainingSteps = steps;
                  const lockedCount = remainingSteps.filter((s) => s.locked).length || remainingSteps.length;
                  return (
                    <ClimbCard>
                      <ClimbHead>
                        <ClimbEyebrow>🎯 This week&apos;s goal</ClimbEyebrow>
                        <ClimbTitle>{goalTitle}</ClimbTitle>
                      </ClimbHead>

                      <ClimbHero>
                        <ClimbScoreBlock>
                          <ClimbScoreNum $muted>{currentPct}%</ClimbScoreNum>
                          <ClimbScoreLabel>Now</ClimbScoreLabel>
                        </ClimbScoreBlock>
                        <ClimbArrow aria-hidden>→</ClimbArrow>
                        <ClimbScoreBlock $align="end">
                          <ClimbScoreNum $lg>{potentialPct}%</ClimbScoreNum>
                          <ClimbScoreLabel>
                            {freeRunwayDone ? 'With Pro' : 'Potential'}
                          </ClimbScoreLabel>
                        </ClimbScoreBlock>
                      </ClimbHero>

                      <ClimbTrack>
                        <ClimbFill $pct={fillPct} />
                      </ClimbTrack>

                      {(doneItems.length > 0 || remainingSteps.length > 0) && (
                        <>
                          <ClimbListLabel>
                            {freeRunwayDone
                              ? 'Remaining (this week only)'
                              : 'Remaining'}
                          </ClimbListLabel>
                          <ClimbSteps>
                            {doneItems.map((item) => (
                              <ClimbStep key={`done-${item.id}`} $done>
                                <ClimbStepNum $done>✓</ClimbStepNum>
                                <ClimbStepBody $done>
                                  {item.label || item.title}
                                </ClimbStepBody>
                                <ClimbStepPts $done>Done</ClimbStepPts>
                              </ClimbStep>
                            ))}
                            {remainingSteps.map((step) => (
                              <ClimbStep key={step.id || step.n}>
                                <ClimbStepNum>
                                  {step.locked ? '🔒' : step.n}
                                </ClimbStepNum>
                                <ClimbStepBody>
                                  {step.title || `Complete step ${step.n}`}
                                </ClimbStepBody>
                                <ClimbStepPts>+{step.points}</ClimbStepPts>
                              </ClimbStep>
                            ))}
                          </ClimbSteps>
                        </>
                      )}

                      {freeRunwayDone && remainingSteps.length > 0 ? (
                        <ClimbWeekPromise>
                          <ClimbWeekPromiseTitle>
                            Next Monday: your manager finds{' '}
                            {Math.max(2, lockedCount)} new wins tailored to what brands
                            are asking for this week
                          </ClimbWeekPromiseTitle>
                          <ClimbWeekPromiseSub>
                            Every Pro creator gets a fresh weekly plan.
                          </ClimbWeekPromiseSub>
                        </ClimbWeekPromise>
                      ) : null}

                      {freeRunwayDone ? (
                        <ClimbUnlockBlock>
                          <ClimbUnlockTitle>
                            Unlock · Weekly manager coaching + unlimited PR unlocks
                          </ClimbUnlockTitle>
                          <ClimbUnlockSub>
                            {weekGain > 0
                              ? `This week: +${weekGain} pts → ${weekScore || potentialPct}% · Every week: new plan`
                              : 'Every week: a new plan tailored to what brands want'}
                          </ClimbUnlockSub>
                        </ClimbUnlockBlock>
                      ) : weekGain > 0 ? (
                        <ClimbOutcome>
                          <ClimbRewardLabel>Reward</ClimbRewardLabel>
                          <ClimbOutcomeGain>+{weekGain} points</ClimbOutcomeGain>
                          <span>
                            {goalReachesMilestone
                              ? `→ ${milestoneName} ✓`
                              : `→ ${weekScore}% by end of week`}
                          </span>
                        </ClimbOutcome>
                      ) : null}
                    </ClimbCard>
                  );
                })()}
              </Card>

              {briefing && (
                <Card style={{ marginTop: 14 }}>
                  <Eyebrow style={{ marginBottom: 6 }}>Your manager&apos;s briefing</Eyebrow>
                  <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>{manager.greeting}</h3>
                  <QuoteBox>
                    <strong>Priority</strong>
                    {briefing.priority}
                    <div style={{ marginTop: 6, color: t.muted }}>{briefing.priority_note}</div>
                  </QuoteBox>
                  {freeRunwayDone ? (
                    <ActionBtn
                      $variant="next"
                      busy={busy}
                      busyKey=""
                      onClick={goPitchBrands}
                      style={{ marginTop: 4 }}
                    >
                      {unlocksLeft != null
                        ? `Pitch a brand (${unlocksLeft} of ${primaryMeter?.limit || 3} left)`
                        : 'Pitch a matched brand'}
                    </ActionBtn>
                  ) : (
                    <QuoteBox>
                      <strong>Recommended shoot</strong>
                      {briefing.recommended_shoot}
                      <div style={{ marginTop: 6, color: t.muted }}>
                        ≈ {briefing.shoot_minutes} min · estimated score gain +
                        {briefing.estimated_score_gain}
                      </div>
                    </QuoteBox>
                  )}
                </Card>
              )}

              {nearBrands.length > 0 && (
                <BrandsNextCard
                  style={{ marginTop: 14 }}
                  id="ai-manager-brands"
                  $emphasize={freeRunwayDone}
                >
                  <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>
                    {freeRunwayDone
                      ? 'Do this next — pitch a brand'
                      : "Brands you're almost ready for"}
                  </h3>
                  <p style={{ margin: '0 0 12px', fontSize: 12, color: t.muted }}>
                    {freeRunwayDone
                      ? 'Your portfolio is live. Use a Brand PR unlock while the setup win is fresh.'
                      : 'Real matches from your For You list. Close readiness gaps to compete harder.'}
                  </p>
                  <BrandList>
                    {nearBrands.map((b) => (
                      <BrandRow
                        key={b.id || b.name}
                        id={`ai-manager-brand-${b.slug || b.id || b.name}`}
                        $focus={
                          !!focusBrand &&
                          [String(b.slug || ''), String(b.id || ''), String(b.name || '')]
                            .map((x) => x.toLowerCase())
                            .includes(String(focusBrand).toLowerCase())
                        }
                      >
                        <div>
                          <strong style={{ fontSize: 14 }}>
                            {b.name}
                            {b.category ? (
                              <span style={{ fontWeight: 500, color: t.muted }}>
                                {' '}
                                · {b.category}
                              </span>
                            ) : null}
                          </strong>
                          {(b.needs || []).length > 0 && (
                            <MissingList>
                              {b.needs.map((n) => (
                                <NeedLine key={`${b.name}-${n.text}`} $done={!!n.done}>
                                  {n.done ? '✓' : '✗'} {n.text}
                                </NeedLine>
                              ))}
                            </MissingList>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div
                            style={{
                              fontSize: 20,
                              fontWeight: 800,
                              color: t.accentDeep,
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {b.score}%
                          </div>
                          <Btn
                            $variant="primary"
                            style={{ width: 'auto', marginTop: 6, padding: '7px 10px' }}
                            onClick={() => pitchNearBrand(b)}
                          >
                            Pitch Brand
                          </Btn>
                        </div>
                      </BrandRow>
                    ))}
                  </BrandList>
                </BrandsNextCard>
              )}
            </div>

            <Card>
              <h3 style={{ margin: '0 0 4px', fontSize: 18 }}>Your manager&apos;s plan</h3>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: t.muted, lineHeight: 1.45 }}>
                {freeRunwayDone
                  ? 'Free setup is done. Pitch a brand now — or unlock Pro coaching for the remaining gaps.'
                  : openFixes > 0
                    ? `Your manager found ${openFixes} change${
                        openFixes === 1 ? '' : 's'
                      } that could make brands more likely to reply. Start with #1.`
                    : 'No open gaps — you look campaign-ready. Keep pitching on For You.'}
              </p>

              {bioDone && optimizedBioText && (
                <OptimizedCard>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <OptimizedLabel>✓ Optimized bio</OptimizedLabel>
                    <TierChip $tone="open">Done</TierChip>
                  </div>
                  <OptimizedText>{optimizedBioText}</OptimizedText>
                  <p style={{ margin: '10px 0 0', fontSize: 12, color: '#166534' }}>
                    Niche + PR email locked in. Paste this onto your social bio.
                  </p>
                </OptimizedCard>
              )}

              {kitDone && (
                <OptimizedCard>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <OptimizedLabel>✓ Portfolio published</OptimizedLabel>
                    <TierChip $tone="open">Done</TierChip>
                  </div>
                  <OptimizedText>
                    {kitStatus.post_count || 3} posts live — brands can open your link.
                  </OptimizedText>
                  <Btn
                    $variant="ghost"
                    style={{ marginTop: 10 }}
                    onClick={() => navigate('/creator/dashboard/my-kit')}
                  >
                    Open Portfolio
                  </Btn>
                </OptimizedCard>
              )}

              {freeRunwayDone && nextMove && (
                <NextMoveCard>
                  <NextMoveTitle>{nextMove.title || "What's next"}</NextMoveTitle>
                  <p
                    style={{
                      margin: '0 0 12px',
                      fontSize: 14,
                      color: t.ink,
                      lineHeight: 1.45,
                      fontWeight: 650,
                    }}
                  >
                    {nextMove.body}
                  </p>
                  {unlocksLeft != null && (
                    <NextMoveHint>
                      {unlocksLeft} of {primaryMeter?.limit || 3} PR unlocks left this month —
                      burn one while setup is fresh.
                    </NextMoveHint>
                  )}
                  <Btn $variant="primary" onClick={goPitchBrands} style={{ marginTop: 0 }}>
                    {nextMove.primary_cta || 'Pitch a matched brand'}
                  </Btn>
                  <Btn
                    $variant="ghost"
                    style={{ marginTop: 8 }}
                    onClick={() => openUpgrade('pr_ready')}
                  >
                    {nextMove.secondary_cta || 'Unlock Pro coaching'}
                  </Btn>
                </NextMoveCard>
              )}

              {(isPro ? fixes : freeFixes).map((fix, i) => {
                const isBio = fix.id === 'bio';
                return (
                  <CoachingCard key={fix.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 800, color: t.muted }}>#{i + 1}</div>
                        <h4 style={{ margin: '4px 0 0', fontSize: 15 }}>
                          {fix.title || fix.label}
                        </h4>
                      </div>
                      <TierChip $tone={fix.critical ? 'critical' : 'open'}>
                        {fix.critical ? 'Critical' : isPro ? 'Open' : 'Included'}
                      </TierChip>
                    </div>
                    <CoachMeta>
                      <span>Impact {Stars({ n: fix.impact || 3 })}</span>
                      <span>Time ≈ {fix.time_minutes || 5} min</span>
                    </CoachMeta>
                    <p style={{ margin: '0 0 8px', fontSize: 13, color: t.inkSoft, lineHeight: 1.45 }}>
                      <strong style={{ color: t.ink }}>Why this matters. </strong>
                      {fix.why || fix.tip}
                    </p>
                    {fix.current && (
                      <QuoteBox>
                        <strong>Current</strong>
                        {fix.current}
                        {fix.goal ? ` · Goal: ${fix.goal}` : ''}
                      </QuoteBox>
                    )}
                    {isBio && (
                      <>
                        <EmailFieldAccount
                          type="email"
                          $fromAccount={emailFromAccount}
                          value={collabEmail}
                          onChange={(e) => {
                            setCollabEmail(e.target.value);
                            setEmailFromAccount(false);
                          }}
                          placeholder="Public PR email — hello@…"
                          aria-label="Public creator email"
                        />
                        {emailFromAccount ? (
                          <EmailHint>
                            using your account email ·{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setEmailFromAccount(false);
                              }}
                            >
                              change
                            </button>
                          </EmailHint>
                        ) : (
                          <p style={{ margin: '0 0 8px', fontSize: 11, color: t.muted }}>
                            Required so agencies can add you to outreach lists.
                          </p>
                        )}
                      </>
                    )}
                    {fix.missing?.length > 0 && (
                      <MissingList>
                        {fix.missing.map((m) => (
                          <li key={m}>Missing: {m}</li>
                        ))}
                      </MissingList>
                    )}
                    {fix.suggested_shoot && (
                      <QuoteBox>
                        <strong>Suggested shoot</strong>
                        {fix.suggested_shoot}
                      </QuoteBox>
                    )}
                    {isPro && fix.fix_steps && (
                      <QuoteBox>
                        <strong>Fix</strong>
                        {fix.fix_steps}
                      </QuoteBox>
                    )}
                    <ActionBtn
                      $variant="primary"
                      busy={busy}
                      busyKey={
                        isBio
                          ? 'bio'
                          : fix.cta_action === 'auto_kit'
                            ? 'kit'
                            : fix.cta_action === 'pitch_pack'
                              ? 'pack'
                              : ''
                      }
                      loadingLabel={
                        isBio
                          ? 'Optimizing your bio…'
                          : fix.cta_action === 'pitch_pack'
                            ? 'Building this week’s plan…'
                            : fix.cta_action === 'auto_kit'
                              ? 'Building your portfolio…'
                              : 'Working…'
                      }
                      onClick={() => runManagerAction(fix.cta_action)}
                    >
                      {fix.cta || 'Start this fix'}
                    </ActionBtn>
                  </CoachingCard>
                );
              })}

              {!isPro && proFixes.length > 0 && (
                <ProHero>
                  <ProHeroTitle>
                    {freeRunwayDone
                      ? '⭐ Let your manager finish the job'
                      : `⭐ ${proFixes.length} more fix${proFixes.length === 1 ? '' : 'es'} available`}
                  </ProHeroTitle>
                  {freeRunwayDone ? (
                    <ProHeroSub>
                      +{manager.pro_gain || proFixes.length * 14} points available with Pro
                      coaching
                    </ProHeroSub>
                  ) : null}
                  {proFixes.map((fix, i) => (
                    <ProPeekItem key={fix.id}>
                      <h5>
                        #{freeFixes.length + i + 1} · {fix.title || fix.label}
                      </h5>
                      <PeekLabel>Why this blocks replies:</PeekLabel>
                      <PeekBody>
                        {fix.why_blocks ||
                          fix.why ||
                          'Brands skip creators who don’t show this proof yet.'}
                      </PeekBody>
                      <FixLocked>
                        FIX: 🔒 Locked — Pro members get the exact 3-step fix.
                      </FixLocked>
                    </ProPeekItem>
                  ))}
                  <p
                    style={{
                      margin: '4px 0 10px',
                      fontSize: 13,
                      fontWeight: 650,
                      color: t.ink,
                      lineHeight: 1.4,
                    }}
                  >
                    Unlock all {proFixes.length} fixes + weekly plan + personalized coaching
                  </p>
                  {successStory?.is_real && successStory?.has_outcome ? (
                    <SuccessStory>
                      <StoryHead>
                        {successStory.avatar_url ? (
                          <StoryAvatarImg
                            src={successStory.avatar_url}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <StoryAvatar>{successStory.avatar_emoji || '✦'}</StoryAvatar>
                        )}
                        <span>
                          <StoryHandle>
                            {successStory.name ||
                              (successStory.handle ? `@${successStory.handle}` : 'Creator')}
                          </StoryHandle>
                          {successStory.country ? ` · ${successStory.country}` : ''}
                          {successStory.follower_current
                            ? ` · ${successStory.follower_current} followers`
                            : ''}
                          {successStory.joined_label
                            ? ` · ${successStory.joined_label}`
                            : ''}
                        </span>
                      </StoryHead>
                      <StoryStats>
                        {successStory.starting_score != null &&
                        successStory.current_score != null ? (
                          <>
                            Score: {successStory.starting_score}% →{' '}
                            {successStory.current_score}%
                            {(successStory.outcome_line ||
                              (successStory.brands_landed || []).length > 0) && <br />}
                          </>
                        ) : null}
                        {successStory.outcome_line
                          ? successStory.outcome_line
                          : (successStory.brands_landed || []).length > 0
                            ? `Landed ${(successStory.brands_landed || []).join(', ')}`
                            : null}
                      </StoryStats>
                      {successStory.quote ? (
                        <StoryQuote>&ldquo;{successStory.quote}&rdquo;</StoryQuote>
                      ) : null}
                    </SuccessStory>
                  ) : null}
                  {unlocksLeft === 0 && (
                    <Btn $variant="accent" onClick={() => openUpgrade('pr_ready')}>
                      Unlock Pro — {plan?.price || '$19/mo'}
                    </Btn>
                  )}
                </ProHero>
              )}
            </Card>
          </ManagerGrid>

          <Row>
            <Card>
              <CardHead>
                <h4>Your portfolio</h4>
                {isPro ? (
                  <ProBadge>Pro stats</ProBadge>
                ) : (
                  <ProBadge style={{ background: t.accentSoft, color: t.accentDeep }}>
                    {kitBuilt ? `${kitStatus.post_count} posts` : 'Portfolio'}
                  </ProBadge>
                )}
              </CardHead>
              <p style={{ margin: 0, fontSize: 12, color: t.muted, minHeight: 40 }}>
                Your shareable portfolio — the posts and proof brands ask for before they reply.
              </p>
              <Thumbs>
                {previewPosts.map((p, i) => (
                  <ThumbCard key={p.post_url || p.thumbnail_url || `post-${i}`}>
                    <Thumb $src={p.thumbnail_url} />
                    {isPro && (p.views > 0 || p.likes > 0 || p.comments > 0) ? (
                      <ThumbStats>
                        {p.views > 0 ? `${fmtStat(p.views)} views` : `${fmtStat(p.likes)} likes`}
                        {p.likes > 0 && p.views > 0 ? ` · ${fmtStat(p.likes)} likes` : ''}
                        {p.comments > 0 ? ` · ${fmtStat(p.comments)} comments` : ''}
                      </ThumbStats>
                    ) : !isPro && p.stats_locked !== false && (p.thumbnail_url || p.post_url) ? (
                      <ThumbStats
                        style={{ filter: 'blur(3px)', userSelect: 'none', cursor: 'pointer' }}
                        onClick={() => openUpgrade('pr_ready')}
                      >
                        ··· views · ··· likes
                      </ThumbStats>
                    ) : null}
                  </ThumbCard>
                ))}
              </Thumbs>
              <ActionBtn
                $variant="primary"
                busy={busy}
                busyKey="kit"
                loadingLabel="Building your portfolio…"
                onClick={doAutoKit}
              >
                {kitBuilt ? 'Rebuild portfolio' : 'Auto-build portfolio'}
              </ActionBtn>
              <Btn $variant="ghost" onClick={() => navigate('/creator/dashboard/my-kit')}>
                Open Portfolio
              </Btn>
            </Card>

            <Card>
              <CardHead>
                <h4>This week&apos;s content plan</h4>
                <ProBadge>{isPro ? 'Pro pack' : '1 sample'}</ProBadge>
              </CardHead>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: t.muted, minHeight: 40 }}>
                Weekly shoots your manager would assign so you stay pitchable while waiting on
                replies.
              </p>
              <ActionBtn
                $variant="ghost"
                busy={busy}
                busyKey="pack"
                loadingLabel="Building this week’s plan…"
                onClick={doPitchPack}
                style={{ marginTop: 0 }}
              >
                {pack ? 'Refresh plan' : 'Generate scripts'}
              </ActionBtn>
            </Card>
          </Row>
        </>
      )}

      {packOpen && pack && (
        <ModalScrim
          role="dialog"
          aria-modal="true"
          aria-label="This week's content plan"
          onClick={() => setPackOpen(false)}
        >
          <ModalCard $wide onClick={(e) => e.stopPropagation()}>
            <ModalClose type="button" onClick={() => setPackOpen(false)} aria-label="Close">
              ×
            </ModalClose>
            <ModalEyebrow>This week&apos;s portfolio plan</ModalEyebrow>
            <ModalTitle>Your manager assigned 4 shoots</ModalTitle>
            <ModalSub>
              {pack.focus ||
                'Film these to build product-proof content brands can evaluate.'}
            </ModalSub>
            <div style={{ display: 'grid', gap: 10 }}>
              {(pack.weekly_plan || []).map((day) => (
                <PlanDay key={`${day.day}-${day.format}`}>
                  <PlanDayHead>
                    <span>{day.day}</span>
                    <span>≈ {day.minutes || 18} min</span>
                  </PlanDayHead>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{day.format}</div>
                  <div style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.45 }}>{day.brief}</div>
                  {day.caption_starter && (
                    <QuoteBox style={{ marginTop: 8, marginBottom: 0 }}>
                      <strong>Caption starter</strong>
                      {day.caption_starter}
                      <Btn
                        $variant="ghost"
                        style={{ width: 'auto', marginTop: 8, padding: '7px 10px' }}
                        onClick={() => copyText(day.caption_starter, 'Caption copied')}
                      >
                        Copy
                      </Btn>
                    </QuoteBox>
                  )}
                </PlanDay>
              ))}
              {(pack.weekly_plan_locked || []).map((day) => (
                <PlanDay key={`locked-${day.day}-${day.format}`} $locked>
                  <PlanDayHead>
                    <span>{day.day}</span>
                    <span>Pro</span>
                  </PlanDayHead>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{day.format}</div>
                  <div style={{ fontSize: 13, color: t.muted }}>{day.brief}</div>
                </PlanDay>
              ))}
            </div>
            {!isPro && (
              <Btn $variant="accent" onClick={() => openUpgrade('pr_ready')}>
                Unlock full week — {plan?.price || '$19/mo'}
              </Btn>
            )}
            <Btn $variant="ghost" onClick={() => setPackOpen(false)}>
              Done
            </Btn>
          </ModalCard>
        </ModalScrim>
      )}

      {coachModalOpen && (
        <ModalScrim
          role="dialog"
          aria-modal="true"
          aria-label="Personal UGC coaching"
          onClick={() => {
            if (coachModalPhase !== 'scanning') closeCoachModal();
          }}
        >
          <ModalCard
            onClick={(e) => e.stopPropagation()}
            $wide={coachModalPhase === 'scanning'}
          >
            {coachModalPhase === 'form' && (
              <>
                <ModalClose type="button" onClick={closeCoachModal} aria-label="Close">
                  ×
                </ModalClose>
                <ModalEyebrow>UGC coaching</ModalEyebrow>
                <ModalTitle>Get my personal UGC coaching</ModalTitle>
                <ModalSub>
                  Enter your Instagram or TikTok handle. We&apos;ll scan your profile and
                  posts, then unlock coaching built around your content.
                </ModalSub>
                <PlatformRow>
                  <PlatformChip
                    type="button"
                    $active={connectPlatform === 'instagram'}
                    onClick={() => setConnectPlatform('instagram')}
                  >
                    Instagram
                  </PlatformChip>
                  <PlatformChip
                    type="button"
                    $active={connectPlatform === 'tiktok'}
                    onClick={() => setConnectPlatform('tiktok')}
                  >
                    TikTok
                  </PlatformChip>
                </PlatformRow>
                <HandleInput
                  value={connectHandle}
                  onChange={(e) => setConnectHandle(e.target.value)}
                  placeholder="@yourhandle"
                  aria-label="Social handle"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') startCoachScan();
                  }}
                />
                {connectError && <Err>{connectError}</Err>}
                <Btn
                  $variant="accent"
                  type="button"
                  onClick={startCoachScan}
                  style={{ width: '100%', marginTop: 0 }}
                >
                  Scan my social
                </Btn>
              </>
            )}

            {coachModalPhase === 'scanning' && (
              <ProfileScrapingLoader
                handle={connectHandle.trim().replace(/^@+/, '')}
                platform={connectPlatform}
                endpoint="/api/pr-ready/refresh-scrape"
                frames={COACHING_SCAN_FRAMES}
                doneLabel="Opening your coaching…"
                onComplete={onCoachScanComplete}
                onError={onCoachScanError}
              />
            )}
          </ModalCard>
        </ModalScrim>
      )}

      {kitBuildOpen && (
        <ModalScrim role="dialog" aria-modal="true" aria-label="Building your portfolio">
          <ModalCard $wide>
            <ModalEyebrow>✨ Building your portfolio</ModalEyebrow>
            <ModalTitle style={{ fontSize: 22 }}>Hang tight — magic in progress</ModalTitle>
            <KitBuildSteps />
          </ModalCard>
        </ModalScrim>
      )}

      {kitAhaOpen && (
        <ModalScrim
          role="dialog"
          aria-modal="true"
          aria-label="Portfolio ready"
          onClick={() => setKitAhaOpen(false)}
        >
          <ModalCard onClick={(e) => e.stopPropagation()}>
            <ModalClose type="button" onClick={() => setKitAhaOpen(false)} aria-label="Close">
              ×
            </ModalClose>
            <ModalEyebrow>Portfolio</ModalEyebrow>
            <ModalTitle>This is yours forever.</ModalTitle>
            <ModalSub>
              Your portfolio is built from your real posts. Share it with brands — then keep it
              fresh with Pro.
            </ModalSub>
            <Btn
              $variant="primary"
              onClick={() => navigate('/creator/dashboard/my-kit')}
            >
              Open Portfolio
            </Btn>
            {kitShareUrl ? (
              <Btn
                $variant="ghost"
                onClick={() => copyText(kitShareUrl, 'Portfolio link copied')}
                style={{ marginTop: 8 }}
              >
                Copy share link
              </Btn>
            ) : null}
            {!isPro && unlocksLeft === 0 && (
              <>
                <p
                  style={{
                    margin: '14px 0 10px',
                    fontSize: 13,
                    color: t.muted,
                    lineHeight: 1.45,
                  }}
                >
                  Unlimited posts attached + brand view tracker. Unlock Pro.
                </p>
                <Btn $variant="accent" onClick={() => openUpgrade('pr_ready')}>
                  Unlock Pro — {plan?.price || '$19/mo'}
                </Btn>
              </>
            )}
          </ModalCard>
        </ModalScrim>
      )}

      {pitchingBrand && (
        <UnlockModalV2
          isOpen={!!pitchingBrand}
          onClose={() => {
            setPitchingBrand(null);
            load();
          }}
          brand={pitchingBrand}
          onPitchSent={(brand, ctx) => {
            handlePitchSentFromReady(brand, ctx);
            if (!ctx?.stayOpen) setPitchingBrand(null);
          }}
          isPro={!!data?.is_pro}
          onUpgrade={() => {
            setPitchingBrand(null);
            openUpgrade('pr_ready');
          }}
        />
      )}

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature={upgradeFeature}
        currentCount={primaryMeter?.used ?? 0}
        limit={primaryMeter?.limit || 3}
        pitchLimits={primaryMeter}
      />
    </Wrap>
  );
}
