import React, { useState, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';

// ============================================================================
// WELCOME TOUR - Premium post-onboarding experience
// Inspired by modern SaaS onboarding (Howl, Linear, Notion)
// ============================================================================

const TOTAL_STEPS = 8;

const LABELS = {
  1: 'Show me how',
  2: 'Next: outreach',
  3: 'Next: track deals',
  4: 'What brands look for',
  5: 'Check my feed quality',
  6: 'See real examples',
  7: 'Score my profile',
  8: "I'm ready to pitch",
};

const PHASES = {
  1: { part: 1, label: 'How it works' },
  2: { part: 1, label: 'How it works' },
  3: { part: 1, label: 'How it works' },
  4: { part: 1, label: 'How it works' },
  5: { part: 2, label: 'Are you pitch-ready?' },
  6: { part: 2, label: 'Are you pitch-ready?' },
  7: { part: 2, label: 'Are you pitch-ready?' },
  8: { part: 2, label: 'Are you pitch-ready?' },
};

// Floating logos removed for now

// Hero video URL from landing page
const HERO_VIDEO_URL = 'https://pub-528caee7e6db4ebc850280fe142043c7.r2.dev/prpack_newcollab%20(1).mp4';

// Feed quality example screenshot
const FEED_QUALITY_EXAMPLE = 'https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/ugc_example_4.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvdWdjX2V4YW1wbGVfNC5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg2MTI3Nzk1LCJleHAiOjE4MTc2NjM3OTV9.rZuoDfkH1Fcjfp_XMwZbUq16S3syzmfxo5aV2ZcnXOM';

// ============================================================================
// ANIMATIONS
// ============================================================================

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
`;

const typing = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`;

const pop = keyframes`
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
  min-height: 100dvh;
  overflow: hidden;

  @media (max-width: 520px) {
    padding: 0;
    align-items: flex-end;
  }
`;

const TourCard = styled.div`
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 600px;
  max-height: calc(100vh - 40px);
  animation: ${slideIn} 0.5s ease-out;

  @media (max-width: 520px) {
    border-radius: 24px 24px 0 0;
    min-height: 100vh;
    min-height: 100dvh;
    max-height: 100vh;
    max-height: 100dvh;
    max-width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

const Header = styled.div`
  padding: 20px 24px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: linear-gradient(180deg, #fff 0%, #fafafa 100%);
  border-bottom: 1px solid #f0f0f0;

  @media (max-width: 520px) {
    padding: calc(16px + env(safe-area-inset-top, 0)) 16px 10px;
    gap: 12px;
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  display: flex;
  gap: 4px;
`;

const ProgressSeg = styled.div`
  flex: 1;
  height: 4px;
  border-radius: 100px;
  background: #e5e7eb;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, #e8395f, #ff6b9d);
    transform-origin: left;
    transform: scaleX(${props => props.$done ? 1 : props.$active ? 0.5 : 0});
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const SkipBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 13px;
  color: #9ca3af;
  cursor: pointer;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 8px;
  font-family: inherit;
  transition: all 0.2s;

  &:hover {
    color: #4b5563;
    background: #f3f4f6;
  }
`;

const PhaseLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.1em;
  padding: 8px 24px 0;
  background: #fff;

  span {
    color: #e8395f;
  }

  @media (max-width: 520px) {
    padding: 8px 16px 0;
  }
`;

const BodyWrap = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const Step = styled.div`
  padding: 16px 28px 24px;
  display: ${props => props.$active ? 'flex' : 'none'};
  flex-direction: column;
  animation: ${props => props.$active ? fadeIn : 'none'} 0.4s ease-out;

  @media (max-width: 520px) {
    padding: 12px 16px 20px;
  }
`;

// Premium hero visual with depth
const HeroVisual = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  background: ${props => props.$bg};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%);
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.05) 100%);
  }

  @media (max-width: 520px) {
    height: 160px;
    margin-bottom: 16px;
    border-radius: 16px;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const HeroEmoji = styled.div`
  font-size: 64px;
  line-height: 1;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.15));
  animation: ${pulse} 2s ease-in-out infinite;
`;

// Video hero for step 1
const HeroVideoWrap = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  // Floating notification badges
  .notif {
    position: absolute;
    background: #fff;
    border-radius: 12px;
    padding: 8px 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    animation: ${slideIn} 0.5s ease-out;

    &.top-right {
      top: 12px;
      right: 12px;
      animation-delay: 0.3s;
    }

    &.bottom-left {
      bottom: 12px;
      left: 12px;
      animation-delay: 0.6s;
    }

    @media (max-width: 520px) {
      padding: 6px 10px;
      font-size: 10px;
      border-radius: 8px;

      &.top-right {
        top: 8px;
        right: 8px;
      }

      &.bottom-left {
        bottom: 8px;
        left: 8px;
      }
    }
  }

  .notif-icon {
    font-size: 14px;

    @media (max-width: 520px) {
      font-size: 12px;
    }
  }

  .notif-text {
    color: #111;
  }

  .notif-sub {
    color: #6b7280;
    font-weight: 500;
  }

  @media (max-width: 520px) {
    border-radius: 16px;
  }
`;

const StepTitle = styled.h2`
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  margin: 0 0 12px;
  color: #111;

  span {
    background: linear-gradient(135deg, #e8395f, #ff6b9d);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @media (max-width: 520px) {
    font-size: 22px;
    margin: 0 0 10px;
  }
`;

const StepBody = styled.p`
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 16px;

  strong {
    color: #374151;
    font-weight: 600;
  }

  @media (max-width: 520px) {
    font-size: 14px;
    margin: 0 0 12px;
  }
`;

// Premium mockup cards
const MockupCard = styled.div`
  width: 100%;
  max-width: 360px;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
  position: relative;

  @media (max-width: 520px) {
    max-width: 100%;
    padding: 12px;
    border-radius: 12px;
  }

  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 20px;
    right: 20px;
    height: 3px;
    background: linear-gradient(90deg, #e8395f, #ff6b9d, #e8395f);
    border-radius: 0 0 4px 4px;
  }
`;

const MockupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const MockupDots = styled.div`
  display: flex;
  gap: 6px;
`;

const MockupDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$color};
`;

const MockupTitle = styled.div`
  flex: 1;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-align: center;
`;

// Brand row in discover mockup
const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f9fafb;
  transition: all 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #fafafa;
    margin: 0 -8px;
    padding: 10px 8px;
    border-radius: 8px;
  }
`;

const BrandLogo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12px;
  color: ${props => props.$color || '#fff'};
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const BrandInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const BrandName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #111;
  margin-bottom: 2px;
`;

const BrandMeta = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const ReplyBadge = styled.div`
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  flex-shrink: 0;
`;

// AI Pitch mockup
const PitchMockup = styled.div`
  width: 100%;
  max-width: 340px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  position: relative;
`;

const PitchHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

const PitchAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e8395f, #ff6b9d);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
`;

const PitchMeta = styled.div`
  flex: 1;
`;

const PitchTo = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #111;
`;

const PitchSubject = styled.div`
  font-size: 11px;
  color: #9ca3af;
`;

const PitchBadge = styled.div`
  font-size: 10px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 6px;
  background: #ecfdf5;
  color: #059669;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PitchBody = styled.div`
  font-size: 13px;
  line-height: 1.6;
  color: #4b5563;

  p {
    margin: 0 0 8px;
  }

  .highlight {
    background: linear-gradient(135deg, rgba(232, 57, 95, 0.1), rgba(255, 107, 157, 0.1));
    padding: 2px 4px;
    border-radius: 4px;
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px 0;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #e8395f;
    animation: ${typing} 1.4s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
`;

// Inbox mockup
const InboxMockup = styled.div`
  width: 100%;
  max-width: 340px;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
`;

const InboxHeader = styled.div`
  background: linear-gradient(135deg, #111 0%, #1f2937 100%);
  padding: 16px 20px;
  color: #fff;
`;

const InboxTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const InboxSubtitle = styled.div`
  font-size: 12px;
  color: rgba(255,255,255,0.7);
  margin-top: 2px;
`;

const InboxList = styled.div`
  padding: 8px;
`;

const InboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }

  ${props => props.$highlight && css`
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.08));
    border: 1px solid rgba(16, 185, 129, 0.2);
  `}
`;

const InboxStatus = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
  ${props => props.$pulse && css`
    animation: ${pulse} 2s ease-in-out infinite;
  `}
`;

const InboxBrand = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #111;
`;

const InboxTag = styled.div`
  font-size: 12px;
  color: ${props => props.$color || '#6b7280'};
  font-weight: 500;
`;

// Profile carousel styles (premium TikTok-style)
const ProfileCarousel = styled.div`
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0 8px;
  margin: 0 -28px 12px;
  padding-left: 28px;
  padding-right: 28px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 520px) {
    margin: 0 -16px 12px;
    padding-left: 16px;
    padding-right: 16px;
    gap: 10px;
  }
`;

const ProfileCard = styled.div`
  background: linear-gradient(135deg, #fff 0%, #fafafa 100%);
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  flex: 0 0 280px;
  scroll-snap-align: start;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  }

  @media (max-width: 520px) {
    flex: 0 0 260px;
    padding: 12px;
    border-radius: 16px;
  }

  @media (max-width: 380px) {
    flex: 0 0 calc(100vw - 48px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #10b981, #059669);
  }
`;

const PcVerified = styled.span`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
  z-index: 2;
`;

const PcPlatform = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #111;
  background: #f3f4f6;
  padding: 4px 10px;
  border-radius: 100px;
  margin-bottom: 12px;
`;

const ProfileScreenshot = styled.div`
  width: 100%;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }

  @media (max-width: 520px) {
    height: 280px;
    border-radius: 10px;
  }
`;

const PcTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const PcTag = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${props =>
    props.$color === 'blue' ? '#dbeafe' :
    props.$color === 'pink' ? '#fce7f3' :
    props.$color === 'purple' ? '#f3e8ff' :
    '#d1fae5'};
  color: ${props =>
    props.$color === 'blue' ? '#1d4ed8' :
    props.$color === 'pink' ? '#be185d' :
    props.$color === 'purple' ? '#7c3aed' :
    '#047857'};
`;

const CarouselHint = styled.div`
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  margin-bottom: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &::after {
    content: '\\2192';
    animation: ${keyframes`
      0%, 100% { transform: translateX(0); }
      50% { transform: translateX(4px); }
    `} 1s ease-in-out infinite;
  }
`;

// Feed quality showcase
const FeedQualityShowcase = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 520px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const FeedExample = styled.div`
  flex: 1;
  border-radius: 16px;
  overflow: hidden;
  background: #f9fafb;
  border: 2px solid ${props => props.$good ? '#10b981' : '#ef4444'};
  position: relative;

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    object-position: top;
  }

  @media (max-width: 520px) {
    img {
      height: 160px;
    }
  }
`;

const FeedBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${props => props.$good ? '#10b981' : '#ef4444'};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
`;

const QualityChecklist = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    gap: 6px;
  }
`;

const QualityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: ${props => props.$good ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)'};
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.$good ? '#065f46' : '#991b1b'};

  @media (max-width: 520px) {
    padding: 8px 10px;
    font-size: 11px;
  }
`;

// Do/Don't grid
const DoDont = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 520px) {
    gap: 8px;
  }
`;

const DdCard = styled.div`
  padding: 14px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.5;
  background: ${props => props.$type === 'do' ?
    'linear-gradient(135deg, #d1fae5, #a7f3d0)' :
    'linear-gradient(135deg, #fee2e2, #fecaca)'};
  color: ${props => props.$type === 'do' ? '#065f46' : '#991b1b'};

  @media (max-width: 520px) {
    padding: 10px;
    font-size: 11px;
    border-radius: 10px;
  }
`;

const DdLbl = styled.div`
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Self-check checklist
const Checklist = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  @media (max-width: 520px) {
    gap: 6px;
    margin-bottom: 12px;
  }
`;

const ChecklistItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: ${props => props.$checked ?
    'linear-gradient(135deg, #d1fae5, #a7f3d0)' :
    '#f9fafb'};
  border: 1px solid ${props => props.$checked ? '#a7f3d0' : '#e5e7eb'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #374151;

  &:hover {
    border-color: ${props => props.$checked ? '#a7f3d0' : '#e8395f'};
    transform: translateX(2px);
  }

  strong {
    font-weight: 700;
    color: #111;
  }

  @media (max-width: 520px) {
    gap: 10px;
    padding: 10px 12px;
    font-size: 13px;
    border-radius: 10px;
  }
`;

const CiBox = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid ${props => props.$checked ? '#10b981' : '#d1d5db'};
  background: ${props => props.$checked ? '#10b981' : '#fff'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
`;

// Score card
const ScoreCard = styled.div`
  background: linear-gradient(135deg, #fce7f3 0%, #f3e8ff 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(232, 57, 95, 0.1);

  @media (max-width: 520px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const ScoreNum = styled.span`
  font-size: 48px;
  font-weight: 900;
  background: linear-gradient(135deg, #e8395f, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;

  @media (max-width: 520px) {
    font-size: 40px;
  }
`;

const ScoreTotal = styled.span`
  font-size: 24px;
  color: #9ca3af;
  font-weight: 700;
`;

const ScoreLbl = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
  font-weight: 600;
`;

// Success state
const SuccessState = styled.div`
  padding: 40px 28px 24px;
  text-align: center;
  display: ${props => props.$show ? 'flex' : 'none'};
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const SuccessEmoji = styled.div`
  font-size: 72px;
  margin-bottom: 20px;
  animation: ${pop} 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.3);
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.1));
`;

const Confetti = styled.div`
  position: absolute;
  font-size: 24px;
  animation: ${confetti} 2s ease-out forwards;
  animation-delay: ${props => props.$delay || 0}s;
  left: ${props => props.$left};
  top: 30%;
`;

// Footer
const Footer = styled.div`
  padding: 16px 24px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 520px) {
    padding: 12px 16px 20px;
    padding-bottom: max(20px, env(safe-area-inset-bottom));
    gap: 10px;
  }
`;

const NextBtn = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: linear-gradient(135deg, #e8395f 0%, #ff6b9d 100%);
  color: #fff;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: -0.01em;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(232, 57, 95, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(232, 57, 95, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: translateX(3px);
  }

  @media (max-width: 520px) {
    padding: 14px 16px;
    font-size: 15px;
    border-radius: 12px;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackBtn = styled.button`
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  font-size: 13px;
  visibility: ${props => props.$show ? 'visible' : 'hidden'};
  transition: all 0.2s;

  &:hover {
    color: #4b5563;
    background: #f3f4f6;
  }
`;

const StepCount = styled.span`
  color: #9ca3af;
  font-weight: 600;
  font-size: 13px;
`;

// ============================================================================
// REAL CREATOR PROFILES - Using TikTok screenshots
// Upload screenshots to R2 and update URLs below
// ============================================================================

// Real creator profile screenshots from Supabase
const PROFILE_EXAMPLES = [
  {
    name: 'Creator 1',
    handle: '@creator1',
    screenshot: 'https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/ugc_example_1.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvdWdjX2V4YW1wbGVfMS5QTkciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg2MTI1MjcyLCJleHAiOjE4MTc2NjEyNzJ9.IDWIY6Rn8JD8VTP8hYIihhbq3ih4Pb0hTH4lwnGPT1M',
    tags: [
      { text: 'Clear niche', color: 'green' },
      { text: 'UK based', color: 'blue' },
      { text: 'PR friendly', color: 'pink' },
      { text: 'Consistent', color: 'purple' },
    ],
  },
  {
    name: 'Creator 2',
    handle: '@creator2',
    screenshot: 'https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/ugc_example_2.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvdWdjX2V4YW1wbGVfMi5QTkciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg2MTI1Mjg3LCJleHAiOjE4MTc2NjEyODd9.rk7qwahtdbs7fxNCXlCCqZt8ZMTZyOqEQ9aGUtkEW-w',
    tags: [
      { text: 'Clear niche', color: 'green' },
      { text: 'Bio structured', color: 'blue' },
      { text: 'Email in bio', color: 'pink' },
      { text: 'Consistent', color: 'purple' },
    ],
  },
  {
    name: 'Creator 3',
    handle: '@creator3',
    screenshot: 'https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/ugc_example_3.PNG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvdWdjX2V4YW1wbGVfMy5QTkciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzg2MTI1MjkzLCJleHAiOjE4MTc2NjEyOTN9.3tDd7OJj_3DTE5sv02fT2rYWRW-Iq-XroaZWeIzF3DE',
    tags: [
      { text: 'UGC creator', color: 'green' },
      { text: 'Ireland', color: 'blue' },
      { text: 'Collabs open', color: 'pink' },
      { text: 'Active', color: 'purple' },
    ],
  },
];

const CHECKLIST_ITEMS = [
  { id: 1, text: '<strong>Clear niche</strong> in your bio (skincare, fashion, food...)' },
  { id: 2, text: '<strong>Public account</strong> with 500+ followers' },
  { id: 3, text: '<strong>3+ posts per week</strong>, active in last 14 days' },
  { id: 4, text: '<strong>Natural light</strong>, clear video and photo quality' },
  { id: 5, text: '<strong>3%+ engagement</strong> (likes ÷ followers on recent posts)' },
  { id: 6, text: '<strong>Contact email</strong> in bio or linktree' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function WelcomeTour({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [checkedItems, setCheckedItems] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  const handleNext = useCallback(() => {
    if (currentStep <= TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
      if (currentStep === TOTAL_STEPS) {
        setShowConfetti(true);
      }
    } else {
      localStorage.setItem('welcomeTourCompleted', 'true');
      if (onComplete) {
        onComplete();
      } else {
        navigate('/creator/dashboard/for-you');
      }
    }
  }, [currentStep, onComplete, navigate]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    if (window.confirm('Skip the tour? You can find it later in Settings.')) {
      localStorage.setItem('welcomeTourCompleted', 'true');
      if (onSkip) {
        onSkip();
      } else {
        navigate('/creator/dashboard/for-you');
      }
    }
  }, [onSkip, navigate]);

  const toggleCheck = useCallback((id) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const score = checkedItems.size;
  const scoreLabel = score === 0 ? 'Tap what applies to you' :
    score < 3 ? 'Focus on the essentials first' :
    score < 5 ? 'Almost there. A few gaps to close' :
    score === 5 ? 'You\'re pitch-ready' :
    'You\'re the ideal Newcollab creator';

  const isComplete = currentStep > TOTAL_STEPS;
  const phase = PHASES[currentStep] || PHASES[7];

  return (
    <Overlay>
      <TourCard role="dialog" aria-modal="true">
        {/* Header */}
        <Header>
          <ProgressBar>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <ProgressSeg
                key={i}
                $done={i + 1 < currentStep}
                $active={i + 1 === currentStep}
              />
            ))}
          </ProgressBar>
          <SkipBtn onClick={handleSkip}>Skip</SkipBtn>
        </Header>

        <PhaseLabel>
          {isComplete ? (
            <span>You're all set</span>
          ) : (
            <>Part {phase.part} · <span>{phase.label}</span></>
          )}
        </PhaseLabel>

        <BodyWrap style={{ display: isComplete ? 'none' : 'block' }}>
          {/* Step 1: Welcome */}
          <Step $active={currentStep === 1}>
            <HeroVisual $bg="#000" style={{ height: 220 }}>
              <HeroVideoWrap>
                <video
                  src={HERO_VIDEO_URL}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <div className="notif top-right">
                  <span className="notif-icon">✨</span>
                  <span className="notif-text">6 pitches sent today</span>
                </div>
                <div className="notif bottom-left">
                  <div>
                    <div className="notif-text">Package received!</div>
                    <div className="notif-sub">Rhode Skin — @carolstyle</div>
                  </div>
                </div>
              </HeroVideoWrap>
            </HeroVisual>
            <StepTitle>The professional toolkit to <span>land brand deals.</span></StepTitle>
            <StepBody>
              Not a lottery. Not a hype tool. A real 3-step system: <strong>discover brands, outreach professionally, land deals</strong>. Let's show you how.
            </StepBody>
          </Step>

          {/* Step 2: Discover */}
          <Step $active={currentStep === 2}>
            <HeroVisual $bg="linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)">
              <MockupCard>
                <MockupHeader>
                  <MockupDots>
                    <MockupDot $color="#ff5f57" />
                    <MockupDot $color="#febc2e" />
                    <MockupDot $color="#28c840" />
                  </MockupDots>
                  <MockupTitle>Brand Discovery</MockupTitle>
                  <div style={{ width: 50 }} />
                </MockupHeader>
                <BrandRow>
                  <BrandLogo $bg="#F5D0D0" $color="#000">G</BrandLogo>
                  <BrandInfo>
                    <BrandName>Glossier</BrandName>
                    <BrandMeta>Beauty · Ships worldwide</BrandMeta>
                  </BrandInfo>
                  <ReplyBadge>52% reply</ReplyBadge>
                </BrandRow>
                <BrandRow>
                  <BrandLogo $bg="#E8395F">R</BrandLogo>
                  <BrandInfo>
                    <BrandName>Rhode Skin</BrandName>
                    <BrandMeta>Skincare · US only</BrandMeta>
                  </BrandInfo>
                  <ReplyBadge>38% reply</ReplyBadge>
                </BrandRow>
                <BrandRow>
                  <BrandLogo $bg="#FFE066" $color="#000">DE</BrandLogo>
                  <BrandInfo>
                    <BrandName>Drunk Elephant</BrandName>
                    <BrandMeta>Skincare · Ships US, UK</BrandMeta>
                  </BrandInfo>
                  <ReplyBadge>45% reply</ReplyBadge>
                </BrandRow>
              </MockupCard>
            </HeroVisual>
            <StepTitle>1. Discover <span>2,000+ real brands.</span></StepTitle>
            <StepBody>
              Filter by niche, follower fit, and geo. See real reply rates and gift values before you pitch. <strong>No cold guessing.</strong>
            </StepBody>
          </Step>

          {/* Step 3: Outreach */}
          <Step $active={currentStep === 3}>
            <HeroVisual $bg="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)">
              <PitchMockup>
                <PitchHeader>
                  <PitchAvatar>Y</PitchAvatar>
                  <PitchMeta>
                    <PitchTo>To: Glossier PR Team</PitchTo>
                    <PitchSubject>Collab idea for Balm Dotcom</PitchSubject>
                  </PitchMeta>
                  <PitchBadge>
                    <span>✓</span> AI-crafted
                  </PitchBadge>
                </PitchHeader>
                <PitchBody>
                  <p>Hi Glossier team,</p>
                  <p>Quick content idea for your <span className="highlight">Balm Dotcom</span> if you're open.</p>
                  <p>I've been using the Cherry shade daily and my audience keeps asking about my lip routine...</p>
                  <TypingIndicator>
                    <span /><span /><span />
                  </TypingIndicator>
                </PitchBody>
              </PitchMockup>
            </HeroVisual>
            <StepTitle>2. Outreach <span>like a pro.</span></StepTitle>
            <StepBody>
              Pitches drafted for you, matched to each brand's tone. <strong>Edit one line to make it yours</strong>, hit send. Auto follow-ups included.
            </StepBody>
          </Step>

          {/* Step 4: Land deals */}
          <Step $active={currentStep === 4}>
            <HeroVisual $bg="linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)">
              <InboxMockup>
                <InboxHeader>
                  <InboxTitle>Your Pipeline</InboxTitle>
                  <InboxSubtitle>3 brands · 1 reply this week</InboxSubtitle>
                </InboxHeader>
                <InboxList>
                  <InboxRow $highlight>
                    <InboxStatus $color="#10b981" $pulse />
                    <InboxBrand>Glossier</InboxBrand>
                    <InboxTag $color="#10b981">Replied 🎉</InboxTag>
                  </InboxRow>
                  <InboxRow>
                    <InboxStatus $color="#fbbf24" />
                    <InboxBrand>Rhode Skin</InboxBrand>
                    <InboxTag>Waiting · 3 days</InboxTag>
                  </InboxRow>
                  <InboxRow>
                    <InboxStatus $color="#fbbf24" />
                    <InboxBrand>Drunk Elephant</InboxBrand>
                    <InboxTag>Waiting · 1 day</InboxTag>
                  </InboxRow>
                </InboxList>
              </InboxMockup>
            </HeroVisual>
            <StepTitle>3. Land deals, <span>track everything.</span></StepTitle>
            <StepBody>
              Watch replies land in one inbox. Brands respond in <strong>3-14 days</strong>. Some ignore, most take a week. Keep going.
            </StepBody>
          </Step>

          {/* Step 5: Transition */}
          <Step $active={currentStep === 5}>
            <HeroVisual $bg="linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)">
              <HeroContent>
                <HeroEmoji>👀</HeroEmoji>
              </HeroContent>
            </HeroVisual>
            <StepTitle>Now the honest part: <span>what brands actually check.</span></StepTitle>
            <StepBody>
              We don't sell miracles. We sell a professional toolkit for creators who are <strong>ready to be pitched</strong>. Here's what brands look for before they say yes.
            </StepBody>
          </Step>

          {/* Step 6: Feed Quality */}
          <Step $active={currentStep === 6}>
            <StepTitle style={{ fontSize: 22, marginBottom: 8 }}>Your content is <span>your portfolio.</span></StepTitle>
            <StepBody style={{ margin: '0 0 14px' }}>
              Brands scroll your feed before they reply. <strong>Quality beats quantity</strong> — here's what they're looking for.
            </StepBody>

            <FeedQualityShowcase>
              <FeedExample $good>
                <FeedBadge $good>✓ Gets replies</FeedBadge>
                <img
                  src={FEED_QUALITY_EXAMPLE}
                  alt="High quality content example"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;color:#10b981;text-align:center;padding:20px;background:#d1fae5;">
                        <div style="font-size:32px;margin-bottom:8px;">📸</div>
                        <div style="font-weight:600;">Quality content</div>
                      </div>
                    `;
                  }}
                />
              </FeedExample>
            </FeedQualityShowcase>

            <QualityChecklist>
              <QualityItem $good>✓ Well-lit, clear shots</QualityItem>
              <QualityItem $good>✓ Face visible (builds trust)</QualityItem>
              <QualityItem>✗ Blurry or dark content</QualityItem>
              <QualityItem>✗ Faceless/anonymous feeds</QualityItem>
              <QualityItem $good>✓ Real, authentic videos</QualityItem>
              <QualityItem>✗ Full AI-generated content</QualityItem>
            </QualityChecklist>
          </Step>

          {/* Step 7: Real examples */}
          <Step $active={currentStep === 7}>
            <StepTitle style={{ fontSize: 22, marginBottom: 8 }}>Real creators <span>brands say yes to.</span></StepTitle>
            <StepBody style={{ margin: '0 0 16px' }}>Study these profiles. See the pattern.</StepBody>

            <ProfileCarousel>
              {PROFILE_EXAMPLES.map((profile, idx) => (
                <ProfileCard key={idx}>
                  <PcVerified>✓ Pitch-ready</PcVerified>
                  <PcPlatform>🎵 TikTok</PcPlatform>
                  <ProfileScreenshot>
                    <img
                      src={profile.screenshot}
                      alt={`${profile.handle} TikTok profile`}
                      onError={(e) => {
                        // Fallback to placeholder if screenshot not uploaded yet
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#9ca3af;text-align:center;padding:20px;">
                            <div style="font-size:32px;margin-bottom:8px;">📸</div>
                            <div style="font-weight:600;">${profile.handle}</div>
                            <div style="font-size:11px;margin-top:4px;">Screenshot coming soon</div>
                          </div>
                        `;
                      }}
                    />
                  </ProfileScreenshot>
                  <PcTags>
                    {profile.tags.map((tag, i) => (
                      <PcTag key={i} $color={tag.color}>{tag.text}</PcTag>
                    ))}
                  </PcTags>
                </ProfileCard>
              ))}
            </ProfileCarousel>

            <CarouselHint>Swipe for more examples</CarouselHint>

            <DoDont>
              <DdCard $type="do">
                <DdLbl>✓ These work</DdLbl>
                Clear niche · Email in bio · Consistent aesthetic · Recent posts
              </DdCard>
              <DdCard $type="dont">
                <DdLbl>✗ Auto-reject</DdLbl>
                Private · No niche · &lt;500 followers · Personal-only feed
              </DdCard>
            </DoDont>
          </Step>

          {/* Step 8: Self-check */}
          <Step $active={currentStep === 8}>
            <StepBody style={{ margin: '0 0 16px' }}>
              <strong>Score yourself.</strong> If you check 5 or more, you're pitch-ready. If not, focus on those first.
            </StepBody>

            <Checklist>
              {CHECKLIST_ITEMS.map((item) => (
                <ChecklistItem
                  key={item.id}
                  $checked={checkedItems.has(item.id)}
                  onClick={() => toggleCheck(item.id)}
                >
                  <CiBox $checked={checkedItems.has(item.id)}>✓</CiBox>
                  <div dangerouslySetInnerHTML={{ __html: item.text }} />
                </ChecklistItem>
              ))}
            </Checklist>

            <ScoreCard>
              <div>
                <ScoreNum>{score}</ScoreNum>
                <ScoreTotal>/6</ScoreTotal>
              </div>
              <ScoreLbl>{score >= 5 ? '🎯 ' : score === 6 ? '💯 ' : ''}{scoreLabel}</ScoreLbl>
            </ScoreCard>
          </Step>
        </BodyWrap>

        {/* Success State */}
        <SuccessState $show={isComplete}>
          {showConfetti && (
            <>
              <Confetti $delay={0} $left="20%">🎉</Confetti>
              <Confetti $delay={0.1} $left="40%">✨</Confetti>
              <Confetti $delay={0.2} $left="60%">🎊</Confetti>
              <Confetti $delay={0.3} $left="80%">🌟</Confetti>
            </>
          )}
          <SuccessEmoji>🚀</SuccessEmoji>
          <StepTitle style={{ textAlign: 'center' }}>You know how it <span>works.</span></StepTitle>
          <StepBody style={{ textAlign: 'center', maxWidth: 340 }}>
            Now let's find brands that fit your niche. Your <strong>first match is waiting</strong>. They're actively replying to Newcollab creators this week.
          </StepBody>
        </SuccessState>

        {/* Footer */}
        <Footer>
          <NextBtn onClick={handleNext}>
            <span>{isComplete ? 'Start exploring brands' : LABELS[currentStep]}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NextBtn>
          <FooterLinks>
            <BackBtn $show={currentStep > 1 && !isComplete} onClick={handleBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back
            </BackBtn>
            <StepCount>
              {isComplete ? 'Complete' : `${currentStep} of ${TOTAL_STEPS}`}
            </StepCount>
          </FooterLinks>
        </Footer>
      </TourCard>
    </Overlay>
  );
}
