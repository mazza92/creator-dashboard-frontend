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
              <Button type="link">Upgrade to Pro ($12/mo) →</Button>
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
        <title>{brand.seo?.title || `${brand.name} PR List Application | NewCollab`}</title>
        <meta name="description" content={brand.seo?.description || `Apply for ${brand.name} PR packages and collaborations.`} />
        <meta name="keywords" content={brand.seo?.keywords || `${brand.name}, PR, influencer, collaboration`} />

        {/* Open Graph */}
        <meta property="og:title" content={brand.seo?.ogTitle || brand.seo?.title || `${brand.name} PR List`} />
        <meta property="og:description" content={brand.seo?.ogDescription || brand.seo?.description || `Apply for ${brand.name} PR packages`} />
        <meta property="og:image" content={brand.seo?.ogImage || brand.logo || 'https://newcollab.co/og-default.png'} />
        <meta property="og:url" content={`https://newcollab.co/brand/${slug}`} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={brand.seo?.ogTitle || brand.seo?.title || `${brand.name} PR List`} />
        <meta name="twitter:description" content={brand.seo?.ogDescription || brand.seo?.description} />
        <meta name="twitter:image" content={brand.seo?.ogImage || brand.logo} />

        <link rel="canonical" content={brand.seo?.canonical || `https://newcollab.co/brand/${slug}`} />

        {/* JobPosting structured data for SEO/GEO */}
        {brand.structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(brand.structuredData)}
          </script>
        )}

        {/* FAQ structured data for GEO */}
        {brand.faqs && brand.faqs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": brand.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>
        )}
      </Helmet>

      <Container>
        <Breadcrumb>
          <Link to="/directory">← Back to Directory</Link>
        </Breadcrumb>

        <Header>
          <BrandLogo>
            {brand.logo ? (
              <img
                src={brand.logo}
                alt={brand.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: 700; color: #667eea; background: linear-gradient(135deg, #667eea22, #764ba222); border-radius: 16px;">${brand.name.charAt(0)}</div>`;
                }}
              />
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
            {/* Direct Answer Box for AI/SEO */}
            <DirectAnswerBox>
              <DirectAnswerTitle>Is {brand.name} accepting PR?</DirectAnswerTitle>
              <DirectAnswerContent>
                <StatusBadge accepting={brand.accepting_pr !== false}>
                  {brand.accepting_pr !== false ? '✅ Open' : '⏸️ Paused'}
                </StatusBadge>
                <p>
                  <strong>Yes</strong>, {brand.name} is {brand.accepting_pr !== false ? 'currently' : 'periodically'} accepting applications from creators
                  {brand.min_followers && brand.min_followers > 0 && ` with ${brand.min_followers >= 1000 ? `${(brand.min_followers / 1000).toFixed(0)}K+` : brand.min_followers} followers`}.
                  {brand.product_types && ` They typically send ${brand.product_types} packages.`}
                </p>
                {brand.application_url && (
                  <DirectLink>
                    <strong>Direct Link:</strong>{' '}
                    {unlockedData ? (
                      <a href={brand.application_url} target="_blank" rel="noopener noreferrer">
                        Open Application Form →
                      </a>
                    ) : (
                      <Button size="small" onClick={handleUnlock}>
                        Unlock Application
                      </Button>
                    )}
                  </DirectLink>
                )}
              </DirectAnswerContent>
            </DirectAnswerBox>

            {brand.description && (
              <Section>
                <SectionTitle>About {brand.name}</SectionTitle>
                <Description>{brand.description}</Description>
              </Section>
            )}

            <Section>
              <SectionTitle>Qualification Requirements</SectionTitle>
              <RequirementsGrid>
                {brand.requirements.minFollowers !== null && brand.requirements.minFollowers !== undefined && brand.requirements.minFollowers > 0 && (
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

                {(brand.requirements.minFollowers === null || brand.requirements.minFollowers === undefined || brand.requirements.minFollowers === 0) &&
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

              <RequirementsExplanation>
                <h4>Can I get {brand.name} PR with less followers?</h4>
                {brand.requirements.minFollowers && brand.requirements.minFollowers > 0 ? (
                  <p>
                    {brand.name} requires a minimum of {brand.requirements.minFollowers >= 1000
                      ? `${(brand.requirements.minFollowers / 1000).toFixed(0)}K`
                      : brand.requirements.minFollowers} followers to qualify for their PR list.
                    {brand.requirements.minFollowers <= 5000 && (
                      <> This is considered <strong>micro-influencer friendly</strong>, making it accessible to smaller creators.</>
                    )}
                    {brand.requirements.minFollowers > 5000 && brand.requirements.minFollowers <= 25000 && (
                      <> This requirement targets <strong>mid-tier influencers</strong> with established audiences.</>
                    )}
                  </p>
                ) : (
                  <p>
                    Great news! {brand.name} does not have a strict follower minimum listed, making them accessible to
                    <strong> micro-influencers and creators with smaller audiences</strong>. They evaluate applications based on
                    content quality, engagement, and niche relevance rather than follower count alone.
                  </p>
                )}

                <h4>How to meet {brand.name} PR list requirements</h4>
                <ul>
                  {brand.requirements.minFollowers && brand.requirements.minFollowers > 0 && (
                    <li>
                      <strong>Follower Count:</strong> You need at least {brand.requirements.minFollowers >= 1000
                        ? `${(brand.requirements.minFollowers / 1000).toFixed(0)}K`
                        : brand.requirements.minFollowers} followers on your primary platform
                    </li>
                  )}
                  {brand.requirements.platforms && brand.requirements.platforms.length > 0 ? (
                    <li>
                      <strong>Platform:</strong> {brand.name} accepts applications from {brand.requirements.platforms.join(', ')} creators
                    </li>
                  ) : (
                    <li>
                      <strong>Platform:</strong> Applications accepted from Instagram, TikTok, YouTube, and other major platforms
                    </li>
                  )}
                  {brand.niches && brand.niches.length > 0 && (
                    <li>
                      <strong>Niche:</strong> Your content should align with {brand.niches.join(', ')}
                    </li>
                  )}
                  {brand.requirements.regions && brand.requirements.regions.length > 0 && (
                    <li>
                      <strong>Location:</strong> {brand.name} ships to creators in {brand.requirements.regions.join(', ')}
                    </li>
                  )}
                  <li>
                    <strong>Engagement:</strong> Maintain authentic engagement with your audience (quality over quantity)
                  </li>
                  <li>
                    <strong>Content Quality:</strong> Showcase professional-looking content that aligns with {brand.name}'s brand aesthetic
                  </li>
                </ul>

                <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                  <strong>Pro tip:</strong> Even if you don't meet all requirements, consider applying anyway.
                  Many brands make exceptions for creators with high engagement rates or niche audiences that align
                  perfectly with their products.
                </p>
              </RequirementsExplanation>
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

        {/* FAQ Section for GEO */}
        {brand.faqs && brand.faqs.length > 0 && (
          <FAQSection>
            <FAQTitle>Frequently Asked Questions</FAQTitle>
            <FAQList>
              {brand.faqs.map((faq, index) => (
                <FAQItem key={index}>
                  <FAQQuestion>{faq.question}</FAQQuestion>
                  <FAQAnswer>{faq.answer}</FAQAnswer>
                </FAQItem>
              ))}
            </FAQList>
          </FAQSection>
        )}

        {/* Similar Brands for Entity Linking */}
        {brand.similarBrands && brand.similarBrands.length > 0 && (
          <SimilarBrandsSection>
            <SimilarBrandsTitle>Similar Brands Accepting PR</SimilarBrandsTitle>
            <SimilarBrandsGrid>
              {brand.similarBrands.map((similarBrand) => (
                <SimilarBrandCard
                  key={similarBrand.id}
                  to={`/brand/${similarBrand.slug}`}
                >
                  {similarBrand.logo ? (
                    <SimilarBrandLogo src={similarBrand.logo} alt={similarBrand.name} />
                  ) : (
                    <SimilarBrandPlaceholder>
                      {similarBrand.name.charAt(0)}
                    </SimilarBrandPlaceholder>
                  )}
                  <SimilarBrandName>{similarBrand.name}</SimilarBrandName>
                  {similarBrand.min_followers && similarBrand.min_followers > 0 && (
                    <SimilarBrandFollowers>
                      {similarBrand.min_followers >= 1000
                        ? `${(similarBrand.min_followers / 1000).toFixed(0)}K+ followers`
                        : `${similarBrand.min_followers}+ followers`}
                    </SimilarBrandFollowers>
                  )}
                </SimilarBrandCard>
              ))}
            </SimilarBrandsGrid>
            <SimilarBrandsFooter>
              <em>Similar to {brand.name} in accepting creator applications and partnership opportunities.</em>
            </SimilarBrandsFooter>
          </SimilarBrandsSection>
        )}

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

const RequirementsExplanation = styled.div`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #f0f0f0;

  h4 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
    margin-top: 24px;

    &:first-child {
      margin-top: 0;
    }
  }

  p {
    font-size: 15px;
    line-height: 1.7;
    color: #555;
    margin-bottom: 16px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 16px 0;

    li {
      padding: 12px 16px;
      background: #f9fafb;
      border-left: 3px solid #667eea;
      margin-bottom: 10px;
      font-size: 15px;
      line-height: 1.6;
      color: #555;

      strong {
        color: #333;
        display: inline-block;
        margin-right: 6px;
      }
    }
  }
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

// Direct Answer Box Styles
const DirectAnswerBox = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 32px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
`;

const DirectAnswerTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  color: white;
`;

const DirectAnswerContent = styled.div`
  font-size: 16px;
  line-height: 1.6;

  p {
    margin: 16px 0;
    color: rgba(255, 255, 255, 0.95);
  }

  strong {
    font-weight: 600;
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 8px 16px;
  background: ${props => props.accepting ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)'};
  border: 2px solid ${props => props.accepting ? '#4CAF50' : '#FF9800'};
  border-radius: 24px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
`;

const DirectLink = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);

  a {
    color: white;
    text-decoration: underline;
    font-weight: 600;

    &:hover {
      opacity: 0.8;
    }
  }

  button {
    background: white;
    color: #667eea;
    font-weight: 600;
    border: none;

    &:hover {
      background: rgba(255, 255, 255, 0.9);
    }
  }
`;

// FAQ Section Styles
const FAQSection = styled.div`
  max-width: 1200px;
  margin: 60px auto;
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const FAQTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 32px;
  text-align: center;
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FAQItem = styled.div`
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  border-left: 4px solid #667eea;
`;

const FAQQuestion = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
`;

const FAQAnswer = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #666;
  margin: 0;
`;

// Similar Brands Section Styles
const SimilarBrandsSection = styled.div`
  max-width: 1200px;
  margin: 60px auto;
  background: white;
  padding: 48px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
`;

const SimilarBrandsTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 32px;
  text-align: center;
`;

const SimilarBrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
`;

const SimilarBrandCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  background: #f9fafb;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
    border-color: #667eea;
  }
`;

const SimilarBrandLogo = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 12px;
  border-radius: 8px;
`;

const SimilarBrandPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  background: linear-gradient(135deg, #667eea22, #764ba222);
  border-radius: 8px;
  margin-bottom: 12px;
`;

const SimilarBrandName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 4px;
`;

const SimilarBrandFollowers = styled.div`
  font-size: 12px;
  color: #999;
  text-align: center;
`;

const SimilarBrandsFooter = styled.div`
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;

  em {
    color: #999;
    font-size: 14px;
  }
`;

export default PublicBrandPage;
