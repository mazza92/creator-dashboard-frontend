import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line no-unused-vars
import { FaGift, FaDollarSign, FaCheckCircle, FaRocket, FaUsers, FaChartLine } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import LandingPageLayout from '../Layouts/LandingPageLayout';
import { Link } from 'react-router-dom';

// Color Palette
const primaryBlue = '#3B82F6';
const brightMagenta = '#EC4899';
const warmOrange = '#F59E0B';
const offWhite = '#F9FAFB';
const darkCharcoal = '#1F2937';
const white = '#FFFFFF';
const lightGray = '#E5E7EB';
const midGray = '#6B7280';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${offWhite};
    color: ${darkCharcoal};
    font-family: 'Inter', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// eslint-disable-next-line no-unused-vars
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rem 2rem 8rem 2rem;
  padding-top: 12rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  min-height: 100vh;

  &::before, &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(120px);
    z-index: -1;
    opacity: 0.15;
  }

  &::before {
    width: 800px;
    height: 800px;
    background: ${primaryBlue};
    top: 10%;
    left: -400px;
  }

  &::after {
    width: 600px;
    height: 600px;
    background: ${brightMagenta};
    bottom: 20%;
    right: -300px;
  }

  @media (max-width: 768px) {
    padding-top: 10rem;
    padding: 6rem 1.5rem 6rem 1.5rem;
  }
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: 8rem;
  &:last-child { margin-bottom: 0; }
`;

const GradientHeadline = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 4.5rem;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 2rem;
  background: linear-gradient(90deg, ${primaryBlue}, ${brightMagenta});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;

  @media (max-width: 1200px) { font-size: 4rem; }
  @media (max-width: 900px) { font-size: 3.5rem; }
  @media (max-width: 768px) { font-size: 2.8rem; }
  @media (max-width: 480px) { font-size: 2.4rem; }
`;

const SubHeadline = styled.p`
  font-size: 1.4rem;
  color: ${midGray};
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  
  @media (max-width: 900px) {
    font-size: 1.25rem;
    margin-bottom: 3rem;
    max-width: 100%;
  }
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const SectionHeadline = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: ${darkCharcoal};

  @media (max-width: 768px) { font-size: 2rem; }
`;

const BodyCopy = styled.p`
  font-size: 1.125rem;
  line-height: 1.6;
  color: ${midGray};
  max-width: 550px;
  margin: 0 auto 1.5rem auto;
`;

const LightCard = styled.div`
  background: ${white};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  transition: all 0.3s ease;
  border: 1px solid ${lightGray};
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07);
  }
`;

const GradientButton = styled(Link)`
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(45deg, ${brightMagenta}, ${warmOrange});
  color: ${white};
  border: none;
  border-radius: 12px;
  padding: 1rem 2.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 2rem;
  box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
  white-space: nowrap;
  display: inline-block;
  text-decoration: none;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 20px rgba(236, 72, 153, 0.3);
    color: ${white};
  }

  @media (max-width: 768px) {
    padding: 0.875rem 2rem;
    font-size: 1.1rem;
  }
`;

// eslint-disable-next-line no-unused-vars
const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 3rem;
  text-align: left;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StepLayout = styled.div`
  text-align: left;
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const StepItem = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
`;

const StepNumber = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${primaryBlue}, ${brightMagenta});
  color: ${white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepperTitle = styled.h4`
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${darkCharcoal};
`;

const StepperDesc = styled.p`
  color: ${midGray};
  font-size: 1rem;
  line-height: 1.6;
`;

const IconWrapper = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${props => props.color || primaryBlue};
  display: flex;
  justify-content: center;
`;

const CardTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: ${darkCharcoal};
  text-align: center;
`;

const CardDescription = styled.p`
  color: ${midGray};
  font-size: 1rem;
  line-height: 1.6;
  text-align: center;
  margin: 0;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.color || primaryBlue};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: ${midGray};
`;

const CreatorShowcaseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem;
  margin-top: 3rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const CreatorShowcaseImage = styled.img`
  width: 65%;
  height: auto;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: block;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const PricingCard = styled(LightCard)`
  max-width: 700px;
  margin: 3rem auto 0;
  text-align: center;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CTASectionWrapper = styled.div`
  background: linear-gradient(135deg, ${primaryBlue} 0%, ${brightMagenta} 100%);
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  color: ${white};
  margin-top: 4rem;
`;

const CTATitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: ${white};

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTAText = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const VideoSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 4rem 0;
  
  @media (max-width: 768px) {
    margin: 3rem 0;
  }
`;

const ModernPhoneMockup = styled.div`
  position: relative;
  width: 368px;
  height: 667px;
  background: transparent;
  border-radius: 38px;
  box-shadow: 0 8px 32px 0 rgba(31,38,135,0.15);
  border: 1.5px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  @media (max-width: 1200px) {
    width: 345px;
    height: 621px;
  }
  
  @media (max-width: 900px) {
    width: 322px;
    height: 575px;
  }
  
  @media (max-width: 768px) {
    width: 299px;
    height: 529px;
  }
  
  @media (max-width: 480px) {
    width: 276px;
    height: 483px;
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 56px;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    z-index: 2;
    opacity: 0.7;
  }
`;

const ModernPhoneScreen = styled.div`
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 38px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(31,38,135,0.04);
`;

const BrandPRPackagesPage = () => {
  // eslint-disable-next-line no-unused-vars
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const creatorShowcaseImages = [
    'https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(5).png',
    'https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(1).png',
    'https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(3).png'
  ];

  return (
    <>
      <GlobalStyle />
      <LandingPageLayout>
        <Helmet>
          <title>Send PR Packages to Small Influencers | Brand PR Platform | Newcollab</title>
          <meta 
            name="description" 
            content="Connect with 10,000+ micro-influencers ready for PR packages. High engagement rates (3-6%), low cost ($50-$500), authentic content. Start sending PR packages to small influencers today." 
          />
          <meta name="keywords" content="send PR packages to influencers, micro influencers PR packages, brand PR platform, influencer marketing, PR distribution, small influencer collaborations, micro influencer partnerships, PR packages for brands, influencer PR strategy, brand partnerships platform" />
          
          {/* Additional SEO Meta Tags */}
          <meta name="robots" content="index, follow" />
          <meta name="author" content="Newcollab" />
          <meta name="language" content="English" />
          <meta name="revisit-after" content="7 days" />
          <meta name="distribution" content="global" />
          <meta name="rating" content="general" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://newcollab.co/brands/pr-packages" />
          <meta property="og:title" content="Send PR Packages to Small Influencers | Brand PR Platform" />
          <meta property="og:description" content="Connect with 10,000+ micro-influencers ready for PR packages. High engagement rates (3-6%), low cost ($50-$500), authentic content. Start sending PR packages today." />
          <meta property="og:image" content="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(5).png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="Newcollab" />
          <meta property="og:locale" content="en_US" />
          
          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://newcollab.co/brands/pr-packages" />
          <meta property="twitter:title" content="Send PR Packages to Small Influencers | Brand PR Platform" />
          <meta property="twitter:description" content="Connect with 10,000+ micro-influencers ready for PR packages. High engagement, low cost, authentic content." />
          <meta property="twitter:image" content="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(5).png" />
          <meta property="twitter:site" content="@newcollab" />
          <meta property="twitter:creator" content="@newcollab" />
        
          <link rel="canonical" href="https://newcollab.co/brands/pr-packages" />
          
          {/* Additional Schema.org Structured Data */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              "name": "Send PR Packages to Small Influencers",
              "description": "Connect with 10,000+ micro-influencers ready for PR packages. High engagement rates (3-6%), low cost ($50-$500), authentic content. Start sending PR packages to small influencers through Newcollab's brand PR platform.",
              "url": "https://newcollab.co/brands/pr-packages",
              "provider": {
                "@type": "Organization",
                "name": "Newcollab",
                "url": "https://newcollab.co",
                "logo": "https://newcollab.co/logo.png"
              },
              "serviceType": "Brand PR Platform",
              "areaServed": "Worldwide",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "validFrom": new Date().toISOString(),
                "url": "https://newcollab.co/brands/pr-packages",
                "description": "Free to list PR packages. Commission only on paid collaborations."
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "89"
              },
              "featureList": [
                "Browse 10,000+ small influencers",
                "Send PR packages directly",
                "3-6% engagement rates",
                "$50-$500 PR package costs",
                "Authentic content creation",
                "Track PR campaigns",
                "Free to list PR packages"
              ]
            })}
          </script>
          
          {/* Enhanced FAQ Schema for Better AI Search Results */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How do I send PR packages to small influencers?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sign up for Newcollab as a brand, browse through 10,000+ verified small influencers, filter by niche and engagement rate, then send PR packages directly through our platform. Track delivery and manage your PR campaigns all in one place."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What are the benefits of sending PR packages to micro-influencers?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Small influencers (1K-50K followers) deliver 3-6x higher engagement rates (3-6% vs 1-2% for macro influencers) at 10x lower cost ($50-$500 vs $5,000+). They create more authentic content and have genuine connections with their niche audiences, resulting in better ROI."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How much do PR packages cost for small influencers?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "PR packages for small influencers typically cost $50-$500, depending on follower count and engagement rate. This is significantly lower than macro-influencer campaigns which cost $5,000+. Newcollab is free to list PR packages - you only pay a commission on paid collaborations."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What engagement rates do small influencers have?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Small influencers typically have 3-6% engagement rates, which is 3-6x higher than macro influencers who average 1-2%. This higher engagement means better ROI and more authentic brand connections."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I find the right small influencers for my brand?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "On Newcollab, you can filter creators by niche, follower count (1K-50K), engagement rate, platform, and content style. Browse through verified creators and see their portfolio, engagement metrics, and content examples before sending PR packages."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is it free to send PR packages on Newcollab?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, it's completely free to list and send PR packages to creators on Newcollab. We only charge a commission (15%) when a creator converts to a paid collaboration after receiving your PR package."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I track my PR package campaigns?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Newcollab provides a dashboard where you can track all your PR packages from delivery to content creation. See which creators received packages, view their content, and manage all your PR campaigns in one place."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What types of creators can receive PR packages?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "All creators on Newcollab (1K-50K followers) are open to receiving PR packages. You can filter by niche including beauty, fashion, fitness, tech, food, travel, and more. Creators are verified and actively seeking brand partnerships."
                  }
                }
              ]
            })}
          </script>
          
          {/* Enhanced Organization Schema for E-E-A-T */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Newcollab",
              "url": "https://newcollab.co",
              "logo": "https://newcollab.co/logo.png",
              "description": "Newcollab is the leading platform connecting brands with small influencers for PR packages and brand partnerships. We help brands send PR packages to 10,000+ verified micro-influencers with high engagement rates and authentic content creation.",
              "foundingDate": "2024",
              "numberOfEmployees": "25-50",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://newcollab.co/contact"
              },
              "sameAs": [
                "https://twitter.com/newcollab",
                "https://instagram.com/newcollab",
                "https://linkedin.com/company/newcollab"
              ]
            })}
          </script>
          
          {/* BreadcrumbList Schema */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://newcollab.co"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "For Brands",
                  "item": "https://newcollab.co/brands"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Send PR Packages",
                  "item": "https://newcollab.co/brands/pr-packages"
                }
              ]
            })}
          </script>
        </Helmet>

        <PageWrapper>
          <ContentContainer>
            {/* Hero Section */}
            <Section ref={heroRef}>
              <GradientHeadline>
                Send PR Packages to 10,000+ Small Influencers
              </GradientHeadline>
              <SubHeadline>
                Connect with high-engagement micro-influencers (1K-50K followers) who deliver authentic content and drive real results for your brand.
              </SubHeadline>
              <GradientButton to="/register/brand">
                Start Sending PR Packages
              </GradientButton>
            </Section>

            {/* Video Section */}
            <VideoSection>
              <ModernPhoneMockup>
                <ModernPhoneScreen>
                  <video
                    src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators/newcollab_sendPR.mp4"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '38px' }}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                    aria-label="Demo of Newcollab PR package sending platform for brands"
                    poster="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/public/creators//newcolla-biolink-sponsoring-tool%20(1).png"
                    preload="metadata"
                    itemScope
                    itemType="https://schema.org/VideoObject"
                  />
                </ModernPhoneScreen>
              </ModernPhoneMockup>
            </VideoSection>

            {/* Value Prop Section */}
            <Section>
              <SectionHeadline style={{ textAlign: 'center' }}>
                3-6x Higher Engagement at 10x Lower Cost
              </SectionHeadline>
              <BodyCopy style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Small influencers deliver authentic connections with their audiences, resulting in higher engagement rates and better ROI than macro-influencer campaigns.
              </BodyCopy>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
                marginTop: '3rem'
              }}>
                <LightCard>
                  <IconWrapper color={primaryBlue}>
                    <FaChartLine />
                  </IconWrapper>
                  <CardTitle>3-6% Engagement Rate</CardTitle>
                  <CardDescription>
                    vs. 1-2% for macro influencers
                  </CardDescription>
                </LightCard>

                <LightCard>
                  <IconWrapper color={brightMagenta}>
                    <FaDollarSign />
                  </IconWrapper>
                  <CardTitle>$50-$500 PR Packages</CardTitle>
                  <CardDescription>
                    vs. $5,000+ for macro campaigns
                  </CardDescription>
                </LightCard>

                <LightCard>
                  <IconWrapper color={warmOrange}>
                    <FaGift />
                  </IconWrapper>
                  <CardTitle>10x More Authentic</CardTitle>
                  <CardDescription>
                    Genuine brand connections
                  </CardDescription>
                </LightCard>
              </div>
            </Section>

            {/* How It Works Section */}
            <Section>
              <SectionHeadline>How It Works</SectionHeadline>
              <BodyCopy style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Get matched with perfect creators and send PR packages in three simple steps
              </BodyCopy>
              
              <StepLayout>
                <StepItem>
                  <StepNumber>1</StepNumber>
                  <StepContent>
                    <StepperTitle>Get Matched with Creators</StepperTitle>
                    <StepperDesc>
                      Our smart matching system automatically connects you with creators who align with your brand. Set your preferences for niche, engagement rate, and follower count—we'll find the perfect matches for your PR packages.
                    </StepperDesc>
                  </StepContent>
                </StepItem>

                <StepItem>
                  <StepNumber>2</StepNumber>
                  <StepContent>
                    <StepperTitle>Review & Send PR Packages</StepperTitle>
                    <StepperDesc>
                      Review your matched creators, see their portfolios and engagement metrics, then send PR packages directly through our platform. Track delivery and manage all your PR campaigns in one place.
                    </StepperDesc>
                    <div style={{ marginTop: '1rem' }}>
                      <GradientButton to="/marketplace" style={{ 
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem',
                        marginTop: '0.5rem'
                      }}>
                        Explore Marketplace →
                      </GradientButton>
                    </div>
                  </StepContent>
                </StepItem>

                <StepItem>
                  <StepNumber>3</StepNumber>
                  <StepContent>
                    <StepperTitle>Get Authentic Content</StepperTitle>
                    <StepperDesc>
                      Receive high-quality, authentic content from matched creators. Build lasting partnerships and scale your PR program efficiently with creators who are genuinely interested in your brand.
                    </StepperDesc>
                  </StepContent>
                </StepItem>
              </StepLayout>
            </Section>

            {/* Marketplace CTA Section */}
            <Section>
              <div style={{
                background: `linear-gradient(135deg, ${primaryBlue} 0%, ${brightMagenta} 100%)`,
                borderRadius: '24px',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: white,
                marginTop: '2rem'
              }}>
                <SectionHeadline style={{ color: white, marginBottom: '1rem' }}>
                  Get Matched with Perfect Creators
                </SectionHeadline>
                <BodyCopy style={{ color: 'rgba(255, 255, 255, 0.95)', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
                  Our smart matching system connects you with creators who align with your brand. Browse the marketplace or get automatically matched based on your preferences. Start sending PR packages in minutes.
                </BodyCopy>
                <GradientButton to="/marketplace" style={{ 
                  background: white,
                  color: primaryBlue,
                  boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)'
                }}>
                  Browse Creator Marketplace
                </GradientButton>
                <p style={{ 
                  marginTop: '1.5rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem'
                }}>
                  Free to browse • No signup required
                </p>
              </div>
            </Section>

            {/* Creator Showcase Section */}
            <Section>
              <SectionHeadline>Creators Seeking PR Packages</SectionHeadline>
              <BodyCopy style={{ textAlign: 'center', marginBottom: '3rem' }}>
                Meet some of the small influencers ready to create authentic content for your brand
              </BodyCopy>
              
              <CreatorShowcaseGrid>
                {creatorShowcaseImages.map((imageUrl, index) => (
                  <CreatorShowcaseImage
                    key={index}
                    src={imageUrl}
                    alt={`Creator showcase ${index + 1}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/400x600?text=Creator+Showcase';
                    }}
                  />
                ))}
              </CreatorShowcaseGrid>

              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <GradientButton to="/register/brand">
                  Browse All Creators
                </GradientButton>
              </div>
            </Section>

            {/* Pricing Section */}
            <Section>
              <SectionHeadline>Simple, Transparent Pricing</SectionHeadline>
              <BodyCopy style={{ textAlign: 'center', marginBottom: '3rem' }}>
                No monthly fees. Only pay for successful collaborations.
              </BodyCopy>
              
              <PricingCard>
                <h3 style={{ 
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  color: darkCharcoal
                }}>
                  Free to List PR Packages
                </h3>
                <p style={{ 
                  fontSize: '1.125rem',
                  color: midGray,
                  marginBottom: '2rem',
                  lineHeight: 1.6
                }}>
                  Create and send PR packages to creators at no upfront cost. We only charge a commission on paid collaborations that result from your PR packages.
                </p>
                
                <PricingGrid>
                  <LightCard>
                    <StatValue color={primaryBlue}>Free</StatValue>
                    <StatLabel>PR Package Distribution</StatLabel>
                  </LightCard>
                  <LightCard>
                    <StatValue color={brightMagenta}>15%</StatValue>
                    <StatLabel>Commission on Paid Collabs</StatLabel>
                    <p style={{ fontSize: '0.875rem', color: midGray, marginTop: '0.5rem', margin: 0 }}>
                      Only when creator converts to paid collaboration
                    </p>
                  </LightCard>
                </PricingGrid>
              </PricingCard>
            </Section>

            {/* CTA Section */}
            <CTASectionWrapper>
              <CTATitle>Ready to Start Sending PR Packages?</CTATitle>
              <CTAText>
                Join brands already connecting with high-engagement small influencers on Newcollab.
              </CTAText>
              <GradientButton to="/register/brand" style={{ 
                background: white,
                color: primaryBlue,
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)'
              }}>
                Start Sending PR Packages
              </GradientButton>
              <p style={{ 
                marginTop: '1.5rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.95rem'
              }}>
                Free to get started • No credit card required
              </p>
            </CTASectionWrapper>
          </ContentContainer>
        </PageWrapper>
      </LandingPageLayout>
    </>
  );
};

export default BrandPRPackagesPage;
