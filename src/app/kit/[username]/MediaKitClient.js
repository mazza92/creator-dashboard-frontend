'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import {
  FiInstagram, FiYoutube, FiTwitter, FiMail, FiMapPin,
  FiExternalLink, FiCheck, FiDollarSign, FiBriefcase
} from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';

const MediaKitClient = ({ mediaKit, username }) => {
  const formatFollowers = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return <FiInstagram />;
      case 'tiktok': return <FaTiktok />;
      case 'youtube': return <FiYoutube />;
      case 'twitter': return <FiTwitter />;
      default: return null;
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Hero Section */}
        <HeroSection>
          <ProfilePhoto
            src={mediaKit.profile_photo_url || '/default-avatar.png'}
            alt={mediaKit.display_name}
            onError={(e) => e.target.src = '/default-avatar.png'}
          />
          <HeroInfo>
            <DisplayName>{mediaKit.display_name}</DisplayName>
            {mediaKit.tagline && <Tagline>{mediaKit.tagline}</Tagline>}
            {mediaKit.location && (
              <Location><FiMapPin /> {mediaKit.location}</Location>
            )}
          </HeroInfo>
        </HeroSection>

        {/* Stats Section */}
        <StatsSection>
          <StatCard>
            <StatValue>{formatFollowers(mediaKit.total_followers)}</StatValue>
            <StatLabel>Followers</StatLabel>
          </StatCard>
          {mediaKit.engagement_rate && (
            <StatCard>
              <StatValue>{mediaKit.engagement_rate}%</StatValue>
              <StatLabel>Engagement</StatLabel>
            </StatCard>
          )}
          {mediaKit.platforms?.length > 0 && (
            <StatCard>
              <StatValue>{mediaKit.platforms.length}</StatValue>
              <StatLabel>Platforms</StatLabel>
            </StatCard>
          )}
        </StatsSection>

        {/* Availability Badges */}
        <BadgesSection>
          {mediaKit.accepts_gifted && (
            <Badge><FiCheck /> Open to Gifted</Badge>
          )}
          {mediaKit.accepts_paid && (
            <Badge $primary><FiDollarSign /> Open to Paid</Badge>
          )}
        </BadgesSection>

        {/* Niches */}
        {mediaKit.niches?.length > 0 && (
          <Section>
            <SectionTitle>Niches</SectionTitle>
            <TagsGrid>
              {mediaKit.niches.map((niche, i) => (
                <Tag key={i}>{niche}</Tag>
              ))}
            </TagsGrid>
          </Section>
        )}

        {/* Content Types */}
        {mediaKit.content_types?.length > 0 && (
          <Section>
            <SectionTitle>Content I Create</SectionTitle>
            <TagsGrid>
              {mediaKit.content_types.map((type, i) => (
                <Tag key={i} $secondary>{type}</Tag>
              ))}
            </TagsGrid>
          </Section>
        )}

        {/* Platforms */}
        {mediaKit.platforms?.length > 0 && (
          <Section>
            <SectionTitle>Platforms</SectionTitle>
            <PlatformsGrid>
              {mediaKit.platforms.map((platform, i) => (
                <PlatformCard key={i}>
                  <PlatformIcon>{getPlatformIcon(platform.platform)}</PlatformIcon>
                  <PlatformInfo>
                    <PlatformName>{platform.platform}</PlatformName>
                    {platform.handle && <PlatformHandle>{platform.handle}</PlatformHandle>}
                    {platform.followers && (
                      <PlatformFollowers>{formatFollowers(parseInt(platform.followers))} followers</PlatformFollowers>
                    )}
                  </PlatformInfo>
                </PlatformCard>
              ))}
            </PlatformsGrid>
          </Section>
        )}

        {/* Past Collaborations */}
        {mediaKit.collaborations?.length > 0 && (
          <Section>
            <SectionTitle><FiBriefcase /> Past Collaborations</SectionTitle>
            <CollabsGrid>
              {mediaKit.collaborations.map((collab, i) => (
                <CollabCard key={i}>
                  <CollabBrand>{collab.brand}</CollabBrand>
                  <CollabType>{collab.type}</CollabType>
                  {collab.description && <CollabDesc>{collab.description}</CollabDesc>}
                  {collab.url && (
                    <CollabLink href={collab.url} target="_blank" rel="noopener noreferrer">
                      View Content <FiExternalLink />
                    </CollabLink>
                  )}
                </CollabCard>
              ))}
            </CollabsGrid>
          </Section>
        )}

        {/* Rates & Packages */}
        {mediaKit.rates?.length > 0 && (
          <Section>
            <SectionTitle><FiDollarSign /> Packages & Rates</SectionTitle>
            <RatesGrid>
              {mediaKit.rates.map((rate, i) => (
                <RateCard key={i}>
                  <div>
                    <RateName>{rate.name}</RateName>
                    {rate.deliverables && <RateDeliverables>{rate.deliverables}</RateDeliverables>}
                  </div>
                  <RatePrice>${rate.price}</RatePrice>
                </RateCard>
              ))}
            </RatesGrid>
          </Section>
        )}

        {/* Contact CTA */}
        <CTASection>
          <CTATitle>Interested in collaborating?</CTATitle>
          <CTAText>Reach out to {mediaKit.display_name} for partnership opportunities</CTAText>
          <CTAButton href={`mailto:?subject=Collaboration Inquiry - ${mediaKit.display_name}&body=Hi ${mediaKit.display_name},%0A%0AI came across your media kit on NewCollab and would love to discuss a potential collaboration.%0A%0ABest regards`}>
            <FiMail /> Get in Touch
          </CTAButton>
        </CTASection>

        {/* Footer */}
        <Footer>
          <FooterText>Media kit powered by</FooterText>
          <FooterLogo href="/">NewCollab</FooterLogo>
        </Footer>
      </ContentWrapper>
    </PageContainer>
  );
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%);
  padding: 40px 20px;

  @media (max-width: 640px) {
    padding: 24px 16px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 680px;
  margin: 0 auto;
`;

// Hero Section
const HeroSection = styled.div`
  background: white;
  border-radius: 24px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;

  @media (max-width: 640px) {
    padding: 24px;
  }
`;

const ProfilePhoto = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #E5E7EB;
  margin-bottom: 16px;
`;

const HeroInfo = styled.div``;

const DisplayName = styled.h2`
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px 0;

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

const Tagline = styled.p`
  font-size: 16px;
  color: #6B7280;
  margin: 0 0 12px 0;
  line-height: 1.5;

  @media (max-width: 640px) {
    font-size: 15px;
  }
`;

const Location = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #9CA3AF;
`;

// Stats Section
const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px 16px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #111827;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
`;

// Badges
const BadgesSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: ${props => props.$primary ? '#ECFDF5' : '#EFF6FF'};
  color: ${props => props.$primary ? '#059669' : '#3B82F6'};
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
`;

// Sections
const Section = styled.div`
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

  @media (max-width: 640px) {
    padding: 20px;
  }
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
`;

// Tags
const TagsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  padding: 8px 16px;
  background: ${props => props.$secondary ? '#F3F4F6' : '#EFF6FF'};
  color: ${props => props.$secondary ? '#374151' : '#3B82F6'};
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
`;

// Platforms
const PlatformsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const PlatformCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 12px;
`;

const PlatformIcon = styled.div`
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #3B82F6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
`;

const PlatformInfo = styled.div`
  min-width: 0;
`;

const PlatformName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  text-transform: capitalize;
`;

const PlatformHandle = styled.div`
  font-size: 13px;
  color: #6B7280;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlatformFollowers = styled.div`
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 2px;
`;

// Collaborations
const CollabsGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const CollabCard = styled.div`
  padding: 16px;
  background: #F9FAFB;
  border-radius: 12px;
`;

const CollabBrand = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
`;

const CollabType = styled.div`
  display: inline-block;
  font-size: 12px;
  color: #6B7280;
  background: #E5E7EB;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 4px;
  text-transform: capitalize;
`;

const CollabDesc = styled.div`
  font-size: 14px;
  color: #6B7280;
  margin-top: 8px;
`;

const CollabLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #3B82F6;
  text-decoration: none;
  margin-top: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

// Rates
const RatesGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const RateCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  background: linear-gradient(135deg, #F0FDF4, #ECFDF5);
  border-radius: 12px;
  border: 1px solid #D1FAE5;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const RateName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
`;

const RatePrice = styled.div`
  font-size: 20px;
  font-weight: 800;
  color: #059669;
  flex-shrink: 0;
`;

const RateDeliverables = styled.div`
  font-size: 13px;
  color: #6B7280;
  margin-top: 4px;
`;

// CTA Section
const CTASection = styled.div`
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    padding: 24px;
  }
`;

const CTATitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
`;

const CTAText = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 20px 0;
`;

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: white;
  color: #3B82F6;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

// Footer
const Footer = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const FooterText = styled.span`
  font-size: 13px;
  color: #9CA3AF;
`;

const FooterLogo = styled(Link)`
  font-size: 14px;
  font-weight: 700;
  color: #3B82F6;
  text-decoration: none;
  margin-left: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

export default MediaKitClient;
