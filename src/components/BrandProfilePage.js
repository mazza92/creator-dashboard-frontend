import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { ArrowLeft, Users, Mail, Music2,
         MapPin, Target, Smartphone, Gift, Zap, Check } from 'lucide-react';
import { FiInstagram } from 'react-icons/fi';
import { UserContext } from '../contexts/UserContext';
import { getRuntimeApiUrl } from '../config/api';
import BrandLogo from './BrandLogo';
import { formatFollowers } from '../utils/format';
import { resolveBrandStats } from '../utils/brandStats';
import AIPitchModal from '../creator-portal/AIPitchModal';
import UpgradeModal from '../creator-portal/UpgradeModal';
import LoadingSpinner from './LoadingSpinner';

// Use shared API config
const getApiBase = () => {
  const base = getRuntimeApiUrl();
  return base.replace(/\/+$/, '');
};

// Avatar colors for activity
const AVATAR_COLORS = ['#E11D48','#7C3AED','#0F0F0F','#059669','#D97706'];
const avatarColor = (name) =>
  AVATAR_COLORS[name?.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];

const BrandProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);
  const [relatedBrands, setRelatedBrands] = useState([]);
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [pitchesSentThisMonth, setPitchesSentThisMonth] = useState(0);
  const [hasPitched, setHasPitched] = useState(false);
  const [pitchDate, setPitchDate] = useState(null);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const FREE_PITCH_LIMIT = 3;
  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
  const pitchesLeft = Math.max(0, FREE_PITCH_LIMIT - pitchesSentThisMonth);
  const atLimit = !isPro && pitchesLeft === 0;
  const isLocked = brand?.requires_pro && !isPro;

  useEffect(() => {
    fetchBrandProfile();
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
      checkIfPitched();
    }
  }, [user, id]);

  const fetchBrandProfile = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const apiBase = getApiBase();
      const { data } = await axios.get(`${apiBase}/brands/${id}`, { withCredentials: true });

      // Parse JSON fields if needed
      const parsedBrand = {
        ...data,
        niches: parseJsonField(data.niches),
        platforms: parseJsonField(data.platforms),
        category: Array.isArray(data.category) ? data.category[0] : data.category,
        brand_name: data.brand_name || data.name,
        domain: data.domain || extractDomain(data.website),
        is_accepting_pr: data.is_accepting_pr ?? data.accepting_pr ?? true,
        ...(() => {
          const s = resolveBrandStats({
            slug: data.slug || String(id),
            category: data.category,
            responseRate: data.response_rate ?? data.stats?.responseRate,
            avgResponseTime: data.avg_response_days ?? data.stats?.avgResponseTime,
            totalPitches: data.total_pitches ?? data.stats?.totalPitches,
            totalResponses: data.responses_received ?? data.stats?.totalResponses,
          });
          return {
            response_rate: s.responseRate,
            avg_response_days: s.avgResponseTime,
            total_pitches: s.totalPitches,
            responses_received: s.totalResponses,
          };
        })(),
      };

      setBrand(parsedBrand);

      // Fetch related brands
      try {
        const { data: related } = await axios.get(
          `${apiBase}/api/public/brands?category=${parsedBrand.category}&limit=5`,
          { withCredentials: true }
        );
        setRelatedBrands((related.brands || related || []).filter(b => b.id !== parsedBrand.id).slice(0, 5));
      } catch (e) {
        console.warn('Could not fetch related brands:', e);
      }

      // Fetch recent activity
      try {
        const { data: activity } = await axios.get(
          `${apiBase}/brands/${id}/recent-activity`,
          { withCredentials: true }
        );
        setRecentActivity(activity || []);
      } catch (e) {
        console.warn('Could not fetch recent activity:', e);
      }
    } catch (error) {
      console.error('Error fetching brand:', error);
      setBrand(null);
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
    } catch (e) {
      console.warn('Could not fetch subscription:', e);
    }
  };

  const checkIfPitched = async () => {
    try {
      const apiBase = getApiBase();
      const { data } = await axios.get(`${apiBase}/api/pr-crm/pipeline`, { withCredentials: true });
      const pitched = (data.pipeline || data || []).find(p =>
        (p.brand_id === parseInt(id) || p.brand_id === id) && p.status === 'pitched'
      );
      if (pitched) {
        setHasPitched(true);
        setPitchDate(pitched.pitched_at || pitched.created_at);
      }
    } catch (e) {
      console.warn('Could not check pitch status:', e);
    }
  };

  const parseJsonField = (field) => {
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
      sessionStorage.setItem('brandReferral', brand?.slug || id);
      navigate('/signup');
      return;
    }
    if (hasPitched) return;
    if (isLocked || atLimit) {
      setShowUpgradeModal(true);
      return;
    }
    setShowPitchModal(true);
  };

  const handlePitchSent = (method) => {
    setPitchesSentThisMonth(prev => prev + 1);
    setHasPitched(true);
    setPitchDate(new Date().toISOString());
    setShowPitchModal(false);
    window.dispatchEvent(new CustomEvent('savedBrandCountChanged'));
    const brandId = brand?.id || id;
    const contactMethod = method || 'email';
    navigate(`/creator/dashboard/pr-pipeline?confirmBrand=${brandId}&method=${contactMethod}`);
  };

  // CTA Render Logic
  const renderCta = () => {
    // State A: Logged out
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

    // State D: Already pitched
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

    // State C: Free user at limit OR Pro-locked brand
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

    // State B (free under limit) or State E (pro user)
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
        <PageInner>
          <LoadingSpinner text="Loading brand..." minHeight="400px" />
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
    <PageWrap>
      <PageInner>
        {/* Back link */}
        <BackLink onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back to Directory
        </BackLink>

        {/* Brand header */}
        <BrandHeader>
          <BrandLogoBox>
            <BrandLogo brand={brand} />
          </BrandLogoBox>
          <BrandHeaderInfo>
            <BrandName>{brand.brand_name}</BrandName>
            <BrandMeta>
              {brand.is_featured && <FeaturedBadge>Featured</FeaturedBadge>}
              {brand.category && <CategoryBadge>{brand.category}</CategoryBadge>}
              {brand.website && (
                <WebsiteLink href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`} target="_blank" rel="noopener noreferrer">
                  {brand.domain || brand.website} →
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
                  <strong>{brand.total_pitches} creators</strong> have contacted this brand
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
            {(brand.min_followers || brand.niches?.length > 0 || brand.platforms?.length > 0 || brand.collab_type) && (
              <Card>
                <CardTitle>What They're Looking For</CardTitle>
                <RequirementsList>
                  {brand.min_followers && (
                    <RequirementRow>
                      <ReqIcon><Users size={15} /></ReqIcon>
                      <div>
                        <ReqLabel>Minimum Followers</ReqLabel>
                        <ReqValue>{brand.min_followers}+ followers on any platform</ReqValue>
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
                  {brand.collab_type && (
                    <RequirementRow>
                      <ReqIcon><Gift size={15} /></ReqIcon>
                      <div>
                        <ReqLabel>Collaboration Type</ReqLabel>
                        <ReqValue>{brand.collab_type}</ReqValue>
                      </div>
                    </RequirementRow>
                  )}
                </RequirementsList>
              </Card>
            )}

            {/* Social media */}
            {(brand.instagram_handle || brand.instagram || brand.tiktok_handle || brand.tiktok) && (
              <Card>
                <CardTitle>Social Media</CardTitle>
                <SocialList>
                  {(brand.instagram_handle || brand.instagram) && (
                    <SocialRow>
                      <SocialIcon><FiInstagram size={14} /></SocialIcon>
                      <SocialHandle>@{(brand.instagram_handle || brand.instagram).replace('@', '')}</SocialHandle>
                      {brand.instagram_followers && (
                        <SocialFollowers>
                          {formatFollowers(brand.instagram_followers)} followers
                        </SocialFollowers>
                      )}
                    </SocialRow>
                  )}
                  {(brand.tiktok_handle || brand.tiktok) && (
                    <SocialRow>
                      <SocialIcon><Music2 size={14} /></SocialIcon>
                      <SocialHandle>@{(brand.tiktok_handle || brand.tiktok).replace('@', '')}</SocialHandle>
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

            {/* Recent creator activity */}
            {recentActivity?.length > 0 && (
              <Card>
                <CardTitle>Recent Creator Activity</CardTitle>
                {recentActivity.map((item, i) => (
                  <ActivityRow key={i}>
                    <ActivityAvatar $color={avatarColor(item.username)}>
                      {item.username?.[0]?.toUpperCase() || 'C'}
                    </ActivityAvatar>
                    <ActivityText>
                      <strong>{item.username}</strong> sent a pitch ·{' '}
                      {item.got_response
                        ? <span className="got-response">Got a response</span>
                        : 'No response yet'}
                    </ActivityText>
                    <ActivityTime>{item.days_ago}d ago</ActivityTime>
                  </ActivityRow>
                ))}
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
                    <EmailBlurred>{brand.email_preview || 'pr@brandname.com'}</EmailBlurred>
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

                {/* CTA button — varies by state */}
                {renderCta()}
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
                {brand.is_free_to_apply !== false && (
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
            <MoreBrandsTitle>More Brands in {brand.category}</MoreBrandsTitle>
            <MoreBrandsSub>Discover more brands open to creator collaborations</MoreBrandsSub>
            <BrandChips>
              {relatedBrands.slice(0, 5).map(b => (
                <BrandChip key={b.id} href={`/brand/profile/${b.id}`}>
                  <LiveDot />
                  {b.brand_name || b.name}
                </BrandChip>
              ))}
            </BrandChips>
            <BrowseLink href={`/directory?category=${brand.category}`}>
              Browse all {brand.category} brands →
            </BrowseLink>
          </MoreBrands>
        )}
      </PageInner>

      {/* AI Pitch Modal */}
      {showPitchModal && brand && (
        <AIPitchModal
          isOpen={showPitchModal}
          onClose={() => setShowPitchModal(false)}
          brand={{
            ...brand,
            brand_id: brand.id,
            brand_name: brand.brand_name || brand.name,
            logo_url: brand.logo_url || brand.logo,
            slug: brand.slug || id
          }}
          onPitchSent={handlePitchSent}
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentCount={pitchesSentThisMonth}
          limit={FREE_PITCH_LIMIT}
          feature="brand contacts"
        />
      )}
    </PageWrap>
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
  top: 76px;

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

const SocialIcon = styled.div`
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

const ActivityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #F4F4F4;
  &:last-child { border-bottom: none; padding-bottom: 0; }
`;

const ActivityAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${p => p.$color || '#0F0F0F'};
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 11px;
  flex-shrink: 0;
`;

const ActivityText = styled.div`
  font-size: 12.5px;
  color: #4B4B4B;
  flex: 1;
  strong { color: #0F0F0F; font-weight: 600; }
  .got-response { color: #059669; font-weight: 600; }
`;

const ActivityTime = styled.div`
  font-size: 11px;
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

export default BrandProfilePage;
