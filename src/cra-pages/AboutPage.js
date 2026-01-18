import React from 'react';
import { Typography, Row, Col, Button } from 'antd';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  RocketOutlined, 
  TeamOutlined, 
  GlobalOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  StarOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import LandingPageLayout from '../Layouts/LandingPageLayout';

const { Title, Paragraph } = Typography;

const PageContainer = styled.div`
  padding-top: 80px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
`;

const Section = styled.section`
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const HeroSection = styled.div`
  text-align: center;
  margin-bottom: 80px;
  padding: 60px 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 24px;
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80') center/cover;
    opacity: 0.1;
    z-index: 0;
  }
`;

const FeatureCard = styled(motion.div)`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  height: 100%;
  transition: transform 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    opacity: 0.05;
    border-radius: 50%;
    transform: translate(50%, -50%);
  }
`;

const StatNumber = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: #6366f1;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const StatLabel = styled.div`
  font-size: 18px;
  color: #4b5563;
  text-align: center;
`;

const IconWrapper = styled.div`
  font-size: 32px;
  color: #6366f1;
  margin-bottom: 16px;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 40px;
    bottom: -32px;
    width: 2px;
    background: #e5e7eb;
  }

  &:last-child::before {
    display: none;
  }
`;

const TimelineDot = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
`;

const TimelineContent = styled.div`
  flex: 1;
`;

const VisualGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin: 48px 0;
`;

const VisualCard = styled(motion.div)`
  background: white;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const AboutPage = () => {
  return (
    <LandingPageLayout>
      <Helmet>
        <link rel="canonical" href="https://newcollab.co/about" />
      </Helmet>
      <PageContainer>
        <Section>
          <HeroSection>
            <Title level={1} style={{ color: 'white', marginBottom: '24px', position: 'relative' }}>
              Empowering Creators, Transforming Brand Partnerships
            </Title>
            <Paragraph style={{ fontSize: '20px', color: 'white', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
              Built by a creator for creators. 10+ years of experience in influencer marketing, from talent agencies to global brands.
            </Paragraph>
          </HeroSection>

          <Row gutter={[48, 48]}>
            <Col xs={24} md={12}>
              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <IconWrapper>
                  <RocketOutlined />
                </IconWrapper>
                <Title level={3}>The Creator's Journey</Title>
                <Paragraph style={{ fontSize: '18px', lineHeight: '1.8' }}>
                  After a decade in the creator economy, I've seen it all - from the early days of influencer marketing to today's sophisticated brand partnerships. I've worked with talent agencies, managed creator campaigns for global brands, and witnessed the evolution of digital content creation firsthand.
                </Paragraph>
                <Paragraph style={{ fontSize: '18px', lineHeight: '1.8' }}>
                  This experience has shown me one thing: creators deserve better tools and opportunities to build sustainable businesses. That's why I built Newcollab - to bridge the gap between creators and brands with a platform that actually works for both sides.
                </Paragraph>
              </FeatureCard>
            </Col>
            <Col xs={24} md={12}>
              <FeatureCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <IconWrapper>
                  <BulbOutlined />
                </IconWrapper>
                <Title level={3}>Why Newcollab?</Title>
                <Paragraph style={{ fontSize: '18px', lineHeight: '1.8' }}>
                  We're not just another marketplace. We're a creator-first platform built by someone who understands the challenges and opportunities in the creator economy. Our mission is simple: empower creators to focus on what they do best - creating amazing content - while we handle the business side.
                </Paragraph>
                <Paragraph style={{ fontSize: '18px', lineHeight: '1.8' }}>
                  With Newcollab, you get a partner who's been in your shoes, understands your needs, and is committed to your success.
                </Paragraph>
              </FeatureCard>
            </Col>
          </Row>

          <Row gutter={[48, 48]} style={{ marginTop: '80px' }}>
            <Col xs={24}>
              <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
                The Numbers Speak for Themselves
              </Title>
              <Row gutter={[48, 48]}>
                <Col xs={24} sm={8}>
                  <FeatureCard>
                    <StatNumber>
                      <TeamOutlined /> 10+
                    </StatNumber>
                    <StatLabel>Years in Creator Economy</StatLabel>
                  </FeatureCard>
                </Col>
                <Col xs={24} sm={8}>
                  <FeatureCard>
                    <StatNumber>
                      <StarOutlined /> 1000+
                    </StatNumber>
                    <StatLabel>Creator Partnerships</StatLabel>
                  </FeatureCard>
                </Col>
                <Col xs={24} sm={8}>
                  <FeatureCard>
                    <StatNumber>
                      <GlobalOutlined /> 500+
                    </StatNumber>
                    <StatLabel>Brand Collaborations</StatLabel>
                  </FeatureCard>
                </Col>
              </Row>
            </Col>
          </Row>

          <Row gutter={[48, 48]} style={{ marginTop: '80px' }}>
            <Col xs={24}>
              <Title level={2} style={{ textAlign: 'center', marginBottom: '48px' }}>
                Our Journey
              </Title>
              <TimelineItem>
                <TimelineDot />
                <TimelineContent>
                  <Title level={4}>2013</Title>
                  <Paragraph>Started in talent agency, managing creator partnerships</Paragraph>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineDot />
                <TimelineContent>
                  <Title level={4}>2016</Title>
                  <Paragraph>Led creator campaigns for global brands</Paragraph>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineDot />
                <TimelineContent>
                  <Title level={4}>2020</Title>
                  <Paragraph>Identified the need for a better creator-brand platform</Paragraph>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineDot />
                <TimelineContent>
                  <Title level={4}>2023</Title>
                  <Paragraph>Launched Newcollab to transform creator-brand partnerships</Paragraph>
                </TimelineContent>
              </TimelineItem>
            </Col>
          </Row>

          <Row gutter={[48, 48]} style={{ marginTop: '80px' }}>
            <Col xs={24}>
              <FeatureCard>
                <Title level={3}>What Sets Us Apart</Title>
                <VisualGrid>
                  <VisualCard
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <IconWrapper>
                      <CheckCircleOutlined />
                    </IconWrapper>
                    <Title level={4}>Creator-First</Title>
                    <Paragraph>Built by creators, for creators</Paragraph>
                  </VisualCard>
                  <VisualCard
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <IconWrapper>
                      <TeamOutlined />
                    </IconWrapper>
                    <Title level={4}>Expert Support</Title>
                    <Paragraph>Dedicated team of industry veterans</Paragraph>
                  </VisualCard>
                  <VisualCard
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <IconWrapper>
                      <GlobalOutlined />
                    </IconWrapper>
                    <Title level={4}>Global Reach</Title>
                    <Paragraph>Connect with brands worldwide</Paragraph>
                  </VisualCard>
                </VisualGrid>
              </FeatureCard>
            </Col>
          </Row>

          <Row style={{ marginTop: '80px', textAlign: 'center' }}>
            <Col xs={24}>
              <Button 
                type="primary" 
                size="large"
                style={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  border: 'none',
                  padding: '12px 32px',
                  height: 'auto',
                  fontSize: '18px'
                }}
                onClick={() => window.location.href = '/register'}
              >
                Join Newcollab now
              </Button>
            </Col>
          </Row>
        </Section>
      </PageContainer>
    </LandingPageLayout>
  );
};

export default AboutPage; 