'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
function LandFirstPRPackageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  // CTA click handler with tracking
  const handleCtaClick = useCallback((location, upgradeParam = false) => {
    // Track click
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'cta_click',
        cta_location: location,
        page: 'land-your-first-pr-package'
      });
    }

    // Get gclid for URL
    const gclid = searchParams.get('gclid') || (typeof localStorage !== 'undefined' ? localStorage.getItem('gclid') : null);
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

    router.push(url);
  }, [router, searchParams]);

  return (
    <PageContainer>
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
              <Arrow>&rarr;</Arrow>
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
            <span>No credit card &middot; 3 free brand unlocks &middot; Cancel anytime</span>
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
              <MockupAction>Open PR Package &rarr;</MockupAction>
            </MockupCard>
          </HeroVisual>
        </Wrap>
      </HeroSection>

      {/* PROBLEM */}
      <ProblemSection>
        <Wrap>
          <SectionTag>Why brands ignore you</SectionTag>
          <H2>You&apos;ve tried DMing brands. Emailing. Sending free content.<br/>Getting ignored.</H2>
          <Lead>The problem isn&apos;t your follower count. It&apos;s that you&apos;re pitching wrong brands, with generic emails, and giving up before follow-ups.</Lead>
          <ProblemGrid>
            <ProbCard>
              <ProbEmoji>🎯</ProbEmoji>
              <ProbH3>Wrong brands</ProbH3>
              <ProbP>Most brands don&apos;t gift creators your size. You&apos;re spending unlocks on the ones who never reply, not the ones who do.</ProbP>
            </ProbCard>
            <ProbCard>
              <ProbEmoji>✍️</ProbEmoji>
              <ProbH3>Generic pitches</ProbH3>
              <ProbP>Every subject line says &quot;collab opportunity.&quot; Brand PR teams see 100 a week. Yours needs a hook they haven&apos;t read yet.</ProbP>
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

      {/* FOOTER */}
      <Footer>
        <Wrap>
          <FooterBrand>
            <img src="/newcollab-logo.png" alt="Newcollab" />
          </FooterBrand>
          <p>&copy; 2026 Newcollab &middot; Made for creators landing their first PR deals.</p>
          <FooterLinks>
            <a href="/privacy-policy">Privacy</a> &middot; <a href="/terms-of-service">Terms</a> &middot; <a href="mailto:team@newcollab.co">team@newcollab.co</a>
          </FooterLinks>
        </Wrap>
      </Footer>

      {/* MOBILE STICKY CTA */}
      <MobileSticky>
        <MobileStickyBtn onClick={() => handleCtaClick('mobile_sticky')}>
          <span>Start free</span>
          <Arrow>&rarr;</Arrow>
        </MobileStickyBtn>
      </MobileSticky>
    </PageContainer>
  );
}

export default LandFirstPRPackageClient;
