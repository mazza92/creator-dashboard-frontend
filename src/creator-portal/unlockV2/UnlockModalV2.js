import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronDown, FiChevronUp, FiCopy, FiCheck, FiFlag } from 'react-icons/fi';
import { message, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';

import LootBoxLoading from './LootBoxLoading';
import CompletionFlash from './CompletionFlash';
import { LOADING, TOKENS, MENTOR_VERDICTS, MENTOR_SECTIONS, SEND_BUTTON, NEXT_ACTIONS } from './copyDictionary';
import { apiClient, getProxiedMediaUrl } from '../../config/api';
import UpgradeModal from '../UpgradeModal';
import { trackProBeginCheckout } from '../../utils/subscriptionAnalytics';

// Brand logo with error handling - shows initials on broken images
const BrandLogoImg = ({ src, alt, fallback }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
    />
  );
};

// Recent post thumbs — route social CDN URLs through media proxy (CORP blocks direct embeds)
const RecentPostThumb = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);
  const proxied = getProxiedMediaUrl(src);

  if (!proxied || hasError) {
    // Keep gray placeholder box (parent ProfileThumb) instead of broken-image icon
    return null;
  }

  return (
    <img
      src={proxied}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
    />
  );
};

/**
 * Strip HTML / og-description noise from a social bio for the unlock preview band.
 */
function cleanSocialBioSnippet(raw) {
  if (!raw) return '';
  let s = String(raw);

  // Decode common HTML entities (and nested ones)
  const decode = (value) => {
    if (typeof document !== 'undefined') {
      const el = document.createElement('textarea');
      el.innerHTML = value;
      return el.value;
    }
    return value
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&#064;/g, '@')
      .replace(/&nbsp;/g, ' ');
  };
  s = decode(s);
  s = decode(s);

  // Remove tags (handles broken scrapes like (@<b>handle</b>))
  s = s.replace(/<[^>]*>/g, '');

  // Prefer the quoted bio from IG/TikTok share snippets
  const quoted = s.match(
    /on\s+(?:Instagram|TikTok)\s*:\s*[“"']\s*(.+?)\s*[”"']\s*$/i
  );
  if (quoted?.[1]) {
    s = quoted[1];
  } else {
    // Drop follower/following/posts prefixes (including truncated "llowers")
    s = s.replace(
      /^[\s\S]*?(?:F?ollowers|Following)\s*,\s*[\d,.]+\s*Following\s*,\s*[\d,.]+\s*Posts\s*[-–—:]?\s*/i,
      ''
    );
    s = s.replace(/^[\s\S]*?on\s+(?:Instagram|TikTok)\s*:\s*/i, '');
    s = s.replace(/^["“'\s]+|["”'\s]+$/g, '');
  }

  // Collapse whitespace / leftover markup crumbs
  s = s
    .replace(/\s+/g, ' ')
    .replace(/\(\s*@\s*/g, '(@')
    .trim();

  // If still mostly meta junk, hide it
  if (/^\d[\d,.]*\s*(followers|following|posts)\b/i.test(s)) return '';
  if (s.length < 3) return '';
  return s.slice(0, 180);
}

/**
 * UnlockModalV2 - Mentor-First Unlock Experience
 *
 * The modal is redesigned around the AI mentor as the hero, not utilities.
 * Think of it as a "Mentor Session" not a "Package".
 *
 * Flow:
 * 1. Loot-box loading (~1.8s) - 4 cards appear progressively
 * 2. Completion flash (0-800ms) - green sparkle, duration based on unlock count
 * 3. The Mentor Session:
 *    - Manager Verdict Hero (🟢🟡🟠🔴 status + coach note)
 *    - What I Noticed (observation + why it matters)
 *    - Your Next Move (ONE concrete action + reasoning)
 *    - Everything Ready (collapsed utilities: contact, pitch, timing)
 *
 * Card timing: Cards appear at minimum intervals (400ms each) OR when API completes,
 * whichever is later. The final "You're Ready" card always waits for API completion.
 */

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(18, 20, 26, 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
  font-family: ${TOKENS.fontSans};

  @media (max-width: 480px) {
    align-items: flex-end;
    padding: 0;
  }
`;

const Modal = styled(motion.div)`
  background: #fff;
  border-radius: 18px;
  width: 100%;
  max-width: 460px;
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(18, 20, 26, 0.28);
  font-family: ${TOKENS.fontSans};

  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 94vh;
    border-radius: 18px 18px 0 0;
  }
`;

const Header = styled.div`
  padding: ${p => (p.$minimal ? '10px 12px 6px' : '14px 16px 12px')};
  display: flex;
  align-items: center;
  justify-content: ${p => (p.$minimal ? 'flex-end' : 'flex-start')};
  gap: 10px;
  border-bottom: ${p => (p.$minimal ? 'none' : `1px solid ${TOKENS.mentorBorder}`)};
  background: #fff;
  flex-shrink: 0;
`;

const BrandLogo = styled.div`
  width: 30px;
  height: 30px;
  background: ${props => props.$bgColor || '#f4f4f5'};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 10.5px;
  color: #f4b400;
  font-style: italic;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BrandInfo = styled.div`
  flex: 1;
`;

const BrandName = styled.div`
  font-weight: 800;
  font-size: 13px;
  line-height: 1.1;
`;

const BrandCategory = styled.div`
  font-size: 10px;
  color: #8a8f98;
  font-weight: 600;
`;

const CloseButton = styled.button`
  margin-left: auto;
  color: #8a8f98;
  font-size: 14px;
  width: 24px;
  height: 24px;
  background: #f1f2f4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e5e6e8;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

// ============================================
// MENTOR VERDICT HERO
// ============================================
const VerdictHero = styled.div`
  padding: 20px 20px 18px;
  background: #fff;
  text-align: center;
  border-bottom: 1px solid ${TOKENS.mentorBorder};
`;

const VerdictEmoji = styled.div`
  font-size: 52px;
  line-height: 1;
  margin-bottom: 14px;
`;

// Confidence indicator - stars instead of fake percentages
const ConfidenceIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 auto 16px;
`;

const ConfidenceStars = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
`;

const Star = styled.span`
  font-size: 20px;
  color: ${props => props.$filled ? props.$color : '#e5e7eb'};
  text-shadow: ${props => props.$filled ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'};
`;

const ConfidenceLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.$color || '#374151'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Sub-scores breakdown - shows why the score is what it is
const SubScoresContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 16px;
  padding: 0 12px;
`;

const SubScoreItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${TOKENS.mentorBg};
  border-radius: 8px;
  padding: 8px 12px;
`;

const SubScoreLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${TOKENS.mentorTextSecondary};
`;

const SubScoreValue = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SubScoreBar = styled.div`
  width: 40px;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
`;

const SubScoreBarFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.$value >= 70) return '#22c55e';
    if (props.$value >= 40) return '#eab308';
    return '#f97316';
  }};
  width: ${props => props.$value}%;
  border-radius: 2px;
`;

const SubScorePercent = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${props => {
    if (props.$value >= 70) return '#22c55e';
    if (props.$value >= 40) return '#eab308';
    return '#f97316';
  }};
  min-width: 28px;
  text-align: right;
`;

// Get star color based on status - NO RED (red = stop, we never want to say stop)
// Green = pitch now, Amber = improve first (still positive)
const getConfidenceColor = (status) => {
  switch(status) {
    case 'ready': return TOKENS.accent;       // Top Match
    case 'almost': return TOKENS.accent;      // Good Match — still get Brand PR
    case 'not_yet': return '#eab308';         // Growth Match - amber
    case 'poor_fit': return '#eab308';        // Stretch Match - amber
    case 'build_first': return '#f97316';     // Low Priority - orange
    default: return '#eab308';
  }
};

const CoachNote = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: ${TOKENS.mentorCoachNote};
  line-height: 1.35;
  margin-top: 16px;
  margin-bottom: 14px;
  padding: 0 12px;
`;

const VerdictPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: ${props => {
    switch (props.$color) {
      case 'green': return TOKENS.verdictGreenBg;
      case 'amber': return TOKENS.verdictAmberBg;
      case 'orange': return TOKENS.verdictOrangeBg;
      case 'red': return TOKENS.verdictRedBg;
      default: return TOKENS.verdictGreenBg;
    }
  }};
  color: ${props => {
    switch (props.$color) {
      case 'green': return TOKENS.verdictGreenFg;
      case 'amber': return TOKENS.verdictAmberFg;
      case 'orange': return TOKENS.verdictOrangeFg;
      case 'red': return TOKENS.verdictRedFg;
      default: return TOKENS.verdictGreenFg;
    }
  }};
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
`;

const VerdictDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`;

// ============================================
// MENTOR SECTIONS
// ============================================
const MentorContent = styled.div`
  padding: 0;
  background: transparent;
`;

const MentorSection = styled.div`
  padding: 14px 0;
  border-bottom: 1px solid ${TOKENS.mentorBorder};

  &:last-child {
    border-bottom: none;
  }
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.68rem;
  font-weight: 700;
  color: ${TOKENS.mentorTextSecondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 10px;
`;

const SectionIcon = styled.span`
  font-size: 14px;
`;

const ObservationText = styled.div`
  font-size: 14px;
  line-height: 1.55;
  color: ${TOKENS.mentorTextPrimary};
`;

const WhyItMatters = styled.div`
  font-size: 13px;
  line-height: 1.5;
  color: ${TOKENS.mentorTextSecondary};
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px solid #e5e7eb;
`;

const NextMoveCard = styled.div`
  background: #fff;
  border: 1px solid ${TOKENS.mentorBorder};
  border-radius: 12px;
  padding: 14px;
`;

const NextMoveAction = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${TOKENS.mentorTextPrimary};
  margin-bottom: 6px;
`;

const NextMoveReasoning = styled.div`
  font-size: 13px;
  color: ${TOKENS.mentorTextSecondary};
  line-height: 1.45;
  margin-bottom: 10px;
`;

const ThenWhat = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${TOKENS.verdictGreenBg};
  color: ${TOKENS.verdictGreenFg};
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 700;
`;

// ============================================
// PROFILE SNAPSHOT (Shows real scraped data)
// ============================================
const ProfileSnapshot = styled.div`
  margin: 0 0 12px;
  padding: 12px 14px;
  background: ${TOKENS.paper};
  border: 1px solid ${TOKENS.mentorBorder};
  border-radius: 12px;
`;

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`;

const PlatformIcon = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #111;
  color: #fff;
  display: grid;
  place-items: center;
  flex-shrink: 0;

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ProfileHandle = styled.span`
  font-size: 0.86rem;
  font-weight: 700;
  color: ${TOKENS.mentorTextPrimary};
`;

const ProfileDivider = styled.span`
  color: #d1d5db;
  font-size: 11px;
`;

const ProfileFollowers = styled.span`
  font-size: 0.8rem;
  color: ${TOKENS.mentorTextSecondary};
`;

const ProfileMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
`;

const NicheTag = styled.span`
  padding: 3px 8px;
  background: #fff;
  border: 1px solid ${TOKENS.mentorBorder};
  border-radius: 999px;
  font-size: 0.72rem;
  color: ${TOKENS.mentorTextSecondary};
  font-weight: 600;
`;

const MetaPill = styled.span`
  padding: 3px 8px;
  background: ${TOKENS.verdictGreenBg};
  border-radius: 999px;
  font-size: 0.72rem;
  color: ${TOKENS.verdictGreenFg};
  font-weight: 600;
`;

const ProfileBio = styled.div`
  font-size: 0.8rem;
  color: ${TOKENS.mentorTextSecondary};
  line-height: 1.45;
  margin-bottom: 8px;
  white-space: pre-wrap;
  word-break: break-word;

  a {
    color: ${TOKENS.accentDeep};
    font-weight: 600;
    text-decoration: none;
  }
`;

const ProfileThemes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
`;

const ProfileThumbnails = styled.div`
  display: flex;
  gap: 6px;
`;

const ProfileThumb = styled.div`
  width: 56px;
  height: 56px;
  background: #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 480px) {
    width: 52px;
    height: 52px;
  }
`;

// ============================================
// WHY YOU FIT (Clean modern styling)
// ============================================
const ReasonsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ReasonItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: ${TOKENS.mentorTextPrimary};
`;

const ReasonDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${props => props.$good ? TOKENS.verdictGreenFg : TOKENS.verdictAmberFg};
  margin-top: 6px;
  flex-shrink: 0;
`;

const ReasonText = styled.div`
  flex: 1;
`;

// ============================================
// UTILITIES SECTION (Collapsed)
// ============================================
const UtilitiesSection = styled.div`
  margin: 0 20px 16px;
  background: ${TOKENS.mentorBg};
  border-radius: 14px;
`;

const UtilitiesHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
`;

const UtilitiesTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UtilitiesChecks = styled.div`
  display: flex;
  gap: 6px;
`;

const UtilityCheck = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${TOKENS.verdictGreenBg};
  color: ${TOKENS.verdictGreenFg};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 700;
`;

const UtilitiesBody = styled(motion.div)`
  overflow: visible;
`;

const UtilitiesContent = styled.div`
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UtilityRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: #fff;
  border-radius: 10px;
`;

const UtilityInfo = styled.div`
  flex: 1;
`;

const UtilityLabel = styled.div`
  font-size: 11px;
  color: ${TOKENS.verdictGreenFg};
  font-weight: 700;
  margin-bottom: 2px;
`;

const UtilityValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${TOKENS.mentorTextPrimary};
`;

// ============================================
// LOW FOLLOWER / UGC GUIDE SECTION
// ============================================
const UGCGuideContainer = styled.div`
  padding: 0 20px 16px;
`;

const UGCGuideTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${TOKENS.mentorTextPrimary};
  margin-bottom: 8px;
`;

const UGCGuideIntro = styled.div`
  font-size: 13px;
  color: ${TOKENS.mentorTextSecondary};
  line-height: 1.5;
  margin-bottom: 16px;
`;

const UGCStepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UGCStep = styled.div`
  display: flex;
  gap: 12px;
  padding: 14px;
  background: ${TOKENS.mentorBg};
  border-radius: 12px;
`;

const UGCStepNumber = styled.div`
  width: 28px;
  height: 28px;
  background: #15161a;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
`;

const UGCStepContent = styled.div`
  flex: 1;
`;

const UGCStepTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${TOKENS.mentorTextPrimary};
  margin-bottom: 4px;
`;

const UGCStepDescription = styled.div`
  font-size: 12px;
  color: ${TOKENS.mentorTextSecondary};
  line-height: 1.45;
`;

const PoolCTAButton = styled.a`
  display: block;
  margin: 16px 20px 8px;
  background: linear-gradient(135deg, #8b5cf6 0%, #c026d3 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 800;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const PoolCTADescription = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${TOKENS.mentorTextSecondary};
  margin: 0 20px 16px;
`;

// ============================================
// BETTER MATCHES SECTION (Alternative brands)
// ============================================
const BetterMatchesSection = styled.div`
  padding: 20px;
  background: linear-gradient(180deg, #fafbfc 0%, #fff 100%);
  border-top: 1px solid #f4f4f6;
`;

const BetterMatchesTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${TOKENS.mentorTextSecondary};
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BetterMatchesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const BetterMatchCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: #15161a;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
`;

const BetterMatchLogo = styled.div`
  width: 40px;
  height: 40px;
  background: #f4f4f5;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #6b7280;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BetterMatchInfo = styled.div`
  flex: 1;
`;

const BetterMatchName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${TOKENS.mentorTextPrimary};
`;

const BetterMatchCategory = styled.div`
  font-size: 11px;
  color: ${TOKENS.mentorTextSecondary};
`;

const BetterMatchFit = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: ${props => {
    switch (props.$status) {
      case 'ready': return TOKENS.verdictGreenBg;
      case 'almost': return TOKENS.verdictAmberBg;
      default: return TOKENS.verdictOrangeBg;
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'ready': return TOKENS.verdictGreenFg;
      case 'almost': return TOKENS.verdictAmberFg;
      default: return TOKENS.verdictOrangeFg;
    }
  }};
  border-radius: 16px;
  font-size: 11px;
  font-weight: 700;
`;

const AlternativeCTA = styled.button`
  margin: 16px 20px 8px;
  background: linear-gradient(135deg, #15161a 0%, #2a2b30 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 14px 0;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-align: center;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  width: calc(100% - 40px);

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SecondaryAction = styled.button`
  display: block;
  margin: 0 auto 16px;
  background: transparent;
  border: none;
  color: ${TOKENS.mentorTextSecondary};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;

  &:hover {
    color: ${TOKENS.mentorTextPrimary};
    text-decoration: underline;
  }
`;

const SendButton = styled.button`
  margin: 16px 16px 20px;
  background: ${TOKENS.action};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 12px;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  flex-shrink: 0;
  font-family: ${TOKENS.fontSans};

  @media (max-width: 480px) {
    margin: 12px 12px 16px;
    padding: 15px 12px;
    font-size: 1rem;
  }

  &:hover {
    background: #1c1c1c;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

// ============================================
// OUTREACH SCREEN (shown after clicking Pitch button)
// Consistent with MentorSection design language
// ============================================
const OutreachScreen = styled(motion.div)`
  padding: 0;
  background: #fff;
`;

const OutreachHeader = styled.div`
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f4f4f6;
`;

const OutreachBrandLogo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${TOKENS.mentorBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
  color: ${TOKENS.mentorTextPrimary};
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const OutreachHeaderText = styled.div`
  flex: 1;
`;

const OutreachTitle = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: ${TOKENS.mentorTextPrimary};
  margin-bottom: 2px;
`;

const OutreachSubtitle = styled.div`
  font-size: 12px;
  color: ${TOKENS.mentorTextSecondary};
`;

const OutreachContent = styled.div`
  padding: 12px 20px 4px;
  background: #fff;
  flex: 1;
  overflow-y: auto;

  @media (max-width: 480px) {
    padding: 10px 16px 4px;
  }
`;

// Reuse MentorSection-style layout for consistency
const OutreachSection = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #f4f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const OutreachSectionLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: ${TOKENS.mentorTextSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
`;

const OutreachSectionIcon = styled.span`
  font-size: 14px;
`;

// Contact row - clean email display
const ContactDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${TOKENS.mentorBg};
  border-radius: 10px;
  padding: 12px 14px;
`;

const ContactEmail = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${TOKENS.mentorTextPrimary};
`;

const ContactCopyBtn = styled.button`
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  color: ${TOKENS.mentorTextPrimary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;

  &:hover {
    background: ${TOKENS.mentorBg};
    border-color: #d1d5db;
  }
`;

// Tone tabs - pill style like modern apps
const ToneTabs = styled.div`
  display: flex;
  background: ${TOKENS.mentorBg};
  border-radius: 8px;
  padding: 3px;
  margin-bottom: 12px;
`;

const ToneTab = styled.button`
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: ${props => props.$active ? '#fff' : 'transparent'};
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};
  font-size: 12px;
  font-weight: ${props => props.$active ? 700 : 500};
  color: ${props => props.$active ? TOKENS.mentorTextPrimary : TOKENS.mentorTextSecondary};
  cursor: pointer;
  text-transform: capitalize;
  transition: all 0.15s;

  &:hover {
    color: ${TOKENS.mentorTextPrimary};
  }
`;

// Pitch preview card
const PitchCard = styled.div`
  background: ${TOKENS.mentorBg};
  border-radius: 10px;
  padding: 14px;
`;

const PitchText = styled.div`
  font-size: 13px;
  line-height: 1.6;
  color: ${TOKENS.mentorTextPrimary};
  max-height: 120px;
  overflow-y: auto;
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-break: break-word;
`;

const PitchCopyBtn = styled.button`
  width: 100%;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
  font-weight: 700;
  color: ${TOKENS.mentorTextPrimary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s;

  &:hover {
    background: ${TOKENS.mentorBg};
    border-color: #d1d5db;
  }
`;

// Timing display
const TimingCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${TOKENS.mentorBg};
  border-radius: 10px;
  padding: 12px 14px;
`;

const TimingIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${TOKENS.verdictGreenBg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
`;

const TimingInfo = styled.div`
  flex: 1;
`;

const TimingPrimary = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${TOKENS.mentorTextPrimary};
`;

const TimingSecondary = styled.div`
  font-size: 12px;
  color: ${TOKENS.mentorTextSecondary};
`;

// CTA and navigation
const OutreachFooter = styled.div`
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const OutreachCTA = styled.button`
  width: 100%;
  background: ${TOKENS.action};
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 0;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  font-family: ${TOKENS.fontSans};

  @media (max-width: 480px) {
    padding: 15px 0;
    font-size: 1rem;
  }

  &:hover {
    background: #1c1c1c;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const PitchSection = styled.div`
  background: #eef6ff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 0.85rem 0.95rem;
  margin-bottom: 0.65rem;
`;

const PitchSectionLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #3b6ea5;
  margin-bottom: 0.45rem;
`;

const FormApplySection = styled.div`
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 0.9rem 0.95rem;
  margin-bottom: 0.65rem;
`;

const FormApplyTitle = styled.div`
  font-weight: 700;
  font-size: 0.92rem;
  color: #1e3a8a;
  margin-bottom: 0.25rem;
`;

const FormApplyBody = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.86rem;
  color: #1e40af;
  line-height: 1.45;
`;

const FormApplyCTA = styled.button`
  width: 100%;
  background: #1d4ed8;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 0;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  cursor: pointer;
  font-family: ${TOKENS.fontSans};
  transition: background 0.2s, transform 0.1s;

  &:hover {
    background: #1e40af;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const FormNote = styled.div`
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 0.8rem 0.95rem;
  font-size: 0.86rem;
  color: #7c4a1a;
  margin-bottom: 0.75rem;
  line-height: 1.45;

  strong {
    display: block;
    color: #b45309;
    margin-bottom: 0.2rem;
    font-weight: 700;
  }
`;

const PrepList = styled.ul`
  margin: 0.4rem 0 0;
  padding: 0;
  list-style: none;

  li {
    font-size: 0.84rem;
    padding: 0.4rem 0;
    border-bottom: 1px solid ${TOKENS.mentorBorder};
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    color: ${TOKENS.mentorTextPrimary};
  }

  li:last-child { border: 0; }

  button {
    border: 0;
    background: transparent;
    color: ${TOKENS.accent};
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    flex-shrink: 0;
    font-family: ${TOKENS.fontSans};
  }
`;

/* Rebuild package layout (Rhode-style preview) */
const PkgPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
`;

const PkgPill = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  border-radius: 6px;
  background: ${p => (
    p.$tone === 'ok' ? TOKENS.verdictGreenBg :
    p.$tone === 'email' ? '#fef3c7' :
    p.$tone === 'form' ? '#eff6ff' :
    p.$tone === 'gift' ? '#fce7f3' :
    '#f4f4f4'
  )};
  color: ${p => (
    p.$tone === 'ok' ? TOKENS.verdictGreenFg :
    p.$tone === 'email' ? '#92400e' :
    p.$tone === 'form' ? '#1d4ed8' :
    p.$tone === 'gift' ? '#9d174d' :
    '#444'
  )};
`;

const MatchBox = styled.div`
  background: ${TOKENS.verdictGreenBg};
  border-radius: 12px;
  padding: 0.8rem 0.95rem;
  margin-bottom: 0.75rem;
`;

const MatchBoxTitle = styled.div`
  color: ${TOKENS.accentDeep};
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
`;

const MatchBoxBody = styled.p`
  margin: 0;
  font-size: 0.88rem;
  color: #1f4d3f;
  line-height: 1.45;
`;

/** Bento-style dark invite band → AI Manager */
const ManagerInviteBand = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin: 0.65rem 0 0.25rem;
  padding: 12px 14px;
  border-radius: 12px;
  background: #0d5c48;
  color: #fff;
  box-shadow: 0 1px 3px rgba(15, 15, 15, 0.08);
  box-sizing: border-box;

  @media (max-width: 480px) {
    flex-wrap: wrap;
    gap: 10px;
  }
`;

const ManagerInviteIcon = styled.span`
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.14);
  font-size: 12px;
  color: #d7f5ea;
`;

const ManagerInviteCopy = styled.p`
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12.5px;
  font-weight: 550;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.95);

  @media (max-width: 480px) {
    flex: 1 1 calc(100% - 40px);
    font-size: 12px;
  }
`;

const ManagerInviteCta = styled.button`
  flex-shrink: 0;
  border: none;
  border-radius: 999px;
  padding: 8px 12px;
  background: #fff;
  color: #0d5c48;
  font-size: 12px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: #f3faf7;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const InfoBlock = styled.div`
  background: ${TOKENS.paper};
  border-radius: 12px;
  padding: 0.85rem 0.95rem;
  margin-bottom: 0.65rem;
`;

const InfoLabel = styled.div`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #888;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-weight: 600;
  font-size: 0.98rem;
  color: ${TOKENS.ink};
  word-break: break-all;
  line-height: 1.35;
`;

const InfoMeta = styled.div`
  font-size: 0.75rem;
  color: ${TOKENS.mentorTextSecondary};
  margin-top: 0.25rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
`;

const GhostBtn = styled.button`
  flex-shrink: 0;
  border: 1px solid #ebebeb;
  background: #fff;
  border-radius: 8px;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${TOKENS.ink};
  cursor: pointer;
  font-family: ${TOKENS.fontSans};

  &:hover {
    border-color: ${TOKENS.accentBorder};
    color: ${TOKENS.accentDeep};
  }
`;

const FlagBtn = styled.button`
  flex-shrink: 0;
  border: none;
  background: transparent;
  padding: 0.35rem;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s ease;

  &:hover {
    color: #ef4444;
    background: #fef2f2;
  }
`;

const TipLine = styled.p`
  font-size: 0.82rem;
  color: ${TOKENS.mentorTextSecondary};
  margin: 0.15rem 0 0.5rem;
  line-height: 1.4;

  b {
    color: #e85d3b;
    font-weight: 700;
  }
`;

const StrategyPanel = styled.div`
  margin: 0.35rem 0 0.75rem;
  padding: 0.9rem 0.95rem;
  background: ${TOKENS.paper};
  border: 1px solid ${TOKENS.mentorBorder};
  border-radius: 12px;
`;

const BackButton = styled.button`
  background: transparent;
  border: none;
  color: ${TOKENS.mentorTextSecondary};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;

  &:hover {
    color: ${TOKENS.mentorTextPrimary};
  }
`;

const NextActionsScreen = styled(motion.div)`
  padding: 4px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const NextActionsHero = styled.div`
  padding: 4px 4px 20px;
  text-align: center;
`;

const NextActionsBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #047857;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 12px;
`;

const NextActionsTitle = styled.h3`
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${TOKENS.mentorTextPrimary};
`;

const NextActionsSub = styled.p`
  margin: 0 auto;
  max-width: 280px;
  font-size: 13px;
  line-height: 1.5;
  color: ${TOKENS.mentorTextSecondary};
`;

const NextActionsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NextActionPrimary = styled.div`
  background: linear-gradient(180deg, #f8f7ff 0%, #f3f0ff 100%);
  border: 1px solid #e8e4ff;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NextActionSecondary = styled.div`
  background: #fff;
  border: 1px solid #eceef2;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NextActionLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${TOKENS.mentorTextPrimary};
  line-height: 1.3;
`;

const NextActionTip = styled.div`
  font-size: 12.5px;
  line-height: 1.45;
  color: ${TOKENS.mentorTextSecondary};
  margin-top: -4px;
`;

const NextActionBtn = styled.button`
  width: 100%;
  border: none;
  border-radius: 11px;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  background: ${p => (p.$secondary ? '#fff' : '#111827')};
  color: ${p => (p.$secondary ? '#111827' : '#fff')};
  border: ${p => (p.$secondary ? '1px solid #e5e7eb' : 'none')};
  transition: transform 0.12s ease, background 0.12s ease;

  &:hover {
    background: ${p => (p.$secondary ? '#f9fafb' : '#1f2937')};
  }

  &:active {
    transform: scale(0.985);
  }
`;

const NextActionsFooter = styled.div`
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #f1f2f4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const NextActionsNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${TOKENS.mentorTextSecondary};
  text-align: center;
  line-height: 1.45;
  max-width: 260px;
`;

const NextActionLink = styled.button`
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 4px;

  &:hover {
    text-decoration: underline;
  }
`;

// Loading/Flash states
const PHASE_LOADING = 'loading';
const PHASE_FLASH = 'flash';
const PHASE_MODAL = 'modal';
const PHASE_OUTREACH = 'outreach';
const PHASE_NEXT = 'next_actions';

// Card timing configuration
const CARD_TIMINGS = {
  inbox: 400,      // Card 1 at 400ms
  pitch: 800,      // Card 2 at 800ms
  strategy: 1200,  // Card 3 at 1200ms
  ready: 1600,     // Card 4 at 1600ms (or when API completes)
};

const UnlockModalV2 = ({
  isOpen,
  onClose,
  brand,
  onPitchSent,
  creatorProfile,
  isPro = false,
  onUpgrade,
  onOpenOpportunities,
}) => {
  // Phase state
  const [phase, setPhase] = useState(PHASE_LOADING);

  // Loading card states
  const [cardStates, setCardStates] = useState({
    inbox: false,
    pitch: false,
    strategy: false,
    ready: false,
  });
  const [animatingCard, setAnimatingCard] = useState(null);
  const [showFallback, setShowFallback] = useState(false);

  // Package data
  const [packageData, setPackageData] = useState(null);
  const [error, setError] = useState(null);
  const [apiComplete, setApiComplete] = useState(false);

  // User data for flash duration
  const [totalUnlocks, setTotalUnlocks] = useState(0);
  const [fastMode, setFastMode] = useState(false);

  // UI state
  const [selectedTone, setSelectedTone] = useState('growing');
  const [utilitiesExpanded, setUtilitiesExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [managerBar, setManagerBar] = useState(null);

  const navigate = useNavigate();
  const startTimeRef = useRef(0);
  const cardTimersRef = useRef([]);
  const fallbackTimerRef = useRef(null);

  // Reveal a card with animation
  const revealCard = useCallback((cardKey) => {
    setAnimatingCard(cardKey);
    setCardStates(prev => ({ ...prev, [cardKey]: true }));

    // Clear animating state after animation
    setTimeout(() => {
      setAnimatingCard(null);
    }, 400);
  }, []);

  // Start the API call and card animations
  const startGeneration = useCallback(async () => {
    if (!brand) return;

    startTimeRef.current = Date.now();
    setApiComplete(false);

    // Schedule card reveals at minimum intervals
    // Cards 1-3 appear at fixed times, card 4 waits for API
    const cardKeys = ['inbox', 'pitch', 'strategy'];

    cardKeys.forEach((cardKey) => {
      const timer = setTimeout(() => {
        revealCard(cardKey);
      }, CARD_TIMINGS[cardKey]);
      cardTimersRef.current.push(timer);
    });

    // Make the API call - regular endpoint now has AI Depth
    try {
      const response = await apiClient.post('/api/pr-crm/generate-pr-package', {
        brand_id: brand.brand_id || brand.id,
        slug: brand.slug,
        is_for_you_match: brand.is_for_you_match || false,
      });

      const elapsed = Date.now() - startTimeRef.current;
      setApiComplete(true);

      if (response.data.success) {
        try {
          const prev = Number(localStorage.getItem('nc_unlock_count') || '0');
          localStorage.setItem('nc_unlock_count', String(prev + 1));
        } catch (_) { /* ignore */ }

        // Calculate when to show the final card
        // Must be at least CARD_TIMINGS.ready ms after start, or now if we're past that
        const readyDelay = Math.max(0, CARD_TIMINGS.ready - elapsed);

        setTimeout(() => {
          revealCard('ready');

          const pkg = response.data.package;
          const brandName = brand?.brand_name || brand?.name || 'Brand';

          // Check if this is the new coaching schema
          const isCoaching = response.data.is_coaching || false;
          const coaching = response.data.coaching || null;

          // Get status for mentor verdict
          const status = coaching?.status || response.data.verdict?.status || 'almost';
          const mentorVerdict = MENTOR_VERDICTS[status] || MENTOR_VERDICTS.almost;

          // Build coaching data from response
          const coachingData = isCoaching && coaching ? {
            status: coaching.status,
            confidence: coaching.confidence,
            coach_note: coaching.coach_note,
            observation: coaching.observation,
            why_it_matters: coaching.why_it_matters,
            action: coaching.action,
            reasoning: coaching.reasoning,
            then_what: coaching.then_what,
          } : null;

          // Legacy verdict for non-coaching mode
          const legacyVerdict = response.data.verdict || {
            emoji: '🎯',
            headline: `You can pitch ${brandName} today.`,
            subline_bold: 'your profile',
            verdict_pill: 'Ready for outreach',
            pill_color: 'green'
          };

          // Legacy reasons for non-coaching mode
          const reasons = response.data.reasons || [
            { dot: 'good', text: `${brand?.category || 'Creator'} match` },
            { dot: 'good', text: 'Active audience' },
            { dot: 'good', text: 'Recent posting' },
          ];

          // Legacy quick win for non-coaching mode
          const quickWin = response.data.quick_win || {
            emoji: '📹',
            action_title: 'Post content this week',
            note: 'Brands check your latest posts before replying.',
            gain_pill: '🟢 Better chance of reply'
          };

          setPackageData({
            success: true,
            is_coaching: isCoaching,
            coaching: coachingData,
            mentor_verdict: mentorVerdict,
            status: status,
            // Legacy fields for backwards compatibility
            fit_tier: response.data.fit_tier || 'high',
            verdict: legacyVerdict,
            reasons,
            quick_win: quickWin,
            quick_wins_count: response.data.quick_wins_count || 1,
            package: pkg,
            contact: response.data.contact || {
              verified: true,
              email: response.data.brand_email,
              email_display: response.data.brand_email ?
                `${response.data.brand_email.substring(0, 12)}...` : 'Verified'
            },
            best_time: response.data.best_time || {
              day: pkg?.timing?.day || 'Tuesday',
              time_range: pkg?.timing?.time_range || '2-5pm ET',
              sample_size: pkg?.timing?.sample_size || 0,
              emoji_flame: true
            },
            brand: pkg?.brand,
            brand_email: response.data.brand_email,
            application_form_url: response.data.application_form_url,
            media_kit_url: response.data.media_kit_url,
            kit_published: response.data.kit_published,
            total_unlocks: response.data.total_unlocks || 1,
            fast_mode: response.data.fast_mode || false,
            used_ai_depth: response.data.used_ai_depth || false,
            // Low follower mode
            is_low_follower: response.data.is_low_follower || false,
            ugc_guide: response.data.ugc_guide || null,
            // Better brand alternatives
            better_matches: response.data.better_matches || null,
            show_alternatives: response.data.show_alternatives || false,
            // Profile snapshot for UI transparency
            profile_snapshot: response.data.profile_snapshot || null
          });

          setTotalUnlocks(response.data.total_unlocks || 1);
          setFastMode(response.data.fast_mode || false);

          // Clear fallback timer
          if (fallbackTimerRef.current) {
            clearTimeout(fallbackTimerRef.current);
          }

          // Transition to flash after card animation
          setTimeout(() => {
            setPhase(PHASE_FLASH);
          }, 600);
        }, readyDelay);
      } else {
        setError(response.data.error || 'Failed to generate package');
        setPhase(PHASE_MODAL);
      }
    } catch (err) {
      console.error('Package generation error:', err);

      if (err.response?.status === 402) {
        setError('paywall');
      } else {
        setError(err.response?.data?.error || 'Failed to generate package');
      }
      setPhase(PHASE_MODAL);
    }
  }, [brand, revealCard]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && brand) {
      setPhase(PHASE_LOADING);
      setCardStates({ inbox: false, pitch: false, strategy: false, ready: false });
      setAnimatingCard(null);
      setShowFallback(false);
      setPackageData(null);
      setError(null);
      setUtilitiesExpanded(false);
      setApiComplete(false);

      // Clear any existing timers
      cardTimersRef.current.forEach(timer => clearTimeout(timer));
      cardTimersRef.current = [];

      // Start generation
      startGeneration();

      // Fallback timer for "Almost done..."
      fallbackTimerRef.current = setTimeout(() => {
        setShowFallback(true);
      }, LOADING.maxTimeMs);
    }

    return () => {
      cardTimersRef.current.forEach(timer => clearTimeout(timer));
      cardTimersRef.current = [];
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
      }
    };
  }, [isOpen, brand, startGeneration]);

  // Hireability snapshot for AI Manager mini-band
  useEffect(() => {
    if (!isOpen) {
      setManagerBar(null);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get('/api/pr-ready');
        if (cancelled || !res.data?.success) return;
        setManagerBar(res.data.manager_bar || null);
      } catch {
        if (!cancelled) setManagerBar(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const handleFlashComplete = useCallback(() => {
    setPhase(PHASE_MODAL);
  }, []);

  const goToAiManager = useCallback(() => {
    const slug = brand?.slug || packageData?.brand?.slug || '';
    const q = slug ? `?focus_brand=${encodeURIComponent(slug)}` : '';
    sessionStorage.setItem('nc_manager_tab_clicked_at', String(Date.now()));
    onClose?.();
    navigate(`/creator/dashboard/pr-ready${q}`);
  }, [brand?.slug, packageData?.brand?.slug, navigate, onClose]);

  const showManagerMini =
    !!managerBar &&
    managerBar.score < 100 &&
    !(isPro && managerBar.score >= 85);

  const renderManagerMiniBand = () => {
    if (!showManagerMini) return null;
    return (
      <ManagerInviteBand>
        <ManagerInviteIcon aria-hidden>✦</ManagerInviteIcon>
        <ManagerInviteCopy>
          Reply chance {managerBar.score}% · Improve your chance of landing this deal with AI Manager
        </ManagerInviteCopy>
        <ManagerInviteCta type="button" onClick={goToAiManager}>
          Improve reply chance
        </ManagerInviteCta>
      </ManagerInviteBand>
    );
  };

  // Handle upgrade to Pro via Stripe checkout
  const handleUpgradeClick = async () => {
    try {
      trackProBeginCheckout({ tier: 'pro', source: 'unlock_modal_v2' });
      const response = await apiClient.post('/api/subscription/create-checkout', { tier: 'pro' });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Upgrade error:', error);
      if (error.response?.data?.code === 'stripe_account_pending') {
        message.warning('Payment processing is temporarily unavailable. Please try again later.');
      } else {
        message.error('Failed to start checkout. Please try again.');
      }
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      message.success('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      message.error('Failed to copy');
    }
  };

  // Handle send button click
  const handleOpenForm = () => {
    const formUrl = packageData?.application_form_url;
    if (!formUrl) return;
    window.open(formUrl, '_blank', 'noopener,noreferrer');
    onPitchSent?.(brand, { method: 'form', stayOpen: true });
    setPhase(PHASE_NEXT);
  };

  const handleSend = async () => {
    const brandEmail = packageData?.brand_email || packageData?.contact?.email;
    const formUrl = packageData?.application_form_url;

    // Form-only brands: open signup in a new tab (user submits — we don't)
    if (formUrl && !brandEmail) {
      handleOpenForm();
      return;
    }

    if (!packageData?.package?.pitches) return;

    const pitch = packageData.package.pitches[selectedTone];
    const subject = pitch?.subject || '';
    const body = pitch?.body_plain || '';

    await copyToClipboard(body, 'pitch');

    const mailtoUrl = `mailto:${brandEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&bcc=creators@newcollab.co`;
    window.location.href = mailtoUrl;

    onPitchSent?.(brand, { method: 'email', stayOpen: true });
    setPhase(PHASE_NEXT);
  };

  const finishAndClose = (goPipeline = false) => {
    onPitchSent?.(brand, {
      method: 'email',
      stayOpen: false,
      alreadyRecorded: true,
      goPipeline,
    });
  };

  if (!isOpen) return null;

  const brandName = brand?.brand_name || brand?.name || 'Brand';
  const brandCategory = brand?.category || '';
  const brandLogo = brand?.logo || brand?.logo_url;
  const brandEmail = packageData?.brand_email || packageData?.contact?.email;
  const formUrl = packageData?.application_form_url;
  const isFormPackage = !!(formUrl && !brandEmail);
  const giftValue = brand?.price_point || packageData?.brand?.price_point || packageData?.package?.brand?.price_point || 45;
  const matchLabel = packageData?.fit_score?.label
    || packageData?.mentor_verdict?.confidenceLabel
    || packageData?.verdict?.verdict_pill
    || 'Good match';
  const matchBlurb = packageData?.coaching?.coach_note
    || packageData?.coaching?.observation
    || packageData?.verdict?.headline
    || (brandCategory
      ? `${brandCategory} creators — unlock PR contact and pitch with a short, personal note.`
      : 'Unlock the PR contact and pitch with a short, personal note.');
  const minFollowers = brand?.min_followers ?? packageData?.brand?.min_followers;
  const microOk = minFollowers == null || minFollowers === '' || Number(minFollowers) === 0 || Number(minFollowers) <= 10000;

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <Modal
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {phase === PHASE_NEXT ? (
            <Header $minimal>
              <CloseButton onClick={onClose}>
                <FiX size={14} />
              </CloseButton>
            </Header>
          ) : (
            <Header>
              <BrandLogo>
                {brandLogo ? (
                  <img src={brandLogo} alt={brandName} />
                ) : (
                  brandName.substring(0, 3).toLowerCase()
                )}
              </BrandLogo>
              <BrandInfo>
                <BrandName>{brandName}</BrandName>
                <BrandCategory>
                  {phase === PHASE_OUTREACH
                    ? (brandCategory
                      ? `${brandCategory}${isFormPackage ? ' · Form package' : ' · PR email'}`
                      : (isFormPackage ? 'Form package · 1 unlock' : 'PR email package · 1 unlock'))
                    : brandCategory}
                </BrandCategory>
              </BrandInfo>
              <CloseButton onClick={onClose}>
                <FiX size={14} />
              </CloseButton>
            </Header>
          )}

          <ModalBody>
            {phase === PHASE_LOADING && (
              <LootBoxLoading
                brandName={brandName}
                cardStates={cardStates}
                animatingCard={animatingCard}
                showFallback={showFallback}
              />
            )}

            {phase === PHASE_FLASH && (
              <CompletionFlash
                totalUnlocks={totalUnlocks}
                fastMode={fastMode}
                onComplete={handleFlashComplete}
              />
            )}

            {phase === PHASE_MODAL && (
              <>
                {error === 'paywall' ? (
                  <UpgradeModal
                    isOpen={true}
                    onClose={onClose}
                    feature="unlock_paywall"
                    currentCount={3}
                    limit={3}
                  />
                ) : error ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
                    <div style={{ fontWeight: 700, marginBottom: '8px' }}>Something went wrong</div>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>{error}</div>
                  </div>
                ) : packageData && (
                  <>
                    <OutreachContent>
                      {packageData.profile_snapshot && (() => {
                        const snap = packageData.profile_snapshot;
                        const niches = (snap.niches?.length ? snap.niches : (snap.niche ? [snap.niche] : []))
                          .filter(Boolean)
                          .slice(0, 3);
                        const themes = (snap.content_themes || []).filter(Boolean).slice(0, 3);
                        const eng = Number(snap.engagement_rate);
                        const bioRaw = cleanSocialBioSnippet(snap.bio || '');
                        // Linkify email if scraper put it in the bio
                        const bioNodes = bioRaw.split(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi).map((part, i) => (
                          part.includes('@') && part.includes('.')
                            ? <a key={i} href={`mailto:${part}`}>{part}</a>
                            : <React.Fragment key={i}>{part}</React.Fragment>
                        ));
                        const platform = (snap.platform || '').toLowerCase();
                        const handleClean = String(snap.handle || '')
                          .replace(/<[^>]*>/g, '')
                          .replace(/^@/, '')
                          .trim();

                        return (
                          <ProfileSnapshot>
                            <ProfileRow>
                              <PlatformIcon aria-label={platform || 'social'}>
                                {platform === 'tiktok' ? (
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                                  </svg>
                                ) : platform === 'youtube' ? (
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                                  </svg>
                                )}
                              </PlatformIcon>
                              <ProfileHandle>@{handleClean}</ProfileHandle>
                              <ProfileDivider>|</ProfileDivider>
                              <ProfileFollowers>
                                {(snap.follower_count || 0).toLocaleString()} followers
                              </ProfileFollowers>
                            </ProfileRow>

                            {(niches.length > 0 || (Number.isFinite(eng) && eng > 0) || snap.is_public === false) && (
                              <ProfileMeta>
                                {niches.map((n, i) => (
                                  <NicheTag key={`${n}-${i}`}>{n}</NicheTag>
                                ))}
                                {Number.isFinite(eng) && eng > 0 && (
                                  <MetaPill>{eng.toFixed(1)}% eng</MetaPill>
                                )}
                                {snap.is_public === false && (
                                  <NicheTag>Private account</NicheTag>
                                )}
                              </ProfileMeta>
                            )}

                            {bioRaw && (
                              <ProfileBio>{bioNodes}</ProfileBio>
                            )}

                            {themes.length > 0 && (
                              <ProfileThemes>
                                {themes.map((theme, i) => (
                                  <NicheTag key={`${theme}-${i}`}>{theme}</NicheTag>
                                ))}
                              </ProfileThemes>
                            )}

                            {snap.recent_thumbnails?.length > 0 && (
                              <ProfileThumbnails>
                                {snap.recent_thumbnails.slice(0, 3).map((url, i) => (
                                  <ProfileThumb key={i}>
                                    <RecentPostThumb src={url} alt={`Recent post ${i + 1}`} />
                                  </ProfileThumb>
                                ))}
                              </ProfileThumbnails>
                            )}
                          </ProfileSnapshot>
                        );
                      })()}

                      <MatchBox>
                        {(() => {
                          const status = packageData.status || 'almost';
                          const fitScore = packageData.fit_score;
                          const verdict = MENTOR_VERDICTS[status] || MENTOR_VERDICTS.almost;
                          const starColor = getConfidenceColor(status);
                          const filledStars = fitScore?.stars || verdict.confidenceStars || 3;
                          const label = fitScore?.label || verdict.confidenceLabel || matchLabel;
                          return (
                            <>
                              <ConfidenceStars style={{ justifyContent: 'flex-start', marginBottom: 6 }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star key={star} $filled={star <= filledStars} $color={starColor} style={{ fontSize: 16 }}>★</Star>
                                ))}
                              </ConfidenceStars>
                              <MatchBoxTitle>{label}</MatchBoxTitle>
                            </>
                          );
                        })()}
                        <MatchBoxBody>{matchBlurb}</MatchBoxBody>
                      </MatchBox>

                      {packageData.is_low_follower && packageData.ugc_guide ? (
                        <>
                          <UGCGuideContainer>
                            <UGCGuideTitle>{packageData.ugc_guide.title}</UGCGuideTitle>
                            <UGCGuideIntro>{packageData.ugc_guide.intro}</UGCGuideIntro>
                            <UGCStepsList>
                              {packageData.ugc_guide.steps.map((step) => (
                                <UGCStep key={step.step}>
                                  <UGCStepNumber>{step.step}</UGCStepNumber>
                                  <UGCStepContent>
                                    <UGCStepTitle>{step.title}</UGCStepTitle>
                                    <UGCStepDescription>{step.description}</UGCStepDescription>
                                  </UGCStepContent>
                                </UGCStep>
                              ))}
                            </UGCStepsList>
                          </UGCGuideContainer>
                          <PoolCTAButton href={packageData.ugc_guide.pool_cta.url}>
                            {packageData.ugc_guide.pool_cta.text} →
                          </PoolCTAButton>
                        </>
                      ) : (
                        <>
                          {packageData.is_coaching && packageData.coaching ? (
                            <MentorContent style={{ padding: 0 }}>
                              <MentorSection>
                                <SectionLabel>
                                  <SectionIcon>
                                    {['poor_fit', 'build_first'].includes(packageData.status)
                                      ? MENTOR_SECTIONS.lowerPriority.icon
                                      : MENTOR_SECTIONS.whatBrandWillNotice.icon}
                                  </SectionIcon>
                                  {['poor_fit', 'build_first'].includes(packageData.status)
                                    ? MENTOR_SECTIONS.lowerPriority.label
                                    : MENTOR_SECTIONS.whatBrandWillNotice.labelTemplate(brandName)}
                                </SectionLabel>
                                <ObservationText>{packageData.coaching.observation}</ObservationText>
                                {packageData.coaching.why_it_matters && (
                                  <WhyItMatters>{packageData.coaching.why_it_matters}</WhyItMatters>
                                )}
                              </MentorSection>
                              {packageData.status !== 'ready' && packageData.coaching.action && (
                                <MentorSection>
                                  <SectionLabel>
                                    <SectionIcon>{MENTOR_SECTIONS.increaseReplyChance.icon}</SectionIcon>
                                    {MENTOR_SECTIONS.increaseReplyChance.label}
                                  </SectionLabel>
                                  <NextMoveCard>
                                    <NextMoveAction>{packageData.coaching.action}</NextMoveAction>
                                    {packageData.coaching.reasoning && (
                                      <NextMoveReasoning>{packageData.coaching.reasoning}</NextMoveReasoning>
                                    )}
                                  </NextMoveCard>
                                </MentorSection>
                              )}
                            </MentorContent>
                          ) : (
                            <MentorContent style={{ padding: 0 }}>
                              <MentorSection>
                                <SectionLabel>
                                  <SectionIcon>👀</SectionIcon>
                                  What {brandName} Will Notice
                                </SectionLabel>
                                <ReasonsList>
                                  {(packageData.reasons || []).map((reason, i) => (
                                    <ReasonItem key={i}>
                                      <ReasonDot $good={reason.dot === 'good'} />
                                      <ReasonText>{reason.text}</ReasonText>
                                    </ReasonItem>
                                  ))}
                                </ReasonsList>
                              </MentorSection>
                              {packageData.quick_win && (
                                <MentorSection>
                                  <SectionLabel>
                                    <SectionIcon>⭐</SectionIcon>
                                    Increase your reply chance
                                  </SectionLabel>
                                  <NextMoveCard>
                                    <NextMoveAction>
                                      {packageData.quick_win.emoji} {packageData.quick_win.action_title}
                                    </NextMoveAction>
                                    <NextMoveReasoning>{packageData.quick_win.note}</NextMoveReasoning>
                                  </NextMoveCard>
                                </MentorSection>
                              )}
                            </MentorContent>
                          )}

                          {packageData.status === 'poor_fit' && packageData.better_matches?.length > 0 && (
                            <BetterMatchesSection>
                              <BetterMatchesTitle><span>✨</span> Try these instead</BetterMatchesTitle>
                              <BetterMatchesList>
                                {packageData.better_matches.map((match) => (
                                  <BetterMatchCard
                                    key={match.id}
                                    onClick={() => {
                                      window.location.href = `/creator/dashboard/pr-brands?brand=${match.slug}`;
                                    }}
                                  >
                                    <BetterMatchLogo>
                                      <BrandLogoImg
                                        src={match.logo}
                                        alt={match.brand_name}
                                        fallback={match.brand_name?.substring(0, 2).toUpperCase()}
                                      />
                                    </BetterMatchLogo>
                                    <BetterMatchInfo>
                                      <BetterMatchName>{match.brand_name}</BetterMatchName>
                                      <BetterMatchCategory>{match.category}</BetterMatchCategory>
                                    </BetterMatchInfo>
                                  </BetterMatchCard>
                                ))}
                              </BetterMatchesList>
                            </BetterMatchesSection>
                          )}
                        </>
                      )}

                      {renderManagerMiniBand()}
                    </OutreachContent>

                    {!packageData.is_low_follower && (
                      <OutreachFooter>
                        <OutreachCTA onClick={() => setPhase(PHASE_OUTREACH)}>
                          {SEND_BUTTON.label}
                        </OutreachCTA>
                        {packageData.status === 'poor_fit' && packageData.better_matches?.length > 0 && (
                          <BackButton type="button" onClick={() => setPhase(PHASE_OUTREACH)}>
                            Still get Brand PR for {brandName}
                          </BackButton>
                        )}
                      </OutreachFooter>
                    )}
                  </>
                )}
              </>
            )}

            {phase === PHASE_OUTREACH && packageData && (
              <>
                <OutreachContent>
                  <PkgPills>
                    {microOk && <PkgPill $tone="ok">Accepts micros</PkgPill>}
                    {isFormPackage ? (
                      <PkgPill $tone="form">Program form</PkgPill>
                    ) : (
                      <PkgPill $tone="email">PR email</PkgPill>
                    )}
                    <PkgPill $tone="gift">~${giftValue} avg gift</PkgPill>
                    {formUrl && brandEmail && <PkgPill $tone="form">Has form</PkgPill>}
                  </PkgPills>

                  {isFormPackage ? (
                    <>
                      <FormNote>
                        <strong>You submit this form — we don’t</strong>
                        Affiliate / UGC portals need your login. We open the link and prep answers from My Kit.
                      </FormNote>
                      <InfoBlock>
                        <InfoLabel>Program signup link</InfoLabel>
                        <InfoRow>
                          <InfoValue style={{ fontSize: '0.88rem' }}>{formUrl}</InfoValue>
                          <GhostBtn type="button" onClick={() => copyToClipboard(formUrl, 'email')}>
                            {copiedField === 'email' ? 'Copied' : 'Copy'}
                          </GhostBtn>
                        </InfoRow>
                      </InfoBlock>
                      <PitchSection>
                        <PitchSectionLabel>Prep answers</PitchSectionLabel>
                        <PrepList>
                          <li>
                            <span>Why you fit</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(
                                packageData.package?.pitches?.[selectedTone]?.body_plain || packageData.coaching?.coach_note || '',
                                'pitch'
                              )}
                            >
                              Copy
                            </button>
                          </li>
                          {packageData.media_kit_url && (
                            <li>
                              <span>Media kit URL</span>
                              <button type="button" onClick={() => copyToClipboard(packageData.media_kit_url, 'pitch')}>
                                Copy
                              </button>
                            </li>
                          )}
                        </PrepList>
                      </PitchSection>
                    </>
                  ) : (
                    <>
                      <InfoBlock>
                        <InfoLabel>Verified PR email</InfoLabel>
                        <InfoRow>
                          <div>
                            <InfoValue>{brandEmail}</InfoValue>
                            <InfoMeta>1 credit used</InfoMeta>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Tooltip title="Report invalid or outdated email">
                              <FlagBtn
                                type="button"
                                onClick={() => {
                                  const subject = encodeURIComponent(`${brandName} - Invalid Contact Report`);
                                  const body = encodeURIComponent(`Hi Newcollab team,\n\nThe contact email for ${brandName} (${brandEmail}) appears to be invalid or no longer active.\n\nPlease update this brand's contact information.\n\nThank you!`);
                                  window.open(`mailto:team@newcollab.co?subject=${subject}&body=${body}`, '_blank');
                                }}
                              >
                                <FiFlag size={14} />
                              </FlagBtn>
                            </Tooltip>
                            <GhostBtn type="button" onClick={() => copyToClipboard(brandEmail, 'email')}>
                              {copiedField === 'email' ? 'Copied' : 'Copy'}
                            </GhostBtn>
                          </div>
                        </InfoRow>
                      </InfoBlock>

                      <PitchSection>
                        <PitchSectionLabel>Your pitch</PitchSectionLabel>
                        <ToneTabs style={{ background: 'rgba(255,255,255,0.7)' }}>
                          {['short', 'growing', 'founder'].map(tone => (
                            <ToneTab
                              key={tone}
                              $active={selectedTone === tone}
                              onClick={() => setSelectedTone(tone)}
                            >
                              {tone}
                            </ToneTab>
                          ))}
                        </ToneTabs>
                        <PitchCard style={{ background: '#fff', border: '1px solid #dbeafe' }}>
                          <PitchText style={{ maxHeight: 160 }}>
                            {packageData.package?.pitches?.[selectedTone]?.body_plain || 'Pitch loading...'}
                          </PitchText>
                          <PitchCopyBtn onClick={() => copyToClipboard(packageData.package?.pitches?.[selectedTone]?.body_plain, 'pitch')}>
                            {copiedField === 'pitch' ? <><FiCheck size={12} /> Copied!</> : <><FiCopy size={12} /> Copy pitch</>}
                          </PitchCopyBtn>
                        </PitchCard>
                      </PitchSection>

                      <InfoBlock>
                        <InfoLabel>What they often gift</InfoLabel>
                        <InfoValue>~${giftValue} avg gift</InfoValue>
                      </InfoBlock>

                      {formUrl && (
                        <FormApplySection>
                          <FormApplyTitle>Also has a PR / affiliate form</FormApplyTitle>
                          <FormApplyBody>
                            You can apply through their form too.
                          </FormApplyBody>
                        </FormApplySection>
                      )}

                      {(packageData.best_time?.day || packageData.best_time?.time_range) && (
                        <TipLine>
                          Best time: <b>{packageData.best_time?.day} {packageData.best_time?.time_range}</b>
                        </TipLine>
                      )}
                    </>
                  )}

                  {renderManagerMiniBand()}
                </OutreachContent>

                <OutreachFooter>
                  {isFormPackage ? (
                    <OutreachCTA onClick={handleOpenForm}>
                      Open PR / affiliate form
                    </OutreachCTA>
                  ) : (
                    <>
                      <OutreachCTA onClick={handleSend}>
                        {SEND_BUTTON.emailLabel}
                      </OutreachCTA>
                      {formUrl && (
                        <FormApplyCTA type="button" onClick={handleOpenForm}>
                          Apply via form
                        </FormApplyCTA>
                      )}
                    </>
                  )}
                  <BackButton type="button" onClick={() => setPhase(PHASE_MODAL)}>
                    ← Back to strategy
                  </BackButton>
                </OutreachFooter>
              </>
            )}

            {/* NEXT ACTIONS — value continues even if brand never replies */}
            {phase === PHASE_NEXT && packageData && (
              <NextActionsScreen
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <NextActionsHero>
                  <NextActionsBadge>
                    {isFormPackage ? '✓ Form opened' : '✓ Email opened'}
                  </NextActionsBadge>
                  <NextActionsTitle>{NEXT_ACTIONS.title}</NextActionsTitle>
                  <NextActionsSub>{NEXT_ACTIONS.subline}</NextActionsSub>
                </NextActionsHero>

                <NextActionsStack>
                  <NextActionPrimary>
                    <NextActionLabel>{NEXT_ACTIONS.opportunitiesTitle}</NextActionLabel>
                    <NextActionTip>{NEXT_ACTIONS.opportunitiesBody}</NextActionTip>
                    <NextActionBtn
                      type="button"
                      onClick={() => {
                        onOpenOpportunities?.();
                        onClose?.();
                      }}
                    >
                      {NEXT_ACTIONS.opportunitiesCta}
                    </NextActionBtn>
                  </NextActionPrimary>

                  {(packageData.status === 'not_yet' || packageData.status === 'almost') && (
                    <NextActionSecondary>
                      <NextActionLabel>{NEXT_ACTIONS.improveTitle}</NextActionLabel>
                      <NextActionTip>
                        {packageData.coaching?.action || packageData.coaching?.then_what || NEXT_ACTIONS.improveBody}
                      </NextActionTip>
                      <NextActionBtn
                        $secondary
                        type="button"
                        onClick={() => setPhase(PHASE_MODAL)}
                      >
                        {NEXT_ACTIONS.improveCta}
                      </NextActionBtn>
                    </NextActionSecondary>
                  )}

                  <NextActionSecondary>
                    <NextActionLabel>{NEXT_ACTIONS.anotherTitle}</NextActionLabel>
                    <NextActionTip>{NEXT_ACTIONS.anotherBody}</NextActionTip>
                    <NextActionBtn
                      $secondary
                      type="button"
                      onClick={() => finishAndClose(false)}
                    >
                      {NEXT_ACTIONS.anotherCta}
                    </NextActionBtn>
                  </NextActionSecondary>
                </NextActionsStack>

                <NextActionsFooter>
                  <NextActionsNote>{NEXT_ACTIONS.note}</NextActionsNote>
                  <NextActionLink
                    type="button"
                    onClick={() => finishAndClose(true)}
                  >
                    {NEXT_ACTIONS.pipelineCta}
                  </NextActionLink>
                </NextActionsFooter>
              </NextActionsScreen>
            )}
          </ModalBody>
        </Modal>
      </Overlay>
    </AnimatePresence>
  );
};

export default UnlockModalV2;
