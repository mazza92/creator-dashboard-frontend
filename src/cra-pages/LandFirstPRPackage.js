import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// ═══════════════════════════════════════════════════════════════════
// INTENT VARIANTS (plain data - rendered with Accent component below)
// ═══════════════════════════════════════════════════════════════════
const INTENT_VARIANTS = {
  default: {
    headlinePart1: "Land your first",
    headlineAccent: "PR package.",
    subheadline: "Even at 500 followers. Newcollab's AI manager finds brands that reply to creators like you, writes your pitch, and coaches you until brands say yes.",
    ctaText: "Get my first PR match",
  },
  pr_small_creator: {
    headlinePart1: "Land PR as a",
    headlineAccent: "small creator.",
    subheadline: "Most brands ignore you. But 23% of them gift creators under 5K. Your AI manager shows you which ones—and writes the pitch that gets replies.",
    ctaText: "Find brands that gift small creators",
  },
  pr_no_following: {
    headlinePart1: "No big following?",
    headlineAccent: "No problem.",
    subheadline: "Brands don't only care about follower count. Newcollab matches you with brands that reply to creators your size and writes the pitch for you.",
    ctaText: "See my brand matches",
  },
  free_products: {
    headlinePart1: "Get free products",
    headlineAccent: "from brands you love.",
    subheadline: "Turn your content into PR boxes. Newcollab shows you which brands are actively gifting creators like you—and what to say to land them.",
    ctaText: "Start getting free products",
  },
  pitch_brands: {
    headlinePart1: "Stop guessing",
    headlineAccent: "what to say.",
    subheadline: "Your AI manager writes personalized pitches for every brand, handles the follow-up, and tells you exactly what's working. Just click send.",
    ctaText: "Get my first pitch written",
  },
  brand_deals: {
    headlinePart1: "Land your first",
    headlineAccent: "brand deal.",
    subheadline: "PR boxes lead to paid partnerships. Start with free products, build the relationship, and turn brands into long-term sponsors.",
    ctaText: "Start with my first PR match",
  },
};

// ═══════════════════════════════════════════════════════════════════
// STYLED COMPONENTS
// ═══════════════════════════════════════════════════════════════════
const PageContainer = styled.div`
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #15161a;
  background: #ffffff;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
`;

const Wrap = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
`;

const Section = styled.section`
  padding: 60px 0;
  @media (max-width: 640px) {
    padding: 44px 0;
  }
`;

// NAV
const Nav = styled.nav`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #ececef;
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  max-width: 1120px;
  margin: 0 auto;
`;

const Brand = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;

  img {
    height: 34px;
    width: auto;
    display: block;
  }
`;

const NavCta = styled.button`
  background: #15161a;
  color: #fff;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: transform 0.15s;
  &:hover {
    transform: translateY(-1px);
  }
`;

// HERO
const HeroSection = styled.section`
  padding: 64px 0 72px;
  background: linear-gradient(180deg, #fff 0, #fdf7f8 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
  &::before {
    content: "";
    position: absolute;
    top: -100px;
    left: 50%;
    transform: translateX(-50%);
    width: 900px;
    height: 500px;
    background: radial-gradient(ellipse at center, rgba(232, 57, 95, 0.08), transparent 60%);
    pointer-events: none;
  }
  @media (max-width: 640px) {
    padding: 44px 0 56px;
  }
`;

const HeroTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #ececef;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  margin-bottom: 22px;
  position: relative;
`;

const GreenDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
`;

const H1 = styled.h1`
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.02;
  margin-bottom: 18px;
  position: relative;
  @media (max-width: 640px) {
    font-size: 38px;
    letter-spacing: -0.02em;
  }
`;

const Accent = styled.span`
  color: #e8395f;
  font-style: italic;
`;

const HeroSub = styled.p`
  font-size: 19px;
  color: #4b5563;
  max-width: 640px;
  margin: 0 auto 32px;
  line-height: 1.5;
  position: relative;
  font-weight: 400;
  @media (max-width: 640px) {
    font-size: 16px;
    padding: 0 8px;
  }
`;

const CtaRow = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  position: relative;
  margin-bottom: 22px;
`;

const BtnPrimary = styled.button`
  background: #e8395f;
  color: #fff;
  padding: 16px 30px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.01em;
  box-shadow: 0 4px 14px rgba(232, 57, 95, 0.28);
  transition: transform 0.2s, box-shadow 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(232, 57, 95, 0.35);
  }
  @media (max-width: 640px) {
    padding: 14px 22px;
    font-size: 15px;
  }
`;

const Arrow = styled.span`
  font-size: 18px;
  transition: transform 0.2s;
  ${BtnPrimary}:hover & {
    transform: translateX(3px);
  }
`;

const BtnSecondary = styled.a`
  color: #15161a;
  padding: 16px 24px;
  font-size: 15px;
  font-weight: 600;
  border-bottom: 1px solid transparent;
  text-decoration: none;
  &:hover {
    border-bottom-color: #15161a;
  }
`;

const HeroTrust = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  font-size: 12.5px;
  color: #6b7280;
  font-weight: 600;
  position: relative;
  flex-wrap: wrap;
`;

const Avatars = styled.div`
  display: flex;
`;

const Avatar = styled.span`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f4f4f6;
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #15161a;
  margin-left: -8px;
  &:first-child { margin-left: 0; background: #fce7f3; color: #be185d; }
  &:nth-child(2) { background: #dcfce7; color: #065f46; }
  &:nth-child(3) { background: #fef3c7; color: #92400e; }
  &:nth-child(4) { background: #e0e7ff; color: #3730a3; }
`;

const HeroVisual = styled.div`
  max-width: 520px;
  margin: 44px auto 0;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
  padding: 16px;
  position: relative;
`;

const MockupCard = styled.div`
  background: #0f1015;
  border-radius: 14px;
  padding: 20px 18px;
  color: #fff;
  text-align: left;
`;

const MockupRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
`;

const MockupLogo = styled.div`
  width: 32px;
  height: 32px;
  background: #fef3c7;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #92400e;
  font-size: 11px;
  font-style: italic;
`;

const MockupName = styled.div`
  flex: 1;
  font-weight: 800;
  font-size: 14px;
`;

const MockupMatch = styled.div`
  background: #dcfce7;
  color: #0f7a44;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 8px;
`;

const MockupVerdict = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(80, 255, 160, 0.14);
  color: #7df0aa;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  margin: 10px 0;
`;

const MockupHeadBig = styled.div`
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 6px;
  letter-spacing: -0.01em;
`;

const MockupSubSmall = styled.div`
  font-size: 11px;
  color: #a0a3ad;
  margin-bottom: 14px;
`;

const MockupAction = styled.div`
  background: #e8395f;
  color: #fff;
  text-align: center;
  padding: 10px 0;
  border-radius: 9px;
  font-size: 12.5px;
  font-weight: 800;
`;

// PROBLEM SECTION
const ProblemSection = styled(Section)`
  background: #fff;
  padding: 72px 0;
`;

const SectionTag = styled.span`
  display: inline-block;
  background: #fce7f3;
  color: #be185d;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 5px 12px;
  border-radius: 6px;
  margin-bottom: 14px;
`;

const H2 = styled.h2`
  font-size: 38px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin-bottom: 14px;
  @media (max-width: 640px) {
    font-size: 28px;
  }
`;

const Lead = styled.p`
  font-size: 17px;
  color: #4b5563;
  max-width: 640px;
  margin-bottom: 44px;
  line-height: 1.55;
`;

const ProblemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const ProbCard = styled.div`
  background: #fafbfd;
  border: 1px solid #ececef;
  border-radius: 16px;
  padding: 26px 24px;
`;

const ProbEmoji = styled.div`
  font-size: 28px;
  margin-bottom: 12px;
`;

const ProbH3 = styled.h3`
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.3;
`;

const ProbP = styled.p`
  font-size: 14.5px;
  color: #4b5563;
  line-height: 1.55;
`;

// HOW IT WORKS
const HowSection = styled(Section)`
  background: #f7f7f8;
  padding: 80px 0;
`;

const HowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const HowStep = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 26px 22px;
  position: relative;
`;

const StepNum = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: #15161a;
  color: #fff;
  border-radius: 50%;
  font-weight: 900;
  font-size: 15px;
  margin-bottom: 14px;
`;

const StepH3 = styled.h3`
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 6px;
  line-height: 1.3;
`;

const StepP = styled.p`
  font-size: 14px;
  color: #4b5563;
  line-height: 1.55;
`;

// SUCCESS STORIES
const SuccessSection = styled(Section)`
  background: #fff;
  padding: 80px 0;
`;

const SuccessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 44px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const StoryCard = styled.div`
  background: #fafbfd;
  border: 1px solid #ececef;
  border-radius: 18px;
  padding: 26px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  overflow: hidden;
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #e8395f, #a93bd6);
  }
`;

const StoryHead = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StoryAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${props => props.$variant === 'a' ? '#fce7f3' : props.$variant === 'b' ? '#dcfce7' : '#fef3c7'};
  color: ${props => props.$variant === 'a' ? '#be185d' : props.$variant === 'b' ? '#065f46' : '#92400e'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 15px;
  flex-shrink: 0;
`;

const StoryInfo = styled.div``;

const StoryHandle = styled.div`
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 2px;
`;

const StoryMeta = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const StoryQuote = styled.div`
  font-size: 15px;
  color: #15161a;
  line-height: 1.55;
  font-weight: 500;
  &::before {
    content: """;
    font-size: 34px;
    color: #e8395f;
    font-family: Georgia, serif;
    line-height: 0;
    position: relative;
    top: 15px;
    margin-right: 2px;
  }
`;

const StoryResult = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  background: #dcfce7;
  color: #0f7a44;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 700;
  width: fit-content;
`;

// FEATURES
const FeaturesSection = styled(Section)`
  background: #0f1015;
  color: #fff;
  padding: 80px 0;
`;

const FeaturesTag = styled(SectionTag)`
  background: rgba(232, 57, 95, 0.14);
  color: #ffb8c6;
`;

const FeaturesH2 = styled(H2)`
  color: #fff;
`;

const FeaturesLead = styled(Lead)`
  color: #a0a3ad;
`;

const FeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 36px;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

const Feat = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 24px;
`;

const FeatEmoji = styled.div`
  font-size: 24px;
  margin-bottom: 10px;
`;

const FeatH3 = styled.h3`
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 6px;
`;

const FeatP = styled.p`
  font-size: 14px;
  color: #a0a3ad;
  line-height: 1.55;
`;

// BRAND WALL
const BrandsSection = styled(Section)`
  background: #fff;
  padding: 60px 0;
  text-align: center;
`;

const BrandsH3 = styled.div`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 26px;
`;

const BrandWall = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 34px 44px;
  filter: grayscale(1);
  opacity: 0.7;
`;

const BrandItem = styled.span`
  font-family: ${props => props.$variant === 'serif' ? 'Georgia, serif' : '-apple-system, sans-serif'};
  font-size: ${props => props.$variant === 'small' ? '16px' : '20px'};
  font-weight: ${props => props.$variant === 'heavy' ? '900' : '800'};
  font-style: ${props => props.$variant === 'serif' ? 'italic' : 'normal'};
  letter-spacing: ${props => props.$variant === 'small' ? '0.05em' : props.$variant === 'heavy' ? '-0.02em' : 'normal'};
  text-transform: ${props => props.$variant === 'small' ? 'uppercase' : 'none'};
  color: #15161a;
`;

const BrandsCount = styled.div`
  display: inline-block;
  margin-top: 24px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
  b {
    color: #15161a;
    font-weight: 800;
  }
`;

// PRICING
const PricingSection = styled(Section)`
  background: #f7f7f8;
  padding: 80px 0;
  text-align: center;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 820px;
  margin: 36px auto 0;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const PriceCard = styled.div`
  background: #fff;
  border: ${props => props.$pro ? '2px solid #15161a' : '1px solid #ececef'};
  border-radius: 20px;
  padding: 32px 26px;
  text-align: left;
  position: relative;
  box-shadow: ${props => props.$pro ? '0 12px 40px rgba(0,0,0,.08)' : 'none'};
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -11px;
  left: 24px;
  background: #15161a;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  padding: 4px 10px;
  border-radius: 6px;
`;

const PriceTier = styled.div`
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 6px;
`;

const PriceNum = styled.div`
  font-size: 44px;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin-bottom: 4px;
`;

const PriceSmall = styled.small`
  font-size: 16px;
  color: #6b7280;
  font-weight: 600;
`;

const PriceDesc = styled.div`
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 22px;
  line-height: 1.5;
`;

const PriceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 26px;
`;

const PriceItem = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.5;
`;

const Check = styled.span`
  color: #0f7a44;
  font-weight: 900;
  flex-shrink: 0;
  margin-top: 2px;
`;

const PriceCta = styled.button`
  display: block;
  width: 100%;
  text-align: center;
  padding: 13px 0;
  border-radius: 10px;
  font-size: 14.5px;
  font-weight: 800;
  transition: transform 0.15s;
  border: none;
  cursor: pointer;
  background: ${props => props.$pro ? '#15161a' : '#f4f4f6'};
  color: ${props => props.$pro ? '#fff' : '#15161a'};
  &:hover {
    transform: translateY(-1px);
  }
`;

// FAQ
const FaqSection = styled(Section)`
  background: #fff;
  padding: 80px 0;
`;

const FaqList = styled.div`
  max-width: 720px;
  margin: 36px auto 0;
`;

const FaqItem = styled.div`
  border-bottom: 1px solid #ececef;
`;

const FaqQuestion = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 22px 0;
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  color: #15161a;
`;

const Chevron = styled.span`
  color: #8a8f98;
  font-size: 20px;
  transition: transform 0.2s;
  flex-shrink: 0;
  margin-left: 12px;
  transform: ${props => props.$open ? 'rotate(45deg)' : 'none'};
`;

const FaqAnswer = styled.div`
  max-height: ${props => props.$open ? '400px' : '0'};
  overflow: hidden;
  font-size: 15px;
  color: #4b5563;
  line-height: 1.6;
  transition: max-height 0.3s, padding 0.2s;
  padding: ${props => props.$open ? '0 0 24px' : '0'};
`;

// FINAL CTA
const FinalCtaSection = styled.section`
  background: linear-gradient(160deg, #0f1015 0%, #2a1335 100%);
  color: #fff;
  padding: 80px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  &::before {
    content: "";
    position: absolute;
    top: -100px;
    right: -50px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(232, 57, 95, 0.24), transparent);
    pointer-events: none;
  }
  &::after {
    content: "";
    position: absolute;
    bottom: -100px;
    left: -50px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(closest-side, rgba(169, 59, 214, 0.18), transparent);
    pointer-events: none;
  }
`;

const FinalH2 = styled(H2)`
  color: #fff;
  position: relative;
`;

const FinalSub = styled.p`
  color: #a0a3ad;
  font-size: 17px;
  max-width: 520px;
  margin: 0 auto 32px;
  position: relative;
  line-height: 1.55;
`;

const TrustLine = styled.div`
  position: relative;
  font-size: 13px;
  color: #6b7280;
  margin-top: 20px;
`;

// FOOTER
const Footer = styled.footer`
  background: #0a0a0d;
  color: #6b7280;
  padding: 34px 0;
  text-align: center;
  font-size: 12.5px;
`;

const FooterBrand = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;

  img {
    height: 28px;
    width: auto;
    display: block;
  }
`;

const FooterLinks = styled.p`
  margin-top: 10px;
  font-size: 12px;
  a {
    color: #8a8f98;
    text-decoration: underline;
    &:hover {
      color: #fff;
    }
  }
`;

// MOBILE STICKY
const MobileSticky = styled.div`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #ececef;
  padding: 12px 16px 20px;
  z-index: 99;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
  @media (max-width: 640px) {
    display: block;
  }
`;

const MobileStickyBtn = styled(BtnPrimary)`
  width: 100%;
  justify-content: center;
  padding: 14px 0;
  font-size: 15px;
`;

// ═══════════════════════════════════════════════════════════════════
// FAQ DATA
// ═══════════════════════════════════════════════════════════════════
const FAQ_DATA = [
  {
    q: "Do I need thousands of followers?",
    a: "No. Newcollab is built specifically for micro creators. Our most active users have between 500 and 15K followers. Fit scores account for your size and match you with brands that gift creators like you. Many of our success stories start under 1,000 followers."
  },
  {
    q: "Which brands are in your directory?",
    a: "500+ brands across beauty, skincare, fashion, wellness, food, and lifestyle. Rhode, Poppi, Anua, Milk_shake, Ouai, Kosas, and 494 more. We update the directory weekly with new additions and remove brands that stop responding."
  },
  {
    q: "How is this different from just DMing brands?",
    a: "DMs are one of 30 things that go into landing a deal. We show you which brands actually reply to creators your size with real reply-rate data, write personalized pitches for you, and coach the follow-up sequence that gets 67% of replies. Guessing is the slowest path. Newcollab is the fastest."
  },
  {
    q: "What if brands don't reply?",
    a: "About 5-15% of first pitches get replies. Most creators land their first PR box between pitch 5 and 8. Your manager sends daily coaching, plans your follow-ups, and shows you exactly what's blocking replies. The creators who quit at pitch 3 are the ones who never see it."
  },
  {
    q: "Can I cancel Pro anytime?",
    a: "Yes. One tap in settings. No questions asked. No hidden fees. You'll be billed for the current month and downgraded to Free at renewal."
  },
  {
    q: "Is my data safe?",
    a: "Yes. We use OAuth for Instagram and TikTok, which means we never see your password. We only access public data plus your basic account info. Delete your account anytime and all your data is wiped within 30 days."
  }
];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
function LandFirstPRPackage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  // Get intent from URL param
  const intent = searchParams.get('intent') || 'default';
  const variant = INTENT_VARIANTS[intent] || INTENT_VARIANTS.default;

  // GCLID capture
  useEffect(() => {
    const gclid = searchParams.get('gclid');
    if (gclid) {
      // Store in cookie for 90 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 90);
      document.cookie = `gclid=${gclid}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      // Also store in localStorage as backup
      localStorage.setItem('gclid', gclid);
      localStorage.setItem('gclid_timestamp', Date.now().toString());
    }
  }, [searchParams]);

  // Scroll depth tracking
  useEffect(() => {
    let scroll50Fired = false;
    const handleScroll = () => {
      const scrollPct = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (scrollPct >= 0.5 && !scroll50Fired) {
        scroll50Fired = true;
        if (window.dataLayer) {
          window.dataLayer.push({ event: 'scroll_50pct', page: 'land-your-first-pr-package' });
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // CTA click handler with tracking
  const handleCtaClick = useCallback((location, upgradeParam = false) => {
    // Track click
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'cta_click',
        cta_location: location,
        page: 'land-your-first-pr-package'
      });
    }
    if (window.gtag) {
      window.gtag('event', 'cta_click', { cta_location: location });
    }

    // Get gclid for URL
    const gclid = searchParams.get('gclid') || localStorage.getItem('gclid');
    const utm_source = searchParams.get('utm_source');
    const utm_medium = searchParams.get('utm_medium');
    const utm_campaign = searchParams.get('utm_campaign');

    // Build registration URL with tracking params
    let url = '/register/creator';
    const params = new URLSearchParams();
    if (upgradeParam) params.set('upgrade', 'pro');
    if (gclid) params.set('gclid', gclid);
    if (utm_source) params.set('utm_source', utm_source);
    if (utm_medium) params.set('utm_medium', utm_medium);
    if (utm_campaign) params.set('utm_campaign', utm_campaign);
    params.set('ref', 'lp-pr-package');

    const paramString = params.toString();
    if (paramString) url += '?' + paramString;

    navigate(url);
  }, [navigate, searchParams]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <PageContainer>
      <Helmet>
        <title>Land your first PR package · Newcollab</title>
        <meta name="description" content="Newcollab is the AI creator manager that helps you land your first PR package. Verified brand contacts, personalized pitches, follow-up coaching. Free to start." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://newcollab.co/land-your-first-pr-package" />

        {/* Open Graph */}
        <meta property="og:title" content="Land your first PR package · Newcollab" />
        <meta property="og:description" content="Your AI manager matches you to brands that gift creators your size, writes the pitch, and coaches you until they say yes." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://newcollab.co/land-your-first-pr-package" />
        <meta property="og:image" content="https://newcollab.co/og-pr-package.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Land your first PR package · Newcollab" />
        <meta name="twitter:description" content="Your AI manager matches you to brands that gift creators your size, writes the pitch, and coaches you until they say yes." />
      </Helmet>

      {/* NAV */}
      <Nav>
        <NavInner>
          <Brand href="/">
            <img src="/newcollab-logo-dark.png" alt="Newcollab" />
          </Brand>
          <NavCta onClick={() => handleCtaClick('nav')}>Start free</NavCta>
        </NavInner>
      </Nav>

      {/* HERO */}
      <HeroSection>
        <Wrap>
          <HeroTag>
            <GreenDot />
            1,600+ creators using Newcollab this month
          </HeroTag>
          <H1>{variant.headlinePart1}<br/><Accent>{variant.headlineAccent}</Accent></H1>
          <HeroSub>{variant.subheadline}</HeroSub>
          <CtaRow>
            <BtnPrimary onClick={() => handleCtaClick('hero')}>
              <span>{variant.ctaText}</span>
              <Arrow>→</Arrow>
            </BtnPrimary>
            <BtnSecondary href="#how">See how it works</BtnSecondary>
          </CtaRow>
          <HeroTrust>
            <Avatars>
              <Avatar>S</Avatar>
              <Avatar>M</Avatar>
              <Avatar>N</Avatar>
              <Avatar>+</Avatar>
            </Avatars>
            <span>No credit card · 3 free brand unlocks · Cancel anytime</span>
          </HeroTrust>

          <HeroVisual>
            <MockupCard>
              <MockupRow>
                <MockupLogo>m_s</MockupLogo>
                <MockupName>milk_shake</MockupName>
                <MockupMatch>91% match</MockupMatch>
              </MockupRow>
              <MockupHeadBig>You can pitch milk_shake today.</MockupHeadBig>
              <MockupSubSmall>Based on your profile.</MockupSubSmall>
              <MockupVerdict>
                <GreenDot />
                Ready for outreach
              </MockupVerdict>
              <MockupAction>Open PR Package →</MockupAction>
            </MockupCard>
          </HeroVisual>
        </Wrap>
      </HeroSection>

      {/* PROBLEM */}
      <ProblemSection>
        <Wrap>
          <SectionTag>Why brands ignore you</SectionTag>
          <H2>You've tried DMing brands. Emailing. Sending free content.<br/>Getting ignored.</H2>
          <Lead>The problem isn't your follower count. It's that you're pitching wrong brands, with generic emails, and giving up before follow-ups.</Lead>
          <ProblemGrid>
            <ProbCard>
              <ProbEmoji>🎯</ProbEmoji>
              <ProbH3>Wrong brands</ProbH3>
              <ProbP>Most brands don't gift creators your size. You're spending unlocks on the ones who never reply, not the ones who do.</ProbP>
            </ProbCard>
            <ProbCard>
              <ProbEmoji>✍️</ProbEmoji>
              <ProbH3>Generic pitches</ProbH3>
              <ProbP>Every subject line says "collab opportunity." Brand PR teams see 100 a week. Yours needs a hook they haven't read yet.</ProbP>
            </ProbCard>
            <ProbCard>
              <ProbEmoji>📉</ProbEmoji>
              <ProbH3>Quit at pitch 3</ProbH3>
              <ProbP>67% of brand replies come after a follow-up. Most creators send once and give up right before it works.</ProbP>
            </ProbCard>
          </ProblemGrid>
        </Wrap>
      </ProblemSection>

      {/* HOW IT WORKS */}
      <HowSection id="how">
        <Wrap>
          <SectionTag>How Newcollab works</SectionTag>
          <H2>4 steps to your first PR box.</H2>
          <Lead>Sign up, connect your socials, get matched, and your manager writes the rest.</Lead>
          <HowGrid>
            <HowStep>
              <StepNum>1</StepNum>
              <StepH3>Sign up free</StepH3>
              <StepP>60 seconds. No credit card. Just an email.</StepP>
            </HowStep>
            <HowStep>
              <StepNum>2</StepNum>
              <StepH3>Connect Instagram or TikTok</StepH3>
              <StepP>We audit your profile in 30 seconds. Score, gaps, quick wins.</StepP>
            </HowStep>
            <HowStep>
              <StepNum>3</StepNum>
              <StepH3>We match you to brands</StepH3>
              <StepP>8 brands ranked by fit and how often they reply to creators like you.</StepP>
            </HowStep>
            <HowStep>
              <StepNum>4</StepNum>
              <StepH3>Unlock, pitch, follow up</StepH3>
              <StepP>We write the email. You send. We plan the follow-up. You land the box.</StepP>
            </HowStep>
          </HowGrid>
        </Wrap>
      </HowSection>

      {/* SUCCESS STORIES */}
      <SuccessSection>
        <Wrap>
          <SectionTag>Real creator wins</SectionTag>
          <H2>Real creators. Real PR boxes.</H2>
          <Lead>Small creators are landing brand deals through Newcollab every week. Here are three from this month.</Lead>
          <SuccessGrid>
            <StoryCard>
              <StoryHead>
                <StoryAvatar $variant="a">S</StoryAvatar>
                <StoryInfo>
                  <StoryHandle>@sarah.wellness</StoryHandle>
                  <StoryMeta>340 followers · UK</StoryMeta>
                </StoryInfo>
              </StoryHead>
              <StoryQuote>Sent 4 pitches, got 2 replies. My first PR box arrived from a clean beauty brand in 3 weeks. I never thought this would work at my size.</StoryQuote>
              <StoryResult><span>🎁</span>Landed 2 PR boxes in 3 weeks</StoryResult>
            </StoryCard>
            <StoryCard>
              <StoryHead>
                <StoryAvatar $variant="b">M</StoryAvatar>
                <StoryInfo>
                  <StoryHandle>@maya.eats</StoryHandle>
                  <StoryMeta>12K followers · US</StoryMeta>
                </StoryInfo>
              </StoryHead>
              <StoryQuote>The manager told me exactly why brands were skipping me. Fixed my bio, added one Reel, next 3 pitches got replies. Poppi + Olipop shipped the same week.</StoryQuote>
              <StoryResult><span>📦</span>4 brand replies in month 1</StoryResult>
            </StoryCard>
            <StoryCard>
              <StoryHead>
                <StoryAvatar $variant="c">N</StoryAvatar>
                <StoryInfo>
                  <StoryHandle>@naomigraciee</StoryHandle>
                  <StoryMeta>146K followers · US</StoryMeta>
                </StoryInfo>
              </StoryHead>
              <StoryQuote>I already knew how to pitch. What I didn't know was which brands to prioritize. The reply rate data is honestly a cheat code.</StoryQuote>
              <StoryResult><span>✨</span>Landed BY FAR + Summer Fridays</StoryResult>
            </StoryCard>
          </SuccessGrid>
        </Wrap>
      </SuccessSection>

      {/* FEATURES */}
      <FeaturesSection>
        <Wrap>
          <FeaturesTag>What's inside</FeaturesTag>
          <FeaturesH2>Your AI manager, built for the PR game.</FeaturesH2>
          <FeaturesLead>Not another directory. Not another pitch template. A coach who knows what works and tells you what to do next.</FeaturesLead>
          <FeatGrid>
            <Feat>
              <FeatEmoji>🎯</FeatEmoji>
              <FeatH3>Verified brand contacts</FeatH3>
              <FeatP>500+ brands with real PR emails. Not scraped. Not guessed. Reviewed and updated weekly.</FeatP>
            </Feat>
            <Feat>
              <FeatEmoji>🤖</FeatEmoji>
              <FeatH3>Pitch written for you</FeatH3>
              <FeatP>AI drafts each pitch personalized to the brand's aesthetic and your niche. Edit if you want. Send in 30 seconds.</FeatP>
            </Feat>
            <Feat>
              <FeatEmoji>📊</FeatEmoji>
              <FeatH3>Real reply rate data</FeatH3>
              <FeatP>Fit scores and reply rates based on actual sent pitches, not category averages. Know what will convert before you spend an unlock.</FeatP>
            </Feat>
            <Feat>
              <FeatEmoji>📬</FeatEmoji>
              <FeatH3>Follow-up coaching</FeatH3>
              <FeatP>67% of replies come after a follow-up. We draft yours, remind you when to send, and track opens.</FeatP>
            </Feat>
            <Feat>
              <FeatEmoji>📋</FeatEmoji>
              <FeatH3>Portfolio + media kit</FeatH3>
              <FeatP>Auto-built from your socials. One link brands can open. Rates, past work, and audience data ready to share.</FeatP>
            </Feat>
            <Feat>
              <FeatEmoji>📈</FeatEmoji>
              <FeatH3>Hireability score</FeatH3>
              <FeatP>Your manager audits your profile and shows exactly what's stopping brands from replying. Fix it and watch the score climb.</FeatP>
            </Feat>
          </FeatGrid>
        </Wrap>
      </FeaturesSection>

      {/* BRAND WALL */}
      <BrandsSection>
        <Wrap>
          <BrandsH3>500+ brands your manager already knows</BrandsH3>
          <BrandWall>
            <BrandItem $variant="serif">rhode</BrandItem>
            <BrandItem $variant="small">Poppi</BrandItem>
            <BrandItem $variant="heavy">OLIPOP</BrandItem>
            <BrandItem $variant="serif">anua</BrandItem>
            <BrandItem>milk_shake</BrandItem>
            <BrandItem $variant="small">OUAI</BrandItem>
            <BrandItem $variant="heavy">KOSAS</BrandItem>
            <BrandItem $variant="serif">Summer Fridays</BrandItem>
            <BrandItem>Aveeno</BrandItem>
            <BrandItem $variant="small">TARTE</BrandItem>
            <BrandItem $variant="heavy">Caudalie</BrandItem>
            <BrandItem $variant="serif">ALO</BrandItem>
            <BrandItem>CeraVe</BrandItem>
            <BrandItem $variant="small">ILIA</BrandItem>
            <BrandItem $variant="heavy">Glossier</BrandItem>
            <BrandItem $variant="serif">FENTY</BrandItem>
            <BrandItem>SUPERGOOP</BrandItem>
            <BrandItem $variant="small">Tower 28</BrandItem>
          </BrandWall>
          <BrandsCount><b>And 480 more brands.</b> Updated weekly with new additions.</BrandsCount>
        </Wrap>
      </BrandsSection>

      {/* PRICING */}
      <PricingSection id="signup">
        <Wrap>
          <SectionTag>Pricing</SectionTag>
          <H2>Start free. Upgrade when you're winning.</H2>
          <Lead style={{ margin: '0 auto 44px' }}>Most creators land their first PR box before they need to pay.</Lead>
          <PricingGrid>
            <PriceCard>
              <PriceTier>FREE</PriceTier>
              <PriceNum>$0<PriceSmall> /month</PriceSmall></PriceNum>
              <PriceDesc>Everything you need to land your first PR box.</PriceDesc>
              <PriceList>
                <PriceItem><Check>✓</Check><span><b>3 brand unlocks per month</b> — real contacts, real reply data</span></PriceItem>
                <PriceItem><Check>✓</Check><span>AI-drafted pitches</span></PriceItem>
                <PriceItem><Check>✓</Check><span>Fit scores and reply rates for every brand</span></PriceItem>
                <PriceItem><Check>✓</Check><span>Portfolio + media kit auto-built</span></PriceItem>
                <PriceItem><Check>✓</Check><span>Hireability score audit</span></PriceItem>
              </PriceList>
              <PriceCta onClick={() => handleCtaClick('pricing_free')}>Start free →</PriceCta>
            </PriceCard>
            <PriceCard $pro>
              <PopularBadge>MOST POPULAR</PopularBadge>
              <PriceTier>PRO</PriceTier>
              <PriceNum>$19<PriceSmall> /month</PriceSmall></PriceNum>
              <PriceDesc>Your full-time AI manager. Cancel anytime.</PriceDesc>
              <PriceList>
                <PriceItem><Check>✓</Check><span><b>Unlimited brand unlocks</b> — no monthly cap</span></PriceItem>
                <PriceItem><Check>✓</Check><span>Weekly personalized coaching plan</span></PriceItem>
                <PriceItem><Check>✓</Check><span>Auto follow-ups sent for you</span></PriceItem>
                <PriceItem><Check>✓</Check><span>Priority brand matches (first look)</span></PriceItem>
                <PriceItem><Check>✓</Check><span>Everything in Free</span></PriceItem>
              </PriceList>
              <PriceCta $pro onClick={() => handleCtaClick('pricing_pro', true)}>Start free, upgrade later →</PriceCta>
            </PriceCard>
          </PricingGrid>
        </Wrap>
      </PricingSection>

      {/* FAQ */}
      <FaqSection>
        <Wrap>
          <SectionTag>Real questions</SectionTag>
          <H2>Everything creators ask before signing up.</H2>
          <FaqList role="list">
            {FAQ_DATA.map((item, index) => (
              <FaqItem key={index} role="listitem">
                <FaqQuestion
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  {item.q}
                  <Chevron $open={openFaq === index}>+</Chevron>
                </FaqQuestion>
                <FaqAnswer
                  $open={openFaq === index}
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  hidden={openFaq !== index}
                >
                  <p>{item.a}</p>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqList>
        </Wrap>
      </FaqSection>

      {/* FINAL CTA */}
      <FinalCtaSection>
        <Wrap>
          <FinalH2>Your first PR box is one pitch away.</FinalH2>
          <FinalSub>Free to start. No credit card. Join 1,600 other creators already landing brand deals.</FinalSub>
          <CtaRow style={{ position: 'relative' }}>
            <BtnPrimary onClick={() => handleCtaClick('final')}>
              <span>Start free — no card required</span>
              <Arrow>→</Arrow>
            </BtnPrimary>
          </CtaRow>
          <TrustLine>Cancel anytime. First PR box within 2-4 weeks typical.</TrustLine>
        </Wrap>
      </FinalCtaSection>

      {/* FOOTER */}
      <Footer>
        <Wrap>
          <FooterBrand>
            <img src="/newcollab-logo.png" alt="Newcollab" />
          </FooterBrand>
          <p>© 2026 Newcollab · Made for creators landing their first PR deals.</p>
          <FooterLinks>
            <a href="/privacy-policy">Privacy</a> · <a href="/terms-of-service">Terms</a> · <a href="mailto:team@newcollab.co">team@newcollab.co</a>
          </FooterLinks>
        </Wrap>
      </Footer>

      {/* MOBILE STICKY CTA */}
      <MobileSticky>
        <MobileStickyBtn onClick={() => handleCtaClick('mobile_sticky')}>
          <span>Start free</span>
          <Arrow>→</Arrow>
        </MobileStickyBtn>
      </MobileSticky>
    </PageContainer>
  );
}

export default LandFirstPRPackage;
