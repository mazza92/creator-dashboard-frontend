import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mail, Heart, Check, Users, Sparkles, Lock, ChevronRight } from 'lucide-react';
import { message } from 'antd';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import UpgradeModal from '../creator-portal/UpgradeModal';
import AIPitchModal from '../creator-portal/AIPitchModal';
import { getCategoryColors } from '../utils/categoryColors';
import { categoryLabel, CANONICAL_CATEGORIES, CATEGORY_LABELS } from '../constants/brandCategories';
import LoadingSpinner from '../components/LoadingSpinner';
import { tokens } from '../theme/tokens';

const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};
const API_BASE = getApiBase();

const FREE_PITCH_LIMIT = 3;

// Use all canonical categories from database (excluding 'other')
const NICHE_OPTIONS = CANONICAL_CATEGORIES.filter(c => c !== 'other');

const ForYou = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pitchingBrand, setPitchingBrand] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const [pitchedIds, setPitchedIds] = useState(new Set());
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [pitchesSentThisMonth, setPitchesSentThisMonth] = useState(0);

  // Profile prompt state
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [followerCount, setFollowerCount] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
  const atLimit = !isPro && pitchesSentThisMonth >= FREE_PITCH_LIMIT;

  useEffect(() => {
    fetchData();
    fetchSubscriptionStatus();
    fetchSavedBrands();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/for-you`, {
        withCredentials: true
      });
      if (response.data.success) {
        setData(response.data);
        if (response.data.profile) {
          setSelectedNiches(response.data.profile.niches || []);
          setFollowerCount(response.data.profile.followers?.toString() || '');
        }
      }
    } catch (error) {
      console.error('Error fetching For You data:', error);
      message.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const subResponse = await axios.get(`${API_BASE}/api/subscription/status`, {
        withCredentials: true
      });
      setSubscriptionTier(subResponse.data.tier || 'free');

      const limitsResponse = await axios.get(`${API_BASE}/api/pr-crm/pitch-limits`, {
        withCredentials: true
      });
      if (limitsResponse.data.success) {
        setPitchesSentThisMonth(limitsResponse.data.used || 0);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchSavedBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/pipeline`, {
        withCredentials: true
      });
      if (response.data.success) {
        const saved = new Set(response.data.pipeline.map(item => item.brand_id));
        setSavedIds(saved);
        const pitched = new Set(
          response.data.pipeline
            .filter(item => item.send_confirmed || item.pitched_at)
            .map(item => item.brand_id)
        );
        setPitchedIds(pitched);
      }
    } catch (error) {
      console.error('Error fetching saved brands:', error);
    }
  };

  const handlePitchNow = useCallback(async (brand) => {
    if (atLimit) {
      setUpgradeReason('limit');
      setShowUpgrade(true);
      return;
    }

    // Auto-save to pipeline if not already saved
    if (!savedIds.has(brand.id)) {
      try {
        await axios.post(`${API_BASE}/api/pr-crm/pipeline/save`, {
          brand_id: brand.id,
          slug: brand.slug
        }, { withCredentials: true });
        setSavedIds(prev => new Set([...prev, brand.id]));
        window.dispatchEvent(new CustomEvent('savedBrandCountChanged'));
      } catch (error) {
        console.error('Error saving brand:', error);
      }
    }

    setPitchingBrand(brand);
  }, [atLimit, savedIds]);

  const handlePitchSent = useCallback(async (brandArg, context = {}) => {
    const contactedBrand = brandArg || pitchingBrand;
    const method = context?.method || 'email';

    if (contactedBrand) {
      setPitchedIds(prev => new Set([...prev, contactedBrand.id]));
      setSavedIds(prev => new Set([...prev, contactedBrand.id]));
    }
    setPitchingBrand(null);

    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/pitch-limits`, {
        withCredentials: true
      });
      if (response.data.success) {
        setPitchesSentThisMonth(response.data.used || 0);
      }
    } catch (error) {
      setPitchesSentThisMonth(prev => prev + 1);
    }

    if (contactedBrand) {
      message.success(
        method === 'form'
          ? 'PR form opened. Confirm your application in Saved.'
          : 'Email opened. Confirm it in Saved so we can track follow-ups.'
      );
      navigate(`/creator/dashboard/pr-pipeline?confirmBrand=${contactedBrand.id}&method=${method}`);
    }
  }, [pitchingBrand, navigate]);

  const handleSaveProfile = async () => {
    if (selectedNiches.length === 0) return;

    setSavingProfile(true);
    try {
      await axios.patch(`${API_BASE}/api/pr-crm/creator-profile`, {
        creator_niches: selectedNiches
      }, { withCredentials: true });

      message.success('Profile updated! Loading your personalized matches...');
      fetchData();
    } catch (error) {
      console.error('Error saving profile:', error);
      message.error('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your recommendations..." minHeight="400px" />;
  }

  return (
    <PageWrap>
      <PageInner>
        {/* Page Header */}
        <PageHeader>
          <PageTitleWrap>
            <PageEyebrow><Sparkles size={14} /> Personalized for you</PageEyebrow>
            <PageTitle>Your Brand Matches</PageTitle>
            <PageSub>Curated daily based on your niche, following and pitch history</PageSub>
          </PageTitleWrap>
          {data?.has_profile && (
            <ProfilePill>
              <ProfileAvatar>{user?.name?.charAt(0) || 'C'}</ProfileAvatar>
              <ProfileInfo>
                <ProfileName>{user?.name || 'Creator'} · {selectedNiches.slice(0, 2).map(n => CATEGORY_LABELS[n] || n).join(' & ')}</ProfileName>
                <ProfileNiche>
                  {parseInt(followerCount) >= 1000
                    ? `${(parseInt(followerCount) / 1000).toFixed(0)}K followers`
                    : parseInt(followerCount) > 0
                      ? `${followerCount} followers`
                      : 'Creator'}
                </ProfileNiche>
              </ProfileInfo>
              <ProfileEdit onClick={() => setData(prev => ({ ...prev, has_profile: false }))}>
                Edit niches <ChevronRight size={14} />
              </ProfileEdit>
            </ProfilePill>
          )}
        </PageHeader>

        {/* Profile Prompt - shown when no niche data yet */}
        {!data?.has_profile && (
          <ProfilePromptCard>
            <PromptIcon>🎯</PromptIcon>
            <PromptTitle>Tell us about your niche</PromptTitle>
            <PromptSub>Takes 10 seconds — unlocks brands matched specifically to you</PromptSub>

            <NicheGrid>
              {NICHE_OPTIONS.map(n => (
                <NicheChip
                  key={n}
                  $selected={selectedNiches.includes(n)}
                  onClick={() => setSelectedNiches(prev =>
                    prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
                  )}
                >
                  {CATEGORY_LABELS[n] || n}
                </NicheChip>
              ))}
            </NicheGrid>

            <SaveProfileBtn
              disabled={selectedNiches.length === 0 || savingProfile}
              onClick={handleSaveProfile}
            >
              {savingProfile ? 'Saving...' : 'Show my matches →'}
            </SaveProfileBtn>
          </ProfilePromptCard>
        )}

        {/* Compact Quota Strip for Free Users */}
        {!isPro && (
          <QuotaCompact>
            <span><Mail size={14} /> {FREE_PITCH_LIMIT - pitchesSentThisMonth} free contacts left this month</span>
            <UpgradeLink onClick={() => { setUpgradeReason('quota'); setShowUpgrade(true); }}>
              Upgrade for unlimited →
            </UpgradeLink>
          </QuotaCompact>
        )}

        {/* Refresh Hint */}
        <RefreshHint>
          <RefreshDot />
          Matches refresh every Monday · Last updated today
        </RefreshHint>

        {/* Section 1: Matched for You (Pro gate) */}
        <Section>
          <SectionHeader>
            <SectionLeft>
              <SectionIcon $bg="#F5F3FF">🎯</SectionIcon>
              <SectionTitleWrap>
                <SectionTitle>Matched for You</SectionTitle>
                <SectionDesc>{data?.matched?.length || 0} brands match your profile</SectionDesc>
              </SectionTitleWrap>
            </SectionLeft>
            {!isPro && <ProLabel>⚡ Pro</ProLabel>}
          </SectionHeader>

          {isPro ? (
            /* Pro users see all cards */
            <CardGrid $cols={3}>
              {data?.matched?.map(brand => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  isPro={isPro}
                  hasPitched={pitchedIds.has(brand.id)}
                  isSaved={savedIds.has(brand.id)}
                  atLimit={atLimit}
                  onPitch={() => handlePitchNow(brand)}
                  onUpgrade={() => { setUpgradeReason('matched'); setShowUpgrade(true); }}
                  matchScore={brand.match_score}
                />
              ))}
            </CardGrid>
          ) : (
            /* Free users: 2 visible cards + locked cards with visible stats */
            <>
              {/* Section header for unlocked */}
              <MatchSectionLabel>🔓 You can pitch ({Math.max(0, FREE_PITCH_LIMIT - pitchesSentThisMonth)} left)</MatchSectionLabel>

              {/* First 2 visible cards */}
              <CardGrid $cols={2} style={{ marginBottom: 20 }}>
                {data?.matched?.slice(0, 2).map(brand => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    isPro={isPro}
                    hasPitched={pitchedIds.has(brand.id)}
                    isSaved={savedIds.has(brand.id)}
                    atLimit={atLimit}
                    onPitch={() => handlePitchNow(brand)}
                    onUpgrade={() => { setUpgradeReason('matched'); setShowUpgrade(true); }}
                    matchScore={brand.match_score}
                  />
                ))}
              </CardGrid>

              {/* Locked matches section */}
              {data?.matched?.length > 2 && (
                <>
                  <MatchSectionLabel>🔒 Pro matches ({(data?.matched?.length || 0) - 2} brands)</MatchSectionLabel>

                  {/* Locked match cards - show visible stats, hidden names */}
                  <LockedMatchList>
                    {data?.matched?.slice(2, 5).map((brand, i) => (
                      <LockedMatchCard key={brand.id || i}>
                        <LockedMatchLogo>
                          {['🛁', '✨', '🌿', '💄', '💪', '🌸'][i % 6]}
                        </LockedMatchLogo>
                        <LockedMatchInfo>
                          <LockedMatchNameBar />
                          <LockedMatchMetaBar />
                        </LockedMatchInfo>
                        <LockedMatchRight>
                          {brand.response_rate > 0 && (
                            <LockedVisibleStat>🔥 {brand.response_rate}% reply</LockedVisibleStat>
                          )}
                          <LockedIcon>🔒</LockedIcon>
                        </LockedMatchRight>
                      </LockedMatchCard>
                    ))}
                  </LockedMatchList>

                  {data?.matched?.length > 5 && (
                    <MoreLockedText>+{(data?.matched?.length || 0) - 5} more matched brands</MoreLockedText>
                  )}

                  {/* Upgrade CTA */}
                  <UnlockBanner onClick={() => { setUpgradeReason('matched'); setShowUpgrade(true); }}>
                    <UnlockBannerText>
                      <UnlockBannerTitle>Unlock {(data?.matched?.length || 0) - 2} matched brands</UnlockBannerTitle>
                      <UnlockBannerSub>Brands ready to work with creators your size</UnlockBannerSub>
                    </UnlockBannerText>
                    <UnlockBannerBtn>$12/mo →</UnlockBannerBtn>
                  </UnlockBanner>
                </>
              )}
            </>
          )}
        </Section>

        {/* Section 2: Most Contacted Brands */}
        <Section>
          <SectionHeader>
            <SectionLeft>
              <SectionIcon $bg="#FFF7ED">🔥</SectionIcon>
              <SectionTitleWrap>
                <SectionTitle>Most contacted brands</SectionTitle>
                <SectionDesc>Top brands creators are pitching right now</SectionDesc>
              </SectionTitleWrap>
            </SectionLeft>
          </SectionHeader>

          <CardGrid $cols={3}>
            {data?.hot?.map(brand => (
              <BrandCard
                key={brand.id}
                brand={brand}
                isPro={isPro}
                hasPitched={pitchedIds.has(brand.id)}
                isSaved={savedIds.has(brand.id)}
                atLimit={atLimit}
                onPitch={() => handlePitchNow(brand)}
                onUpgrade={() => { setUpgradeReason('limit'); setShowUpgrade(true); }}
                showMomentum
              />
            ))}
          </CardGrid>
        </Section>

        {/* Section 3: Right Season */}
        <Section>
          <SectionHeader>
            <SectionLeft>
              <SectionIcon $bg="#ECFDF5">📅</SectionIcon>
              <SectionTitleWrap>
                <SectionTitle>Right Season — {data?.seasonal_month}</SectionTitle>
                <SectionDesc>{data?.seasonal_reason}</SectionDesc>
              </SectionTitleWrap>
            </SectionLeft>
          </SectionHeader>

          <SeasonalGrid>
            {data?.seasonal?.map(brand => (
              <SeasonalCard key={brand.id}>
                <SeasonalLogoBox>
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <SeasonalLogoText>{brand.name?.charAt(0)}</SeasonalLogoText>
                  )}
                </SeasonalLogoBox>
                <SeasonalInfo>
                  <SeasonalName>{brand.name}</SeasonalName>
                  <SeasonalReason>📅 Seasonal pick — {data?.seasonal_reason?.split('—')[0]}</SeasonalReason>
                  <SeasonalStats>
                    {brand.response_rate && (
                      <div>
                        <SeasonalStatVal className="green">{brand.response_rate}%</SeasonalStatVal>
                        <SeasonalStatLbl>Response</SeasonalStatLbl>
                      </div>
                    )}
                    <div>
                      <SeasonalStatVal>~{brand.avg_response_days || 5}d</SeasonalStatVal>
                      <SeasonalStatLbl>Avg reply</SeasonalStatLbl>
                    </div>
                  </SeasonalStats>
                  <SeasonalBtn
                    onClick={() => handlePitchNow(brand)}
                    disabled={pitchedIds.has(brand.id)}
                    $pitched={pitchedIds.has(brand.id)}
                  >
                    {pitchedIds.has(brand.id) ? (
                      <><Check size={14} /> Contacted</>
                    ) : (
                      <><Mail size={14} /> Pitch Now</>
                    )}
                  </SeasonalBtn>
                </SeasonalInfo>
              </SeasonalCard>
            ))}
          </SeasonalGrid>
        </Section>
      </PageInner>

      {/* Modals */}
      {pitchingBrand && (
        <AIPitchModal
          isOpen={!!pitchingBrand}
          onClose={() => setPitchingBrand(null)}
          brand={pitchingBrand}
          onPitchSent={handlePitchSent}
        />
      )}

      {showUpgrade && (
        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          currentCount={pitchesSentThisMonth}
          limit={FREE_PITCH_LIMIT}
          feature={upgradeReason === 'matched' ? 'personalized matches' : 'brand contacts'}
        />
      )}
    </PageWrap>
  );
};

// Brand Card Component (inline for this page)
const BrandCard = ({ brand, isPro, hasPitched, isSaved, atLimit, onPitch, onUpgrade, badge, matchScore, showMomentum }) => {
  const catStyle = getCategoryColors(brand.category);

  return (
    <Card
      as={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <LogoBox>
        {badge && (
          <LogoBadge $type={badge.type}>{badge.label}</LogoBadge>
        )}
        {matchScore && (
          <MatchBadge>{matchScore}% match</MatchBadge>
        )}
        {brand.logo ? (
          <LogoImg src={brand.logo} alt={brand.name} onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <LogoText>{brand.name?.charAt(0)}</LogoText>
        )}
      </LogoBox>

      <CardName>{brand.name}</CardName>
      {brand.description && <CardDesc>{brand.description}</CardDesc>}

      <CardTags>
        {brand.category && (
          <CategoryTag $bg={catStyle.bg} $color={catStyle.text} $border={catStyle.border}>
            {categoryLabel(brand.category)}
          </CategoryTag>
        )}
        {brand.min_followers > 0 && (
          <TagFollowers>{(brand.min_followers / 1000).toFixed(0)}K+ followers</TagFollowers>
        )}
      </CardTags>

      {showMomentum && brand.response_rate && (
        <Momentum>
          <MomentumLabel>
            <span>Response rate this week</span>
            <span className="rate">↑ {brand.response_rate}%</span>
          </MomentumLabel>
          <MomentumTrack>
            <MomentumFill style={{ width: `${Math.min(brand.response_rate, 100)}%` }} />
          </MomentumTrack>
        </Momentum>
      )}

      {!showMomentum && (
        <>
          <CardDivider />
          <CardStats>
            {brand.response_rate && (
              <>
                <StatItem>
                  <StatValue className="green">{brand.response_rate}%</StatValue>
                  <StatLabel>Response</StatLabel>
                </StatItem>
                <StatDivider />
              </>
            )}
            <StatItem>
              <StatValue>~{brand.avg_response_days || 5}d</StatValue>
              <StatLabel>Avg reply</StatLabel>
            </StatItem>
          </CardStats>
        </>
      )}

      {brand.pitched_this_week > 0 && (
        <SocialProof>
          <Users size={12} /> {brand.pitched_this_week} pitched · <span className="green">{brand.wins_this_week || 0} got packages</span>
        </SocialProof>
      )}

      <PitchBtn
        onClick={onPitch}
        $pitched={hasPitched}
        disabled={hasPitched}
      >
        {hasPitched ? (
          <><Check size={16} /> Contacted</>
        ) : (
          <><Mail size={16} /> Pitch Now</>
        )}
      </PitchBtn>
    </Card>
  );
};

// Styled Components
const PageWrap = styled.div`
  background: #F5F5F7;
  min-height: 100vh;
  overflow-x: hidden;
  width: 100%;
`;

const PageInner = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  padding: 32px 24px 80px;

  @media (max-width: 640px) {
    padding: 20px 14px 80px;
  }
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const PageTitleWrap = styled.div``;

const PageEyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${tokens.primary};
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 4px;
  color: ${tokens.textPrimary};

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

const PageSub = styled.p`
  font-size: 13px;
  color: ${tokens.textMuted};
  margin: 0;
`;

const ProfilePill = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 14px;
  padding: 10px 16px;
  box-shadow: ${tokens.shadowCard};
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 100%;
    padding: 10px 14px;
  }
`;

const ProfileAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${tokens.primary};
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 12px;
`;

const ProfileInfo = styled.div``;

const ProfileName = styled.div`
  font-size: 13px;
  font-weight: 700;
`;

const ProfileNiche = styled.div`
  font-size: 11px;
  color: ${tokens.textMuted};
  margin-top: 1px;
`;

const ProfileEdit = styled.button`
  font-size: 12px;
  color: ${tokens.primary};
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 2px;

  &:hover { text-decoration: underline; }
`;

const Section = styled.div`
  margin-bottom: 36px;

  @media (max-width: 640px) {
    margin-bottom: 28px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    margin-bottom: 12px;
  }
`;

const SectionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: ${p => p.$bg || '#F4F4F4'};
  display: grid;
  place-items: center;
  font-size: 17px;
  flex-shrink: 0;
`;

const SectionTitleWrap = styled.div``;

const SectionTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.2px;

  @media (max-width: 640px) {
    font-size: 15px;
  }
`;

const SectionDesc = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
  margin-top: 1px;
`;

const ProLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  background: ${tokens.proGradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${p => p.$cols || 3}, 1fr);
  gap: 14px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

/* Free users: Matched section layout */
const MatchedSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 14px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const VisibleCard = styled.div`
  /* First card is fully visible */
`;

const PaywallArea = styled.div`
  position: relative;
  min-height: 320px;

  @media (max-width: 900px) {
    min-height: auto;
  }
`;

const BlurredPreview = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  filter: blur(6px);
  opacity: 0.5;
  pointer-events: none;
  user-select: none;

  @media (max-width: 900px) {
    display: none;
  }
`;

const BlurredCard = styled.div`
  /* Blurred card wrapper */
`;

const SeasonalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

// Brand Card Styles
const Card = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 18px;
  padding: 18px;
  padding-top: 22px;
  position: relative;
  transition: all 0.2s;
  box-shadow: ${tokens.shadowCard};
  display: flex;
  flex-direction: column;
  overflow: visible;

  &:hover {
    border-color: #D4D4D4;
    box-shadow: ${tokens.shadowHover};
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    padding: 12px;
    padding-top: 18px;
    border-radius: 14px;
  }
`;

const LogoBox = styled.div`
  width: 100%;
  height: 80px;
  background: #FAFAFA;
  border: 1px solid #F0F0F0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  overflow: visible;
  position: relative;

  @media (max-width: 640px) {
    height: 70px;
    border-radius: 10px;
  }
`;

const LogoImg = styled.img`
  max-width: 65%;
  max-height: 50px;
  width: auto;
  height: auto;
  object-fit: contain;
  mix-blend-mode: multiply;
`;

const LogoText = styled.div`
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -1px;
  color: ${tokens.textPrimary};
`;

const LogoBadge = styled.div`
  position: absolute;
  top: -8px;
  left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 9px;
  border-radius: 100px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2px;
  white-space: nowrap;
  background: ${p => p.$type === 'hot' ? '#FFF7ED' : '#ECFDF5'};
  color: ${p => p.$type === 'hot' ? '#C2410C' : '#059669'};
  border: 1px solid ${p => p.$type === 'hot' ? '#FED7AA' : '#A7F3D0'};
  z-index: 2;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);

  @media (max-width: 640px) {
    top: -6px;
    left: 6px;
    font-size: 9px;
    padding: 3px 7px;
  }
`;

const MatchBadge = styled.div`
  position: absolute;
  top: -10px;
  right: 10px;
  background: linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #D946EF 100%);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  padding: 6px 12px;
  border-radius: 100px;
  letter-spacing: 0.3px;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.35), 0 1px 3px rgba(0,0,0,0.1);
  text-shadow: 0 1px 2px rgba(0,0,0,0.15);

  @media (max-width: 640px) {
    top: -8px;
    right: 8px;
    font-size: 11px;
    padding: 5px 10px;
  }
`;

const CardName = styled.div`
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 4px;
  letter-spacing: -0.2px;
  word-break: break-word;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const CardDesc = styled.div`
  font-size: 12.5px;
  color: ${tokens.textMuted};
  text-align: center;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
`;

const CardTags = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const CategoryTag = styled.span`
  background: ${p => p.$bg};
  color: ${p => p.$color};
  border: 1px solid ${p => p.$border};
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1px;
  text-transform: capitalize;
`;

const TagFollowers = styled.span`
  background: ${tokens.accentLight};
  color: ${tokens.accent};
  border: 1px solid ${tokens.accentBorder};
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
`;

const CardDivider = styled.div`
  height: 1px;
  background: ${tokens.border};
  margin: 0 -18px 14px;
`;

const CardStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 14px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;

  &.green { color: ${tokens.success}; }
`;

const StatLabel = styled.div`
  font-size: 10px;
  color: ${tokens.textMuted};
  font-weight: 500;
  margin-top: 1px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const StatDivider = styled.div`
  width: 1px;
  height: 28px;
  background: ${tokens.border};
`;

const SocialProof = styled.div`
  text-align: center;
  font-size: 11px;
  color: ${tokens.textMuted};
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;

  .green { color: ${tokens.success}; font-weight: 700; }
`;

const Momentum = styled.div`
  margin-bottom: 14px;
`;

const MomentumLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: ${tokens.textMuted};
  margin-bottom: 4px;

  .rate { font-weight: 700; color: ${tokens.success}; }
`;

const MomentumTrack = styled.div`
  height: 4px;
  background: ${tokens.subtle};
  border-radius: 2px;
  overflow: hidden;
`;

const MomentumFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, ${tokens.success}, #34D399);
  transition: width 0.4s ease;
`;

const PitchBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 12px;
  background: ${p => p.$pitched ? tokens.successLight : tokens.action};
  color: ${p => p.$pitched ? tokens.success : '#fff'};
  border: ${p => p.$pitched ? `1.5px solid ${tokens.successBorder}` : 'none'};
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: ${p => p.$pitched ? 'default' : 'pointer'};
  font-family: inherit;
  transition: all 0.15s;
  margin-top: auto;

  &:hover:not(:disabled) {
    background: ${p => p.$pitched ? tokens.successLight : '#1C1C1C'};
    transform: ${p => p.$pitched ? 'none' : 'translateY(-1px)'};
  }
`;

// Seasonal Card Styles
const SeasonalCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 18px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  box-shadow: ${tokens.shadowCard};
  transition: all 0.2s;

  &:hover {
    border-color: #D4D4D4;
    box-shadow: ${tokens.shadowHover};
  }

  @media (max-width: 640px) {
    padding: 14px;
    gap: 12px;
    border-radius: 14px;
  }
`;

const SeasonalLogoBox = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: ${tokens.subtle};
  border: 1px solid ${tokens.border};
  display: grid;
  place-items: center;
  flex-shrink: 0;
  overflow: hidden;
  padding: 8px;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    mix-blend-mode: multiply;
  }

  @media (max-width: 640px) {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    padding: 6px;
  }
`;

const SeasonalLogoText = styled.div`
  font-size: 12px;
  font-weight: 800;
  color: ${tokens.textPrimary};
  text-align: center;
`;

const SeasonalInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SeasonalName = styled.div`
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 2px;
  word-break: break-word;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const SeasonalReason = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
  margin-bottom: 8px;
  line-height: 1.4;
  word-break: break-word;

  @media (max-width: 640px) {
    font-size: 11px;
    margin-bottom: 6px;
  }
`;

const SeasonalStats = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 640px) {
    gap: 10px;
    margin-bottom: 10px;
  }
`;

const SeasonalStatVal = styled.div`
  font-size: 14px;
  font-weight: 800;

  &.green { color: ${tokens.success}; }
`;

const SeasonalStatLbl = styled.div`
  font-size: 10px;
  color: ${tokens.textMuted};
  font-weight: 500;
  text-transform: uppercase;
`;

const SeasonalBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  background: ${p => p.$pitched ? tokens.successLight : tokens.action};
  color: ${p => p.$pitched ? tokens.success : '#fff'};
  border: ${p => p.$pitched ? `1.5px solid ${tokens.successBorder}` : 'none'};
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  cursor: ${p => p.$pitched ? 'default' : 'pointer'};
  font-family: inherit;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: ${p => p.$pitched ? tokens.successLight : '#1C1C1C'};
  }

  @media (max-width: 640px) {
    padding: 8px;
    font-size: 12px;
    border-radius: 8px;
  }
`;

// Paywall Styles
const PaywallOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(to bottom, rgba(245,245,247,0.3), rgba(245,245,247,0.95) 60%);
  border-radius: 18px;

  @media (max-width: 900px) {
    position: relative;
    background: none;
    padding: 0;
  }
`;

const PaywallCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 20px;
  padding: 28px 24px;
  text-align: center;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 8px 40px rgba(15,15,15,.12);

  @media (max-width: 900px) {
    max-width: 100%;
    padding: 24px 20px;
    border-radius: 18px;
    box-shadow: ${tokens.shadowCard};
  }
`;

const PaywallIcon = styled.div`
  font-size: 36px;
  margin-bottom: 12px;
`;

const PaywallTitle = styled.div`
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
  margin-bottom: 6px;
`;

const PaywallSub = styled.div`
  font-size: 13px;
  color: ${tokens.textSecondary};
  line-height: 1.6;
  margin-bottom: 18px;
`;

const PaywallFeatures = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
  margin-bottom: 20px;
`;

const PaywallFeature = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 500;
  color: ${tokens.textSecondary};
`;

const PaywallCheck = styled.div`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${tokens.successLight};
  border: 1px solid ${tokens.successBorder};
  color: ${tokens.success};
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
`;

const UpgradeBtn = styled.button`
  width: 100%;
  padding: 14px;
  background: ${tokens.proGradient};
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(225,29,72,.25);
  transition: all 0.2s;
  margin-bottom: 10px;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(225,29,72,.35);
  }
`;

const PaywallHint = styled.div`
  font-size: 11.5px;
  color: ${tokens.textMuted};
`;

// New Conversion Design - Locked Match Cards
const MatchSectionLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${tokens.textSecondary};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LockedMatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const LockedMatchCard = styled.div`
  background: #F9FAFB;
  border: 1.5px dashed #E5E7EB;
  border-radius: 16px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 640px) {
    padding: 10px 12px;
    gap: 10px;
    border-radius: 14px;
  }
`;

const LockedMatchLogo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    font-size: 16px;
  }
`;

const LockedMatchInfo = styled.div`
  flex: 1;
`;

const LockedMatchNameBar = styled.div`
  height: 12px;
  width: 100px;
  background: linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%);
  background-size: 200% 100%;
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
  margin-bottom: 6px;

  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const LockedMatchMetaBar = styled.div`
  height: 10px;
  width: 70px;
  background: #F3F4F6;
  border-radius: 5px;
`;

const LockedMatchRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex-shrink: 0;
`;

const LockedVisibleStat = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${tokens.success};
  white-space: nowrap;
`;

const LockedIcon = styled.div`
  font-size: 16px;
  color: #9CA3AF;
`;

const MoreLockedText = styled.div`
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #9CA3AF;
  padding: 6px 0 12px;
`;

const UnlockBanner = styled.div`
  background: linear-gradient(135deg, #7C3AED, #E11D48);
  border-radius: 16px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.25);
  }

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    padding: 18px 16px;
    gap: 12px;
  }
`;

const UnlockBannerText = styled.div`
  flex: 1;
`;

const UnlockBannerTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 2px;
`;

const UnlockBannerSub = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
`;

const UnlockBannerBtn = styled.div`
  background: #fff;
  color: #7C3AED;
  font-size: 13px;
  font-weight: 800;
  padding: 9px 16px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
`;

// Profile Prompt Styles
const ProfilePromptCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
  box-shadow: ${tokens.shadowCard};
`;

const PromptIcon = styled.div`
  font-size: 32px;
  margin-bottom: 10px;
`;

const PromptTitle = styled.div`
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 4px;
`;

const PromptSub = styled.div`
  font-size: 13px;
  color: ${tokens.textMuted};
  margin-bottom: 18px;
`;

const NicheGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 16px;
`;

const NicheChip = styled.button`
  padding: 7px 14px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  background: ${p => p.$selected ? tokens.action : '#F4F4F4'};
  color: ${p => p.$selected ? '#fff' : tokens.textSecondary};
  border: ${p => p.$selected ? `1px solid ${tokens.action}` : '1px solid #E8E8E8'};

  &:hover {
    background: ${p => p.$selected ? tokens.action : '#EBEBEB'};
  }
`;

const SaveProfileBtn = styled.button`
  padding: 12px 28px;
  border-radius: 100px;
  background: ${p => p.disabled ? '#F4F4F4' : tokens.action};
  color: ${p => p.disabled ? tokens.textMuted : '#fff'};
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  font-family: inherit;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #1C1C1C;
  }
`;

// Compact Quota Strip
const QuotaCompact = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 12px;
  padding: 10px 16px;
  margin-bottom: 24px;
  font-size: 13px;
  color: ${tokens.textSecondary};

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 8px;
    text-align: center;
    padding: 12px 14px;
  }

  span {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const UpgradeLink = styled.button`
  background: none;
  border: none;
  color: ${tokens.primary};
  font-weight: 600;
  cursor: pointer;
  font-size: 13px;
  font-family: inherit;

  &:hover { text-decoration: underline; }
`;

const RefreshHint = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: ${tokens.textMuted};
  margin-bottom: 32px;

  @media (max-width: 640px) {
    margin-bottom: 24px;
    font-size: 11px;
  }
`;

const RefreshDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${tokens.success};
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;

export default ForYou;
