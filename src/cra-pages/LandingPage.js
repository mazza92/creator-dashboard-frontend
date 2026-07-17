import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { Helmet } from 'react-helmet-async';
import {
  FiSearch,
  FiFileText,
  FiEdit3,
  FiBarChart2,
  FiGift
} from 'react-icons/fi';
import { FaLinkedin, FaInstagram } from 'react-icons/fa';
import { FaTiktok, FaXTwitter } from 'react-icons/fa6';

// ═══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════
const colors = {
  rose: '#E11D48',
  roseLight: '#FFF1F3',
  roseMid: '#FDA4AF',
  violet: '#7C3AED',
  green: '#059669',
  greenLight: '#ECFDF5',
  greenMid: '#6EE7B7',
  amber: '#D97706',
  black: '#0F0F0F',
  bg: '#FAFAF9',
  white: '#FFFFFF',
  border: '#EBEBEB',
  text: '#0F0F0F',
  text2: '#4A4A4A',
  text3: '#8A8A8A',
};

const shadows = {
  sm: '0 1px 4px rgba(0,0,0,.05), 0 4px 16px rgba(0,0,0,.06)',
  lg: '0 8px 40px rgba(0,0,0,.10)',
};

// ═══════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════
const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const ticker = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

const slideIn = keyframes`
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// ═══════════════════════════════════════════════════════════════════
// BASE COMPONENTS
// ═══════════════════════════════════════════════════════════════════
const PageContainer = styled.div`
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: ${colors.bg};
  color: ${colors.text};
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const ContainerSm = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: 0 24px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const SectionCenter = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${colors.text3};
  margin-bottom: 16px;
`;

const EyebrowDot = styled.div`
  width: 6px;
  height: 6px;
  background: ${colors.rose};
  border-radius: 50%;
`;

const BtnBlack = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${colors.black};
  color: ${colors.white};
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #1a1a1a;
    transform: translateY(-1px);
  }
`;

const BtnOutline = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  color: ${colors.text};
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  border: 1.5px solid ${colors.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.black};
  }
`;

const BtnRose = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${colors.rose};
  color: ${colors.white};
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #BE123C;
    transform: translateY(-1px);
  }
`;

const TagPro = styled.span`
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, ${colors.rose}, ${colors.violet});
  color: ${colors.white};
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 20px;
  margin-left: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ═══════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════
const HeroSection = styled.section`
  padding: 100px 0 60px;
  background: ${colors.bg};
  position: relative;
  overflow: hidden;

  @media (max-width: 800px) {
    padding: 80px 0 40px;
  }
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const HeroText = styled.div`
  @media (max-width: 800px) {
    text-align: center;
    order: 2;
  }
`;

const HeroH1 = styled.h1`
  font-size: clamp(36px, 5vw, 52px);
  font-weight: 800;
  line-height: 1.1;
  color: ${colors.text};
  margin: 0 0 24px;

  em {
    font-style: italic;
    color: ${colors.rose};
  }
`;

const HeroSubline = styled.p`
  font-size: 18px;
  color: ${colors.text2};
  line-height: 1.6;
  margin: 0 0 32px;
  max-width: 480px;

  @media (max-width: 800px) {
    margin: 0 auto 32px;
  }
`;

const HeroCTARow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;

  @media (max-width: 800px) {
    justify-content: center;
  }
`;

const HeroProof = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: ${colors.text3};

  @media (max-width: 800px) {
    justify-content: center;
  }
`;

const AvatarStack = styled.div`
  display: flex;

  div {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid ${colors.white};
    margin-left: -8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: ${colors.white};

    &:first-child {
      margin-left: 0;
    }
  }
`;

const HeroVisual = styled.div`
  position: relative;

  @media (max-width: 800px) {
    order: 1;
  }
`;

const HeroGifWrap = styled.div`
  position: relative;
  border-radius: 16px;
  box-shadow: ${shadows.lg};
  background: ${colors.white};

  video, img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 16px;
  }
`;

const FloatingBadge = styled.div`
  position: absolute;
  background: ${colors.white};
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: ${shadows.sm};
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${float} 3s ease-in-out infinite;
  z-index: 10;

  &.bottom-left {
    bottom: 12px;
    left: 10px;
    animation-delay: 0s;
  }

  &.top-right {
    top: 12px;
    right: 10px;
    animation-delay: 1.5s;
  }

  @media (max-width: 480px) {
    padding: 8px 10px;
    font-size: 11px;
    gap: 6px;
    border-radius: 10px;
  }
`;

// ═══════════════════════════════════════════════════════════════════
// TICKER SECTION
// ═══════════════════════════════════════════════════════════════════
const TickerSection = styled.section`
  background: ${colors.black};
  padding: 14px 0;
  overflow: hidden;
`;

const TickerInner = styled.div`
  display: flex;
  animation: ${ticker} 35s linear infinite;
  width: max-content;
`;

const TickerItem = styled.span`
  color: ${colors.white};
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  padding: 0 32px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::after {
    content: '·';
    margin-left: 32px;
    color: ${colors.text3};
  }
`;

// ═══════════════════════════════════════════════════════════════════
// CLARITY STRIP
// ═══════════════════════════════════════════════════════════════════
const ClaritySection = styled.section`
  padding: 60px 0;
  background: ${colors.white};
`;

const ClarityGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 580px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
`;

const ClarityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: ${colors.bg};
  border-radius: 12px;
  min-width: 200px;

  @media (max-width: 580px) {
    min-width: auto;
    flex-direction: column;
    text-align: center;
    padding: 20px 16px;
  }
`;

const ClarityIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${colors.text};
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;

const ClarityText = styled.div`
  .label {
    font-size: 14px;
    font-weight: 700;
    color: ${colors.text};
    margin-bottom: 2px;
  }

  .sub {
    font-size: 12px;
    color: ${colors.text3};
  }
`;

const ClarityArrow = styled.div`
  font-size: 18px;
  color: ${colors.border};

  @media (max-width: 580px) {
    display: none;
  }
`;

// ═══════════════════════════════════════════════════════════════════
// PROBLEM SECTION
// ═══════════════════════════════════════════════════════════════════
const ProblemSection = styled.section`
  padding: 80px 0;
  background: ${colors.bg};
`;

const ProblemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const ProblemCard = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 28px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.sm};
  }

  .headline {
    font-size: 17px;
    font-weight: 700;
    color: ${colors.text};
    margin-bottom: 10px;
    line-height: 1.4;
  }

  .body {
    font-size: 14px;
    color: ${colors.text2};
    line-height: 1.6;
  }
`;

const ProblemCTA = styled.div`
  background: ${colors.black};
  border-radius: 16px;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;

  .text {
    font-size: 17px;
    font-weight: 700;
    color: ${colors.white};
  }

  @media (max-width: 560px) {
    flex-direction: column;
    text-align: center;
  }
`;

// ═══════════════════════════════════════════════════════════════════
// SOLUTION FLOW (DARK SECTION)
// ═══════════════════════════════════════════════════════════════════
const SolutionSection = styled.section`
  padding: 80px 0;
  background: ${colors.black};
`;

const SolutionGrid = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  scroll-snap-type: x mandatory;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.3);
    border-radius: 3px;
  }
`;

const SolutionStep = styled.div`
  flex: 0 0 200px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 24px;
  scroll-snap-align: start;
  position: relative;

  .step-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.$iconBg || 'rgba(255,255,255,0.1)'};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    position: relative;

    svg {
      font-size: 22px;
      color: ${colors.white};
    }
  }

  .step-num {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 22px;
    height: 22px;
    background: ${colors.rose};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 800;
    color: ${colors.white};
  }

  .step-title {
    font-size: 15px;
    font-weight: 700;
    color: ${colors.white};
    margin-bottom: 8px;
  }

  .step-body {
    font-size: 13px;
    color: rgba(255,255,255,0.6);
    line-height: 1.5;
  }
`;

// ═══════════════════════════════════════════════════════════════════
// BRAND DIRECTORY
// ═══════════════════════════════════════════════════════════════════
const DirectorySection = styled.section`
  padding: 80px 0;
  background: ${colors.bg};
`;

const DirectoryBox = styled.div`
  background: ${colors.white};
  border-radius: 20px;
  padding: 32px;
  box-shadow: ${shadows.sm};
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const FilterTab = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${colors.border};
  background: ${props => props.$active ? colors.black : colors.white};
  color: ${props => props.$active ? colors.white : colors.text2};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${colors.black};
  }
`;

const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 680px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const BrandCard = styled.div`
  background: ${colors.bg};
  border: 1px solid ${colors.border};
  border-radius: 14px;
  padding: 20px;
  transition: all 0.2s ease;
  display: ${props => props.$hidden ? 'none' : 'block'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${shadows.sm};
  }
`;

const BrandLogoBlock = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${props => (props.$isImage ? colors.white : (props.$bg || colors.rose))};
  border: ${props => (props.$isImage ? `1px solid ${colors.border}` : 'none')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: ${colors.white};
  margin-bottom: 12px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 5px;
  }
`;

const BrandName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 4px;
`;

const BrandCat = styled.div`
  font-size: 12px;
  color: ${colors.text3};
  margin-bottom: 12px;
`;

const BrandMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const ReplyRate = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${props => props.$hi ? colors.green : colors.amber};
`;

const LockBtn = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  background: ${colors.bg};
  color: ${colors.text2};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.roseLight};
    color: ${colors.rose};
  }
`;

const LockedCard = styled.div`
  background: linear-gradient(135deg, ${colors.roseLight}, #F5F3FF);
  border: 1px dashed ${colors.border};
  border-radius: 14px;
  padding: 20px;
  text-align: center;

  .lock-icon {
    font-size: 26px;
    margin-bottom: 8px;
  }

  .lock-title {
    font-size: 13px;
    font-weight: 800;
    color: ${colors.text};
    margin-bottom: 4px;
  }

  .lock-sub {
    font-size: 11.5px;
    color: ${colors.text3};
    margin-bottom: 12px;
  }
`;

const DirectoryFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${colors.border};
  flex-wrap: wrap;
  gap: 16px;

  .count {
    font-size: 13px;
    color: ${colors.text3};

    strong {
      color: ${colors.text};
    }
  }
`;

// ═══════════════════════════════════════════════════════════════════
// FEATURE SECTIONS
// ═══════════════════════════════════════════════════════════════════
const FeatureSection = styled.section`
  padding: 80px 0;
  background: ${props => props.$bg || colors.bg};
`;

const FeatureRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;

  &.reverse {
    direction: rtl;

    > * {
      direction: ltr;
    }
  }

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    gap: 40px;

    &.reverse {
      direction: ltr;
    }
  }
`;

const FeatureText = styled.div``;

const FeatureTag = styled.div`
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: ${colors.rose};
  background: ${colors.roseLight};
  padding: 6px 12px;
  border-radius: 6px;
  margin-bottom: 16px;
`;

const FeatureH3 = styled.h3`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.text};
  line-height: 1.3;
  margin: 0 0 16px;
`;

const FeatureP = styled.p`
  font-size: 15px;
  color: ${colors.text2};
  line-height: 1.7;
  margin: 0 0 24px;
`;

const FeatureBullet = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FeatureBulletItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${colors.text2};

  &::before {
    content: '✓';
    width: 20px;
    height: 20px;
    background: ${colors.greenLight};
    color: ${colors.green};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
  }
`;

const FeatureCallout = styled.div`
  background: ${colors.bg};
  border-left: 3px solid ${colors.rose};
  padding: 14px 18px;
  border-radius: 0 10px 10px 0;
  font-size: 14px;
  color: ${colors.text2};
  font-style: italic;
  margin-bottom: 24px;
`;

const FeatureVisual = styled.div`
  display: flex;
  justify-content: center;
`;

const MockupCard = styled.div`
  background: ${colors.white};
  border-radius: 16px;
  box-shadow: ${shadows.lg};
  overflow: hidden;
  max-width: 400px;
  width: 100%;
`;

const MockupHeader = styled.div`
  background: ${colors.bg};
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid ${colors.border};
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
  font-size: 12px;
  font-weight: 600;
  color: ${colors.text3};
`;

const MockupBody = styled.div`
  padding: 20px;
`;

// ═══════════════════════════════════════════════════════════════════
// SOCIAL PROOF
// ═══════════════════════════════════════════════════════════════════
const ProofSection = styled.section`
  padding: 80px 0;
  background: ${colors.white};
`;

const NotifWall = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
`;

const NotifPill = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${colors.bg};
  border: 1px solid ${colors.border};
  border-radius: 100px;
  padding: 10px 18px;
  font-size: 13px;
  animation: ${slideIn} 0.5s ease forwards;
  animation-delay: ${props => props.$delay || '0s'};
  opacity: 0;

  .notif-icon {
    font-size: 16px;
  }

  strong {
    font-weight: 700;
    color: ${colors.text};
  }

  span {
    color: ${colors.text3};
    font-size: 11px;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 48px;

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background: ${colors.bg};
  border-radius: 14px;
  padding: 24px;
  text-align: center;

  .stat-num {
    font-size: 32px;
    font-weight: 800;
    color: ${props => props.$color || colors.text};
    margin-bottom: 6px;
  }

  .stat-lbl {
    font-size: 13px;
    color: ${colors.text3};
  }
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const TestimonialCard = styled.div`
  background: ${colors.bg};
  border-radius: 16px;
  padding: 24px;
`;

const TestimonialCreator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
`;

const TestimonialAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${props => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.white};
`;

const TestimonialInfo = styled.div`
  .name {
    font-size: 14px;
    font-weight: 700;
    color: ${colors.text};
  }

  .meta {
    font-size: 12px;
    color: ${colors.text3};
  }
`;

const TestimonialStars = styled.div`
  color: #FBBF24;
  font-size: 14px;
  letter-spacing: 2px;
  margin-bottom: 12px;
`;

const TestimonialResult = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${colors.greenLight};
  color: ${colors.green};
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 14px;
`;

const TestimonialQuote = styled.div`
  font-size: 14px;
  color: ${colors.text2};
  font-style: italic;
  line-height: 1.6;
`;

// ═══════════════════════════════════════════════════════════════════
// HOW IT WORKS
// ═══════════════════════════════════════════════════════════════════
const HowSection = styled.section`
  padding: 80px 0;
  background: ${colors.bg};
`;

const HowSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  margin-bottom: 48px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const HowStep = styled.div`
  text-align: center;

  .how-num {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: ${colors.black};
    color: ${colors.white};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 800;
    margin: 0 auto 20px;
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: ${colors.text};
    margin: 0 0 12px;
  }

  p {
    font-size: 14px;
    color: ${colors.text2};
    line-height: 1.6;
    margin: 0;
  }
`;

const HowCTA = styled.div`
  text-align: center;

  .sub {
    margin-top: 12px;
    font-size: 13px;
    color: ${colors.text3};
  }
`;

// ═══════════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════════
const PricingSection = styled.section`
  padding: 80px 0;
  background: ${colors.white};
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const PricingCard = styled.div`
  background: ${colors.bg};
  border: ${props => props.$featured ? `2px solid ${colors.black}` : `1px solid ${colors.border}`};
  border-radius: 20px;
  padding: 32px;
  position: relative;

  &.featured {
    background: ${colors.white};
    box-shadow: ${shadows.lg};
  }
`;

const PricingBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: ${colors.black};
  color: ${colors.white};
  font-size: 11px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PricingTier = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${props => props.$rose ? colors.rose : colors.text3};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
`;

const PricingPrice = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: ${colors.text};
  margin-bottom: 4px;

  sup {
    font-size: 24px;
    font-weight: 700;
    vertical-align: super;
  }

  &.gradient {
    background: linear-gradient(135deg, ${colors.rose}, ${colors.violet});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const PricingPriceSub = styled.div`
  font-size: 13px;
  color: ${colors.text3};
  margin-bottom: 24px;
`;

const PricingFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const PricingFeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${colors.text2};

  .pf-check {
    color: ${colors.green};
    font-weight: 700;
  }

  .pf-cross {
    color: ${colors.text3};
  }

  .pf-lock {
    color: ${colors.text3};
  }

  strong {
    font-weight: 700;
    color: ${colors.text};
  }
`;

const PricingBtn = styled.a`
  display: block;
  width: 100%;
  text-align: center;
  padding: 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &.outline {
    background: transparent;
    border: 1.5px solid ${colors.border};
    color: ${colors.text};

    &:hover {
      border-color: ${colors.black};
    }
  }

  &.black {
    background: ${colors.black};
    border: none;
    color: ${colors.white};

    &:hover {
      background: #1a1a1a;
    }
  }
`;

const PricingNote = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${colors.text3};
  margin-top: 12px;
`;

// ═══════════════════════════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════════════════════════
const FAQSection = styled.section`
  padding: 80px 0;
  background: ${colors.bg};
`;

const FAQList = styled.div`
  max-width: 700px;
  margin: 0 auto;
`;

const FAQItem = styled.details`
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;

  &[open] {
    .faq-icon {
      transform: rotate(45deg);
    }
  }
`;

const FAQSummary = styled.summary`
  padding: 20px 24px;
  font-size: 15px;
  font-weight: 700;
  color: ${colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }

  .faq-icon {
    font-size: 18px;
    color: ${colors.text3};
    transition: transform 0.2s ease;
  }
`;

const FAQAnswer = styled.div`
  padding: 0 24px 20px;
  font-size: 14px;
  color: ${colors.text2};
  line-height: 1.7;
`;

// ═══════════════════════════════════════════════════════════════════
// FINAL CTA
// ═══════════════════════════════════════════════════════════════════
const FinalCTASection = styled.section`
  padding: 100px 0;
  background: ${colors.black};
  text-align: center;
`;

const FinalH2 = styled.h2`
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  color: ${colors.white};
  line-height: 1.2;
  margin: 0 0 16px;

  em {
    font-style: italic;
    color: ${colors.roseMid};
  }
`;

const FinalSubline = styled.p`
  font-size: 16px;
  color: rgba(255,255,255,0.7);
  margin: 0 0 32px;
`;

const FinalCTAActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const FinalTrust = styled.div`
  font-size: 12px;
  color: rgba(255,255,255,0.5);
`;

// ═══════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════
const Footer = styled.footer`
  background: ${colors.black};
  padding: 60px 0 32px;
  border-top: 1px solid rgba(255,255,255,0.1);
`;

const FooterInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const FooterTop = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;

  img {
    height: 28px;
    width: auto;
    display: block;
  }
`;

const FooterSocials = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;

  a {
    color: rgba(255, 255, 255, 0.5);
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease, transform 0.2s ease;

    &:hover {
      color: ${colors.white};
      transform: scale(1.08);
    }
  }
`;

const FooterDesc = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.5);
  line-height: 1.6;
`;

const FooterColTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  a {
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${colors.white};
    }
  }
`;

const FooterBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.1);
  flex-wrap: wrap;
  gap: 16px;
`;

const FooterCopy = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.4);
`;

const FooterBottomLinks = styled.div`
  display: flex;
  gap: 24px;

  a {
    font-size: 13px;
    color: rgba(255,255,255,0.4);
    text-decoration: none;

    &:hover {
      color: ${colors.white};
    }
  }
`;

// ═══════════════════════════════════════════════════════════════════
// MEDIA KIT MOCKUP
// ═══════════════════════════════════════════════════════════════════
const KitCard = styled.div`
  background: ${colors.bg};
  border: 1px solid ${colors.border};
  border-radius: 12px;
  padding: 16px;
`;

const KitHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const KitAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${colors.rose};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  color: ${colors.white};
`;

const KitName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${colors.text};
`;

const KitHandle = styled.div`
  font-size: 12px;
  color: ${colors.text3};
`;

const KitStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 14px;
`;

const KitStat = styled.div`
  text-align: center;

  .val {
    font-size: 16px;
    font-weight: 800;
    color: ${colors.text};
  }

  .lbl {
    font-size: 10px;
    color: ${colors.text3};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const KitNiches = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const KitNiche = styled.span`
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  background: ${colors.white};
  border: 1px solid ${colors.border};
  border-radius: 20px;
  color: ${colors.text2};
`;

const KitAttachedBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${colors.greenLight};
  color: ${colors.green};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
`;

// ═══════════════════════════════════════════════════════════════════
// BRANDS DATA
// ═══════════════════════════════════════════════════════════════════
const getApiBase = () => {
  const base = process.env.REACT_APP_BACKEND_URL
    || process.env.REACT_APP_API_BASE
    || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};

// Extract hostname from a URL string, return null on failure
const extractDomain = (url) => {
  if (!url) return null;
  try {
    const withProto = url.startsWith('http') ? url : `https://${url}`;
    return new URL(withProto).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

// Map API response (_format_public_brand_list_item returns: name, logo, website, category, responseRate, avgResponseTime)
const mapApiBrand = (b) => {
  const name = b.name || '';
  const replyRate = Math.round(b.responseRate || b.response_rate || 0);
  const replyDays = b.avgResponseTime || b.avg_response_time_days;
  const replyTime = replyDays ? `Replies in ${replyDays} days` : 'Replies in 3–5 days';
  const cat = (() => {
    const c = (b.category || '').toLowerCase();
    if (c.includes('fashion') || c.includes('apparel')) return 'fashion';
    if (c.includes('skincare')) return 'skincare';
    if (c.includes('food') || c.includes('beverage') || c.includes('drink') || c.includes('wellness')) return 'food';
    return 'beauty';
  })();

  // Use stored logo_url, or derive from website via Clearbit
  const domain = extractDomain(b.website);
  const logo = b.logo || (domain ? `https://logo.clearbit.com/${domain}?size=128` : null);

  return {
    name,
    slug: b.slug,
    initials: name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    bg: '#F5F5F4',
    logo,
    cat,
    catLabel: b.category || 'Brand',
    replyTime,
    replyRate: replyRate || 40,
    hi: replyRate >= 40,
  };
};

function LandingBrandLogo({ brand, style }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!brand.logo || imgFailed) {
    return (
      <BrandLogoBlock $bg={brand.bg} style={style}>
        {brand.initials}
      </BrandLogoBlock>
    );
  }

  return (
    <BrandLogoBlock $isImage style={style}>
      <img src={brand.logo} alt={brand.name} onError={() => setImgFailed(true)} />
    </BrandLogoBlock>
  );
}

// Static fallback — shown until the API responds
const brandsDataFallback = [
  { name: 'Rhode Skin', slug: 'rhode-skin', initials: 'RS', bg: '#B5002D', logo: null, cat: 'beauty', catLabel: 'Skincare', replyTime: 'Replies in 2–3 days', replyRate: 52, hi: true },
  { name: 'Anua', slug: 'anua', initials: 'AN', bg: '#2E7D4F', logo: null, cat: 'beauty', catLabel: 'K-Beauty', replyTime: 'Replies in 3–5 days', replyRate: 38, hi: true },
  { name: 'Oh Polly', slug: 'oh-polly', initials: 'OP', bg: '#1A1A2E', logo: null, cat: 'fashion', catLabel: 'Fashion', replyTime: 'Replies in 5–7 days', replyRate: 29, hi: false },
  { name: 'Fenty Beauty', slug: 'fenty-beauty', initials: 'FB', bg: '#8B4513', logo: null, cat: 'beauty', catLabel: 'Beauty', replyTime: 'Replies in 3–5 days', replyRate: 44, hi: true },
  { name: 'Nopalera', slug: 'nopalera', initials: 'NP', bg: '#2D5016', logo: null, cat: 'beauty', catLabel: 'Skincare', replyTime: 'Replies in 2–3 days', replyRate: 61, hi: true },
  { name: 'Aura Bora', slug: 'aura-bora', initials: 'AB', bg: '#7C3AED', logo: null, cat: 'food', catLabel: 'Beverages', replyTime: 'Replies in 1–2 days', replyRate: 72, hi: true },
  { name: 'Glow Recipe', slug: 'glow-recipe', initials: 'GR', bg: '#EC4899', logo: null, cat: 'skincare', catLabel: 'Skincare', replyTime: 'Replies in 3–5 days', replyRate: 45, hi: true },
  { name: 'Princess Polly', slug: 'princess-polly', initials: 'PP', bg: '#6D28D9', logo: null, cat: 'fashion', catLabel: 'Fashion', replyTime: 'Replies in 3–5 days', replyRate: 47, hi: true },
];

// ═══════════════════════════════════════════════════════════════════
// TICKER DATA
// ═══════════════════════════════════════════════════════════════════
const tickerItems = [
  { icon: '📦', text: 'carolstyle landed Rhode Skin — 3 days after joining' },
  { icon: '💬', text: 'glowwith_m got 2 brand replies in 48 hours' },
  { icon: '📦', text: 'zionne019 received an Anua PR package this week' },
  { icon: '✍️', text: 'sarahlooks pitched 8 brands in one afternoon' },
  { icon: '📦', text: 'dailybyzoe landed Oh Polly with media kit auto-attached' },
  { icon: '🎉', text: 'plates.co got a food brand collab after first pitch' },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
const LandingPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [isVisible, setIsVisible] = useState(false);
  const [brands, setBrands] = useState(brandsDataFallback);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const brandCache = React.useRef({});

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch brands for the active filter tab, with per-category caching
  useEffect(() => {
    let cancelled = false;
    const cacheKey = activeFilter;
    if (brandCache.current[cacheKey]) {
      setBrands(brandCache.current[cacheKey]);
      return;
    }
    setLoadingBrands(true);
    (async () => {
      try {
        const cat = activeFilter === 'all' ? '' : `&category=${activeFilter}`;
        const url = `${getApiBase()}/api/public/brands?limit=16&page=1${cat}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        const list = Array.isArray(data.brands) ? data.brands : [];
        // Prefer brands with a logo or website, cap at 8
        const withMedia = list.filter(b => b.logo || b.website);
        const chosen = (withMedia.length >= 8 ? withMedia : list).slice(0, 8);
        if (!cancelled && chosen.length > 0) {
          const mapped = chosen.map(mapApiBrand);
          brandCache.current[cacheKey] = mapped;
          setBrands(mapped);
        }
      } catch (err) {
        // silently fall back to static data
      } finally {
        if (!cancelled) setLoadingBrands(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeFilter]);

  const filteredBrands = brands;

  // JSON-LD Schemas
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "newcollab",
    "url": "https://newcollab.co",
    "description": "PR forms directory and brand outreach tool for nano and micro creators — 500+ brands with open PR application forms, AI pitch emails, and auto media kit.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://newcollab.co/brands?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I get my first brand deal as a small creator?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sign up for newcollab, browse the brand directory filtered to your niche, and send an AI-generated pitch with your auto-attached media kit. Most creators land their first deal within 2 weeks — the key is sending enough pitches and following up. The free plan gives you 3 pitches a month to start."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need a media kit to pitch brands?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes — it's the #1 reason brands ignore cold emails. newcollab auto-generates yours from your profile, so every pitch includes your stats, audience demographics, niche, and past collabs. No design skills needed."
        }
      },
      {
        "@type": "Question",
        "name": "How many followers do you need to work with brands?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No minimum. 63% of brands prefer working with nano and micro creators (1K–50K followers) — engagement is more genuine and content feels authentic. newcollab filters brands by follower fit so you only see relevant opportunities."
        }
      },
      {
        "@type": "Question",
        "name": "What is a PR package?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A PR package is when a brand sends you their products for free in exchange for content on your channels — a post, TikTok, story, or reel. You pitch the brand directly via email with your media kit. newcollab handles finding the brand, writing the pitch, and tracking the reply."
        }
      },
      {
        "@type": "Question",
        "name": "Where can I find PR forms for brands?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "newcollab's brand directory lists 500+ brands with open PR forms and direct application links across beauty, fashion, skincare, food, tech, and wellness. You can filter by niche and send a personalised AI pitch in one click — no need to hunt for contact emails or application URLs."
        }
      },
      {
        "@type": "Question",
        "name": "What is a brand PR application form?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A brand PR application form is a public submission page where creators apply to receive gifted products (PR packages) in exchange for social media content. Brands use these forms to vet creators by niche, follower count, and engagement rate. newcollab lists brands with open PR forms and lets you apply with an AI-generated pitch and auto-attached media kit."
        }
      },
      {
        "@type": "Question",
        "name": "Is newcollab free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes — free plan includes full brand directory access, auto media kit, PR pipeline, and 3 brand unlocks per month. Pro ($19/month) unlocks unlimited contacts, batch send, full For You feed, and the $PR Value dashboard."
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>newcollab | PR Forms for Brands &amp; Brand Outreach Tool for Micro Creators</title>
        <meta name="description" content="Browse 500+ brands with open PR forms and direct application links. Send AI pitch emails, auto-generate your media kit, and track every outreach. The complete PR forms directory and brand deal system for micro creators." />
        <meta name="keywords" content="PR forms for brands, brand PR forms, PR application forms for influencers, brands with open PR forms, how to get brand deals, PR packages for micro creators, brand outreach tool, media kit for content creators, micro influencer brand deals, brand collaboration forms" />
        <meta property="og:title" content="newcollab | 500+ Brand PR Forms &amp; Outreach Tool for Micro Creators" />
        <meta property="og:description" content="Browse brands with open PR forms and application links. AI pitch emails, auto media kit, deal tracking — all in one place for nano and micro creators." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://newcollab.co" />
        <meta property="og:site_name" content="newcollab" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="newcollab | Brand Outreach for Micro Creators" />
        <meta name="twitter:description" content="The complete brand deal system for nano and micro creators." />
        <link rel="canonical" href="https://newcollab.co/" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <PageContainer>
        {/* ════════════════════════════════════════════════════════════════ */}
        {/* HERO */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <HeroSection>
          <Container>
            <HeroGrid>
              <HeroText>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <HeroH1>
                    Land brand deals.<br />
                    On repeat.<br />
                    <em>No guessing.</em>
                  </HeroH1>
                  <HeroSubline>
                    500+ brands with open PR forms. AI pitch emails. Auto media kit. Deal tracking. All in one place.
                  </HeroSubline>
                  <HeroCTARow>
                    <BtnBlack href="/register/creator">Start for free →</BtnBlack>
                    <BtnOutline href="/directory">See brands</BtnOutline>
                  </HeroCTARow>
                  <HeroProof>
                    <AvatarStack>
                      <div style={{ background: colors.rose }}>C</div>
                      <div style={{ background: colors.violet }}>M</div>
                      <div style={{ background: colors.green }}>Z</div>
                      <div style={{ background: colors.amber }}>S</div>
                      <div style={{ background: '#3B82F6' }}>D</div>
                    </AvatarStack>
                    <span>900+ creators already getting brand deals · Free · No credit card</span>
                  </HeroProof>
                </motion.div>
              </HeroText>
              <HeroVisual>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <HeroGifWrap>
                    <video
                      src="https://pub-528caee7e6db4ebc850280fe142043c7.r2.dev/prpack_newcollab%20(1).mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                    />
                    <FloatingBadge className="bottom-left">
                      <span>📦</span>
                      <div>
                        <div style={{ fontWeight: 700 }}>Package received!</div>
                        <div style={{ fontSize: 11, color: colors.text3 }}>Rhode Skin → @carolstyle</div>
                      </div>
                    </FloatingBadge>
                    <FloatingBadge className="top-right">
                      <span>✨</span>
                      <span>6 pitches sent today</span>
                    </FloatingBadge>
                  </HeroGifWrap>
                </motion.div>
              </HeroVisual>
            </HeroGrid>
          </Container>
        </HeroSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* TICKER */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <TickerSection>
          <TickerInner>
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <TickerItem key={i}>
                <span>{item.icon}</span>
                {item.text}
              </TickerItem>
            ))}
          </TickerInner>
        </TickerSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* CLARITY STRIP */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <ClaritySection>
          <Container>
            <ClarityGrid>
              <ClarityItem>
                <ClarityIcon><FiSearch /></ClarityIcon>
                <ClarityText>
                  <div className="label">Find brands</div>
                  <div className="sub">500+ PR contacts, your niche</div>
                </ClarityText>
              </ClarityItem>
              <ClarityArrow>→</ClarityArrow>
              <ClarityItem>
                <ClarityIcon><FiFileText /></ClarityIcon>
                <ClarityText>
                  <div className="label">Auto media kit</div>
                  <div className="sub">Generated, always ready</div>
                </ClarityText>
              </ClarityItem>
              <ClarityArrow>→</ClarityArrow>
              <ClarityItem>
                <ClarityIcon><FiEdit3 /></ClarityIcon>
                <ClarityText>
                  <div className="label">AI pitch email</div>
                  <div className="sub">Personalised in 60 seconds</div>
                </ClarityText>
              </ClarityItem>
              <ClarityArrow>→</ClarityArrow>
              <ClarityItem>
                <ClarityIcon><FiBarChart2 /></ClarityIcon>
                <ClarityText>
                  <div className="label">Track everything</div>
                  <div className="sub">Pipeline · follow-ups · wins</div>
                </ClarityText>
              </ClarityItem>
            </ClarityGrid>
          </Container>
        </ClaritySection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* PROBLEM SECTION */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <ProblemSection>
          <Container>
            <SectionCenter>
              <Eyebrow><EyebrowDot /> The struggle is real</Eyebrow>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: colors.text, margin: 0 }}>
                Getting brand deals feels impossible.<br />
                <em style={{ color: colors.rose }}>It doesn't have to.</em>
              </h2>
            </SectionCenter>
            <ProblemGrid>
              <ProblemCard>
                <div className="headline">"Where do I even find brand PR emails?"</div>
                <div className="body">Googled it for hours. No real contacts, no idea who's open to new creators.</div>
              </ProblemCard>
              <ProblemCard>
                <div className="headline">"They want a media kit and I don't have one."</div>
                <div className="body">Brands expect your stats, demographics, niche. Most creators lose deals here.</div>
              </ProblemCard>
              <ProblemCard>
                <div className="headline">"I open a blank email and freeze every time."</div>
                <div className="body">Too formal? Too casual? Most creators spend hours on one pitch, or never send it.</div>
              </ProblemCard>
              <ProblemCard>
                <div className="headline">"I sent emails last month and forgot to follow up."</div>
                <div className="body">No system. No visibility. Warm leads went cold. Not laziness, just no tool.</div>
              </ProblemCard>
            </ProblemGrid>
            <ProblemCTA>
              <div className="text">newcollab handles all of this, automatically.</div>
              <BtnRose href="/register/creator">Get started free →</BtnRose>
            </ProblemCTA>
          </Container>
        </ProblemSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* SOLUTION FLOW (DARK) */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <SolutionSection>
          <Container>
            <SectionCenter>
              <Eyebrow style={{ color: colors.roseMid }}><EyebrowDot style={{ background: colors.roseMid }} /> The newcollab way</Eyebrow>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: colors.white, margin: 0 }}>
                Not just a tool.<br />
                <em style={{ color: colors.roseMid }}>The complete outreach flow.</em>
              </h2>
            </SectionCenter>
            <SolutionGrid>
              <SolutionStep $iconBg="rgba(225, 29, 72, 0.2)">
                <div className="step-icon">
                  <FiSearch />
                  <span className="step-num">1</span>
                </div>
                <div className="step-title">Discover</div>
                <div className="step-body">500+ brand PR contacts filtered to your niche</div>
              </SolutionStep>
              <SolutionStep $iconBg="rgba(124, 58, 237, 0.2)">
                <div className="step-icon">
                  <FiFileText />
                  <span className="step-num">2</span>
                </div>
                <div className="step-title">Prepare</div>
                <div className="step-body">Auto-generated media kit from your profile</div>
              </SolutionStep>
              <SolutionStep $iconBg="rgba(5, 150, 105, 0.2)">
                <div className="step-icon">
                  <FiEdit3 />
                  <span className="step-num">3</span>
                </div>
                <div className="step-title">Pitch</div>
                <div className="step-body">AI email + media kit attached · batch-send 10 at once</div>
              </SolutionStep>
              <SolutionStep $iconBg="rgba(217, 119, 6, 0.2)">
                <div className="step-icon">
                  <FiBarChart2 />
                  <span className="step-num">4</span>
                </div>
                <div className="step-title">Track</div>
                <div className="step-body">Pipeline + auto follow-up reminders at day 7</div>
              </SolutionStep>
              <SolutionStep $iconBg="rgba(236, 72, 153, 0.2)">
                <div className="step-icon">
                  <FiGift />
                  <span className="step-num">5</span>
                </div>
                <div className="step-title">Win</div>
                <div className="step-body">Package arrives · log your PR value · repeat</div>
              </SolutionStep>
            </SolutionGrid>
          </Container>
        </SolutionSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* BRAND DIRECTORY */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <DirectorySection id="brands">
          <Container>
            <SectionCenter>
              <Eyebrow><EyebrowDot /> PR forms &amp; brand directory</Eyebrow>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: colors.text, margin: '0 0 8px' }}>
                500+ brands with open PR forms.<br />
                <em style={{ color: colors.rose }}>Apply in one click.</em>
              </h2>
              <p style={{ fontSize: 16, color: colors.text2, margin: '0 0 12px' }}>
                Direct PR application links, verified email contacts, and reply rates, filtered by your niche. Skip the Googling.
              </p>
              <p style={{ fontSize: 13, color: colors.text3, margin: 0 }}>
                Looking for a specific brand? See the full{' '}
                <a href="/directory" style={{ color: colors.rose, fontWeight: 600, textDecoration: 'none' }}>brand PR forms directory →</a>
              </p>
            </SectionCenter>
            <DirectoryBox>
              <FilterTabs>
                {['all', 'beauty', 'fashion', 'skincare', 'food'].map(cat => (
                  <FilterTab
                    key={cat}
                    $active={activeFilter === cat}
                    onClick={() => setActiveFilter(cat)}
                  >
                    {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </FilterTab>
                ))}
              </FilterTabs>
              <BrandGrid style={{ opacity: loadingBrands ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                {filteredBrands.map((brand, i) => (
                  <BrandCard key={brand.slug || i}>
                    <LandingBrandLogo brand={brand} />
                    <BrandName>{brand.name}</BrandName>
                    <BrandCat>{brand.catLabel} · {brand.replyTime}</BrandCat>
                    <BrandMeta>
                      <ReplyRate $hi={brand.hi}>{brand.replyRate}% reply</ReplyRate>
                      <LockBtn onClick={() => window.location.href = '/register/creator'}>🔒 Sign up</LockBtn>
                    </BrandMeta>
                  </BrandCard>
                ))}
                <LockedCard>
                  <div className="lock-icon">🔒</div>
                  <div className="lock-title">492 more brands</div>
                  <div className="lock-sub">Sign up free to unlock all</div>
                  <BtnBlack href="/register/creator" style={{ padding: '10px 20px', fontSize: 13 }}>Get access →</BtnBlack>
                </LockedCard>
              </BrandGrid>
              <DirectoryFooter>
                <div className="count">Showing <strong>8 of 500+</strong> brands · Updated weekly</div>
                <BtnBlack href="/register/creator" style={{ padding: '10px 20px', fontSize: 13 }}>Unlock all contacts →</BtnBlack>
              </DirectoryFooter>
            </DirectoryBox>
          </Container>
        </DirectorySection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FEATURE 1: MEDIA KIT */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <FeatureSection $bg={colors.bg} id="features">
          <Container>
            <FeatureRow>
              <FeatureText>
                <FeatureTag>Auto Media Kit</FeatureTag>
                <FeatureH3>Your media kit, generated automatically. Every pitch looks pro.</FeatureH3>
                <FeatureP>Brands won't reply without one. newcollab builds your media kit from your profile (stats, audience, niche) and attaches it to every pitch automatically. No Canva. No design skills. Done in 30 seconds.</FeatureP>
                <FeatureBullet>
                  <FeatureBulletItem>Stats pulled live from your profile</FeatureBulletItem>
                  <FeatureBulletItem>Audience age, niche, platform included</FeatureBulletItem>
                  <FeatureBulletItem>Auto-attached to every AI pitch</FeatureBulletItem>
                  <FeatureBulletItem>Always up to date, no manual edits</FeatureBulletItem>
                </FeatureBullet>
              </FeatureText>
              <FeatureVisual>
                <MockupCard>
                  <MockupHeader>
                    <MockupDots>
                      <MockupDot $color="#FF5F57" />
                      <MockupDot $color="#FFBD2E" />
                      <MockupDot $color="#28CA41" />
                    </MockupDots>
                    <MockupTitle>My Media Kit</MockupTitle>
                  </MockupHeader>
                  <MockupBody>
                    <KitCard>
                      <KitHeader>
                        <KitAvatar>C</KitAvatar>
                        <div>
                          <KitName>carolstyle</KitName>
                          <KitHandle>@carolstyle · Fashion & Lifestyle</KitHandle>
                        </div>
                      </KitHeader>
                      <KitStats>
                        <KitStat>
                          <div className="val">17K</div>
                          <div className="lbl">Followers</div>
                        </KitStat>
                        <KitStat>
                          <div className="val">6.2%</div>
                          <div className="lbl">Eng. Rate</div>
                        </KitStat>
                        <KitStat>
                          <div className="val">18–34</div>
                          <div className="lbl">Audience Age</div>
                        </KitStat>
                      </KitStats>
                      <KitNiches>
                        <KitNiche>Fashion</KitNiche>
                        <KitNiche>Lifestyle</KitNiche>
                        <KitNiche>Beauty</KitNiche>
                      </KitNiches>
                    </KitCard>
                    <div style={{ marginTop: 12 }}>
                      <KitAttachedBadge>
                        <span>📎</span>
                        <span>Auto-attached to your pitch email</span>
                      </KitAttachedBadge>
                    </div>
                  </MockupBody>
                </MockupCard>
              </FeatureVisual>
            </FeatureRow>
          </Container>
        </FeatureSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FEATURE 2: AI PITCH */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <FeatureSection $bg={colors.white}>
          <Container>
            <FeatureRow className="reverse">
              <FeatureText>
                <FeatureTag>AI Pitch Writer</FeatureTag>
                <FeatureH3>Perfect pitch in 60 seconds. Send to 10 brands at once.</FeatureH3>
                <FeatureP>AI writes a personalised email for each brand: their name, their niche, why you're the right fit. Media kit attaches automatically. Batch-pitch up to 10 brands in one session on Pro.</FeatureP>
                <FeatureBullet>
                  <FeatureBulletItem>Personalised per brand, not a generic template</FeatureBulletItem>
                  <FeatureBulletItem>Media kit auto-attached every time</FeatureBulletItem>
                  <FeatureBulletItem>Batch-pitch 10 brands in one session <TagPro>Pro</TagPro></FeatureBulletItem>
                  <FeatureBulletItem>AI follow-up at day 7 <TagPro>Pro</TagPro></FeatureBulletItem>
                </FeatureBullet>
              </FeatureText>
              <FeatureVisual>
                <MockupCard>
                  <MockupHeader>
                    <MockupDots>
                      <MockupDot $color="#FF5F57" />
                      <MockupDot $color="#FFBD2E" />
                      <MockupDot $color="#28CA41" />
                    </MockupDots>
                    <MockupTitle>AI Pitch Generator</MockupTitle>
                  </MockupHeader>
                  <MockupBody>
                    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <BrandLogoBlock $bg="#B5002D" style={{ width: 36, height: 36, margin: 0, fontSize: 11 }}>RS</BrandLogoBlock>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800 }}>Rhode Skin</div>
                        <div style={{ fontSize: 11, color: colors.green, fontWeight: 700 }}>52% reply rate</div>
                      </div>
                    </div>
                    <div style={{ background: colors.white, border: `1.5px solid ${colors.black}`, borderRadius: 10, padding: 12, fontSize: 12, color: colors.text2, lineHeight: 1.6 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: colors.text3, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>AI-Generated Pitch</div>
                      Hi Rhode Skin team,<br /><br />
                      I'm <strong style={{ color: colors.text }}>@carolstyle</strong>, a fashion & beauty creator with <strong style={{ color: colors.text }}>17K followers</strong> (6.2% engagement). My audience is 85% female, 18–34, a strong fit for your skincare launches...<br /><br />
                      <span style={{ color: colors.text3, fontSize: 11 }}>Media kit attached for your review.</span>
                    </div>
                    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                      <KitAttachedBadge style={{ flex: 1 }}>📎 Kit attached</KitAttachedBadge>
                      <BtnBlack href="/register/creator" style={{ padding: '10px 18px', fontSize: 12 }}>Send →</BtnBlack>
                    </div>
                  </MockupBody>
                </MockupCard>
              </FeatureVisual>
            </FeatureRow>
          </Container>
        </FeatureSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FEATURE 3: PIPELINE */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <FeatureSection $bg={colors.bg}>
          <Container>
            <FeatureRow>
              <FeatureText>
                <FeatureTag>PR Pipeline</FeatureTag>
                <FeatureH3>Track every pitch. Follow up before it goes cold.</FeatureH3>
                <FeatureP>Every brand you contact lives in your pipeline. We remind you to follow up at day 7, when most brands respond. Never lose a warm lead again.</FeatureP>
                <FeatureCallout>
                  <em>Creators who follow up are 3× more likely to land the deal.</em> We make sure you never forget.
                </FeatureCallout>
                <FeatureBullet>
                  <FeatureBulletItem>Stages: Saved → Waiting → Replied → Won</FeatureBulletItem>
                  <FeatureBulletItem>Auto day-7 follow-up reminder</FeatureBulletItem>
                  <FeatureBulletItem>Log replies, packages, $PR value <TagPro>Pro</TagPro></FeatureBulletItem>
                </FeatureBullet>
              </FeatureText>
              <FeatureVisual>
                <MockupCard>
                  <MockupHeader>
                    <MockupDots>
                      <MockupDot $color="#FF5F57" />
                      <MockupDot $color="#FFBD2E" />
                      <MockupDot $color="#28CA41" />
                    </MockupDots>
                    <MockupTitle>My PR Pipeline</MockupTitle>
                  </MockupHeader>
                  <MockupBody>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: colors.amber, marginBottom: 8 }}>⚡ Action needed <span style={{ background: colors.amber, color: colors.white, padding: '2px 6px', borderRadius: 10, fontSize: 10, marginLeft: 4 }}>1</span></div>
                      <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.amber}`, borderRadius: 10, padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BrandLogoBlock $bg="#B5002D" style={{ width: 28, height: 28, margin: 0, fontSize: 9 }}>RS</BrandLogoBlock>
                            <span style={{ fontWeight: 700, fontSize: 13 }}>Rhode Skin</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: colors.amber, background: 'rgba(217, 119, 6, 0.1)', padding: '3px 8px', borderRadius: 6 }}>Waiting</span>
                        </div>
                        <div style={{ fontSize: 11, color: colors.text3, marginBottom: 6 }}>Pitched 7 days ago</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: colors.amber }}>⏰ Time to follow up</div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: colors.green, marginBottom: 8 }}>✅ Replied <span style={{ background: colors.green, color: colors.white, padding: '2px 6px', borderRadius: 10, fontSize: 10, marginLeft: 4 }}>2</span></div>
                      <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BrandLogoBlock $bg="#2E7D4F" style={{ width: 28, height: 28, margin: 0, fontSize: 9 }}>AN</BrandLogoBlock>
                            <span style={{ fontWeight: 700, fontSize: 13 }}>Anua</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: colors.green }}>Replied ✓</span>
                        </div>
                        <div style={{ fontSize: 11, color: colors.text3, marginTop: 4 }}>Package confirmed · coming in 5 days</div>
                      </div>
                    </div>
                  </MockupBody>
                </MockupCard>
              </FeatureVisual>
            </FeatureRow>
          </Container>
        </FeatureSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FEATURE 4: FOR YOU FEED */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <FeatureSection $bg={colors.white}>
          <Container>
            <FeatureRow className="reverse">
              <FeatureText>
                <FeatureTag>For You Feed</FeatureTag>
                <FeatureH3>The right brands, delivered to you every week.</FeatureH3>
                <FeatureP>Based on your niche, platform, and following, newcollab surfaces the brands most likely to reply to you right now. Hot this week. Seasonal campaigns. Brands that just responded to creators like you.</FeatureP>
                <FeatureBullet>
                  <FeatureBulletItem>Matched to your niche + follower count</FeatureBulletItem>
                  <FeatureBulletItem>Seasonal alerts to pitch before everyone else</FeatureBulletItem>
                  <FeatureBulletItem>Full personalised feed <TagPro>Pro</TagPro></FeatureBulletItem>
                </FeatureBullet>
              </FeatureText>
              <FeatureVisual>
                <MockupCard>
                  <MockupHeader>
                    <MockupDots>
                      <MockupDot $color="#FF5F57" />
                      <MockupDot $color="#FFBD2E" />
                      <MockupDot $color="#28CA41" />
                    </MockupDots>
                    <MockupTitle>For You</MockupTitle>
                  </MockupHeader>
                  <MockupBody>
                    <div style={{ fontSize: 10, fontWeight: 700, color: colors.text3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>🔥 Hot this week — Beauty</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: colors.bg, borderRadius: 10, padding: 10 }}>
                        <BrandLogoBlock $bg="#B5002D" style={{ width: 36, height: 36, margin: 0, fontSize: 11 }}>RS</BrandLogoBlock>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>Rhode Skin</div>
                          <div style={{ fontSize: 11, color: colors.text3 }}>Skincare · 52% reply rate</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '4px 8px', borderRadius: 6 }}>🔥 Hot</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: colors.bg, borderRadius: 10, padding: 10 }}>
                        <BrandLogoBlock $bg="#2E7D4F" style={{ width: 36, height: 36, margin: 0, fontSize: 11 }}>AN</BrandLogoBlock>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>Anua</div>
                          <div style={{ fontSize: 11, color: colors.text3 }}>K-Beauty · 38% reply rate</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(124, 58, 237, 0.1)', color: colors.violet, padding: '4px 8px', borderRadius: 6 }}>✨ Match</span>
                      </div>
                    </div>
                    <div style={{ marginTop: 14, background: `linear-gradient(135deg, ${colors.roseLight}, #F5F3FF)`, borderRadius: 10, padding: 12, textAlign: 'center', fontSize: 12, fontWeight: 600, color: colors.text2 }}>
                      🔒 5 more matches · <a href="/register/creator" style={{ color: colors.rose, fontWeight: 700, textDecoration: 'none' }}>Upgrade to Pro →</a>
                    </div>
                  </MockupBody>
                </MockupCard>
              </FeatureVisual>
            </FeatureRow>
          </Container>
        </FeatureSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* SOCIAL PROOF */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <ProofSection>
          <Container>
            <SectionCenter>
              <Eyebrow><EyebrowDot /> Creator stories</Eyebrow>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: colors.text, margin: 0 }}>
                Real results. Real creators.<br />
                <em style={{ color: colors.rose }}>Just like you.</em>
              </h2>
            </SectionCenter>

            <NotifWall>
              <NotifPill $delay="0s">
                <span className="notif-icon">📦</span>
                <span><strong>@carolstyle</strong> received a Rhode Skin PR package <span>· 2 hours ago</span></span>
              </NotifPill>
              <NotifPill $delay="0.1s">
                <span className="notif-icon">💬</span>
                <span><strong>@glowwith_m</strong> got a reply from Anua <span>· 5 hours ago</span></span>
              </NotifPill>
              <NotifPill $delay="0.2s">
                <span className="notif-icon">✍️</span>
                <span><strong>@sarahlooks</strong> pitched 8 brands in one afternoon <span>· today</span></span>
              </NotifPill>
              <NotifPill $delay="0.3s">
                <span className="notif-icon">🎉</span>
                <span><strong>@zionne019</strong> landed her first brand deal — 5.3K followers <span>· yesterday</span></span>
              </NotifPill>
            </NotifWall>

            <StatsRow>
              <StatCard $color={colors.rose}>
                <div className="stat-num">900+</div>
                <div className="stat-lbl">Active creators</div>
              </StatCard>
              <StatCard>
                <div className="stat-num">500+</div>
                <div className="stat-lbl">Brand PR contacts</div>
              </StatCard>
              <StatCard $color={colors.green}>
                <div className="stat-num">52%</div>
                <div className="stat-lbl">Top reply rate</div>
              </StatCard>
              <StatCard $color={colors.violet}>
                <div className="stat-num">363</div>
                <div className="stat-lbl">Pitches sent this month</div>
              </StatCard>
            </StatsRow>

            <TestimonialGrid>
              <TestimonialCard>
                <TestimonialCreator>
                  <TestimonialAvatar $bg={colors.rose}>C</TestimonialAvatar>
                  <TestimonialInfo>
                    <div className="name">@carolstyle</div>
                    <div className="meta">17K · Fashion · London</div>
                  </TestimonialInfo>
                </TestimonialCreator>
                <TestimonialStars>★★★★★</TestimonialStars>
                <TestimonialResult>
                  <span>📦</span>
                  Landed Rhode Skin within 3 days. The auto media kit made me look so professional — they actually commented on it.
                </TestimonialResult>
                <TestimonialQuote>"I'd spent months DMing brands on IG. Nothing. This changed everything."</TestimonialQuote>
              </TestimonialCard>
              <TestimonialCard>
                <TestimonialCreator>
                  <TestimonialAvatar $bg={colors.violet}>M</TestimonialAvatar>
                  <TestimonialInfo>
                    <div className="name">@glowwith_m</div>
                    <div className="meta">8.9K · Skincare · Paris</div>
                  </TestimonialInfo>
                </TestimonialCreator>
                <TestimonialStars>★★★★★</TestimonialStars>
                <TestimonialResult>
                  <span>💬</span>
                  Pitched 6 brands in one afternoon. 2 replied in 48 hours. The pipeline keeps me on top of everything.
                </TestimonialResult>
                <TestimonialQuote>"I finally feel like a professional creator, not just a girl sending emails into the void."</TestimonialQuote>
              </TestimonialCard>
              <TestimonialCard>
                <TestimonialCreator>
                  <TestimonialAvatar $bg={colors.green}>Z</TestimonialAvatar>
                  <TestimonialInfo>
                    <div className="name">@zionne019</div>
                    <div className="meta">5.3K · Beauty · NYC</div>
                  </TestimonialInfo>
                </TestimonialCreator>
                <TestimonialStars>★★★★★</TestimonialStars>
                <TestimonialResult>
                  <span>🎉</span>
                  First PR package arrived 2 weeks after signing up. Found Anua in the For You feed — they actively wanted micro creators.
                </TestimonialResult>
                <TestimonialQuote>"I thought you needed 100K followers. I had 5K and it still worked."</TestimonialQuote>
              </TestimonialCard>
            </TestimonialGrid>
          </Container>
        </ProofSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* HOW IT WORKS */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <HowSection id="how-it-works">
          <Container>
            <SectionCenter>
              <Eyebrow><EyebrowDot /> Simple process</Eyebrow>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: colors.text, margin: 0 }}>
                Your first brand deal<br />
                <em style={{ color: colors.rose }}>in 3 steps.</em>
              </h2>
            </SectionCenter>
            <HowSteps>
              <HowStep>
                <div className="how-num">1</div>
                <h3>Find your brands</h3>
                <p>Browse 500+ PR contacts by niche and reply speed. Or check your For You feed — matched brands, every week. Save the ones you want to pitch.</p>
              </HowStep>
              <HowStep>
                <div className="how-num">2</div>
                <h3>Send a complete pitch</h3>
                <p>AI writes a personalised email. Media kit auto-attached. Hit send. Pitch one brand — or ten — in the same session.</p>
              </HowStep>
              <HowStep>
                <div className="how-num">3</div>
                <h3>Track, follow up, win</h3>
                <p>Your pipeline tracks everything. Day-7 reminder fires automatically. Brand replies? Log it. Package ships? Mark it won.</p>
              </HowStep>
            </HowSteps>
            <HowCTA>
              <BtnBlack href="/register/creator">Start landing brand deals →</BtnBlack>
              <div className="sub">Free plan · No credit card · Ready in 2 minutes</div>
            </HowCTA>
          </Container>
        </HowSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* PRICING */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <PricingSection id="pricing">
          <Container>
            <SectionCenter>
              <Eyebrow><EyebrowDot /> Pricing</Eyebrow>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: colors.text, margin: '0 0 8px' }}>
                Free to start.<br />
                <em style={{ color: colors.rose }}>Upgrade when you're ready.</em>
              </h2>
              <p style={{ fontSize: 16, color: colors.text2, margin: 0 }}>Most creators land their first deal on the free plan.</p>
            </SectionCenter>
            <PricingGrid>
              <PricingCard>
                <PricingTier>Free</PricingTier>
                <PricingPrice><sup>$</sup>0</PricingPrice>
                <PricingPriceSub>Forever free · No credit card</PricingPriceSub>
                <PricingFeatures>
                  <PricingFeatureItem><span className="pf-check">✓</span> Brand directory (full access)</PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-check">✓</span> For You feed (top 3 brands/week)</PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-check">✓</span> AI pitch writer (3 per month)</PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-check">✓</span> Auto media kit</PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-check">✓</span> PR Pipeline</PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-cross">—</span> <span className="pf-lock">Batch pitching</span></PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-cross">—</span> <span className="pf-lock">AI follow-up writer</span></PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-cross">—</span> <span className="pf-lock">$PR Value dashboard</span></PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-cross">—</span> <span className="pf-lock">Full For You feed</span></PricingFeatureItem>
                </PricingFeatures>
                <PricingBtn className="outline" href="/register/creator">Get started free</PricingBtn>
              </PricingCard>
              <PricingCard $featured className="featured">
                <PricingBadge>Most popular</PricingBadge>
                <PricingTier $rose>Pro</PricingTier>
                <PricingPrice className="gradient"><sup>$</sup>19</PricingPrice>
                <PricingPriceSub>per month · Cancel anytime</PricingPriceSub>
                <PricingFeatures>
                  <PricingFeatureItem><span className="pf-check">✓</span> Everything in Free</PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-check">✓</span> <strong>Unlimited AI pitches</strong></PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-check">✓</span> <strong>Batch pitching</strong> (10 brands at once)</PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-check">✓</span> <strong>AI follow-up writer</strong></PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-check">✓</span> <strong>Full For You feed</strong></PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-check">✓</span> <strong>$PR Value dashboard</strong></PricingFeatureItem>
                  <PricingFeatureItem><span className="pf-check">✓</span> Priority brand alerts</PricingFeatureItem>
                </PricingFeatures>
                <PricingBtn className="black" href="/register/creator?plan=pro">Start Pro for $19/mo</PricingBtn>
                <PricingNote>Cancel anytime · No contracts</PricingNote>
              </PricingCard>
            </PricingGrid>
          </Container>
        </PricingSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FAQ */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <FAQSection>
          <Container>
            <SectionCenter>
              <Eyebrow><EyebrowDot /> FAQ</Eyebrow>
              <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: colors.text, margin: 0 }}>Quick answers.</h2>
            </SectionCenter>
            <FAQList>
              <FAQItem>
                <FAQSummary>
                  How do I get my first brand deal as a small creator?
                  <span className="faq-icon">+</span>
                </FAQSummary>
                <FAQAnswer>
                  Sign up for newcollab, browse the brand directory filtered to your niche, and send an AI-generated pitch with your auto-attached media kit. Most creators land their first deal within 2 weeks. The key is sending enough pitches and following up. The free plan gives you 3 pitches a month to start.
                </FAQAnswer>
              </FAQItem>
              <FAQItem>
                <FAQSummary>
                  Do I need a media kit to pitch brands?
                  <span className="faq-icon">+</span>
                </FAQSummary>
                <FAQAnswer>
                  Yes! It's the #1 reason brands ignore cold emails. newcollab auto-generates yours from your profile, so every pitch includes your stats, audience demographics, niche, and past collabs. No design skills needed.
                </FAQAnswer>
              </FAQItem>
              <FAQItem>
                <FAQSummary>
                  How many followers do you need to work with brands?
                  <span className="faq-icon">+</span>
                </FAQSummary>
                <FAQAnswer>
                  No minimum. 63% of brands prefer working with nano and micro creators (1K–50K followers) because engagement is more genuine and content feels authentic. newcollab filters brands by follower fit so you only see relevant opportunities.
                </FAQAnswer>
              </FAQItem>
              <FAQItem>
                <FAQSummary>
                  What is a PR package?
                  <span className="faq-icon">+</span>
                </FAQSummary>
                <FAQAnswer>
                  A PR package is when a brand sends you their products for free in exchange for content on your channels: a post, TikTok, story, or reel. You pitch the brand directly via email with your media kit. newcollab handles finding the brand, writing the pitch, and tracking the reply.
                </FAQAnswer>
              </FAQItem>
              <FAQItem>
                <FAQSummary>
                  Where can I find PR forms for brands?
                  <span className="faq-icon">+</span>
                </FAQSummary>
                <FAQAnswer>
                  newcollab's brand directory lists 500+ brands with open PR forms and direct application links across beauty, fashion, skincare, food, tech, and wellness. Filter by niche and send an AI pitch in one click with no hunting for contact emails or application URLs. See the full{' '}
                  <a href="/directory" style={{ color: colors.rose, textDecoration: 'none', fontWeight: 600 }}>PR forms directory</a>.
                </FAQAnswer>
              </FAQItem>
              <FAQItem>
                <FAQSummary>
                  What is a brand PR application form?
                  <span className="faq-icon">+</span>
                </FAQSummary>
                <FAQAnswer>
                  A brand PR application form is a public submission page where creators apply to receive gifted products in exchange for social media content. Brands use these forms to vet creators by niche, follower count, and engagement rate. newcollab lists brands with open PR forms and lets you apply with an AI-generated pitch and auto-attached media kit.
                </FAQAnswer>
              </FAQItem>
              <FAQItem>
                <FAQSummary>
                  Is newcollab free?
                  <span className="faq-icon">+</span>
                </FAQSummary>
                <FAQAnswer>
                  Yes! The free plan includes full brand directory access, auto media kit, PR pipeline, and 3 brand unlocks per month. Pro ($19/month) unlocks unlimited contacts, batch send, full For You feed, and the $PR Value dashboard.
                </FAQAnswer>
              </FAQItem>
            </FAQList>
          </Container>
        </FAQSection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FINAL CTA */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <FinalCTASection>
          <ContainerSm>
            <Eyebrow style={{ color: colors.roseMid, justifyContent: 'center' }}>
              <EyebrowDot style={{ background: colors.roseMid }} /> Start today
            </Eyebrow>
            <FinalH2>
              Your first brand deal<br />
              is one pitch <em>away.</em>
            </FinalH2>
            <FinalSubline>Join 900+ creators who stopped guessing and started getting brand deals.</FinalSubline>
            <FinalCTAActions>
              <BtnRose href="/register/creator">Start for free, no credit card →</BtnRose>
              <FinalTrust>Free plan · 3 AI pitches · Media kit included · Pro cancel anytime</FinalTrust>
            </FinalCTAActions>
          </ContainerSm>
        </FinalCTASection>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* FOOTER */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <Footer>
          <FooterInner>
            <FooterTop>
              <div>
                <FooterLogo>
                  <img src="/newcollab-logo.png" alt="newcollab" />
                </FooterLogo>
                <FooterDesc>The complete brand outreach tool for nano and micro creators.</FooterDesc>
              </div>
              <div>
                <FooterColTitle>Product</FooterColTitle>
                <FooterLinks>
                  <a href="/directory">Brand Directory</a>
                  <a href="/register/creator">AI Pitch Writer</a>
                  <a href="/register/creator">PR Pipeline</a>
                  <a href="/register/creator">For You Feed</a>
                  <a href="/register/creator">Media Kit Builder</a>
                </FooterLinks>
              </div>
              <div>
                <FooterColTitle>Company</FooterColTitle>
                <FooterLinks>
                  <a href="/about">About</a>
                  <a href="/blog">Blog</a>
                  <a href="#pricing">Pricing</a>
                  <a href="mailto:hello@newcollab.co">Contact</a>
                </FooterLinks>
              </div>
              <div>
                <FooterColTitle>Guides</FooterColTitle>
                <FooterLinks>
                  <a href="/blog/companies-with-open-pr-application-forms-influencers-2025">Open PR Application Forms</a>
                  <a href="/blog/list-of-companies-that-send-pr-packages-2025">Companies That Send PR</a>
                  <a href="/blog/pr-emails-for-brands-2025">PR Email Contacts</a>
                  <a href="/blog/pr-list-for-clothing-brands-micro-influencers-2025">Fashion PR List</a>
                  <a href="/blog/ultimate-list-of-gaming-tech-companies-that-sponsor-small-streamers">Gaming Sponsors</a>
                </FooterLinks>
              </div>
            </FooterTop>
            <FooterBottom>
              <FooterCopy>© 2026 newcollab.co · All rights reserved</FooterCopy>
              <FooterSocials>
                <a href="https://www.linkedin.com/company/newcollab/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
                <a href="https://x.com/newcollab_" target="_blank" rel="noopener noreferrer" aria-label="X">
                  <FaXTwitter />
                </a>
                <a href="https://www.instagram.com/newcollab.co/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href="https://www.tiktok.com/@newcollabco" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <FaTiktok />
                </a>
              </FooterSocials>
              <FooterBottomLinks>
                <a href="/privacy-policy">Privacy</a>
                <a href="/terms-of-service">Terms</a>
              </FooterBottomLinks>
            </FooterBottom>
          </FooterInner>
        </Footer>
      </PageContainer>
    </>
  );
};

export default LandingPage;
