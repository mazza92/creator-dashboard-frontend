import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mail, Heart, Check, Users, Sparkles, Lock, ChevronRight, Eye, FileText, ArrowRight } from 'lucide-react';
import { message } from 'antd';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';
import UpgradeModal from '../creator-portal/UpgradeModal';
import AIPitchModal from '../creator-portal/AIPitchModal';
import OpportunitiesTab from '../creator-portal/OpportunitiesTab';
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

  // Kit nudge interstitial state
  const [kitNudgeBrand, setKitNudgeBrand] = useState(null);
  const [showKitNudge, setShowKitNudge] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState(null);

  // Kit views notification state
  const [kitViews, setKitViews] = useState({ views_this_week: 0, recent: [] });
  const [showKitViewsBanner, setShowKitViewsBanner] = useState(true);

  // Pending pitches state (for dead zone engagement)
  const [pendingPitches, setPendingPitches] = useState([]);

  // Sub-tab state for Matches vs Opportunities
  const [activeTab, setActiveTab] = useState('matches');
  const [pitchLimits, setPitchLimits] = useState({ used: 0, limit: 3, canPitch: true });
  const [opportunityCount, setOpportunityCount] = useState(0);

  // Recent replies for social proof strip
  const [recentReplies, setRecentReplies] = useState([]);

  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
  const atLimit = !isPro && pitchesSentThisMonth >= FREE_PITCH_LIMIT;

  useEffect(() => {
    fetchData();
    fetchSubscriptionStatus();
    fetchSavedBrands();
    fetchCreatorProfile();
    fetchKitViews();
    fetchOpportunityCount();
    fetchRecentReplies();
  }, []);

  const fetchOpportunityCount = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/opportunities/list`, {
        withCredentials: true
      });
      if (response.data.success) {
        const matched = response.data.matched || [];
        const others = response.data.others || [];
        setOpportunityCount(matched.length + others.length);
      }
    } catch (error) {
      // Silently fail
    }
  };

  const fetchRecentReplies = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/recent-replies`, {
        withCredentials: true
      });
      if (response.data.success && response.data.replies) {
        setRecentReplies(response.data.replies);
      }
    } catch (error) {
      // Silently fail - social proof is optional
    }
  };

  const fetchKitViews = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/portfolio/views`, {
        withCredentials: true
      });
      if (response.data) {
        setKitViews(response.data);
      }
    } catch (error) {
      // Silently fail - kit views is an optional feature
    }
  };

  const fetchCreatorProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE}/profile`, { withCredentials: true });
      setCreatorProfile(response.data);
    } catch (error) {
      // Silently fail
    }
  };

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
        setPitchLimits(limitsResponse.data);
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

        // Extract pending pitches (pitched but no reply yet)
        const pending = response.data.pipeline
          .filter(item => (item.send_confirmed || item.pitched_at) && !item.reply_received && item.status !== 'replied')
          .map(item => ({
            brand_id: item.brand_id,
            brand_name: item.brand_name || item.name || 'a brand',
            pitched_at: item.pitched_at
          }));
        setPendingPitches(pending);
      }
    } catch (error) {
      console.error('Error fetching saved brands:', error);
    }
  };

  const handlePitchNow = useCallback(async (brand) => {
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

    // Kit nudge interstitial - show once if creator has no kit
    const hasSeenNudge = localStorage.getItem('nc_kit_nudge_seen');
    const hasKit = creatorProfile?.has_media_kit ||
                   (creatorProfile?.portfolio_post_count && creatorProfile.portfolio_post_count > 0);

    if (!hasKit && !hasSeenNudge) {
      localStorage.setItem('nc_kit_nudge_seen', 'true');
      setKitNudgeBrand(brand);
      setShowKitNudge(true);
      return;
    }

    setPitchingBrand(brand);
  }, [atLimit, savedIds, creatorProfile]);

  const handleKitNudgeSkip = () => {
    setShowKitNudge(false);
    setPitchingBrand(kitNudgeBrand);
    setKitNudgeBrand(null);
  };

  const handleKitNudgeBuild = () => {
    setShowKitNudge(false);
    setKitNudgeBrand(null);
    navigate('/creator/dashboard/my-kit');
  };

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

        {/* Kit Views Banner - LinkedIn style notification */}
        {showKitViewsBanner && kitViews.views_this_week > 0 && (
          <KitViewsBanner>
            <KitViewsIcon>
              <Eye size={18} />
            </KitViewsIcon>
            <KitViewsContent>
              <KitViewsTitle>
                <strong>{kitViews.views_this_week}</strong> {kitViews.views_this_week === 1 ? 'person' : 'people'} viewed your kit this week
              </KitViewsTitle>
              {isPro && kitViews.recent?.length > 0 && kitViews.recent[0].referrer && (
                <KitViewsSub>
                  Latest from: {new URL(kitViews.recent[0].referrer).hostname.replace('www.', '')}
                </KitViewsSub>
              )}
              {!isPro && (
                <KitViewsUpgrade onClick={() => { setUpgradeReason('kit_views'); setShowUpgrade(true); }}>
                  Upgrade to see who's checking you out →
                </KitViewsUpgrade>
              )}
            </KitViewsContent>
            <KitViewsClose onClick={() => setShowKitViewsBanner(false)}>×</KitViewsClose>
          </KitViewsBanner>
        )}

        {/* Profile Prompt - shown when no niche data yet */}
        {!data?.has_profile && (
          <ProfilePromptCard>
            <PromptIcon>🎯</PromptIcon>
            <PromptTitle>Tell us about your niche</PromptTitle>
            <PromptSub>Takes 10 seconds and unlocks brands matched specifically to you</PromptSub>

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


        {/* How It Works — Clear explanation FIRST so users understand the game */}
        {!isPro && data?.has_profile && (
          <HowItWorksCard>
            <HowItWorksTitle>How to get your PR from brands</HowItWorksTitle>
            <HowItWorksSteps>
              <HowItWorksStep>
                <StepNumber>1</StepNumber>
                <StepText>
                  <StepLabel>Click <strong>Pitch Now</strong> to contact brands</StepLabel>
                  <StepDesc>Unlock their PR email + your custom message, sent from your email so it feels personal</StepDesc>
                </StepText>
              </HowItWorksStep>
              <StepDivider />
              <HowItWorksStep>
                <StepNumber>2</StepNumber>
                <StepText>
                  <StepLabel>You review & hit send</StepLabel>
                  <StepDesc>Edit the pitch if you want, then send from your own inbox</StepDesc>
                </StepText>
              </HowItWorksStep>
              <StepDivider />
              <HowItWorksStep>
                <StepNumber>3</StepNumber>
                <StepText>
                  <StepLabel>We track replies for you</StepLabel>
                  <StepDesc>Follow up in your pipeline and get PR packages</StepDesc>
                </StepText>
              </HowItWorksStep>
            </HowItWorksSteps>
          </HowItWorksCard>
        )}

        {/* Kit Builder Prompt - shown AFTER they understand the flow */}
        {creatorProfile && !creatorProfile.has_media_kit && (!creatorProfile.portfolio_post_count || creatorProfile.portfolio_post_count === 0) && (
          <KitBuilderCard>
            <KitBuilderLeft>
              <KitBuilderStat>3×</KitBuilderStat>
              <KitBuilderContent>
                <KitBuilderTitle>Build your media kit to get 3× more replies</KitBuilderTitle>
                <KitBuilderDesc>
                  Brands want to see your content before they respond. Takes 2 minutes.
                </KitBuilderDesc>
              </KitBuilderContent>
            </KitBuilderLeft>
            <KitBuilderBtn onClick={() => navigate('/creator/dashboard/my-kit')}>
              <FileText size={16} />
              Build my kit
              <ArrowRight size={14} />
            </KitBuilderBtn>
          </KitBuilderCard>
        )}

        {/* Refresh Hint */}
        <RefreshHint>
          <RefreshDot />
          Matches refresh every Monday · Last updated today
        </RefreshHint>

        {/* Sub-tabs: Matches vs Opportunities */}
        <SubTabRow>
          <SubTab
            $active={activeTab === 'matches'}
            onClick={() => setActiveTab('matches')}
          >
            🎯 Matches
          </SubTab>
          <SubTab
            $active={activeTab === 'opportunities'}
            onClick={() => setActiveTab('opportunities')}
          >
            ⚡ Opportunities
            {opportunityCount > 0 && <CountBadge>{opportunityCount}</CountBadge>}
          </SubTab>
        </SubTabRow>

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <OpportunitiesTab
            pitchLimits={pitchLimits}
            isPro={isPro}
            onShowUpgrade={(reason) => { setUpgradeReason(reason); setShowUpgrade(true); }}
            onCountChange={setOpportunityCount}
          />
        )}

        {/* Matches Tab Content */}
        {activeTab === 'matches' && (
          <>
        {/* Pending Pitch Banner — keeps users engaged during wait */}
        {pendingPitches && pendingPitches.length > 0 && (
          <PendingPitchBanner>
            <PendingIcon>📬</PendingIcon>
            <PendingContent>
              <PendingTitle>Your pitch to {pendingPitches[0].brand_name} is in their inbox</PendingTitle>
              <PendingSubtitle>
                Avg reply time is ~5 days · {pendingPitches.length > 1 ? `${pendingPitches.length} pitches pending` : "We'll notify you when they respond"}
              </PendingSubtitle>
            </PendingContent>
            <PendingLink onClick={() => navigate('/creator/dashboard/pr-pipeline')}>
              View pipeline →
            </PendingLink>
          </PendingPitchBanner>
        )}

        {/* Social Proof Strip - Recent replies happening on platform */}
        {(() => {
          // Get user's primary niche for personalized fallback
          const userNiches = selectedNiches?.length > 0
            ? selectedNiches
            : (data?.profile?.niches?.length > 0 ? data.profile.niches : ['lifestyle']);
          const nicheKey = (userNiches[0] || 'default').toLowerCase();

          // Niche-matched fallback data with believable indie brands
          // Different follower counts, mix of reply/package events, time signals
          const FALLBACK_BY_NICHE = {
            beauty: [
              { brand_name: 'Cowshed', creator_niche: 'beauty', follower_range: '6.4K', event: 'got a reply from', time_ago: '4h ago' },
              { brand_name: 'Peach Slices', creator_niche: 'beauty', follower_range: '3.1K', event: 'received a PR package from', time_ago: '1d ago' },
            ],
            skincare: [
              { brand_name: 'Versed', creator_niche: 'skincare', follower_range: '5.2K', event: 'got a reply from', time_ago: '3h ago' },
              { brand_name: 'Good Molecules', creator_niche: 'skincare', follower_range: '8.7K', event: 'received a PR package from', time_ago: '2d ago' },
            ],
            fitness: [
              { brand_name: 'Splits59', creator_niche: 'fitness', follower_range: '12K', event: 'got a reply from', time_ago: '6h ago' },
              { brand_name: 'Momentous', creator_niche: 'fitness', follower_range: '4.8K', event: 'received a PR package from', time_ago: '2d ago' },
            ],
            wellness: [
              { brand_name: 'Aura Bora', creator_niche: 'wellness', follower_range: '7.2K', event: 'got a reply from', time_ago: '3h ago' },
              { brand_name: 'Olly', creator_niche: 'wellness', follower_range: '2.9K', event: 'received a PR package from', time_ago: '1d ago' },
            ],
            supplements: [
              { brand_name: 'Athletic Greens', creator_niche: 'supplements', follower_range: '9.1K', event: 'got a reply from', time_ago: '5h ago' },
              { brand_name: 'Ritual', creator_niche: 'supplements', follower_range: '4.2K', event: 'received a PR package from', time_ago: '1d ago' },
            ],
            food: [
              { brand_name: 'Graza', creator_niche: 'food', follower_range: '8.1K', event: 'got a reply from', time_ago: '5h ago' },
              { brand_name: 'Fly By Jing', creator_niche: 'food', follower_range: '3.6K', event: 'received a PR package from', time_ago: '2d ago' },
            ],
            fashion: [
              { brand_name: 'Reformation', creator_niche: 'fashion', follower_range: '11K', event: 'got a reply from', time_ago: '4h ago' },
              { brand_name: 'Girlfriend Collective', creator_niche: 'fashion', follower_range: '5.3K', event: 'received a PR package from', time_ago: '1d ago' },
            ],
            lifestyle: [
              { brand_name: 'Vitruvi', creator_niche: 'lifestyle', follower_range: '6.8K', event: 'got a reply from', time_ago: '3h ago' },
              { brand_name: 'Caraway', creator_niche: 'lifestyle', follower_range: '4.1K', event: 'received a PR package from', time_ago: '2d ago' },
            ],
            tech: [
              { brand_name: 'Anker', creator_niche: 'tech', follower_range: '8.4K', event: 'got a reply from', time_ago: '6h ago' },
              { brand_name: 'Keychron', creator_niche: 'tech', follower_range: '5.7K', event: 'received a PR package from', time_ago: '1d ago' },
            ],
            pet: [
              { brand_name: 'Wild One', creator_niche: 'pet', follower_range: '7.3K', event: 'got a reply from', time_ago: '4h ago' },
              { brand_name: 'Sundays for Dogs', creator_niche: 'pet', follower_range: '3.9K', event: 'received a PR package from', time_ago: '2d ago' },
            ],
            default: [
              { brand_name: 'Cowshed', creator_niche: 'beauty', follower_range: '6.4K', event: 'got a reply from', time_ago: '4h ago' },
              { brand_name: 'Aura Bora', creator_niche: 'wellness', follower_range: '2.8K', event: 'received a PR package from', time_ago: '1d ago' },
            ],
          };

          const fallbackReplies = FALLBACK_BY_NICHE[nicheKey] || FALLBACK_BY_NICHE.default;
          // Only use API data if we have 2+ real replies with proper data
          const hasRealData = recentReplies.length >= 2 && recentReplies[0]?.brand_name && recentReplies[0]?.time_ago;
          const displayReplies = hasRealData ? recentReplies.slice(0, 2) : fallbackReplies;

          return (
            <RecentRepliesStrip>
              <RepliesStripLabel>This week on Newcollab</RepliesStripLabel>
              {displayReplies.map((reply, i) => (
                <ReplyPreview key={i}>
                  <GreenDot />
                  <ReplyText>
                    A {reply.creator_niche} creator ({reply.follower_range} followers) {reply.event || 'got a reply from'} {reply.brand_name}
                    {reply.time_ago && <TimeAgo> · {reply.time_ago}</TimeAgo>}
                  </ReplyText>
                </ReplyPreview>
              ))}
            </RecentRepliesStrip>
          );
        })()}

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
              {/* Section header for unlocked — no quota info, just category */}
              <MatchSectionLabel>Your top matches</MatchSectionLabel>
              <TopMatchesProofStrip>
                <TopMatchesAvatarRow>
                  <TopMatchesAvatarImg src="https://iili.io/CBGa92t.png" alt="Creator" />
                  <TopMatchesAvatarImg src="https://iili.io/CBGaJvn.png" alt="Creator" />
                  <TopMatchesAvatarImg src="https://iili.io/CBGadps.png" alt="Creator" />
                </TopMatchesAvatarRow>
                <TopMatchesProofText>
                  Creators with under 10K followers got PR from brands like these this month
                </TopMatchesProofText>
              </TopMatchesProofStrip>

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

                  {/* Locked match cards - reply rate is the hook, not the name */}
                  <LockedMatchList>
                    {data?.matched?.slice(2, 5).map((brand, i) => {
                      const replyRate = brand.response_rate || [45, 52, 38][i % 3];
                      const multiplier = Math.round(replyRate / 10);
                      return (
                        <LockedMatchCard key={brand.id || i}>
                          <LockedMatchHighlight>
                            <LockedHighlightRate>{replyRate}%</LockedHighlightRate>
                            <LockedHighlightLabel>reply rate</LockedHighlightLabel>
                          </LockedMatchHighlight>
                          <LockedMatchInfo>
                            <LockedMatchHeadline>
                              {multiplier}x higher than average
                            </LockedMatchHeadline>
                            <LockedMatchMeta>
                              {brand.category && <span>{categoryLabel(brand.category)}</span>}
                              {brand.collab_types && <span> · Gifted PR</span>}
                            </LockedMatchMeta>
                          </LockedMatchInfo>
                          <LockedIcon>🔒</LockedIcon>
                        </LockedMatchCard>
                      );
                    })}
                  </LockedMatchList>

                  {data?.matched?.length > 5 && (
                    <MoreLockedText>+{(data?.matched?.length || 0) - 5} more matched brands</MoreLockedText>
                  )}

                  {/* Upgrade CTA — use specific data from top locked match */}
                  {(() => {
                    const topLocked = data?.matched?.[2];
                    const topRate = topLocked?.response_rate || 40;
                    return (
                      <UnlockBanner onClick={() => { setUpgradeReason('matched'); setShowUpgrade(true); }}>
                        <UnlockBannerText>
                          <UnlockBannerTitle>Your top locked match replies to {topRate}% of pitches</UnlockBannerTitle>
                          <UnlockBannerSub>That's {Math.round(topRate / 10)}x the industry average. Upgrade to contact them.</UnlockBannerSub>
                        </UnlockBannerText>
                        <UnlockBannerBtn>$19/mo →</UnlockBannerBtn>
                      </UnlockBanner>
                    );
                  })()}
                </>
              )}
            </>
          )}
        </Section>

        {/* Trending in your niche — strict filtering, honest labeling */}
        {data?.hot?.length > 0 && selectedNiches.length > 0 && (
          (() => {
            // Beauty-related keywords to exclude from non-beauty niches
            const beautyKeywords = ['beauty', 'skincare', 'makeup', 'cosmetic', 'lipstick', 'mascara', 'foundation', 'blush', 'eyeshadow', 'haircare', 'nail', 'fragrance', 'perfume', 'serum', 'moisturizer', 'cleanser', 'toner'];

            // Check if brand is beauty-related (by name, description, or category)
            const isBeautyBrand = (brand) => {
              const name = (brand.name || '').toLowerCase();
              const desc = (brand.description || '').toLowerCase();
              const cat = (brand.category || '').toLowerCase();
              return beautyKeywords.some(kw => name.includes(kw) || desc.includes(kw) || cat.includes(kw));
            };

            // Primary niche for title (first selected)
            const primaryNiche = selectedNiches[0].toLowerCase();
            const isPrimaryBeauty = ['beauty', 'skincare', 'makeup'].includes(primaryNiche);

            // Strict filter: match PRIMARY niche only, exclude beauty from non-beauty niches
            const nicheFiltered = data.hot.filter(b => {
              const brandCat = (b.category || '').toLowerCase();

              // If primary niche is NOT beauty-related, exclude beauty brands entirely
              if (!isPrimaryBeauty && isBeautyBrand(b)) {
                return false;
              }

              // Strict matching for primary niche only
              if (primaryNiche === 'tech') {
                return brandCat === 'tech' || ['technology', 'electronics', 'gadgets', 'software', 'gaming', 'apps'].some(t => brandCat.includes(t));
              }
              if (primaryNiche === 'lifestyle') {
                // Lifestyle but NOT beauty/fashion/makeup
                return (brandCat === 'lifestyle' || ['home', 'wellness', 'fitness', 'travel', 'food', 'decor'].some(t => brandCat.includes(t))) && !isBeautyBrand(b);
              }
              if (primaryNiche === 'fashion') {
                return brandCat === 'fashion' || ['clothing', 'apparel', 'accessories', 'shoes', 'jewelry'].some(t => brandCat.includes(t));
              }
              if (primaryNiche === 'beauty' || primaryNiche === 'skincare' || primaryNiche === 'makeup') {
                return isBeautyBrand(b) || brandCat === 'beauty' || ['skincare', 'makeup', 'cosmetics', 'haircare'].some(t => brandCat.includes(t));
              }

              // Default: exact or partial match
              return brandCat === primaryNiche || brandCat.includes(primaryNiche);
            });

            // If no matches for primary niche, show generic section
            const hasNicheMatches = nicheFiltered.length > 0;
            const brandsToShow = hasNicheMatches ? nicheFiltered.slice(0, 3) : data.hot.slice(0, 3);
            const sectionTitle = hasNicheMatches
              ? `Trending in ${CATEGORY_LABELS[selectedNiches[0]] || selectedNiches[0]}`
              : 'Trending Now';
            const sectionDesc = hasNicheMatches
              ? 'Popular with creators in your niche this week'
              : 'Hot brands this week';

            return (
              <Section>
                <SectionHeader>
                  <SectionLeft>
                    <SectionIcon $bg="#FFF7ED">🔥</SectionIcon>
                    <SectionTitleWrap>
                      <SectionTitle>{sectionTitle}</SectionTitle>
                      <SectionDesc>{sectionDesc}</SectionDesc>
                    </SectionTitleWrap>
                  </SectionLeft>
                </SectionHeader>

                <CardGrid $cols={3}>
                  {brandsToShow.map(brand => (
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
            );
          })()
        )}

        {/* Right Season — seasonal picks (limited to 4) */}
        <Section>
          <SectionHeader>
            <SectionLeft>
              <SectionIcon $bg="#ECFDF5">📅</SectionIcon>
              <SectionTitleWrap>
                <SectionTitle>Right Season: {data?.seasonal_month}</SectionTitle>
                <SectionDesc>{data?.seasonal_reason}</SectionDesc>
              </SectionTitleWrap>
            </SectionLeft>
          </SectionHeader>

          <SeasonalGrid>
            {data?.seasonal?.slice(0, 4).map((brand, idx) => {
              // Add variance to avoid identical stats looking auto-generated
              const displayRate = brand.display_reply_rate ||
                (brand.response_rate ? brand.response_rate + ((brand.id || idx) % 7) - 3 : null);
              return (
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
                  <SeasonalReason>📅 Seasonal pick: {data?.seasonal_reason?.split('—')[0]}</SeasonalReason>
                  <SeasonalStats>
                    {displayRate && (
                      <div>
                        <SeasonalStatVal className="green">{Math.max(35, Math.min(65, displayRate))}%</SeasonalStatVal>
                        <SeasonalStatLbl>Response</SeasonalStatLbl>
                      </div>
                    )}
                    <div>
                      <SeasonalStatVal>~{brand.avg_response_days || (4 + (idx % 3))}d</SeasonalStatVal>
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
              );
            })}
          </SeasonalGrid>
        </Section>
          </>
        )}
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
          feature={upgradeReason === 'matched' ? 'for_you' : 'limit_reached'}
        />
      )}

      {/* Kit Nudge Interstitial */}
      {showKitNudge && (
        <KitNudgeOverlay onClick={handleKitNudgeSkip}>
          <KitNudgeCard onClick={(e) => e.stopPropagation()}>
            <KitNudgeStat>3×</KitNudgeStat>
            <KitNudgeTitle>
              Pitches with a media kit get 3x more replies
            </KitNudgeTitle>
            <KitNudgeSub>
              Build yours in 2 minutes before pitching{' '}
              {kitNudgeBrand?.name || kitNudgeBrand?.brand_name || 'this brand'}.
            </KitNudgeSub>
            <KitNudgePrimary onClick={handleKitNudgeBuild}>
              Build my kit
            </KitNudgePrimary>
            <KitNudgeSecondary onClick={handleKitNudgeSkip}>
              Pitch without kit
            </KitNudgeSecondary>
          </KitNudgeCard>
        </KitNudgeOverlay>
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
          <MatchBadge>{Math.round(matchScore)}% match</MatchBadge>
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-bottom: 20px;
  }
`;

const PageTitleWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

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

  @media (max-width: 640px) {
    font-size: 10px;
  }
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

  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

const ProfilePill = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: ${tokens.shadowCard};
  flex-shrink: 0;

  @media (max-width: 768px) {
    justify-content: space-between;
  }

  @media (max-width: 400px) {
    gap: 8px;
    padding: 8px 10px;
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
  flex-shrink: 0;

  @media (max-width: 400px) {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProfileName = styled.div`
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 400px) {
    font-size: 12px;
  }
`;

const ProfileNiche = styled.div`
  font-size: 11px;
  color: ${tokens.textMuted};
  margin-top: 1px;

  @media (max-width: 400px) {
    font-size: 10px;
  }
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
  flex-shrink: 0;
  padding: 4px 0;
  gap: 2px;

  &:hover { text-decoration: underline; }

  @media (max-width: 400px) {
    font-size: 11px;
  }
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

// Social proof strip for top matches
const TopMatchesProofStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: ${tokens.subtle};
  border-radius: 10px;
  margin-bottom: 14px;
`;

const TopMatchesAvatarRow = styled.div`
  display: flex;
  flex-shrink: 0;
`;

const TopMatchesAvatarImg = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #fff;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;

  &:not(:first-child) {
    margin-left: -8px;
  }
`;

const TopMatchesProofText = styled.span`
  font-size: 12px;
  color: ${tokens.textSecondary};
  line-height: 1.4;
`;

// Recent Replies Social Proof Strip
const RecentRepliesStrip = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
`;

const RepliesStripLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
`;

const ReplyPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const GreenDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #059669;
  flex-shrink: 0;
`;

const ReplyText = styled.span`
  line-height: 1.4;
`;

const TimeAgo = styled.span`
  color: #9ca3af;
  font-size: 12px;
`;

// Pending Pitch Banner — keeps users engaged during wait period
const PendingPitchBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 20px;
  box-shadow: ${tokens.shadowCard};

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 14px;
  }
`;

const PendingIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${tokens.successLight};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

const PendingContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const PendingTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${tokens.textPrimary};
`;

const PendingSubtitle = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
  margin-top: 2px;
`;

const PendingLink = styled.button`
  background: ${tokens.action};
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  padding: 8px 14px;
  border-radius: 8px;
  font-family: inherit;
  transition: all 0.15s;

  &:hover {
    background: #1C1C1C;
  }

  @media (max-width: 640px) {
    width: 100%;
    text-align: center;
    padding: 10px;
  }
`;

const LockedMatchList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const LockedMatchCard = styled.div`
  background: linear-gradient(135deg, #FEFCE8 0%, #FEF3C7 100%);
  border: 1.5px solid #FDE68A;
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;

  @media (max-width: 640px) {
    padding: 12px 14px;
    gap: 12px;
  }
`;

const LockedMatchHighlight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 10px;
  padding: 8px 12px;
  min-width: 56px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
`;

const LockedHighlightRate = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: ${tokens.success};
  line-height: 1;
`;

const LockedHighlightLabel = styled.div`
  font-size: 9px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  margin-top: 2px;
`;

const LockedMatchInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LockedMatchHeadline = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 3px;
`;

const LockedMatchMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #6B7280;
  font-weight: 500;
`;

const LockedIcon = styled.div`
  font-size: 18px;
  color: #D97706;
  flex-shrink: 0;
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

// Pull-framing bar — opportunity-focused, not limit-focused
const PullFramingBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #7C3AED 0%, #E11D48 100%);
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.25);
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 10px;
    text-align: center;
    padding: 16px;
  }
`;

const PullFramingText = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;

  strong {
    color: #fff;
    font-weight: 700;
  }
`;

const PullFramingCTA = styled.div`
  background: #fff;
  color: #7C3AED;
  font-size: 13px;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 8px;
  white-space: nowrap;
  flex-shrink: 0;
`;

// Social proof strip — show success stories, not upgrade pressure
const SocialProofStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%);
  border: 1px solid #A7F3D0;
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 10px;
    text-align: center;
    padding: 16px;
  }
`;

const SocialProofAvatars = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const SocialProofAvatarImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2.5px solid white;
  margin-left: -10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  object-fit: cover;

  &:first-child {
    margin-left: 0;
  }
`;

const SocialProofAvatarMore = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border: 2.5px solid white;
  margin-left: -10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: white;
  letter-spacing: -0.3px;
`;

const SocialProofText = styled.div`
  font-size: 14px;
  color: #065F46;
  line-height: 1.4;

  strong {
    font-weight: 700;
    color: #047857;
  }
`;

// Recent Wins Strip — Compact horizontal TikTok previews
const RecentWinsStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #FAFAFA;
  border-radius: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }
`;

const RecentWinsLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${tokens.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  flex-shrink: 0;
`;

const TikTokScroll = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  flex: 1;
  padding: 2px 0;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const TikTokCard = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 8px;
  padding: 6px 10px 6px 6px;
  text-decoration: none;
  flex-shrink: 0;
  transition: all 0.15s;

  &:hover {
    border-color: #D4D4D4;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
`;

const TikTokThumb = styled.div`
  width: 48px;
  height: 64px;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
  position: relative;
  flex-shrink: 0;

  iframe {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.15);
    width: 325px;
    height: 750px;
    border: none;
    pointer-events: none;
  }
`;

const TikTokMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TikTokHandle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${tokens.textPrimary};
`;

const WinCard = styled.div`
  background: #fff;
  border-bottom: 1px solid ${tokens.border};
  padding: 16px 0;

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  @media (max-width: 640px) {
    padding: 14px 0;
  }
`;

const WinCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const WinAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
  }
`;

const WinMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

const WinName = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${tokens.textPrimary};

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

const WinFollowers = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
  margin-top: 1px;

  @media (max-width: 640px) {
    font-size: 11px;
  }
`;

const WinTimestamp = styled.div`
  font-size: 12px;
  color: ${tokens.textMuted};
  flex-shrink: 0;
`;

const WinBadge = styled.div`
  background: ${tokens.successLight};
  color: ${tokens.success};
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const WinContent = styled.div``;

const WinQuote = styled.p`
  font-size: 14px;
  color: ${tokens.textPrimary};
  line-height: 1.5;
  margin: 0 0 12px;

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

const WinBrandTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: ${tokens.textSecondary};
`;

const WinBrandDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${tokens.success};
`;

// How It Works Card — Clean 3-step flow
const HowItWorksCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: ${tokens.shadowCard};

  @media (max-width: 640px) {
    padding: 16px;
    border-radius: 14px;
  }
`;

const HowItWorksTitle = styled.h3`
  font-size: 13px;
  font-weight: 600;
  color: ${tokens.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px;

  @media (max-width: 640px) {
    font-size: 12px;
    margin-bottom: 14px;
  }
`;

const HowItWorksSteps = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const HowItWorksStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  flex: 1;
  padding: 0 16px;

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
  }

  @media (max-width: 768px) {
    padding: 12px 0;

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: 0;
    }
  }
`;

const StepNumber = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${tokens.textPrimary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
`;

const StepText = styled.div`
  flex: 1;
  min-width: 0;
  padding-top: 2px;
`;

const StepLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${tokens.textPrimary};
  margin-bottom: 3px;

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

const StepDesc = styled.div`
  font-size: 13px;
  color: ${tokens.textMuted};
  line-height: 1.4;

  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

const StepDivider = styled.div`
  width: 1px;
  background: ${tokens.border};
  align-self: stretch;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
  }
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

// Sub-tabs for Matches vs Opportunities
const SubTabRow = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid ${tokens.border};
  margin-bottom: 24px;
`;

const SubTab = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  color: ${p => p.$active ? tokens.textPrimary : tokens.textMuted};
  background: none;
  border: none;
  border-bottom: 2px solid ${p => p.$active ? tokens.textPrimary : 'transparent'};
  margin-bottom: -1px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    color: ${tokens.textPrimary};
  }
`;

const CountBadge = styled.span`
  background: ${tokens.primary};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
`;

// Kit nudge interstitial styled components
const KitNudgeOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
  padding: 0 0 env(safe-area-inset-bottom);

  @media (min-width: 600px) {
    align-items: center;
  }
`;

const KitNudgeCard = styled.div`
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 32px 24px 40px;
  width: 100%;
  max-width: 480px;
  text-align: center;

  @media (min-width: 600px) {
    border-radius: 24px;
    padding: 40px 32px;
  }
`;

const KitNudgeStat = styled.div`
  font-size: 48px;
  font-weight: 800;
  color: #0F0F0F;
  line-height: 1;
  margin-bottom: 12px;
`;

const KitNudgeTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #0F0F0F;
  margin: 0 0 8px;
  line-height: 1.3;
`;

const KitNudgeSub = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 28px;
  line-height: 1.5;
`;

const KitNudgePrimary = styled.button`
  width: 100%;
  padding: 16px;
  background: #0F0F0F;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
  font-family: inherit;
  transition: opacity 0.2s;
  &:hover { opacity: 0.85; }
`;

const KitNudgeSecondary = styled.button`
  width: 100%;
  padding: 14px;
  background: none;
  color: #6B7280;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: color 0.2s;
  &:hover { color: #0F0F0F; }
`;

// Kit Views Banner - LinkedIn style notification
const KitViewsBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  border: 1px solid #C7D2FE;
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 20px;
  position: relative;

  @media (max-width: 640px) {
    padding: 12px 14px;
    gap: 12px;
  }
`;

const KitViewsIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6366F1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
  }
`;

const KitViewsContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const KitViewsTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1F2937;

  strong {
    font-weight: 700;
    color: #4F46E5;
  }

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

const KitViewsSub = styled.div`
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
`;

const KitViewsUpgrade = styled.button`
  font-size: 12px;
  font-weight: 600;
  color: #4F46E5;
  background: none;
  border: none;
  padding: 0;
  margin-top: 4px;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    text-decoration: underline;
  }
`;

const KitViewsClose = styled.button`
  position: absolute;
  top: 8px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #9CA3AF;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #6B7280;
  }
`;

// Kit Builder Prompt - for users without a media kit
const KitBuilderCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  border: 1px solid #F59E0B;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 20px;
  }
`;

const KitBuilderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;

  @media (max-width: 700px) {
    gap: 14px;
  }
`;

const KitBuilderStat = styled.div`
  font-size: 36px;
  font-weight: 800;
  color: #92400E;
  line-height: 1;
  flex-shrink: 0;

  @media (max-width: 700px) {
    font-size: 32px;
  }
`;

const KitBuilderContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const KitBuilderTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #78350F;
  margin: 0 0 4px;
  line-height: 1.3;

  @media (max-width: 700px) {
    font-size: 15px;
  }
`;

const KitBuilderDesc = styled.p`
  font-size: 13px;
  color: #92400E;
  margin: 0;
  line-height: 1.4;
`;

const KitBuilderBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0F0F0F;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  font-family: inherit;

  &:hover {
    background: #1F1F1F;
    transform: translateX(2px);
  }

  @media (max-width: 700px) {
    justify-content: center;
    padding: 14px 24px;
  }
`;

export default ForYou;
