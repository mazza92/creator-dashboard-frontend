import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import LandingPageLayout from '../Layouts/LandingPageLayout';

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
  margin-bottom: 32px;
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

  strong {
    color: ${colors.ink};
    font-weight: 700;
  }
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
const BrandPRPackagesPage = () => {
  const signupUrl = 'https://app.newcollab.co/for-brands';

  return (
    <LandingPageLayout>
      <Helmet>
        <title>Newcollab for Brands | Gifted UGC You Can Run as Ads</title>
        <meta name="description" content="Your brand gets a private roster that fills with vetted UGC creators. Select, lock, ship. Ad-ready videos with 6-month commercial reuse. $299/month, first campaign free." />
        <link rel="canonical" href="https://newcollab.co/brands/pr-packages" />
        <meta property="og:title" content="Gifted UGC You Can Run as Ads | Newcollab for Brands" />
        <meta property="og:description" content="Branded roster. Auto-filled creators. Select, lock, ship. Reuse in ads for 6 months. $299/month, first campaign free." />
        <meta property="og:url" content="https://newcollab.co/brands/pr-packages" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* HERO */}
      <HeroSection>
        <Wrap>
          <HeroTag>
            <span className="pulse"></span>
            <span><strong>22+ brands</strong> running Newcollab campaigns this quarter</span>
          </HeroTag>
          <H1>Gifted UGC you can <span>run as ads.</span></H1>
          <HeroSub>
            Your brand gets a private roster page that fills with vetted UGC creators. You select, lock, and export shipping details. Gift the product. Get ad-ready videos back with <strong>6-month commercial usage</strong>.
          </HeroSub>
          <CTARow>
            <BtnPrimary href={signupUrl}>
              Start free campaign
              <ArrowIcon />
            </BtnPrimary>
            <BtnSecondary href="#how">See how it works</BtnSecondary>
          </CTARow>
          <HeroTrust>
            <span><CheckIcon /> First campaign free</span>
            <span><CheckIcon /> Branded roster, auto-filled</span>
            <span><CheckIcon /> Select → lock → ship</span>
            <span><CheckIcon /> Reuse in ads for 6 months</span>
          </HeroTrust>
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
          <SecSub>Same output. Radically different pricing.</SecSub>

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
            <HowStep>
              <HowNum>1</HowNum>
              <HowTitle>Open your branded roster</HowTitle>
              <HowDesc>Private page under your brand name. Vetted UGC creators fill in automatically as they qualify. No searching profiles, no new software.</HowDesc>
            </HowStep>
            <HowStep>
              <HowNum>2</HowNum>
              <HowTitle>Select who to gift</HowTitle>
              <HowDesc>Skip anyone who is not a fit. On a paid plan, we refill the roster when someone is wrong for you. Creator terms are already agreed when they apply.</HowDesc>
            </HowStep>
            <HowStep>
              <HowNum>3</HowNum>
              <HowTitle>Lock and ship</HowTitle>
              <HowDesc>Lock the list and shipping details unlock as a CSV. Gift product. Organic posts and UGC files land in the same inbox, ready to run as ads for 6 months.</HowDesc>
            </HowStep>
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

              <PricingCTA href={signupUrl}>
                Start free campaign
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

      {/* FAQ */}
      <FAQSection id="faq">
        <Wrap>
          <SecLabel>Questions we get a lot</SecLabel>
          <SecTitle>What brands <span>ask us.</span></SecTitle>

          <FAQList>
            <FAQItem>
              <FAQQ>Is this an affiliate or referral program?</FAQQ>
              <FAQA>No. Newcollab runs on gifted UGC content swaps only. <strong>No commission tracking, no revshare, no attribution.</strong> Brand ships gifted product to creator, creator delivers organic + UGC with 6-month commercial usage. That's it.</FAQA>
            </FAQItem>
            <FAQItem>
              <FAQQ>Can I reuse the content in ads?</FAQQ>
              <FAQA>Yes. You get <strong>6-month commercial usage</strong> from delivery. Run the videos as paid ads on Meta or TikTok, and on your own channels. Creators keep ownership. No exclusivity, no royalties during the term.</FAQA>
            </FAQItem>
            <FAQItem>
              <FAQQ>What is the branded roster?</FAQQ>
              <FAQA>A private page under your brand name. Vetted UGC creators fill it automatically. You select who to gift, lock the list, export a shipping CSV, and collect content in the same link. No login for your team. No hunting profiles yourself.</FAQA>
            </FAQItem>
            <FAQItem>
              <FAQQ>What if the creators aren't the right fit?</FAQQ>
              <FAQA>Skip anyone before you lock. After you subscribe, we refill the roster when someone is not a fit so you are not stuck searching Instagram or negotiating replacements by email.</FAQA>
            </FAQItem>
            <FAQItem>
              <FAQQ>Are terms already agreed?</FAQQ>
              <FAQA>Yes. Creators accept gifted PR terms and 6-month UGC usage when they apply. You are not chasing contracts or usage paperwork after you pick them.</FAQA>
            </FAQItem>
            <FAQItem>
              <FAQQ>How does the free first campaign work?</FAQQ>
              <FAQA>You get 5 vetted creators + 5-10 UGC videos delivered with no platform fee. Your only cost is your PR package and shipping. If the content lands, you opt in to $299/mo from month 2. <strong>No auto-billing.</strong> If it doesn't work, no obligation. You still keep 6-month commercial reuse on what was delivered.</FAQA>
            </FAQItem>
            <FAQItem>
              <FAQQ>What kind of brands work with Newcollab?</FAQQ>
              <FAQA>DTC brands running paid social. Most of our brand partners are in beauty, skincare, wellness, fashion, fitness, and lifestyle. Sweet spot: <strong>brands with $500K-$10M revenue running Meta or TikTok ads</strong> and looking to fill their creative library with authentic UGC.</FAQA>
            </FAQItem>
            <FAQItem>
              <FAQQ>Can creators post on their own accounts too?</FAQQ>
              <FAQA>Some do when it fits their content plan. Organic posts are a bonus, not a guarantee at this tier. If you specifically need guaranteed distribution on creator accounts, we offer that as a paid supplement ($75/creator).</FAQA>
            </FAQItem>
            <FAQItem>
              <FAQQ>Do you have creators in [specific niche]?</FAQQ>
              <FAQA>Our core pool skews beauty and skincare. For niches outside that (fitness, men's grooming, food, home), we hand-source creators from TikTok and Instagram to match your brief. Sourcing adds 3-5 days to campaign timeline.</FAQA>
            </FAQItem>
            <FAQItem>
              <FAQQ>How do I cancel?</FAQQ>
              <FAQA>Reply to any Newcollab email or email team@newcollab.co with "cancel." Your subscription stops immediately, no last month charge, no questions. Commercial reuse already granted on delivered content continues for its 6-month term.</FAQA>
            </FAQItem>
          </FAQList>
        </Wrap>
      </FAQSection>

      {/* FINAL CTA */}
      <FinalCTA>
        <Wrap>
          <FinalInner>
            <h2>Start your <span>free campaign</span> today.</h2>
            <p>Open your branded roster, pick who to gift, lock, and ship. Ad-ready UGC with 6-month commercial usage. Pay $299/mo only if it works.</p>
            <BtnPrimary href={signupUrl}>
              Start free campaign
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
    </LandingPageLayout>
  );
};

export default BrandPRPackagesPage;
