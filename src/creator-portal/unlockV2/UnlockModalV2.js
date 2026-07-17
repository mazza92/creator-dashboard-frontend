import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronDown, FiChevronUp, FiCopy, FiCheck } from 'react-icons/fi';
import { message } from 'antd';

import LootBoxLoading from './LootBoxLoading';
import CompletionFlash from './CompletionFlash';
import { LOADING, TOKENS, MENTOR_VERDICTS, MENTOR_SECTIONS, SEND_BUTTON, NEXT_ACTIONS } from './copyDictionary';
import { apiClient } from '../../config/api';
import UpgradeModal from '../UpgradeModal';

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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: #fff;
  border-radius: 26px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 46px rgba(0, 0, 0, 0.14);
`;

const Header = styled.div`
  padding: ${p => (p.$minimal ? '10px 12px 6px' : '12px 16px 10px')};
  display: flex;
  align-items: center;
  justify-content: ${p => (p.$minimal ? 'flex-end' : 'flex-start')};
  gap: 8px;
  border-bottom: ${p => (p.$minimal ? 'none' : '1px solid #ececef')};
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
  padding: 28px 20px 24px;
  background: #fff;
  text-align: center;
  border-bottom: 1px solid #f4f4f6;
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
    case 'ready': return '#22c55e';      // Top Match - green
    case 'almost': return '#22c55e';     // Good Match - green (still pitch today)
    case 'not_yet': return '#eab308';    // Growth Match - amber
    case 'poor_fit': return '#eab308';   // Stretch Match - amber (not red!)
    case 'build_first': return '#f97316'; // Low Priority - orange
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
  padding: 0 20px;
  background: #fff;
`;

const MentorSection = styled.div`
  padding: 18px 0;
  border-bottom: 1px solid #f4f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionLabel = styled.div`
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
  background: ${TOKENS.mentorBg};
  border-radius: 12px;
  padding: 16px;
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
  padding: 14px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f2;
`;

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const PlatformIcon = styled.span`
  font-size: 14px;
  opacity: 0.7;
`;

const ProfileHandle = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${TOKENS.mentorTextPrimary};
`;

const ProfileDivider = styled.span`
  color: #d1d5db;
  font-size: 11px;
`;

const ProfileFollowers = styled.span`
  font-size: 12px;
  color: ${TOKENS.mentorTextSecondary};
`;

const ProfileNiches = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
`;

const NicheTag = styled.span`
  padding: 3px 8px;
  background: #f3f4f6;
  border-radius: 12px;
  font-size: 11px;
  color: #4b5563;
  font-weight: 500;
`;

const ProfileBio = styled.div`
  font-size: 12px;
  color: ${TOKENS.mentorTextSecondary};
  line-height: 1.4;
  margin-bottom: 10px;
`;

const ProfileThumbnails = styled.div`
  display: flex;
  gap: 6px;
`;

const ProfileThumb = styled.div`
  width: 52px;
  height: 52px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  margin: 16px 20px 22px;
  background: #15161a;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 14px 0;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-align: center;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  flex-shrink: 0;

  &:hover {
    background: #2a2b30;
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
  padding: 0 20px;
  background: #fff;
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
  background: linear-gradient(135deg, #15161a 0%, #2a2b30 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px 0;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
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

  const handleFlashComplete = useCallback(() => {
    setPhase(PHASE_MODAL);
  }, []);

  // Handle upgrade to Pro via Stripe checkout
  const handleUpgradeClick = async () => {
    try {
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
  const handleSend = async () => {
    if (!packageData?.package?.pitches) return;

    const pitch = packageData.package.pitches[selectedTone];
    const brandEmail = packageData.brand_email || packageData.contact?.email;
    const subject = pitch?.subject || '';
    const body = pitch?.body_plain || '';

    // Copy body to clipboard
    await copyToClipboard(body, 'pitch');

    // Open email client with auto BCC for tracking
    const mailtoUrl = `mailto:${brandEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}&bcc=creators@newcollab.co`;
    window.location.href = mailtoUrl;

    // Record pitch but keep modal open for next actions (silence workaround)
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
          {(phase === PHASE_OUTREACH || phase === PHASE_NEXT) ? (
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
                <BrandCategory>{brandCategory}</BrandCategory>
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
                  // Use proper UpgradeModal for paywall
                  <UpgradeModal
                    isOpen={true}
                    onClose={onClose}
                    feature="unlock_paywall"
                    currentCount={5}
                    limit={5}
                  />
                ) : error ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
                    <div style={{ fontWeight: 700, marginBottom: '8px' }}>Something went wrong</div>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>{error}</div>
                  </div>
                ) : packageData && (
                  <>
                    {/* Profile Snapshot - Shows real scraped data */}
                    {packageData.profile_snapshot && (
                      <ProfileSnapshot>
                        <ProfileRow>
                          <PlatformIcon>
                            {packageData.profile_snapshot.platform === 'tiktok' ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                              </svg>
                            ) : packageData.profile_snapshot.platform === 'youtube' ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF0000">
                                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                              </svg>
                            )}
                          </PlatformIcon>
                          <ProfileHandle>@{packageData.profile_snapshot.handle}</ProfileHandle>
                          <ProfileDivider>|</ProfileDivider>
                          <ProfileFollowers>
                            {(packageData.profile_snapshot.follower_count || 0).toLocaleString()} followers
                          </ProfileFollowers>
                        </ProfileRow>
                        {(packageData.profile_snapshot.niches?.length > 0 || packageData.profile_snapshot.niche) && (
                          <ProfileNiches>
                            {packageData.profile_snapshot.niches?.length > 0
                              ? packageData.profile_snapshot.niches.map((niche, i) => (
                                  <NicheTag key={i}>{niche}</NicheTag>
                                ))
                              : <NicheTag>{packageData.profile_snapshot.niche}</NicheTag>
                            }
                          </ProfileNiches>
                        )}
                        {packageData.profile_snapshot.bio && (
                          <ProfileBio>
                            {packageData.profile_snapshot.bio}
                            {packageData.profile_snapshot.bio.length >= 140 && '...'}
                          </ProfileBio>
                        )}
                        {packageData.profile_snapshot.recent_thumbnails?.length > 0 && (
                          <ProfileThumbnails>
                            {packageData.profile_snapshot.recent_thumbnails.map((url, i) => (
                              <ProfileThumb key={i}>
                                <img src={url} alt={`Post ${i + 1}`} />
                              </ProfileThumb>
                            ))}
                          </ProfileThumbnails>
                        )}
                      </ProfileSnapshot>
                    )}

                    {/* Mentor Verdict Hero */}
                    <VerdictHero>
                      {/* Confidence Stars - uses deterministic fit_score */}
                      {(() => {
                        const status = packageData.status || 'almost';
                        const fitScore = packageData.fit_score;
                        const verdict = MENTOR_VERDICTS[status] || MENTOR_VERDICTS.almost;
                        const starColor = getConfidenceColor(status);
                        // Use deterministic stars from fit_score, or fallback to verdict
                        const filledStars = fitScore?.stars || verdict.confidenceStars || 3;
                        const label = fitScore?.label || verdict.confidenceLabel || 'Good Fit';

                        return (
                          <ConfidenceIndicator>
                            <ConfidenceStars>
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} $filled={star <= filledStars} $color={starColor}>
                                  ★
                                </Star>
                              ))}
                            </ConfidenceStars>
                            <ConfidenceLabel $color={starColor}>
                              {label}
                            </ConfidenceLabel>
                          </ConfidenceIndicator>
                        );
                      })()}

                      {/* Sub-scores breakdown - shows WHY the score is what it is */}
                      {packageData.fit_score?.sub_scores && (
                        <SubScoresContainer>
                          <SubScoreItem>
                            <SubScoreLabel>Niche</SubScoreLabel>
                            <SubScoreValue>
                              <SubScoreBar>
                                <SubScoreBarFill $value={packageData.fit_score.sub_scores.niche} />
                              </SubScoreBar>
                              <SubScorePercent $value={packageData.fit_score.sub_scores.niche}>
                                {packageData.fit_score.sub_scores.niche}%
                              </SubScorePercent>
                            </SubScoreValue>
                          </SubScoreItem>
                          <SubScoreItem>
                            <SubScoreLabel>Content</SubScoreLabel>
                            <SubScoreValue>
                              <SubScoreBar>
                                <SubScoreBarFill $value={packageData.fit_score.sub_scores.content} />
                              </SubScoreBar>
                              <SubScorePercent $value={packageData.fit_score.sub_scores.content}>
                                {packageData.fit_score.sub_scores.content}%
                              </SubScorePercent>
                            </SubScoreValue>
                          </SubScoreItem>
                          <SubScoreItem>
                            <SubScoreLabel>Engagement</SubScoreLabel>
                            <SubScoreValue>
                              <SubScoreBar>
                                <SubScoreBarFill $value={packageData.fit_score.sub_scores.engagement} />
                              </SubScoreBar>
                              <SubScorePercent $value={packageData.fit_score.sub_scores.engagement}>
                                {packageData.fit_score.sub_scores.engagement}%
                              </SubScorePercent>
                            </SubScoreValue>
                          </SubScoreItem>
                          <SubScoreItem>
                            <SubScoreLabel>Consistency</SubScoreLabel>
                            <SubScoreValue>
                              <SubScoreBar>
                                <SubScoreBarFill $value={packageData.fit_score.sub_scores.consistency} />
                              </SubScoreBar>
                              <SubScorePercent $value={packageData.fit_score.sub_scores.consistency}>
                                {packageData.fit_score.sub_scores.consistency}%
                              </SubScorePercent>
                            </SubScoreValue>
                          </SubScoreItem>
                        </SubScoresContainer>
                      )}

                      <CoachNote>
                        {packageData.is_coaching && packageData.coaching?.coach_note
                          ? packageData.coaching.coach_note
                          : packageData.verdict?.headline || `You can pitch ${brandName} today.`}
                      </CoachNote>
                      <VerdictPill $color={packageData.mentor_verdict?.pillColor || packageData.verdict?.pill_color || 'green'}>
                        <VerdictDot />
                        {packageData.is_coaching
                          ? packageData.mentor_verdict?.pill
                          : packageData.verdict?.verdict_pill || 'Ready for outreach'}
                      </VerdictPill>
                    </VerdictHero>

                    {/* Mentor Sections - only show if coaching mode */}
                    {packageData.is_coaching && packageData.coaching ? (
                      <MentorContent>
                        {/* What Brand Will Notice / Lower Priority */}
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
                          <ObservationText>
                            {packageData.coaching.observation}
                          </ObservationText>
                          {packageData.coaching.why_it_matters && (
                            <WhyItMatters>
                              {packageData.coaching.why_it_matters}
                            </WhyItMatters>
                          )}
                        </MentorSection>

                        {/* Increase Reply Chance */}
                        {packageData.status !== 'ready' && (
                          <MentorSection>
                            <SectionLabel>
                              <SectionIcon>{MENTOR_SECTIONS.increaseReplyChance.icon}</SectionIcon>
                              {MENTOR_SECTIONS.increaseReplyChance.label}
                            </SectionLabel>
                            <NextMoveCard>
                              <NextMoveAction>
                                {packageData.coaching.action}
                              </NextMoveAction>
                              {packageData.coaching.reasoning && (
                                <NextMoveReasoning>
                                  {packageData.coaching.reasoning}
                                </NextMoveReasoning>
                              )}
                              {packageData.coaching.then_what && (
                                <ThenWhat>
                                  {packageData.coaching.then_what}
                                </ThenWhat>
                              )}
                            </NextMoveCard>
                          </MentorSection>
                        )}
                      </MentorContent>
                    ) : (
                      /* Legacy mode - show reasons and quick win as before */
                      <MentorContent>
                        <MentorSection>
                          <SectionLabel>
                            <SectionIcon>
                              {['poor_fit', 'build_first'].includes(packageData.status) ? MENTOR_SECTIONS.lowerPriority.icon : '✅'}
                            </SectionIcon>
                            {['poor_fit', 'build_first'].includes(packageData.status)
                              ? MENTOR_SECTIONS.lowerPriority.label
                              : `What ${brandName} Will Notice`}
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
                              <SectionIcon>🎯</SectionIcon>
                              Do this first
                            </SectionLabel>
                            <NextMoveCard>
                              <NextMoveAction>
                                {packageData.quick_win.emoji} {packageData.quick_win.action_title}
                              </NextMoveAction>
                              <NextMoveReasoning>
                                {packageData.quick_win.note}
                              </NextMoveReasoning>
                              <ThenWhat>
                                {packageData.quick_win.gain_pill}
                              </ThenWhat>
                            </NextMoveCard>
                          </MentorSection>
                        )}
                      </MentorContent>
                    )}

                    {/* Low Follower Mode: Show UGC Guide and Pool CTA */}
                    {packageData.is_low_follower && packageData.ugc_guide ? (
                      <>
                        <UGCGuideContainer>
                          <UGCGuideTitle>
                            {packageData.ugc_guide.title}
                          </UGCGuideTitle>
                          <UGCGuideIntro>
                            {packageData.ugc_guide.intro}
                          </UGCGuideIntro>
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
                        <PoolCTADescription>
                          {packageData.ugc_guide.pool_cta.description}
                        </PoolCTADescription>
                      </>
                    ) : (
                      <>
                        {/* For poor_fit ONLY: Show alternative brands (niche mismatch = try different brands) */}
                        {packageData.status === 'poor_fit' && packageData.better_matches?.length > 0 && (
                          <>
                            <BetterMatchesSection>
                              <BetterMatchesTitle>
                                <span>✨</span> Try these instead
                              </BetterMatchesTitle>
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
                                    <BetterMatchFit $status={match.fit_status}>
                                      {match.fit_emoji} {match.fit_label}
                                    </BetterMatchFit>
                                  </BetterMatchCard>
                                ))}
                              </BetterMatchesList>
                            </BetterMatchesSection>

                            <AlternativeCTA onClick={() => {
                              const bestMatch = packageData.better_matches[0];
                              if (bestMatch) {
                                window.location.href = `/creator/dashboard/pr-brands?brand=${bestMatch.slug}`;
                              }
                            }}>
                              Pitch {packageData.better_matches[0]?.brand_name} Instead →
                            </AlternativeCTA>

                            <SecondaryAction onClick={handleSend}>
                              ✉️ Still Pitch {brandName}
                            </SecondaryAction>
                          </>
                        )}

                        {/* For not_yet (Growth Match): Encourage pitching but highlight improvement opportunity */}
                        {packageData.status === 'not_yet' && (
                          <>
                            <SendButton onClick={handleSend} style={{ background: '#eab308' }}>
                              {SEND_BUTTON.labelTemplate(brandName)}
                            </SendButton>
                            <div style={{
                              textAlign: 'center',
                              fontSize: '12px',
                              color: '#6b7280',
                              marginTop: '8px'
                            }}>
                              ⭐ Improve the above first for higher reply chance
                            </div>
                          </>
                        )}

                        {/* For ready/almost OR poor_fit with no alternatives: Show pitch CTA (no accordion) */}
                        {(!['poor_fit', 'not_yet'].includes(packageData.status) || (packageData.status === 'poor_fit' && !packageData.better_matches?.length)) && (
                          <>
                            {/* Clean pitch button - transitions to outreach screen */}
                            <SendButton onClick={() => setPhase(PHASE_OUTREACH)}>
                              {SEND_BUTTON.labelTemplate(brandName)}
                            </SendButton>

                            {/* For ready/almost: Show more brands at bottom to keep momentum */}
                            {packageData.better_matches?.length > 0 && (
                              <BetterMatchesSection style={{ marginTop: '8px' }}>
                                <BetterMatchesTitle>
                                  <span>🚀</span> More brands for you
                                </BetterMatchesTitle>
                                <BetterMatchesList>
                                  {packageData.better_matches.map((match) => (
                                    <BetterMatchCard
                                      key={match.id}
                                      onClick={() => {
                                        window.location.href = `/creator/dashboard/pr-brands?brand=${match.slug}`;
                                      }}
                                    >
                                      <BetterMatchLogo>
                                        {match.logo ? (
                                          <img src={match.logo} alt={match.brand_name} />
                                        ) : (
                                          match.brand_name?.substring(0, 2).toUpperCase()
                                        )}
                                      </BetterMatchLogo>
                                      <BetterMatchInfo>
                                        <BetterMatchName>{match.brand_name}</BetterMatchName>
                                        <BetterMatchCategory>{match.category}</BetterMatchCategory>
                                      </BetterMatchInfo>
                                      <BetterMatchFit $status={match.fit_status}>
                                        {match.fit_emoji} {match.fit_label}
                                      </BetterMatchFit>
                                    </BetterMatchCard>
                                  ))}
                                </BetterMatchesList>
                              </BetterMatchesSection>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {/* OUTREACH SCREEN - Shown after clicking Pitch button */}
            {phase === PHASE_OUTREACH && packageData && (
              <OutreachScreen
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header with brand logo */}
                <OutreachHeader>
                  <OutreachBrandLogo>
                    {brand?.logo ? (
                      <img src={brand.logo} alt={brandName} />
                    ) : (
                      brandName?.substring(0, 2).toUpperCase()
                    )}
                  </OutreachBrandLogo>
                  <OutreachHeaderText>
                    <OutreachTitle>Pitch {brandName}</OutreachTitle>
                    <OutreachSubtitle>Everything ready to send</OutreachSubtitle>
                  </OutreachHeaderText>
                </OutreachHeader>

                <OutreachContent>
                  {/* Contact Section */}
                  <OutreachSection>
                    <OutreachSectionLabel>
                      <OutreachSectionIcon>📧</OutreachSectionIcon>
                      {packageData.contact?.verified ? 'Verified Contact' : 'Contact'}
                    </OutreachSectionLabel>
                    <ContactDisplay>
                      <ContactEmail>
                        {packageData.contact?.email || packageData.brand_email}
                      </ContactEmail>
                      <ContactCopyBtn onClick={() => copyToClipboard(packageData.contact?.email || packageData.brand_email, 'email')}>
                        {copiedField === 'email' ? <><FiCheck size={12} /> Copied</> : 'Copy'}
                      </ContactCopyBtn>
                    </ContactDisplay>
                  </OutreachSection>

                  {/* Pitch Section */}
                  <OutreachSection>
                    <OutreachSectionLabel>
                      <OutreachSectionIcon>✍️</OutreachSectionIcon>
                      Your Pitch
                    </OutreachSectionLabel>
                    <ToneTabs>
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
                    <PitchCard>
                      <PitchText>
                        {packageData.package?.pitches?.[selectedTone]?.body_plain || 'Pitch loading...'}
                      </PitchText>
                      <PitchCopyBtn onClick={() => copyToClipboard(packageData.package?.pitches?.[selectedTone]?.body_plain, 'pitch')}>
                        {copiedField === 'pitch' ? <><FiCheck size={12} /> Copied!</> : <><FiCopy size={12} /> Copy pitch</>}
                      </PitchCopyBtn>
                    </PitchCard>
                  </OutreachSection>

                  {/* Timing Section */}
                  <OutreachSection>
                    <OutreachSectionLabel>
                      <OutreachSectionIcon>⏰</OutreachSectionIcon>
                      Best Time to Send
                    </OutreachSectionLabel>
                    <TimingCard>
                      <TimingIcon>
                        {packageData.best_time?.emoji_flame ? '🔥' : '📅'}
                      </TimingIcon>
                      <TimingInfo>
                        <TimingPrimary>{packageData.best_time?.day}</TimingPrimary>
                        <TimingSecondary>{packageData.best_time?.time_range}</TimingSecondary>
                      </TimingInfo>
                    </TimingCard>
                  </OutreachSection>
                </OutreachContent>

                <OutreachFooter>
                  <OutreachCTA onClick={handleSend}>
                    Open Email →
                  </OutreachCTA>
                  <BackButton onClick={() => setPhase(PHASE_MODAL)}>
                    ← Back to strategy
                  </BackButton>
                </OutreachFooter>
              </OutreachScreen>
            )}

            {/* NEXT ACTIONS — value continues even if brand never replies */}
            {phase === PHASE_NEXT && packageData && (
              <NextActionsScreen
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <NextActionsHero>
                  <NextActionsBadge>✓ Email opened</NextActionsBadge>
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
