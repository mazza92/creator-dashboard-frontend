'use client';

import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { Sparkles, TrendingUp, Users } from 'lucide-react';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';
import { FAQ_ITEMS, HOW_STEPS, PAGE_URL, SIGNUP_URL } from './content';
import { relatedLinks, trackBrandCtaClick } from '../_cluster/catalog';
import CitationCompareTable from '../../components/CitationCompareTable';
import { CITATION_LAST_UPDATED } from '../../../lib/citationFacts';
import ScanInput from '../scan/ScanInput';
import { scanUrl } from '../scan/scanApi';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const colors = {
  pink: '#e8395f',
  pinkHover: '#c92549',
  pinkSoft: '#fef2f4',
  pinkTint: '#fde8ec',
  ink: '#15161a',
  ink2: '#2b2d33',
  inkSoft: '#4a4d55',
  muted: '#6b6f78',
  muted2: '#9ca0a8',
  line: '#e5e7eb',
  lineSoft: '#f1f2f4',
  bg: '#ffffff',
  bgSoft: '#f7f7f8',
  bgTint: '#fafafa',
  green: '#0f9d58',
  greenSoft: '#e8f7ed',
};

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Wrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

// Hero Section
const HeroSection = styled.section`
  padding: 160px 0 72px;
  background: linear-gradient(180deg, #fff 0%, ${colors.pinkSoft} 100%);
  border-bottom: 1px solid ${colors.lineSoft};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -100px;
    right: -100px;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(232,57,95,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 720px) {
    padding: 120px 0 48px;
  }
`;

const HeroTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid ${colors.line};
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${colors.inkSoft};
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(15,17,20,0.04);

  .pulse {
    width: 7px;
    height: 7px;
    background: ${colors.green};
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }

  strong {
    color: ${colors.pink};
    font-weight: 800;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

const H1 = styled.h1`
  font-size: 64px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: ${colors.ink};
  margin: 0 0 22px 0;
  max-width: 820px;

  span {
    color: ${colors.pink};
  }

  @media (max-width: 720px) {
    font-size: 40px;
  }
`;

const HeroSub = styled.p`
  font-size: 20px;
  color: ${colors.inkSoft};
  max-width: 640px;
  margin: 0 0 36px 0;
  line-height: 1.5;

  strong {
    color: ${colors.ink};
    font-weight: 700;
  }

  @media (max-width: 720px) {
    font-size: 17px;
  }
`;

const CTARow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 12px;
`;

const Btn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 26px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15.5px;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  text-decoration: none;
`;

const BtnPrimary = styled(Btn)`
  background: ${colors.pink};
  color: #fff;
  box-shadow: 0 6px 18px rgba(232,57,95,0.28);

  &:hover {
    background: ${colors.pinkHover};
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(232,57,95,0.36);
    color: #fff;
  }

  svg {
    transition: transform 0.15s;
  }

  &:hover svg {
    transform: translateX(3px);
  }
`;

const BtnSecondary = styled(Btn)`
  background: #fff;
  color: ${colors.ink};
  border: 1.5px solid ${colors.line};

  &:hover {
    border-color: ${colors.ink};
    color: ${colors.ink};
  }
`;

const FounderNote = styled.p`
  margin: 0 0 28px;
  font-size: 14px;
  color: ${colors.muted};
  a {
    color: ${colors.ink};
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const HeroTrust = styled.div`
  display: flex;
  gap: 22px;
  font-size: 13px;
  color: ${colors.muted};
  flex-wrap: wrap;

  span {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  svg {
    color: ${colors.green};
    flex-shrink: 0;
  }
`;

// Centered, Lightreel-style hero with the Brand Scan input
const HeroCenter = styled.div`
  text-align: center;

  h1, p {
    margin-left: auto;
    margin-right: auto;
  }

  > div {
    justify-content: center;
  }
`;

const ScanWrap = styled.div`
  max-width: 680px;
  margin: 0 auto 26px;
`;

const ScanLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.muted};
  margin-bottom: 10px;
`;

// "What a scan shows you": static product preview, no screenshot
const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 28px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PreviewPoints = styled.div`
  display: grid;
  gap: 14px;

  div {
    border: 1px solid ${colors.line};
    border-radius: 14px;
    padding: 16px 18px;
    background: #fff;
  }

  strong {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    color: ${colors.ink};
    margin-bottom: 4px;
  }

  svg {
    color: ${colors.pink};
  }

  span {
    font-size: 14px;
    line-height: 1.5;
    color: ${colors.muted};
  }
`;

const PreviewCard = styled.div`
  border: 1px solid ${colors.line};
  border-radius: 20px;
  background: #fff;
  padding: 20px;
  box-shadow: 0 18px 48px rgba(15, 17, 20, 0.08);

  .ask {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 14px;
  }

  .ask .ex {
    margin-right: auto;
    align-self: center;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${colors.muted2};
  }

  .ask span {
    background: ${colors.bgSoft};
    border-radius: 16px 16px 4px 16px;
    padding: 8px 14px;
    font-size: 13px;
    color: ${colors.ink};
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    color: ${colors.inkSoft};
    margin: 0 0 12px;
  }

  p b {
    color: ${colors.ink};
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 14px;
  }

  .chips span {
    border: 1px solid ${colors.line};
    border-radius: 10px;
    padding: 5px 10px;
    font-size: 12px;
    color: ${colors.muted};
  }

  .chips b {
    color: ${colors.ink};
    margin-right: 4px;
  }

  .vids {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 14px;
  }

  .vids div {
    aspect-ratio: 9 / 16;
    border-radius: 10px;
    background: linear-gradient(160deg, #3a3d45 0%, #15161a 100%);
    position: relative;
  }

  .vids div::after {
    content: attr(data-views);
    position: absolute;
    left: 6px;
    bottom: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
  }

  .hook {
    border: 1px solid ${colors.lineSoft};
    border-radius: 12px;
    padding: 10px 12px;
    font-size: 13px;
    color: ${colors.ink};
  }

  .hook small {
    display: block;
    color: ${colors.muted};
    margin-top: 2px;
  }
`;

// Social Proof Band
const ProofBand = styled.div`
  padding: 40px 0;
  background: #fff;
  border-bottom: 1px solid ${colors.lineSoft};
`;

const ProofLabel = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: ${colors.muted};
  text-transform: uppercase;
  margin-bottom: 20px;
`;

const ProofLogos = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 38px 44px;
  font-family: "Times New Roman", serif;
  font-weight: 700;
  font-size: 18px;
  color: ${colors.inkSoft};
  letter-spacing: -0.02em;

  span {
    opacity: 0.75;
    transition: opacity 0.15s;
    &:hover { opacity: 1; }
  }

  @media (max-width: 720px) {
    gap: 24px;
    font-size: 15px;
  }
`;

// Section Base
const Section = styled.section`
  padding: 88px 0;

  @media (max-width: 720px) {
    padding: 56px 0;
  }
`;

const SecLabel = styled.div`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: ${colors.pink};
  text-transform: uppercase;
  margin-bottom: 14px;
`;

const SecTitle = styled.h2`
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: ${colors.ink};
  max-width: 760px;
  margin: 0 0 16px 0;

  span {
    color: ${colors.pink};
  }

  @media (max-width: 720px) {
    font-size: 30px;
  }
`;

const SecSub = styled.p`
  font-size: 18px;
  color: ${colors.inkSoft};
  max-width: 640px;
  line-height: 1.55;
  margin: 0 0 48px 0;

  @media (max-width: 720px) {
    font-size: 16px;
    margin-bottom: 32px;
  }
`;

// Value Grid
const ValueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ValueCard = styled.div`
  background: ${colors.bgTint};
  border: 1px solid ${colors.lineSoft};
  border-radius: 16px;
  padding: 24px;
  transition: all 0.18s;

  &:hover {
    border-color: ${colors.pinkTint};
    box-shadow: 0 4px 16px rgba(15,17,20,0.06);
    transform: translateY(-3px);
  }
`;

const ValueIcon = styled.div`
  width: 44px;
  height: 44px;
  background: ${colors.pinkSoft};
  color: ${colors.pink};
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  font-size: 20px;
`;

const ValueTitle = styled.div`
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: ${colors.ink};
  margin-bottom: 6px;
`;

const ValueDesc = styled.div`
  font-size: 14px;
  color: ${colors.muted};
  line-height: 1.5;
`;

// Comparison Section
const CompareSection = styled.section`
  background: ${colors.ink};
  color: #fff;
  padding: 88px 0;

  ${SecLabel} { color: ${colors.pink}; }
  ${SecTitle} { color: #fff; }
  ${SecTitle} span { color: ${colors.pink}; }
  ${SecSub} { color: #c7c9d0; }
`;

const CompareGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 44px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const CompareCard = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 26px;

  &.highlight {
    background: linear-gradient(180deg, rgba(232,57,95,0.15) 0%, rgba(232,57,95,0.05) 100%);
    border-color: ${colors.pink};
    position: relative;

    &::before {
      content: "THIS IS US";
      position: absolute;
      top: -11px;
      left: 24px;
      background: ${colors.pink};
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 100px;
      letter-spacing: 0.06em;
    }
  }
`;

const CompareName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #c7c9d0;
  margin-bottom: 12px;
  letter-spacing: -0.005em;

  .highlight & {
    color: #fff;
  }
`;

const ComparePrice = styled.div`
  font-size: 38px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff;
  line-height: 1;
  margin-bottom: 6px;
`;

const ComparePer = styled.div`
  font-size: 14px;
  color: #9ca0a8;
  margin-bottom: 20px;
`;

const CompareList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 9px;
  font-size: 13.5px;
  color: #c7c9d0;
  margin: 0;
  padding: 0;

  li {
    display: flex;
    gap: 9px;
    align-items: flex-start;
    line-height: 1.4;

    &::before {
      content: "·";
      color: ${colors.pink};
      font-weight: 800;
      flex-shrink: 0;
    }

    &.miss {
      color: #6b6f78;
      &::before {
        content: "✕";
        color: #6b6f78;
        font-size: 11px;
        margin-top: 2px;
      }
    }
  }
`;

// How It Works
const HowSection = styled(Section)`
  background: ${colors.bgTint};
`;

const HowSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  position: relative;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

const HowStep = styled.div`
  background: #fff;
  border: 1px solid ${colors.lineSoft};
  border-radius: 18px;
  padding: 32px 26px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 60px rgba(15,17,20,0.16), 0 8px 20px rgba(15,17,20,0.08);
  }
`;

const HowNum = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, ${colors.pink} 0%, #c92549 100%);
  color: #fff;
  border-radius: 12px;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.02em;
  margin-bottom: 18px;
  box-shadow: 0 4px 12px rgba(232,57,95,0.28);
`;

const HowTitle = styled.div`
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: ${colors.ink};
  margin-bottom: 8px;
`;

const HowDesc = styled.div`
  font-size: 15px;
  color: ${colors.inkSoft};
  line-height: 1.55;

  a {
    color: ${colors.pink};
    font-weight: 600;
    text-decoration: none;
  }
`;

// Pricing Section
const PricingSection = styled(Section)`
  background: #fff;
`;

const PricingContainer = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 48px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const PricingCopy = styled.div`
  h3 {
    font-size: 36px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: ${colors.ink};
    margin: 0 0 14px 0;

    span { color: ${colors.pink}; }
  }

  p {
    font-size: 16.5px;
    color: ${colors.inkSoft};
    line-height: 1.6;
    margin: 0 0 20px 0;

    strong {
      color: ${colors.ink};
      font-weight: 700;
    }
  }

  @media (max-width: 900px) {
    h3 { font-size: 28px; }
  }
`;

const PricingCallouts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
`;

const Callout = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  background: ${colors.bgTint};
  border-radius: 12px;
  font-size: 14.5px;
  color: ${colors.ink2};
  line-height: 1.45;

  strong {
    color: ${colors.ink};
    font-weight: 700;
  }
`;

const CalloutIcon = styled.div`
  width: 26px;
  height: 26px;
  background: ${colors.pinkSoft};
  color: ${colors.pink};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`;

const PricingCard = styled.div`
  background: linear-gradient(180deg, ${colors.pinkSoft} 0%, #fff 100%);
  border: 2px solid ${colors.pink};
  border-radius: 24px;
  padding: 44px 36px;
  position: relative;
  box-shadow: 0 24px 60px rgba(15,17,20,0.16), 0 8px 20px rgba(15,17,20,0.08);
`;

const PricingBadge = styled.div`
  position: absolute;
  top: -14px;
  left: 36px;
  background: ${colors.ink};
  color: #fff;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
`;

const PricingTier = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: ${colors.pink};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const PricingPriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;

  .amount {
    font-size: 64px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: ${colors.ink};
    line-height: 1;
  }

  .per {
    font-size: 17px;
    color: ${colors.muted};
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .amount { font-size: 52px; }
  }
`;

const PricingNote = styled.div`
  font-size: 15px;
  color: ${colors.inkSoft};
  margin-bottom: 26px;

  strong {
    color: ${colors.pink};
    font-weight: 800;
  }
`;

const PricingFeatures = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 28px 0;
  padding: 0;

  li {
    display: flex;
    gap: 11px;
    align-items: flex-start;
    font-size: 15px;
    color: ${colors.ink2};
    line-height: 1.5;
  }
`;

const PFCheck = styled.span`
  width: 20px;
  height: 20px;
  background: ${colors.green};
  color: #fff;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-weight: 800;
  font-size: 11px;
  margin-top: 1px;
`;

const PricingCTA = styled(BtnPrimary)`
  width: 100%;
  justify-content: center;
  font-size: 16px;
`;

const PricingFine = styled.div`
  text-align: center;
  font-size: 12.5px;
  color: ${colors.muted};
  margin-top: 14px;
`;

// Creators Section
const CreatorsSection = styled(Section)`
  background: ${colors.bgTint};
`;

const CreatorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 12px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
  }
`;

const CreatorCard = styled.div`
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid ${colors.lineSoft};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(15,17,20,0.1);
  }
`;

const CreatorScreenshot = styled.img`
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 9 / 16;
  object-fit: cover;
  object-position: top;
`;

const CreatorCaption = styled.div`
  padding: 16px 20px;
  text-align: center;
  background: linear-gradient(180deg, #fff 0%, ${colors.bgTint} 100%);
  border-top: 1px solid ${colors.lineSoft};
`;

const CreatorTag = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 10px;
  background: ${colors.pinkSoft};
  color: ${colors.pink};
  border-radius: 100px;
`;

// FAQ Section
const FAQSection = styled(Section)`
  background: #fff;
`;

const FAQList = styled.div`
  max-width: 820px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
`;

const FAQItem = styled.div`
  background: ${colors.bgTint};
  border: 1px solid ${colors.lineSoft};
  border-radius: 12px;
  padding: 22px 24px;
  transition: border-color 0.15s;

  &:hover {
    border-color: ${colors.pinkTint};
  }
`;

const FAQQ = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: ${colors.ink};
  letter-spacing: -0.01em;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;

  &::before {
    content: "→";
    color: ${colors.pink};
    font-weight: 800;
  }
`;

const FAQA = styled.div`
  font-size: 15px;
  color: ${colors.inkSoft};
  line-height: 1.6;
  padding-left: 22px;
`;

const RelatedRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
`;

const RelatedLink = styled.a`
  border: 1px solid ${colors.line};
  border-radius: 100px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.ink};
  text-decoration: none;
  &:hover { border-color: ${colors.pink}; color: ${colors.pink}; }
`;

// Final CTA
const FinalCTA = styled.section`
  background: ${colors.ink};
  color: #fff;
  padding: 96px 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(232,57,95,0.2) 0%, transparent 70%);
    pointer-events: none;
  }

  @media (max-width: 720px) {
    h2 { font-size: 36px; }
  }
`;

const FinalInner = styled.div`
  max-width: 760px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;

  h2 {
    font-size: 52px;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin: 0 0 20px 0;

    span { color: ${colors.pink}; }
  }

  p {
    font-size: 18px;
    color: #c7c9d0;
    margin: 0 auto 36px;
    line-height: 1.55;
    max-width: 520px;
  }

  ${BtnPrimary} {
    padding: 18px 32px;
    font-size: 16px;
  }
`;

const FinalTrust = styled.div`
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 13px;
  color: #9ca0a8;
  flex-wrap: wrap;

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  svg {
    color: ${colors.pink};
  }
`;

// ============================================================================
// ICONS
// ============================================================================
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
    <polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ============================================================================
// COMPONENT
// ============================================================================
export default function PRPackagesClient() {
  const signupUrl = SIGNUP_URL;
  const onCta = (location) => () => trackBrandCtaClick('pr-packages', location);
  const router = useRouter();
  const onScan = (brand) => {
    trackBrandCtaClick('pr-packages', 'hero_scan');
    router.push(scanUrl(brand, 'landing'));
  };

  return (
    <LandingPageLayoutNext canonicalUrl={PAGE_URL}>
      {/* HERO */}
      <HeroSection>
        <Wrap>
          <HeroCenter>
            <HeroTag>
              <span className="pulse"></span>
              <span><strong>New:</strong> Brand Scan, free TikTok creator lookup</span>
            </HeroTag>
            <H1>See who&apos;s posting for your competitors. <span>Get them posting for you.</span></H1>
            <HeroSub>
              Scan any brand to see the TikTok creators, hooks and videos behind its growth. Then gift vetted creators who make the same content for you, with <strong>6-month ad rights</strong>. First campaign free.
            </HeroSub>
            <ScanWrap>
              <ScanLabel>Scan a competitor</ScanLabel>
              <ScanInput onSubmit={onScan} placeholder="Type a brand, e.g. Glow Recipe or @glowrecipe" />
            </ScanWrap>
            <CTARow>
              <BtnPrimary href={signupUrl} onClick={onCta('hero')}>
                Try your first campaign free
                <ArrowIcon />
              </BtnPrimary>
              <BtnSecondary href="#how">See how it works</BtnSecondary>
            </CTARow>
            <FounderNote>
              Prefer a 10-minute setup?{' '}
              <a href="mailto:team@newcollab.co?subject=Free%20gifted%20UGC%20campaign" onClick={onCta('hero_email')}>
                Email Mazza and I&apos;ll open the roster for you.
              </a>
            </FounderNote>
            <HeroTrust>
              <span><CheckIcon /> First campaign free</span>
              <span><CheckIcon /> Vetted creators, auto-filled</span>
              <span><CheckIcon /> Select, lock, ship</span>
              <span><CheckIcon /> Reuse in ads for 6 months</span>
            </HeroTrust>
          </HeroCenter>
        </Wrap>
      </HeroSection>

      {/* SOCIAL PROOF */}
      <ProofBand>
        <Wrap>
          <ProofLabel>Trusted by brands running gifted UGC campaigns</ProofLabel>
          <ProofLogos>
            <span>Byoma</span>
            <span>Scandinavian Biolabs</span>
            <span>Ocean Botanicals</span>
            <span>MDaire</span>
            <span>HitchSwitch</span>
            <span>Zenkyu Matcha</span>
            <span>Pier Augé</span>
            <span>Kappel</span>
          </ProofLogos>
        </Wrap>
      </ProofBand>

      {/* BRAND SCAN */}
      <Section id="scan">
        <Wrap>
          <SecLabel>Brand Scan</SecLabel>
          <SecTitle>Your competitor&apos;s creator playbook, <span>in one search.</span></SecTitle>
          <SecSub>
            Type any brand and get a report built from live TikTok posts: who is posting, what they say in the first second, and which videos get the views. Free, no login.
          </SecSub>
          <PreviewGrid>
            <PreviewPoints>
              <div><strong><Users size={17} /> Every creator posting</strong><span>Handles, follower counts, and whether each post was gifted, paid or affiliate.</span></div>
              <div><strong><Sparkles size={17} /> Hooks that repeat</strong><span>The opening lines several creators reuse. That is the brand&apos;s creator script, ready to brief your own creators on.</span></div>
              <div><strong><TrendingUp size={17} /> Videos that win</strong><span>Top posts by views, with the creator and the hook behind each one.</span></div>
              <div><strong>→ Creators ready for you</strong><span>Vetted Newcollab creators who fit the same profile and are open to gifting your brand.</span></div>
            </PreviewPoints>
            <PreviewCard aria-label="Example Brand Scan result">
              <div className="ask"><small className="ex">Example report</small><span>Scan Dewy Labs</span></div>
              <p><b>Dewy Labs</b> has <b>41 creators</b> posting about it on TikTok in the last 6 months, across <b>63 videos</b>. Most are small creators and the top hook ran on <b>9 videos</b>.</p>
              <div className="chips">
                <span><b>41</b>creators</span>
                <span><b>63</b>videos</span>
                <span><b>8.2K</b>median followers</span>
              </div>
              <div className="vids">
                <div data-views="444K" />
                <div data-views="356K" />
                <div data-views="142K" />
                <div data-views="36K" />
              </div>
              <div className="hook">“when i say my skin is basically clear but i…”<small>9 videos · 7 creators</small></div>
            </PreviewCard>
          </PreviewGrid>
          <CTARow style={{ marginTop: 28 }}>
            <BtnPrimary href="/brands/scan" onClick={onCta('scan_section')}>
              Scan a brand free
              <ArrowIcon />
            </BtnPrimary>
          </CTARow>
        </Wrap>
      </Section>

      {/* WHAT YOU GET */}
      <Section>
        <Wrap>
          <SecLabel>What you actually get</SecLabel>
          <SecTitle>Gifting on rails. <span>From pick to ship.</span></SecTitle>
          <SecSub>
            No scrolling Instagram for hours. No cold DMs. No chasing addresses or contracts.
            Your branded Newcollab roster fills with fit creators. Terms are already agreed when they apply.
            You pick who to gift, lock the list, and ship.
          </SecSub>

          <ValueGrid>
            <ValueCard>
              <ValueIcon>🔗</ValueIcon>
              <ValueTitle>Your branded roster page</ValueTitle>
              <ValueDesc>A private link under your brand name. Creators land there as they qualify. One place to pick, ship, and collect content. No login maze.</ValueDesc>
            </ValueCard>
            <ValueCard>
              <ValueIcon>🎯</ValueIcon>
              <ValueTitle>Auto-filled with vetted creators</ValueTitle>
              <ValueDesc>We source UGC creators for your niche and place them on your roster. You skip discovery. Skip anyone who is not a fit.</ValueDesc>
            </ValueCard>
            <ValueCard>
              <ValueIcon>📦</ValueIcon>
              <ValueTitle>Select, lock, shipping ready</ValueTitle>
              <ValueDesc>Lock your picks and full shipping details unlock as a CSV for Shopify or ShipStation. Gift product the way you already ship orders.</ValueDesc>
            </ValueCard>
            <ValueCard>
              <ValueIcon>📜</ValueIcon>
              <ValueTitle>Reuse in ads for 6 months</ValueTitle>
              <ValueDesc>Commercial usage for 6 months after delivery. Run as paid ads or on your channels. Creators keep ownership. Terms agreed upfront.</ValueDesc>
            </ValueCard>
          </ValueGrid>
        </Wrap>
      </Section>

      {/* COMPARISON */}
      <CompareSection>
        <Wrap>
          <SecLabel>Cost comparison</SecLabel>
          <SecTitle>$299/month or <span>$5,000/month.</span></SecTitle>
          <SecSub>Same output. Radically different pricing. Cite the table — last updated {CITATION_LAST_UPDATED}.</SecSub>
          <CitationCompareTable tone="dark" />

          <CompareGrid>
            <CompareCard>
              <CompareName>UGC Agency</CompareName>
              <ComparePrice>$2,500</ComparePrice>
              <ComparePer>per month, minimum</ComparePer>
              <CompareList>
                <li>5-8 UGC assets per month</li>
                <li>Agency markup on creator fees</li>
                <li>Limited usage rights, expire annually</li>
                <li className="miss">You don't own the content long-term</li>
                <li className="miss">Long contracts, minimum 6 months</li>
              </CompareList>
            </CompareCard>

            <CompareCard className="highlight">
              <CompareName>Newcollab</CompareName>
              <ComparePrice>$299</ComparePrice>
              <ComparePer>per month · first campaign free</ComparePer>
              <CompareList>
                <li>Branded roster that fills itself</li>
                <li>Select, lock, shipping CSV ready</li>
                <li>Creator terms already agreed</li>
                <li>Commercial reuse for 6 months</li>
                <li>Cancel anytime</li>
              </CompareList>
            </CompareCard>

            <CompareCard>
              <CompareName>Traditional PR / Influencer platform</CompareName>
              <ComparePrice>$5,000+</ComparePrice>
              <ComparePer>per month, annual contracts</ComparePer>
              <CompareList>
                <li>Enterprise dashboard nobody uses</li>
                <li>Setup fees on top of subscription</li>
                <li>Focus on reach, not content assets</li>
                <li className="miss">Rarely delivers ad-ready UGC</li>
                <li className="miss">Locked into annual contracts</li>
              </CompareList>
            </CompareCard>
          </CompareGrid>
        </Wrap>
      </CompareSection>

      {/* HOW IT WORKS */}
      <HowSection id="how">
        <Wrap>
          <SecLabel>How it works</SecLabel>
          <SecTitle>Three steps. <span>No discovery. No DMs.</span></SecTitle>
          <SecSub>Your branded roster does the busywork. You decide who gets a gift and when it ships.</SecSub>

          <HowSteps>
            {HOW_STEPS.map((step, index) => (
              <HowStep key={step.name}>
                <HowNum>{index + 1}</HowNum>
                <HowTitle>{step.name}</HowTitle>
                <HowDesc>{step.text}</HowDesc>
              </HowStep>
            ))}
          </HowSteps>
        </Wrap>
      </HowSection>

      {/* PRICING */}
      <PricingSection id="pricing">
        <Wrap>
          <PricingContainer>
            <PricingCopy>
              <SecLabel>Simple pricing</SecLabel>
              <h3>One plan. <span>First campaign free.</span></h3>
              <p>Test the swap on us. If the UGC lands and you want more, opt in to the monthly plan starting month 2. <strong>No auto-billing, no locked contracts.</strong></p>

              <PricingCallouts>
                <Callout>
                  <CalloutIcon>🎁</CalloutIcon>
                  <div><strong>First campaign is free.</strong> Only pay if the content works for you.</div>
                </Callout>
                <Callout>
                  <CalloutIcon>🔄</CalloutIcon>
                  <div><strong>No auto-renewal.</strong> You explicitly opt in to month 2.</div>
                </Callout>
                <Callout>
                  <CalloutIcon>✕</CalloutIcon>
                  <div><strong>Cancel anytime.</strong> Zero commitment. Zero questions.</div>
                </Callout>
              </PricingCallouts>
            </PricingCopy>

            <PricingCard>
              <PricingBadge>MOST POPULAR</PricingBadge>
              <PricingTier>Subscription</PricingTier>
              <PricingPriceRow>
                <span className="amount">$299</span>
                <span className="per">/ month</span>
              </PricingPriceRow>
              <PricingNote><strong>First campaign free.</strong> No card required to start.</PricingNote>

              <PricingFeatures>
                <li><PFCheck>✓</PFCheck><span>Dedicated branded roster (private link)</span></li>
                <li><PFCheck>✓</PFCheck><span>Auto-filled with vetted UGC creators</span></li>
                <li><PFCheck>✓</PFCheck><span>Select, lock, shipping CSV ready for Shopify</span></li>
                <li><PFCheck>✓</PFCheck><span>Refill unfit creators once you are subscribed</span></li>
                <li><PFCheck>✓</PFCheck><span>5-10 UGC videos / month, reuse in ads for 6 months</span></li>
                <li><PFCheck>✓</PFCheck><span>Cancel anytime, no auto-billing</span></li>
              </PricingFeatures>

              <PricingCTA href={signupUrl} onClick={onCta('pricing')}>
                Try your first campaign free
                <ArrowIcon />
              </PricingCTA>
              <PricingFine>Your only cost for the trial: PR package + shipping</PricingFine>
            </PricingCard>
          </PricingContainer>
        </Wrap>
      </PricingSection>

      {/* CREATORS */}
      <CreatorsSection>
        <Wrap>
          <SecLabel>Real creators, real content</SecLabel>
          <SecTitle>Vetted UGC creators, <span>not random influencers.</span></SecTitle>
          <SecSub>A snapshot of creators in our pool. Every one is hand-vetted for niche fit, content quality, and brand safety before we suggest them to you.</SecSub>

          <CreatorsGrid>
            <CreatorCard>
              <CreatorScreenshot
                src="/images/marketing/ugc_example_1.PNG"
                alt="UGC creator profile example"
              />
              <CreatorCaption>
                <CreatorTag>Clear niche</CreatorTag>
              </CreatorCaption>
            </CreatorCard>
            <CreatorCard>
              <CreatorScreenshot
                src="/images/marketing/ugc_example_2.PNG"
                alt="UGC creator profile example"
              />
              <CreatorCaption>
                <CreatorTag>Quality content</CreatorTag>
              </CreatorCaption>
            </CreatorCard>
            <CreatorCard>
              <CreatorScreenshot
                src="/images/marketing/ugc_example_3.PNG"
                alt="UGC creator profile example"
              />
              <CreatorCaption>
                <CreatorTag>UGC creator</CreatorTag>
              </CreatorCaption>
            </CreatorCard>
          </CreatorsGrid>
        </Wrap>
      </CreatorsSection>

      {/* RELATED CLUSTER */}
      <Section>
        <Wrap>
          <SecLabel>More for brands</SecLabel>
          <SecTitle>Jobs, comparisons, <span>and beauty UGC.</span></SecTitle>
          <RelatedRow>
            {relatedLinks('pr-packages').map((item) => (
              <RelatedLink key={item.href} href={item.href}>{item.label}</RelatedLink>
            ))}
          </RelatedRow>
        </Wrap>
      </Section>

      {/* FAQ */}
      <FAQSection id="faq">
        <Wrap>
          <SecLabel>Questions we get a lot</SecLabel>
          <SecTitle>What brands <span>ask us.</span></SecTitle>

          <FAQList>
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.question}>
                <FAQQ>{item.question}</FAQQ>
                <FAQA>{item.answer}</FAQA>
              </FAQItem>
            ))}
          </FAQList>
        </Wrap>
      </FAQSection>

      {/* FINAL CTA */}
      <FinalCTA>
        <Wrap>
          <FinalInner>
            <h2>Try your <span>first campaign free.</span></h2>
            <p>Open your branded roster, pick who to gift, lock, and ship. Ad-ready UGC with 6-month commercial usage. Pay $299/mo only if it works.</p>
            <BtnPrimary href={signupUrl} onClick={onCta('footer')}>
              Try your first campaign free
              <ArrowIcon />
            </BtnPrimary>
            <FinalTrust>
              <span><CheckIcon /> No card required</span>
              <span><CheckIcon /> Cancel anytime</span>
              <span><CheckIcon /> Reuse in ads for 6 months</span>
            </FinalTrust>
          </FinalInner>
        </Wrap>
      </FinalCTA>
    </LandingPageLayoutNext>
  );
}
