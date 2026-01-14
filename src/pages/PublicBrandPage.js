import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Button, Spin, Tag, Modal, message } from 'antd';
import {
  CheckCircleOutlined,
  MailOutlined,
  LinkOutlined,
  LockOutlined,
  StarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

const PublicBrandPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedData, setUnlockedData] = useState(null);

  useEffect(() => {
    fetchBrand();
  }, [slug]);

  const fetchBrand = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/public/brands/${slug}`);
      setBrand(data);
    } catch (error) {
      console.error('Error fetching brand:', error);
      if (error.response?.status === 404) {
        message.error('Brand not found');
        navigate('/directory');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!user) {
      // Save referral for post-signup redirect
      sessionStorage.setItem('brandReferral', slug);
      sessionStorage.setItem('brandName', brand.name);
      navigate('/register/creator');
      return;
    }

    setUnlocking(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/public/brands/${slug}/unlock`,
        {},
        { withCredentials: true }
      );

      setUnlockedData(data);
      message.success('Access unlocked! Brand saved to your pipeline.');

      // If it's a direct link, open in new tab
      if (data.applicationUrl) {
        window.open(data.applicationUrl, '_blank');
      }
    } catch (error) {
      console.error('Error unlocking brand:', error);
      message.error('Failed to unlock access. Please try again.');
    } finally {
      setUnlocking(false);
    }
  };

  const renderCTA = () => {
    // Already unlocked
    if (unlockedData) {
      return (
        <UnlockedSection>
          <h3>✅ Access Granted</h3>

          {unlockedData.applicationUrl && (
            <AccessItem>
              <LinkOutlined /> Application Link
              <Button
                type="primary"
                href={unlockedData.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Application Form
              </Button>
            </AccessItem>
          )}

          {unlockedData.contactEmail && (
            <AccessItem>
              <MailOutlined /> PR Manager Email
              <Button
                type="primary"
                href={`mailto:${unlockedData.contactEmail}`}
              >
                {unlockedData.contactEmail}
              </Button>
              <ProBadge>PRO</ProBadge>
            </AccessItem>
          )}

          <Link to="/creator/dashboard/pr-pipeline">
            <Button type="link">View in Your Pipeline →</Button>
          </Link>
        </UnlockedSection>
      );
    }

    // User not logged in
    if (!user) {
      return (
        <CTABox>
          <LockIcon><LockOutlined /></LockIcon>
          <h3>Sign Up to Apply</h3>
          <p>Create a free account to unlock the application link</p>
          <Button
            type="primary"
            size="large"
            onClick={handleUnlock}
          >
            Create Free Account
          </Button>
          <FeatureList>
            <li>✓ Instant access to application link</li>
            <li>✓ Save to your brand pipeline</li>
            <li>✓ Track your applications</li>
          </FeatureList>
        </CTABox>
      );
    }

    // User logged in but hasn't unlocked
    const tier = user.subscription_tier || 'free';
    const isPro = tier === 'pro' || tier === 'elite';

    return (
      <CTABox>
        <h3>Unlock {brand.name} Contact</h3>

        <UnlockOptions>
          {brand.gated.hasDirectLink && (
            <UnlockOption>
              <LinkOutlined style={{ fontSize: 24 }} />
              <div>
                <strong>Application Link</strong>
                <span>Direct link to brand's application form</span>
              </div>
              <FreeBadge>FREE</FreeBadge>
            </UnlockOption>
          )}

          {brand.gated.hasEmailContact && (
            <UnlockOption disabled={!isPro}>
              <MailOutlined style={{ fontSize: 24 }} />
              <div>
                <strong>PR Manager Email</strong>
                <span>Pitch directly to the decision maker</span>
              </div>
              {isPro ? (
                <ProBadge>PRO</ProBadge>
              ) : (
                <LockedBadge><LockOutlined /> PRO</LockedBadge>
              )}
            </UnlockOption>
          )}
        </UnlockOptions>

        <Button
          type="primary"
          size="large"
          loading={unlocking}
          onClick={handleUnlock}
          block
        >
          {isPro ? 'Get Full Access' : 'Get Application Link'}
        </Button>

        {!isPro && brand.gated.hasEmailContact && (
          <UpgradePrompt>
            <p>Want the PR manager's email?</p>
            <Link to="/creator/dashboard/settings">
              <Button type="link">Upgrade to Pro ($10/mo) →</Button>
            </Link>
          </UpgradePrompt>
        )}
      </CTABox>
    );
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spin size="large" />
      </LoadingContainer>
    );
  }

  if (!brand) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{brand.seo.title}</title>
        <meta name="description" content={brand.seo.description} />
        <meta property="og:title" content={brand.seo.title} />
        <meta property="og:description" content={brand.seo.description} />
        {brand.logo && <meta property="og:image" content={brand.logo} />}
        <link rel="canonical" href={`https://newcollab.co/brand/${slug}`} />

        {/* Schema.org structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": brand.name,
            "url": brand.website,
            "logo": brand.logo,
            "description": brand.description,
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "PR Department",
              "url": `https://newcollab.co/brand/${slug}`
            }
          })}
        </script>
      </Helmet>

      <Container>
        <Breadcrumb>
          <Link to="/directory">← Back to Directory</Link>
        </Breadcrumb>

        <Header>
          <BrandLogo>
            {brand.logo ? (
              <img src={brand.logo} alt={brand.name} />
            ) : (
              <PlaceholderLogo>{brand.name.charAt(0)}</PlaceholderLogo>
            )}
          </BrandLogo>

          <BrandTitle>
            <h1>{brand.name}</h1>
            {brand.isFeatured && <StarBadge><StarOutlined /> Featured</StarBadge>}
            <CategoryTag>{brand.category?.replace('_', ' ')}</CategoryTag>

            {brand.website && (
              <WebsiteLink href={brand.website} target="_blank" rel="noopener noreferrer">
                Visit Website →
              </WebsiteLink>
            )}
          </BrandTitle>
        </Header>

        <Content>
          <MainColumn>
            {brand.description && (
              <Section>
                <SectionTitle>About {brand.name}</SectionTitle>
                <Description>{brand.description}</Description>
              </Section>
            )}

            <Section>
              <SectionTitle>Application Requirements</SectionTitle>
              <RequirementsGrid>
                {brand.requirements.minFollowers && brand.requirements.minFollowers > 0 && (
                  <Requirement>
                    <RequirementIcon>📊</RequirementIcon>
                    <div>
                      <RequirementLabel>Minimum Followers</RequirementLabel>
                      <RequirementValue>
                        {brand.requirements.minFollowers >= 1000
                          ? `${(brand.requirements.minFollowers / 1000).toFixed(0)}K+`
                          : brand.requirements.minFollowers}
                      </RequirementValue>
                    </div>
                  </Requirement>
                )}

                {brand.requirements.platforms && brand.requirements.platforms.length > 0 && (
                  <Requirement>
                    <RequirementIcon>📱</RequirementIcon>
                    <div>
                      <RequirementLabel>Platforms</RequirementLabel>
                      <RequirementValue>
                        {brand.requirements.platforms.join(', ')}
                      </RequirementValue>
                    </div>
                  </Requirement>
                )}

                {brand.niches && brand.niches.length > 0 && (
                  <Requirement>
                    <RequirementIcon>🎯</RequirementIcon>
                    <div>
                      <RequirementLabel>Niches</RequirementLabel>
                      <RequirementValue>
                        {brand.niches.join(', ')}
                      </RequirementValue>
                    </div>
                  </Requirement>
                )}

                {brand.requirements.regions && brand.requirements.regions.length > 0 && (
                  <Requirement>
                    <RequirementIcon>🌍</RequirementIcon>
                    <div>
                      <RequirementLabel>Regions</RequirementLabel>
                      <RequirementValue>
                        {brand.requirements.regions.join(', ')}
                      </RequirementValue>
                    </div>
                  </Requirement>
                )}

                {!brand.requirements.minFollowers &&
                 (!brand.requirements.platforms || brand.requirements.platforms.length === 0) &&
                 (!brand.niches || brand.niches.length === 0) &&
                 (!brand.requirements.regions || brand.requirements.regions.length === 0) && (
                  <Requirement>
                    <RequirementIcon>✨</RequirementIcon>
                    <div>
                      <RequirementLabel>Open to All Creators</RequirementLabel>
                      <RequirementValue>
                        No specific requirements listed - all creators welcome to apply!
                      </RequirementValue>
                    </div>
                  </Requirement>
                )}
              </RequirementsGrid>
            </Section>

            {brand.stats && (brand.stats.responseRate || brand.stats.avgResponseTime) && (
              <Section>
                <SectionTitle>Brand Stats</SectionTitle>
                <StatsGrid>
                  {brand.stats.responseRate && (
                    <StatCard>
                      <StatValue>{brand.stats.responseRate}%</StatValue>
                      <StatLabel>Response Rate</StatLabel>
                    </StatCard>
                  )}
                  {brand.stats.avgResponseTime && (
                    <StatCard>
                      <StatValue>~{brand.stats.avgResponseTime} days</StatValue>
                      <StatLabel>Avg Response Time</StatLabel>
                    </StatCard>
                  )}
                </StatsGrid>
              </Section>
            )}

            {(brand.instagram || brand.tiktok) && (
              <Section>
                <SectionTitle>Social Media</SectionTitle>
                <SocialLinks>
                  {brand.instagram && (
                    <SocialLink
                      href={`https://instagram.com/${brand.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📷 @{brand.instagram.replace('@', '')}
                    </SocialLink>
                  )}
                  {brand.tiktok && (
                    <SocialLink
                      href={`https://tiktok.com/@${brand.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🎵 @{brand.tiktok.replace('@', '')}
                    </SocialLink>
                  )}
                </SocialLinks>
              </Section>
            )}
          </MainColumn>

          <Sidebar>
            {renderCTA()}

            <TrustSignals>
              <TrustItem>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                Verified Brand
              </TrustItem>
              <TrustItem>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                Actively Reviewing Applications
              </TrustItem>
              <TrustItem>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                Free to Apply
              </TrustItem>
            </TrustSignals>
          </Sidebar>
        </Content>

        <RelatedSection>
          <h2>More Brands in {brand.category?.replace('_', ' ')}</h2>
          <Link to={`/directory?category=${brand.category}`}>
            <Button type="link">Browse All {brand.category?.replace('_', ' ')} Brands →</Button>
          </Link>
        </RelatedSection>
      </Container>
    </>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
`;

const Breadcrumb = styled.div`
  max-width: 1200px;
  margin: 0 auto 20px;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 40px;
  display: flex;
  align-items: center;
  gap: 30px;
  background: white;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const BrandLogo = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e5e5;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 8px;
  }
`;

const PlaceholderLogo = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  color: #667eea;
  background: linear-gradient(135deg, #667eea22, #764ba222);
`;

const BrandTitle = styled.div`
  flex: 1;

  h1 {
    font-size: 36px;
    margin-bottom: 12px;

    @media (max-width: 768px) {
      font-size: 28px;
    }
  }
`;

const StarBadge = styled.span`
  display: inline-block;
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-right: 12px;
`;

const CategoryTag = styled.span`
  display: inline-block;
  background: #667eea;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-right: 16px;
`;

const WebsiteLink = styled.a`
  display: inline-block;
  margin-top: 16px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-left: 8px;

  &:hover {
    text-decoration: underline;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.7;
  color: #444;
`;

const RequirementsGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const Requirement = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
`;

const RequirementIcon = styled.div`
  font-size: 28px;
`;

const RequirementLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const RequirementValue = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 12px;
  color: white;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  opacity: 0.9;
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SocialLink = styled.a`
  display: inline-block;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  color: #333;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: #667eea;
    color: white;
  }
`;

const CTABox = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
  position: sticky;
  top: 20px;

  h3 {
    font-size: 22px;
    margin-bottom: 12px;
  }

  p {
    color: #666;
    margin-bottom: 24px;
  }
`;

const LockIcon = styled.div`
  font-size: 48px;
  color: #667eea;
  margin-bottom: 16px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
  text-align: left;

  li {
    padding: 8px 0;
    color: #666;
    font-size: 14px;
  }
`;

const UnlockOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
`;

const UnlockOption = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: ${props => props.disabled ? '#f5f5f5' : '#f9fafb'};
  border: 2px solid ${props => props.disabled ? '#ddd' : '#667eea'};
  border-radius: 12px;
  text-align: left;
  opacity: ${props => props.disabled ? 0.6 : 1};

  div {
    flex: 1;

    strong {
      display: block;
      margin-bottom: 4px;
    }

    span {
      font-size: 13px;
      color: #666;
    }
  }
`;

const FreeBadge = styled.span`
  background: #52c41a;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
`;

const ProBadge = styled.span`
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #333;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
`;

const LockedBadge = styled.span`
  background: #ddd;
  color: #666;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
`;

const UpgradePrompt = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;

  p {
    font-size: 14px;
    margin-bottom: 8px;
  }
`;

const UnlockedSection = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  h3 {
    color: #52c41a;
    margin-bottom: 24px;
  }
`;

const AccessItem = styled.div`
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  button {
    margin-top: 8px;
  }
`;

const TrustSignals = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  font-size: 14px;
  color: #666;

  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

const RelatedSection = styled.div`
  max-width: 1200px;
  margin: 60px auto 0;
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);

  h2 {
    font-size: 24px;
    margin-bottom: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
`;

export default PublicBrandPage;
