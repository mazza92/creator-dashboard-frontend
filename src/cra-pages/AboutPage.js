import React from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import LandingPageLayout from '../Layouts/LandingPageLayout';

// V5 design tokens
const colors = {
  rose: '#E11D48',
  roseLight: '#FFF1F3',
  roseMid: '#FECDD3',
  black: '#0F0F0F',
  black2: '#1a1a1a',
  violet: '#7C3AED',
  violetLight: '#F5F3FF',
  green: '#059669',
  greenLight: '#ECFDF5',
  bg: '#FAFAF9',
  surface: '#FFFFFF',
  border: '#EBEBEB',
  text: '#0F0F0F',
  text2: '#4A4A4A',
  text3: '#8A8A8A',
};

const shadows = {
  sm: '0 1px 4px rgba(0,0,0,.05),0 4px 16px rgba(0,0,0,.06)',
  lg: '0 8px 40px rgba(0,0,0,.10)',
};

// ── Layout ─────────────────────────────────────────────────
const Page = styled.div`
  background: ${colors.bg};
  color: ${colors.text};
  font-size: 15px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
`;

const Container = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 20px;
`;

const ContainerSm = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: 0 20px;
`;

// ── Typography ─────────────────────────────────────────────
const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${colors.rose};
  margin-bottom: 12px;
`;

const EyebrowDot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
`;

const H1 = styled.h1`
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1.08;
  color: ${colors.text};

  em {
    font-style: normal;
    color: ${colors.rose};
  }
`;

const H2 = styled.h2`
  font-size: clamp(24px, 3.5vw, 36px);
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1.15;

  em {
    font-style: normal;
    color: ${colors.rose};
  }
`;

const Subline = styled.p`
  font-size: 16px;
  color: ${colors.text2};
  line-height: 1.65;
  margin-top: 12px;
`;

// ── Buttons ────────────────────────────────────────────────
const BtnBase = `
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 22px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  font-family: inherit;
  text-decoration: none;
`;

const BtnBlack = styled.a`
  ${BtnBase}
  background: ${colors.black};
  color: #fff;

  &:hover {
    background: ${colors.black2};
  }
`;

const BtnRose = styled.a`
  ${BtnBase}
  background: ${colors.rose};
  color: #fff;

  &:hover {
    opacity: 0.9;
  }
`;

const BtnOutline = styled.a`
  ${BtnBase}
  background: #fff;
  color: ${colors.text};
  border: 1.5px solid ${colors.border};

  &:hover {
    border-color: ${colors.text3};
  }
`;

// ── Hero ───────────────────────────────────────────────────
const Hero = styled.section`
  padding: 120px 20px 56px;
  background:
    radial-gradient(ellipse at 5% 0%, rgba(225, 29, 72, 0.07) 0%, transparent 55%),
    radial-gradient(ellipse at 95% 100%, rgba(124, 58, 237, 0.06) 0%, transparent 50%),
    ${colors.bg};
  text-align: center;

  h1 {
    max-width: 700px;
    margin: 0 auto;
  }

  ${Subline} {
    max-width: 520px;
    margin: 14px auto 0;
  }

  @media (max-width: 768px) {
    padding: 96px 20px 48px;
  }
`;

const HeroCta = styled.div`
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`;

// ── Founder section ────────────────────────────────────────
const FounderSection = styled.section`
  background: #fff;
  padding: 64px 20px;
`;

const FounderInner = styled.div`
  max-width: 1040px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 64px;
  align-items: start;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
  }
`;

const FounderPhotoWrap = styled.div`
  position: relative;
`;

const FounderPhoto = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(160deg, ${colors.roseLight}, ${colors.violetLight});
  box-shadow: ${shadows.lg};
  position: relative;
`;

const FounderImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const FounderBadge = styled.div`
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  padding: 10px 16px;
  box-shadow: ${shadows.lg};
  display: flex;
  align-items: center;
  gap: 9px;
  white-space: nowrap;
`;

const FounderBadgeAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${colors.rose}, ${colors.violet});
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 900;
  font-size: 13px;
  flex-shrink: 0;
`;

const FounderBadgeText = styled.div`
  font-size: 12.5px;
`;

const FounderBadgeName = styled.span`
  font-weight: 800;
  color: ${colors.text};
  display: block;
`;

const FounderBadgeRole = styled.span`
  color: ${colors.text3};
  font-size: 11.5px;
`;

const FounderContent = styled.div`
  padding-top: 4px;

  ${Eyebrow} {
    margin-bottom: 16px;
  }

  ${H2} {
    font-size: clamp(22px, 3vw, 32px);
    margin-bottom: 18px;
  }

  p {
    font-size: 15px;
    color: ${colors.text2};
    line-height: 1.75;
    margin-bottom: 16px;

    &:last-of-type {
      margin-bottom: 0;
    }

    strong {
      color: ${colors.text};
      font-weight: 700;
    }
  }
`;

// ── Mission strip ──────────────────────────────────────────
const MissionStrip = styled.div`
  background: ${colors.black};
  padding: 56px 20px;
  text-align: center;
`;

const MissionStatement = styled.p`
  max-width: 680px;
  margin: 0 auto;
  font-size: clamp(22px, 3.5vw, 34px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -1px;
  line-height: 1.2;

  em {
    color: #FDA4AF;
    font-style: normal;
  }
`;

const MissionSub = styled.p`
  max-width: 480px;
  margin: 16px auto 0;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.6;
`;

// ── Who it's for ───────────────────────────────────────────
const ForSection = styled.section`
  background: ${colors.bg};
  padding: 64px 20px;
`;

const Center = styled.div`
  text-align: center;
`;

const ForGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 36px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ForCard = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 24px;
  box-shadow: ${shadows.sm};

  h3 {
    font-size: 16px;
    font-weight: 800;
    margin-bottom: 10px;
    line-height: 1.3;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 0;
    list-style: none;
  }

  ul li {
    font-size: 13.5px;
    color: ${colors.text2};
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  ul li::before {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 12px;
  }

  &.yes ul li::before {
    content: '✓';
    color: ${colors.green};
    font-weight: 800;
  }

  &.no ul li::before {
    content: '—';
    color: ${colors.text3};
  }
`;

const ForCardTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  padding: 4px 11px;
  border-radius: 20px;
  margin-bottom: 14px;
  background: ${(p) => (p.$yes ? colors.greenLight : '#F3F3F3')};
  color: ${(p) => (p.$yes ? colors.green : colors.text3)};
`;

// ── Honest numbers ─────────────────────────────────────────
const NumbersSection = styled.section`
  background: #fff;
  padding: 64px 20px;
`;

const NumbersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 36px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const NumberCard = styled.div`
  background: ${colors.bg};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
`;

const NumberVal = styled.div`
  font-size: 40px;
  font-weight: 900;
  letter-spacing: -2px;
  margin-bottom: 4px;
  color: ${(p) => p.$color || colors.text};
`;

const NumberLabel = styled.div`
  font-size: 13px;
  color: ${colors.text2};
  font-weight: 600;
  margin-bottom: 6px;
`;

const NumberContext = styled.div`
  font-size: 12px;
  color: ${colors.text3};
  line-height: 1.5;
`;

// ── What newcollab is / is not ─────────────────────────────
const HonestSection = styled.section`
  background: ${colors.bg};
  padding: 64px 20px;
`;

const HonestGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 36px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const HonestNot = styled.div`
  background: #fff;
  border: 1px solid ${colors.border};
  border-radius: 14px;
  padding: 20px;
`;

const HonestNotLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.text3};
  margin-bottom: 8px;
`;

const HonestNotText = styled.div`
  font-size: 14px;
  color: ${colors.text2};
  line-height: 1.55;
`;

const HonestIs = styled.div`
  background: ${colors.black};
  border-radius: 14px;
  padding: 20px;
  grid-column: span 2;

  @media (max-width: 640px) {
    grid-column: span 1;
  }
`;

const HonestIsLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 8px;
`;

const HonestIsText = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  line-height: 1.55;

  em {
    color: #FDA4AF;
    font-style: normal;
  }
`;

// ── Roadmap ────────────────────────────────────────────────
const RoadmapSection = styled.section`
  background: #fff;
  padding: 64px 20px;
`;

const RoadmapList = styled.div`
  max-width: 640px;
  margin: 36px auto 0;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const RoadmapItem = styled.div`
  display: flex;
  gap: 20px;
  padding-bottom: 32px;
  position: relative;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 32px;
    width: 2px;
    height: calc(100% - 8px);
    background: ${colors.border};
  }
`;

const RoadmapDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 800;
  position: relative;
  z-index: 1;

  background: ${(p) =>
    p.$status === 'done'
      ? colors.black
      : p.$status === 'now'
      ? colors.rose
      : colors.bg};
  color: ${(p) => (p.$status === 'next' ? colors.text3 : '#fff')};
  border: ${(p) =>
    p.$status === 'next' ? `2px solid ${colors.border}` : 'none'};
`;

const RoadmapContent = styled.div`
  padding-top: 5px;
  text-align: left;
`;

const RoadmapLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  color: ${(p) => (p.$status === 'now' ? colors.rose : colors.text3)};
`;

const RoadmapTitle = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: ${colors.text};
  margin-bottom: 3px;
`;

const RoadmapDesc = styled.div`
  font-size: 13.5px;
  color: ${colors.text2};
  line-height: 1.5;
`;

// ── Final CTA ──────────────────────────────────────────────
const FinalCta = styled.section`
  background: ${colors.black};
  padding: 80px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(225, 29, 72, 0.25) 0%, transparent 65%);
    pointer-events: none;
  }

  h2 {
    color: #fff;
    position: relative;
    z-index: 1;
  }

  h2 em {
    color: #FDA4AF;
  }

  ${Subline} {
    color: rgba(255, 255, 255, 0.5);
    max-width: 440px;
    margin: 10px auto 0;
    position: relative;
    z-index: 1;
  }
`;

const FinalCtaActions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 28px;
  position: relative;
  z-index: 1;
`;

const FinalCtaTrust = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
`;

const RoseEyebrow = styled(Eyebrow)`
  color: #FDA4AF;
  justify-content: center;
`;

const CenteredEyebrow = styled(Eyebrow)`
  justify-content: center;
`;

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
const AboutPage = () => {
  return (
    <LandingPageLayout>
      <Helmet>
        <title>About newcollab | Built for Creators Who Want Brand Deals</title>
        <meta
          name="description"
          content="newcollab was built by a founder who spent years in influencer marketing and saw the same problem everywhere: creators with great content, no system to reach brands. So we built one."
        />
        <link rel="canonical" href="https://newcollab.co/about" />
        <meta property="og:title" content="About newcollab | Built for Creators Who Want Brand Deals" />
        <meta
          property="og:description"
          content="A solo-founder product, built after years watching talented creators get ignored — not because their content was bad, but because they had no system."
        />
        <meta property="og:url" content="https://newcollab.co/about" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About newcollab | Built for Creators Who Want Brand Deals" />
        <meta
          name="twitter:description"
          content="The complete brand outreach tool for nano and micro creators."
        />
      </Helmet>

      <Page>
        {/* Hero */}
        <Hero>
          <CenteredEyebrow>
            <EyebrowDot /> About newcollab
          </CenteredEyebrow>
          <H1>
            Built for creators who are tired of
            <br />
            <em>guessing how to reach brands.</em>
          </H1>
          <Subline>
            A solo-founder product, built after years watching talented creators get
            ignored — not because their content was bad, but because they had no system.
          </Subline>
          <HeroCta>
            <BtnBlack
              href="/register/creator"
              style={{ padding: '15px 28px', fontSize: 16, borderRadius: 14 }}
            >
              Try it free →
            </BtnBlack>
            <BtnOutline href="/directory">Browse brands</BtnOutline>
          </HeroCta>
        </Hero>

        {/* Founder */}
        <FounderSection>
          <FounderInner>
            <FounderPhotoWrap>
              <FounderPhoto>
                <FounderImg src="/founder.jpg" alt="Mazza, founder of newcollab" />
              </FounderPhoto>
              <FounderBadge>
                <FounderBadgeAvatar>M</FounderBadgeAvatar>
                <FounderBadgeText>
                  <FounderBadgeName>Mazza</FounderBadgeName>
                  <FounderBadgeRole>Founder, newcollab</FounderBadgeRole>
                </FounderBadgeText>
              </FounderBadge>
            </FounderPhotoWrap>

            <FounderContent>
              <Eyebrow>
                <EyebrowDot /> The founder
              </Eyebrow>
              <H2>
                I spent years in influencer marketing.
                <br />
                Watching creators get <em>left behind.</em>
              </H2>

              <p>
                I started in talent agencies, then moved to managing creator campaigns
                for global brands. For over a decade, I watched the same problem from
                both sides: creators with genuinely great content, sending emails into
                the void. Brands with real PR budgets, struggling to find the right
                people.
              </p>

              <p>
                The tools that existed were built for agencies — expensive, complicated,
                and completely out of reach for a solo creator with 8,000 followers who
                just wanted to pitch Rhode Skin.
              </p>

              <p>
                <strong>So I built the tool I wish existed.</strong> Something a nano
                creator could pick up in 5 minutes — that handles the brand contacts,
                writes the pitch, attaches the media kit, and keeps track of every
                outreach. No agency needed. No guessing.
              </p>

              <p>
                newcollab is still early. I&apos;m one person, building in public,
                shipping fast. If something&apos;s broken, I&apos;ll fix it. If you have
                a brand to add, tell me. This is a product built with its users — not
                launched at them.
              </p>
            </FounderContent>
          </FounderInner>
        </FounderSection>

        {/* Mission strip */}
        <MissionStrip>
          <MissionStatement>
            Every creator deserves a real shot at brand deals —
            <br />
            <em>not just the ones who know the right people.</em>
          </MissionStatement>
          <MissionSub>
            That&apos;s what newcollab is for. Contacts, pitch, media kit, tracking —
            everything a creator needs to reach brands professionally, in one place.
          </MissionSub>
        </MissionStrip>

        {/* Who it's for */}
        <ForSection>
          <ContainerSm>
            <Center>
              <CenteredEyebrow>
                <EyebrowDot /> Who this is for
              </CenteredEyebrow>
              <H2>
                Built for nano and micro creators.
                <br />
                Not for <em>everyone.</em>
              </H2>
              <Subline>
                newcollab isn&apos;t trying to serve every creator at every stage. It&apos;s
                built for one specific person.
              </Subline>
            </Center>
            <ForGrid>
              <ForCard className="yes">
                <ForCardTag $yes>This is for you if...</ForCardTag>
                <h3>
                  You&apos;re a creator who wants brand deals and doesn&apos;t know where
                  to start.
                </h3>
                <ul>
                  <li>You create content on Instagram, TikTok, YouTube or a blog</li>
                  <li>You have between 1,000 and 100,000 followers</li>
                  <li>You want PR packages and paid collabs — not just gifted posts</li>
                  <li>You&apos;re ready to reach out to brands but have no system</li>
                  <li>You&apos;ve DMd brands before and got no reply</li>
                  <li>You don&apos;t have a media kit and don&apos;t know where to start</li>
                </ul>
              </ForCard>
              <ForCard className="no">
                <ForCardTag>This probably isn&apos;t for you if...</ForCardTag>
                <h3>
                  You&apos;re an agency, a mega-influencer, or a brand looking to run
                  campaigns.
                </h3>
                <ul>
                  <li>You have a full team managing brand relationships</li>
                  <li>You already have a talent manager or agent</li>
                  <li>You&apos;re a brand looking to source creators (not pitch them)</li>
                  <li>You&apos;re looking for a full CRM with workflow automation</li>
                  <li>You have 500K+ followers and brands already come to you</li>
                </ul>
              </ForCard>
            </ForGrid>
          </ContainerSm>
        </ForSection>

        {/* Honest numbers */}
        <NumbersSection>
          <Container>
            <Center>
              <CenteredEyebrow>
                <EyebrowDot /> Where we are today
              </CenteredEyebrow>
              <H2>
                Honest numbers.
                <br />
                Early stage, <em>growing fast.</em>
              </H2>
            </Center>
            <NumbersGrid>
              <NumberCard>
                <NumberVal $color={colors.rose}>900+</NumberVal>
                <NumberLabel>Creators signed up</NumberLabel>
                <NumberContext>
                  Nano and micro creators using newcollab to find and pitch brands.
                </NumberContext>
              </NumberCard>
              <NumberCard>
                <NumberVal>2,000+</NumberVal>
                <NumberLabel>Brand PR contacts</NumberLabel>
                <NumberContext>
                  Verified brand contacts, direct PR emails, and reply rates. Updated
                  weekly.
                </NumberContext>
              </NumberCard>
              <NumberCard>
                <NumberVal $color={colors.green}>52%</NumberVal>
                <NumberLabel>Top brand reply rate</NumberLabel>
                <NumberContext>
                  The highest reply rate on the platform — brands that respond fastest to
                  creator pitches.
                </NumberContext>
              </NumberCard>
            </NumbersGrid>
          </Container>
        </NumbersSection>

        {/* What it is / is not */}
        <HonestSection>
          <ContainerSm>
            <Center>
              <CenteredEyebrow>
                <EyebrowDot /> What newcollab is
              </CenteredEyebrow>
              <H2>
                Let&apos;s be direct about
                <br />
                what this <em>actually does.</em>
              </H2>
            </Center>
            <HonestGrid>
              <HonestNot>
                <HonestNotLabel>Not a marketplace</HonestNotLabel>
                <HonestNotText>
                  We don&apos;t connect you to brands through a platform they also have
                  to join. You pitch them directly — by email — like a professional.
                </HonestNotText>
              </HonestNot>
              <HonestNot>
                <HonestNotLabel>Not a PR agency</HonestNotLabel>
                <HonestNotText>
                  We don&apos;t manage your outreach for you. You&apos;re in control. We
                  give you the contacts, the pitch, and the tracking — you send it.
                </HonestNotText>
              </HonestNot>
              <HonestNot>
                <HonestNotLabel>Not a follower growth tool</HonestNotLabel>
                <HonestNotText>
                  We don&apos;t grow your audience. We help you monetise the audience
                  you already have through brand partnerships, PR packages, and gifted
                  collabs.
                </HonestNotText>
              </HonestNot>
              <HonestNot>
                <HonestNotLabel>Not for huge creators</HonestNotLabel>
                <HonestNotText>
                  If brands are already coming to you, you don&apos;t need this. newcollab
                  is built for the creator who has to make the first move — and wins when
                  they do.
                </HonestNotText>
              </HonestNot>
              <HonestIs>
                <HonestIsLabel>What it actually is</HonestIsLabel>
                <HonestIsText>
                  A complete outreach system.{' '}
                  <em>
                    Brand contacts, AI pitch emails, auto-generated media kit, and a
                    deal-tracking pipeline
                  </em>{' '}
                  — everything a small creator needs to reach brands like a professional
                  and land deals on repeat.
                </HonestIsText>
              </HonestIs>
            </HonestGrid>
          </ContainerSm>
        </HonestSection>

        {/* Roadmap */}
        <RoadmapSection>
          <ContainerSm>
            <Center>
              <CenteredEyebrow>
                <EyebrowDot /> What&apos;s coming
              </CenteredEyebrow>
              <H2>
                Building this in the open.
                <br />
                Here&apos;s <em>what&apos;s next.</em>
              </H2>
              <Subline>
                newcollab ships fast. If you want a feature, tell us — the best ideas
                come from creators using it every day.
              </Subline>
            </Center>
            <RoadmapList>
              <RoadmapItem>
                <RoadmapDot $status="done">✓</RoadmapDot>
                <RoadmapContent>
                  <RoadmapLabel $status="done">Shipped</RoadmapLabel>
                  <RoadmapTitle>Brand directory — 2,000+ PR contacts</RoadmapTitle>
                  <RoadmapDesc>
                    Verified brand emails, reply rates, niche filters. Updated weekly.
                  </RoadmapDesc>
                </RoadmapContent>
              </RoadmapItem>
              <RoadmapItem>
                <RoadmapDot $status="done">✓</RoadmapDot>
                <RoadmapContent>
                  <RoadmapLabel $status="done">Shipped</RoadmapLabel>
                  <RoadmapTitle>AI pitch writer + media kit auto-generation</RoadmapTitle>
                  <RoadmapDesc>
                    Personalised email per brand. Media kit generated from your profile
                    and auto-attached.
                  </RoadmapDesc>
                </RoadmapContent>
              </RoadmapItem>
              <RoadmapItem>
                <RoadmapDot $status="done">✓</RoadmapDot>
                <RoadmapContent>
                  <RoadmapLabel $status="done">Shipped</RoadmapLabel>
                  <RoadmapTitle>PR Pipeline + follow-up reminders</RoadmapTitle>
                  <RoadmapDesc>
                    Track every pitch. Auto day-7 follow-up alert. Log replies, packages,
                    and PR value.
                  </RoadmapDesc>
                </RoadmapContent>
              </RoadmapItem>
              <RoadmapItem>
                <RoadmapDot $status="now">→</RoadmapDot>
                <RoadmapContent>
                  <RoadmapLabel $status="now">In progress</RoadmapLabel>
                  <RoadmapTitle>For You feed — weekly personalised brand matches</RoadmapTitle>
                  <RoadmapDesc>
                    Brands matched to your niche, platform, and follower count. Seasonal
                    alerts included.
                  </RoadmapDesc>
                </RoadmapContent>
              </RoadmapItem>
              <RoadmapItem>
                <RoadmapDot $status="next">·</RoadmapDot>
                <RoadmapContent>
                  <RoadmapLabel $status="next">Coming next</RoadmapLabel>
                  <RoadmapTitle>Batch pitching — 10 brands in one session</RoadmapTitle>
                  <RoadmapDesc>
                    Select multiple brands, generate all pitches at once, send in bulk.
                    Pro feature.
                  </RoadmapDesc>
                </RoadmapContent>
              </RoadmapItem>
              <RoadmapItem>
                <RoadmapDot $status="next">·</RoadmapDot>
                <RoadmapContent>
                  <RoadmapLabel $status="next">On the list</RoadmapLabel>
                  <RoadmapTitle>Creator community + shared pitch wins</RoadmapTitle>
                  <RoadmapDesc>
                    See which brands other creators in your niche are landing. Real-time
                    success feed.
                  </RoadmapDesc>
                </RoadmapContent>
              </RoadmapItem>
            </RoadmapList>
            <Center style={{ marginTop: 36 }}>
              <p style={{ fontSize: 14, color: colors.text3, marginBottom: 14 }}>
                Have a feature request? Tell us directly.
              </p>
              <BtnOutline href="mailto:hello@newcollab.co">Email the founder →</BtnOutline>
            </Center>
          </ContainerSm>
        </RoadmapSection>

        {/* Resources */}
        <ForSection>
          <ContainerSm>
            <Center>
              <CenteredEyebrow>
                <EyebrowDot /> Free resources
              </CenteredEyebrow>
              <H2>
                Start landing PR with
                <br />
                our <em>free guides.</em>
              </H2>
              <Subline>
                Brand lists, PR contacts, and pitch templates — all free, all updated for 2026.
              </Subline>
            </Center>
            <ForGrid>
              <ForCard className="yes" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/blog/companies-with-open-pr-application-forms-influencers-2025'}>
                <ForCardTag $yes>Most Popular</ForCardTag>
                <h3>385+ Brands with Open PR Application Forms</h3>
                <ul>
                  <li>Direct application links to brand PR forms</li>
                  <li>Beauty, fashion, lifestyle & wellness brands</li>
                  <li>Updated weekly with new opportunities</li>
                </ul>
              </ForCard>
              <ForCard className="yes" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/blog/list-of-companies-that-send-pr-packages-2025'}>
                <ForCardTag $yes>2025 List</ForCardTag>
                <h3>Companies That Send PR Packages</h3>
                <ul>
                  <li>100+ verified PR-friendly brands</li>
                  <li>Brands actively seeking small creators</li>
                  <li>Contact info and reply rate data</li>
                </ul>
              </ForCard>
            </ForGrid>
            <Center style={{ marginTop: 24 }}>
              <BtnOutline href="/blog">View all guides →</BtnOutline>
            </Center>
          </ContainerSm>
        </ForSection>

        {/* Final CTA */}
        <FinalCta>
          <ContainerSm>
            <RoseEyebrow>
              <EyebrowDot style={{ background: '#FDA4AF' }} /> Ready to start
            </RoseEyebrow>
            <H2>
              Stop waiting for brands
              <br />
              to find <em>you.</em>
            </H2>
            <Subline>
              Join 900+ creators who are pitching brands directly — with a complete system
              that handles every step.
            </Subline>
            <FinalCtaActions>
              <BtnRose
                href="/register/creator"
                style={{ padding: '15px 28px', fontSize: 16, borderRadius: 14 }}
              >
                Start for free — no credit card →
              </BtnRose>
              <FinalCtaTrust>Free plan · 3 AI pitches/month · Media kit included</FinalCtaTrust>
            </FinalCtaActions>
          </ContainerSm>
        </FinalCta>
      </Page>
    </LandingPageLayout>
  );
};

export default AboutPage;
