import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { Spin, message } from 'antd';
import axios from 'axios';
import { ArrowLeft, Users, Mail, Music2, Target, Smartphone, Gift, Zap, Check } from 'lucide-react';
import { FiInstagram } from 'react-icons/fi';
import { UserContext } from '../contexts/UserContext';
import { getRuntimeApiUrl } from '../config/api';
import UpgradeModal from '../creator-portal/UpgradeModal';
import AIPitchModal from '../creator-portal/AIPitchModal';
import BrandLogo from '../components/BrandLogo';
import { formatFollowers } from '../utils/format';
import { resolveBrandStats } from '../utils/brandStats';

// Use shared API config with runtime detection
const getApiBase = () => {
  const base = getRuntimeApiUrl();
  return base.replace(/\/+$/, '');
};

const PublicBrandPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [pitchesSentThisMonth, setPitchesSentThisMonth] = useState(0);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [hasPitched, setHasPitched] = useState(false);
  const [relatedBrands, setRelatedBrands] = useState([]);

  const FREE_PITCH_LIMIT = 3;
  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
  const pitchesLeft = Math.max(0, FREE_PITCH_LIMIT - pitchesSentThisMonth);
  const atLimit = !isPro && pitchesLeft === 0;
  const isLocked = brand?.requires_pro && !isPro;

  useEffect(() => {
    fetchBrand();
  }, [slug]);

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
      checkIfPitched();
    }
  }, [user, slug]);

  const fetchBrand = async () => {
    try {
      const apiBase = getApiBase();
      const { data } = await axios.get(`${apiBase}/api/public/brands/${slug}`);

      // Normalize brand data
      const normalizedBrand = {
        ...data,
        brand_name: data.name || data.brand_name,
        domain: data.domain || extractDomain(data.website),
        is_accepting_pr: data.accepting_pr ?? data.is_accepting_pr ?? true,
        ...(() => {
          const s = resolveBrandStats({
            slug: data.slug,
            category: data.category,
            responseRate: data.stats?.responseRate ?? data.response_rate,
            avgResponseTime: data.stats?.avgResponseTime ?? data.avg_response_days,
            totalPitches: data.stats?.totalPitches,
            totalResponses: data.stats?.totalResponses,
          });
          return {
            response_rate: s.responseRate,
            avg_response_days: s.avgResponseTime,
            total_pitches: s.totalPitches,
            responses_received: s.totalResponses,
          };
        })(),
        niches: parseArray(data.niches),
        platforms: parseArray(data.platforms),
        is_verified: data.is_verified ?? true,
        is_free_to_apply: data.is_free_to_apply ?? true,
      };

      setBrand(normalizedBrand);

      // Fetch related brands
      if (normalizedBrand.category) {
        try {
          const { data: related } = await axios.get(
            `${apiBase}/api/public/brands?category=${normalizedBrand.category}&limit=6`
          );
          setRelatedBrands((related.brands || related || []).filter(b => b.slug !== slug).slice(0, 5));
        } catch (e) {
          console.warn('Could not fetch related brands');
        }
      }

    } catch (error) {
      console.error('Error fetching brand:', error);
      if (error.response?.status === 404) {
        message.error('Brand not found');
        navigate(user?.role === 'creator' ? '/creator/dashboard/pr-brands' : '/directory');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const apiBase = getApiBase();
      const { data } = await axios.get(`${apiBase}/api/subscription/status`, { withCredentials: true });
      setSubscriptionTier(data.tier || 'free');
      setPitchesSentThisMonth(data.pitches_sent_this_week || data.pitches_sent_this_month || 0);
    } catch (error) {
      console.warn('Could not fetch subscription status');
    }
  };

  const checkIfPitched = async () => {
    try {
      const apiBase = getApiBase();
      const { data } = await axios.get(`${apiBase}/api/pr-crm/pipeline`, { withCredentials: true });
      const pitched = (data.pipeline || data || []).find(p =>
        p.slug === slug && p.status === 'pitched'
      );
      setHasPitched(!!pitched);
    } catch (e) {
      // Pipeline endpoint may fail for non-creators
    }
  };

  const parseArray = (field) => {
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
      try { return JSON.parse(field); } catch { return []; }
    }
    return [];
  };

  const extractDomain = (url) => {
    if (!url) return null;
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch { return null; }
  };

  const handleContactClick = () => {
    if (!user) {
      sessionStorage.setItem('brandReferral', slug);
      sessionStorage.setItem('brandName', brand?.brand_name);
      navigate('/register/creator');
      return;
    }
    if (hasPitched) return;
    if (isLocked || atLimit) {
      setUpgradeModalVisible(true);
      return;
    }
    setShowPitchModal(true);
  };

  const handlePitchSent = () => {
    setPitchesSentThisMonth(prev => prev + 1);
    setHasPitched(true);
    setShowPitchModal(false);
    message.success('Pitch sent successfully!');
  };

  const handleSaveForLater = async () => {
    if (!user) {
      sessionStorage.setItem('brandReferral', slug);
      navigate('/register/creator');
      return;
    }
    setSaving(true);
    try {
      const apiBase = getApiBase();
      await axios.post(
        `${apiBase}/api/pr-crm/pipeline/save`,
        { brand_id: brand.id, slug: slug },
        { withCredentials: true }
      );
      setSaved(true);
      message.success(`${brand.brand_name} saved to your pipeline!`);
    } catch (error) {
      message.error('Failed to save brand');
    } finally {
      setSaving(false);
    }
  };

  // CTA Render Logic
  const renderCta = () => {
    if (!user) {
      return (
        <>
          <CtaBtn onClick={handleContactClick}>
            <Zap size={16} /> Sign up to Contact {brand.brand_name}
          </CtaBtn>
          <CtaHint>Already a member? <Link to="/login">Sign in</Link> · Free to start</CtaHint>
        </>
      );
    }

    if (hasPitched) {
      return (
        <>
          <CtaBtnContacted disabled>
            <Check size={16} /> Pitch Sent — Awaiting Reply
          </CtaBtnContacted>
          <CtaHint>Response rate: {brand.response_rate}% · Check your pipeline</CtaHint>
        </>
      );
    }

    if (isLocked || atLimit) {
      return (
        <>
          <CtaBtn onClick={handleContactClick}>
            <Zap size={16} /> Upgrade to Contact {brand.brand_name}
          </CtaBtn>
          <CtaHint>
            {atLimit
              ? 'Monthly limit reached · Upgrade for unlimited contacts'
              : 'This brand is only accessible on Pro'}
          </CtaHint>
        </>
      );
    }

    return (
      <>
        <CtaBtnContact onClick={handleContactClick}>
          <Mail size={16} /> Contact {brand.brand_name}
        </CtaBtnContact>
        <CtaHint>
          {isPro
            ? 'Unlimited contacts included in your Pro plan'
            : `${pitchesLeft} free contact${pitchesLeft !== 1 ? 's' : ''} remaining this month`}
        </CtaHint>
      </>
    );
  };

  if (loading) {
    return (
      <PageWrap>
        <PageInner style={{ textAlign: 'center', paddingTop: 100 }}>
          <Spin size="large" />
        </PageInner>
      </PageWrap>
    );
  }

  if (!brand) {
    return (
      <PageWrap>
        <PageInner style={{ textAlign: 'center', paddingTop: 100 }}>
          <div>Brand not found.</div>
        </PageInner>
      </PageWrap>
    );
  }

  return (
    <>
      <Helmet>
        <title>{brand.brand_name} PR Collaboration | NewCollab</title>
        <meta name="description" content={`Apply for ${brand.brand_name} PR packages and collaborations. ${brand.description?.slice(0, 120)}`} />
        <link rel="canonical" href={`https://newcollab.co/brand/${slug}`} />
      </Helmet>

      <PageWrap>
        <PageInner>
          {/* Back link */}
          <BackLink onClick={() => navigate(user?.role === 'creator' ? '/creator/dashboard/pr-brands' : '/directory')}>
            <ArrowLeft size={14} /> Back to Directory
          </BackLink>

          {/* Hero lifestyle image */}
          {brand.coverImage && (
            <HeroSection>
              <HeroImage
                src={brand.coverImage}
                alt={`${brand.brand_name} lifestyle`}
                loading="lazy"
              />
              <HeroGradient />
              <HeroLogoOverlay>
                <BrandLogo brand={brand} />
              </HeroLogoOverlay>
            </HeroSection>
          )}

          {/* Brand header */}
          <BrandHeader>
            <BrandLogoBox>
              <BrandLogo brand={brand} />
            </BrandLogoBox>
            <BrandHeaderInfo>
              <BrandName>{brand.brand_name}</BrandName>
              <BrandMeta>
                {brand.isFeatured && <FeaturedBadge>Featured</FeaturedBadge>}
                {brand.category && <CategoryBadge>{brand.category.replace('_', ' ')}</CategoryBadge>}
                {brand.website && (
                  <WebsiteLink href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`} target="_blank" rel="noopener noreferrer">
                    {brand.domain || 'Visit Website'} →
                  </WebsiteLink>
                )}
              </BrandMeta>
            </BrandHeaderInfo>
            <BrandHeaderRight>
              <PRStatusPill $open={brand.is_accepting_pr}>
                <StatusDot $open={brand.is_accepting_pr} />
                {brand.is_accepting_pr ? 'Accepting PR' : 'Not Accepting PR'}
              </PRStatusPill>
            </BrandHeaderRight>
          </BrandHeader>

          <PageGrid>
            {/* MAIN COLUMN */}
            <MainCol>
              {/* Social proof */}
              {brand.total_pitches > 0 && (
                <SocialProof>
                  <SocialProofIcon><Users size={16} /></SocialProofIcon>
                  <SocialProofText>
                    <strong>{brand.total_pitches} creator{brand.total_pitches !== 1 ? 's' : ''}</strong> have contacted this brand
                    {brand.responses_received > 0 && (
                      <> · <span className="green">{brand.responses_received} got a response</span></>
                    )}
                  </SocialProofText>
                </SocialProof>
              )}

              {/* About */}
              {brand.description && (
                <Card>
                  <CardTitle>About {brand.brand_name}</CardTitle>
                  <p style={{ fontSize: 14, color: '#4B4B4B', lineHeight: 1.7, margin: 0 }}>
                    {brand.description}
                  </p>
                </Card>
              )}

              {/* Stats */}
              <Card>
                <CardTitle>Brand Stats</CardTitle>
                <StatsGrid>
                  <StatCard>
                    <StatValue $green>{brand.response_rate}%</StatValue>
                    <StatLabel>Response Rate</StatLabel>
                    <StatSub>
                      {brand.response_rate >= 40 ? 'Above average' : 'Industry average'}
                    </StatSub>
                  </StatCard>
                  <StatCard>
                    <StatValue>~{brand.avg_response_days}d</StatValue>
                    <StatLabel>Avg. Response</StatLabel>
                    <StatSub>When they reply</StatSub>
                  </StatCard>
                </StatsGrid>
              </Card>

              {/* What they're looking for */}
              {(brand.min_followers || brand.niches?.length > 0 || brand.platforms?.length > 0 || brand.collab_type || brand.product_types) && (
                <Card>
                  <CardTitle>What They're Looking For</CardTitle>
                  <RequirementsList>
                    {brand.min_followers && (
                      <RequirementRow>
                        <ReqIcon><Users size={15} /></ReqIcon>
                        <div>
                          <ReqLabel>Minimum Followers</ReqLabel>
                          <ReqValue>
                            {brand.min_followers >= 1000
                              ? `${(brand.min_followers / 1000).toFixed(0)}K+`
                              : brand.min_followers}+ followers on any platform
                          </ReqValue>
                        </div>
                      </RequirementRow>
                    )}
                    {brand.niches?.length > 0 && (
                      <RequirementRow>
                        <ReqIcon><Target size={15} /></ReqIcon>
                        <div>
                          <ReqLabel>Niche</ReqLabel>
                          <ReqValue>{brand.niches.join(', ')}</ReqValue>
                        </div>
                      </RequirementRow>
                    )}
                    {brand.platforms?.length > 0 && (
                      <RequirementRow>
                        <ReqIcon><Smartphone size={15} /></ReqIcon>
                        <div>
                          <ReqLabel>Preferred Platforms</ReqLabel>
                          <ReqValue>{brand.platforms.join(', ')}</ReqValue>
                        </div>
                      </RequirementRow>
                    )}
                    {(brand.collab_type || brand.product_types) && (
                      <RequirementRow>
                        <ReqIcon><Gift size={15} /></ReqIcon>
                        <div>
                          <ReqLabel>Collaboration Type</ReqLabel>
                          <ReqValue>{brand.collab_type || brand.product_types}</ReqValue>
                        </div>
                      </RequirementRow>
                    )}
                  </RequirementsList>
                </Card>
              )}

              {/* Social media */}
              {(brand.instagram || brand.tiktok) && (
                <Card>
                  <CardTitle>Social Media</CardTitle>
                  <SocialList>
                    {brand.instagram && (
                      <SocialRow>
                        <SocialIconBox><FiInstagram size={14} /></SocialIconBox>
                        <SocialHandle>@{brand.instagram.replace('@', '')}</SocialHandle>
                        {brand.instagram_followers && (
                          <SocialFollowers>
                            {formatFollowers(brand.instagram_followers)} followers
                          </SocialFollowers>
                        )}
                      </SocialRow>
                    )}
                    {brand.tiktok && (
                      <SocialRow>
                        <SocialIconBox><Music2 size={14} /></SocialIconBox>
                        <SocialHandle>@{brand.tiktok.replace('@', '')}</SocialHandle>
                        {brand.tiktok_followers && (
                          <SocialFollowers>
                            {formatFollowers(brand.tiktok_followers)} followers
                          </SocialFollowers>
                        )}
                      </SocialRow>
                    )}
                  </SocialList>
                </Card>
              )}

            </MainCol>

            {/* SIDEBAR */}
            <Sidebar>
              {/* CTA card */}
              <CtaCard>
                <CtaTop>
                  <CtaBrandRow>
                    <CtaBrandLogo>
                      <BrandLogo brand={brand} small />
                    </CtaBrandLogo>
                    <div>
                      <CtaBrandName>Contact {brand.brand_name}</CtaBrandName>
                      <CtaBrandSub>Direct PR team access</CtaBrandSub>
                    </div>
                  </CtaBrandRow>

                  {/* Email teaser */}
                  <EmailTeaser>
                    <EmailTeaserIcon><Mail size={15} /></EmailTeaserIcon>
                    <EmailTextWrap>
                      <EmailLabel>PR Contact Email</EmailLabel>
                      <EmailBlurred>{brand.gated?.maskedEmail || 'pr@brandname.com'}</EmailBlurred>
                    </EmailTextWrap>
                    {!hasPitched && <EmailUnlockBadge>Unlock</EmailUnlockBadge>}
                  </EmailTeaser>

                  {/* Quick stats */}
                  <QuickStats>
                    <QuickStat>
                      <QuickStatVal $green>{brand.response_rate}%</QuickStatVal>
                      <QuickStatLbl>Response rate</QuickStatLbl>
                    </QuickStat>
                    <QuickStat>
                      <QuickStatVal>~{brand.avg_response_days}d</QuickStatVal>
                      <QuickStatLbl>Avg. reply time</QuickStatLbl>
                    </QuickStat>
                  </QuickStats>

                  {/* CTA button */}
                  {renderCta()}

                  {/* Save for later */}
                  {user && !hasPitched && (
                    <SaveButton onClick={handleSaveForLater} disabled={saving || saved}>
                      {saved ? '✓ Saved to Pipeline' : '🔖 Save for Later'}
                    </SaveButton>
                  )}
                </CtaTop>

                <CtaDivider />

                <CtaBottom>
                  <ValueProps>
                    <ValueProp>
                      <VPIcon><Check size={12} /></VPIcon>
                      <div>
                        <VPTitle>Direct PR team contact</VPTitle>
                        <VPSub>Not a generic form — real email access</VPSub>
                      </div>
                    </ValueProp>
                    <ValueProp>
                      <VPIcon><Check size={12} /></VPIcon>
                      <div>
                        <VPTitle>AI-generated pitch email</VPTitle>
                        <VPSub>Personalised to your profile in seconds</VPSub>
                      </div>
                    </ValueProp>
                    <ValueProp>
                      <VPIcon><Check size={12} /></VPIcon>
                      <div>
                        <VPTitle>Track your outreach</VPTitle>
                        <VPSub>See opens, replies and follow-ups</VPSub>
                      </div>
                    </ValueProp>
                  </ValueProps>
                </CtaBottom>
              </CtaCard>

              {/* Trust badges */}
              <TrustCard>
                <TrustList>
                  {brand.is_verified && (
                    <TrustRow><TrustCheck><Check size={11} /></TrustCheck> Verified Brand</TrustRow>
                  )}
                  {brand.is_accepting_pr && (
                    <TrustRow><TrustCheck><Check size={11} /></TrustCheck> Actively Reviewing Applications</TrustRow>
                  )}
                  {brand.is_free_to_apply && (
                    <TrustRow><TrustCheck><Check size={11} /></TrustCheck> Free to Apply</TrustRow>
                  )}
                  <TrustRow><TrustCheck><Check size={11} /></TrustCheck> Open to Nano & Micro Creators</TrustRow>
                </TrustList>
              </TrustCard>
            </Sidebar>
          </PageGrid>

          {/* More brands in category */}
          {relatedBrands?.length > 0 && (
            <MoreBrands>
              <MoreBrandsTitle>More Brands in {brand.category?.replace('_', ' ')}</MoreBrandsTitle>
              <MoreBrandsSub>Discover more brands open to creator collaborations</MoreBrandsSub>
              <BrandChips>
                {relatedBrands.map(b => (
                  <BrandChip key={b.id} href={user?.role === 'creator' ? `/creator/dashboard/brand/${b.slug}` : `/brand/${b.slug}`}>
                    <LiveDot />
                    {b.name || b.brand_name}
                  </BrandChip>
                ))}
              </BrandChips>
              <BrowseLink href={user?.role === 'creator' ? `/creator/dashboard/pr-brands?category=${brand.category}` : `/directory?category=${brand.category}`}>
                Browse all {brand.category?.replace('_', ' ')} brands →
              </BrowseLink>
            </MoreBrands>
          )}
        </PageInner>
      </PageWrap>

      {/* AI Pitch Modal */}
      {showPitchModal && brand && (
        <AIPitchModal
          isOpen={showPitchModal}
          onClose={() => setShowPitchModal(false)}
          brand={{
            ...brand,
            brand_id: brand.id,
            brand_name: brand.brand_name || brand.name,
            logo_url: brand.logo,
            slug: slug
          }}
          onPitchSent={handlePitchSent}
        />
      )}

      {/* Upgrade Modal */}
      {upgradeModalVisible && (
        <UpgradeModal
          isOpen={upgradeModalVisible}
          onClose={() => setUpgradeModalVisible(false)}
          currentCount={pitchesSentThisMonth}
          limit={FREE_PITCH_LIMIT}
          feature="brand contacts"
        />
      )}
    </>
  );
};

// ── STYLED COMPONENTS ───────────────────────────────────────────────

const PageWrap = styled.div`
  background: #F5F5F7;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
`;

const PageInner = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  padding: 28px 24px 80px;

  @media (max-width: 640px) { padding: 20px 16px 80px; }
`;

const BackLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #8C8C8C;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  margin-bottom: 20px;
  cursor: pointer;
  transition: color 0.15s;
  &:hover { color: #0F0F0F; }
`;

const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 20px;

  @media (max-width: 640px) {
    height: 200px;
    border-radius: 16px;
  }
`;

const HeroImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const HeroGradient = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%);
  pointer-events: none;
`;

const HeroLogoOverlay = styled.div`
  position: absolute;
  bottom: 20px;
  left: 24px;
  width: 72px;
  height: 72px;
  background: white;
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: grid;
  place-items: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 640px) {
    width: 56px;
    height: 56px;
    bottom: 16px;
    left: 16px;
    padding: 8px;
  }
`;

const BrandHeader = styled.div`
  background: #FFFFFF;
  border: 1px solid #E8E8E8;
  border-radius: 20px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(15,15,15,0.05), 0 1px 8px rgba(15,15,15,0.04);

  @media (max-width: 640px) {
    flex-wrap: wrap;
    padding: 18px;
    gap: 14px;
  }
`;

const BrandLogoBox = styled.div`
  width: 80px;
  height: 80px;
  background: #F4F4F4;
  border: 1px solid #E8E8E8;
  border-radius: 16px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  padding: 10px;

  @media (max-width: 640px) { width: 60px; height: 60px; border-radius: 12px; }
`;

const BrandHeaderInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const BrandName = styled.h1`
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 10px 0;
  color: #0F0F0F;

  @media (max-width: 640px) { font-size: 22px; }
`;

const BrandMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
`;

const FeaturedBadge = styled(Badge)`
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #78350F;
  box-shadow: 0 2px 6px rgba(251,191,36,0.25);
`;

const CategoryBadge = styled(Badge)`
  background: #F4F4F4;
  color: #4B4B4B;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  font-size: 11px;
`;

const WebsiteLink = styled.a`
  color: #8C8C8C;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.15s;
  &:hover { color: #0F0F0F; }
`;

const BrandHeaderRight = styled.div`
  flex-shrink: 0;
  @media (max-width: 640px) { width: 100%; }
`;

const PRStatusPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  background: ${p => p.$open ? '#ECFDF5' : '#FEF2F2'};
  color: ${p => p.$open ? '#059669' : '#DC2626'};
  border: 1px solid ${p => p.$open ? '#A7F3D0' : '#FECACA'};
`;

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  animation: ${p => p.$open ? 'pulse 2s infinite' : 'none'};

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
`;

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  align-items: start;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const MainCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 20px;

  @media (max-width: 860px) {
    position: static;
    order: -1;
  }
`;

const Card = styled.div`
  background: #FFFFFF;
  border: 1px solid #E8E8E8;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(15,15,15,0.05), 0 1px 8px rgba(15,15,15,0.04);
`;

const CardTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.2px;
  color: #0F0F0F;
`;

const SocialProof = styled.div`
  background: #FFFFFF;
  border: 1px solid #E8E8E8;
  border-radius: 14px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(15,15,15,0.05);
`;

const SocialProofIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #059669;
`;

const SocialProofText = styled.div`
  font-size: 13px;
  color: #4B4B4B;
  strong { color: #0F0F0F; font-weight: 700; }
  .green { color: #059669; font-weight: 700; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const StatCard = styled.div`
  background: #F4F4F4;
  border-radius: 14px;
  padding: 18px 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 4px;
  color: ${p => p.$green ? '#059669' : '#0F0F0F'};
`;

const StatLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #8C8C8C;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`;

const StatSub = styled.div`
  font-size: 11px;
  color: #8C8C8C;
  margin-top: 3px;
`;

const RequirementsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RequirementRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const ReqIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #F4F4F4;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  margin-top: 1px;
  color: #4B4B4B;
`;

const ReqLabel = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #0F0F0F;
`;

const ReqValue = styled.div`
  font-size: 12.5px;
  color: #8C8C8C;
  margin-top: 2px;
`;

const SocialList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SocialRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #F4F4F4;
  border-radius: 10px;
`;

const SocialIconBox = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: white;
  border: 1px solid #E8E8E8;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #4B4B4B;
`;

const SocialHandle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #0F0F0F;
  flex: 1;
`;

const SocialFollowers = styled.span`
  font-size: 12px;
  color: #8C8C8C;
`;

// CTA Card
const CtaCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E8E8E8;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04);
`;

const CtaTop = styled.div`
  padding: 22px 22px 0;
`;

const CtaBrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const CtaBrandLogo = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #F4F4F4;
  border: 1px solid #E8E8E8;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 5px;
  flex-shrink: 0;
`;

const CtaBrandName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #0F0F0F;
`;

const CtaBrandSub = styled.div`
  font-size: 12px;
  color: #8C8C8C;
  margin-top: 2px;
`;

const EmailTeaser = styled.div`
  background: #F4F4F4;
  border: 1px solid #E8E8E8;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const EmailTeaserIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: white;
  border: 1px solid #E8E8E8;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  color: #4B4B4B;
`;

const EmailTextWrap = styled.div`
  flex: 1;
  overflow: hidden;
`;

const EmailLabel = styled.div`
  font-size: 10px;
  color: #8C8C8C;
  margin-bottom: 3px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const EmailBlurred = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  color: #0F0F0F;
  filter: blur(4px);
  user-select: none;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
`;

const EmailUnlockBadge = styled.span`
  background: #FFF1F3;
  color: #E11D48;
  border: 1px solid #FECDD3;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 100px;
  flex-shrink: 0;
  white-space: nowrap;
`;

const QuickStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
`;

const QuickStat = styled.div`
  background: #F4F4F4;
  border-radius: 10px;
  padding: 10px 12px;
  text-align: center;
`;

const QuickStatVal = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: ${p => p.$green ? '#059669' : '#0F0F0F'};
`;

const QuickStatLbl = styled.div`
  font-size: 10.5px;
  color: #8C8C8C;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 600;
`;

const CtaBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #E11D48, #7C3AED);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(225,29,72,0.25);
  margin-bottom: 14px;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(225,29,72,0.35);
  }
`;

const CtaBtnContacted = styled(CtaBtn)`
  background: #ECFDF5;
  color: #059669;
  border: 1px solid #A7F3D0;
  box-shadow: none;
  cursor: default;
  &:hover { transform: none; box-shadow: none; }
`;

const CtaBtnContact = styled(CtaBtn)`
  background: #0F0F0F;
  box-shadow: none;
  &:hover { background: #1C1C1C; box-shadow: none; }
`;

const CtaHint = styled.div`
  text-align: center;
  font-size: 11.5px;
  color: #8C8C8C;
  margin-bottom: 20px;
  a { color: #E11D48; font-weight: 600; text-decoration: none; }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 12px;
  background: ${p => p.disabled ? '#ECFDF5' : 'transparent'};
  color: ${p => p.disabled ? '#059669' : '#4B4B4B'};
  border: 1px solid ${p => p.disabled ? '#A7F3D0' : '#E8E8E8'};
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: ${p => p.disabled ? 'default' : 'pointer'};
  font-family: inherit;
  transition: all 0.15s;
  margin-bottom: 16px;

  &:hover:not(:disabled) {
    background: #F4F4F4;
    border-color: #D4D4D4;
  }
`;

const CtaDivider = styled.hr`
  border: none;
  border-top: 1px solid #E8E8E8;
  margin: 0 -22px 18px;
`;

const CtaBottom = styled.div`
  padding: 0 22px 22px;
`;

const ValueProps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ValueProp = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
`;

const VPIcon = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  color: #059669;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const VPTitle = styled.div`
  font-size: 12.5px;
  font-weight: 700;
  color: #0F0F0F;
`;

const VPSub = styled.div`
  font-size: 11.5px;
  color: #8C8C8C;
  margin-top: 2px;
`;

const TrustCard = styled.div`
  background: #FFFFFF;
  border: 1px solid #E8E8E8;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 1px 3px rgba(15,15,15,0.05);
`;

const TrustList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TrustRow = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 500;
  color: #4B4B4B;
`;

const TrustCheck = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  color: #059669;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;

const MoreBrands = styled.div`
  background: #FFFFFF;
  border: 1px solid #E8E8E8;
  border-radius: 20px;
  padding: 32px 28px;
  text-align: center;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(15,15,15,0.05);
`;

const MoreBrandsTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 6px 0;
  letter-spacing: -0.3px;
  color: #0F0F0F;
`;

const MoreBrandsSub = styled.p`
  font-size: 13px;
  color: #8C8C8C;
  margin: 0 0 20px 0;
`;

const BrandChips = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const BrandChip = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 14px;
  background: #F4F4F4;
  border: 1px solid #E8E8E8;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: #0F0F0F;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { background: white; border-color: #D4D4D4; }
`;

const LiveDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #059669;
  flex-shrink: 0;
`;

const BrowseLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #E11D48;
  font-size: 13.5px;
  font-weight: 700;
  text-decoration: none;
  &:hover { color: #BE123C; }
`;

export default PublicBrandPage;
