import React, { useState, useEffect, useContext, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Mail, Heart, Check, Users, Sparkles, Lock, ChevronRight, Eye, FileText, ArrowRight, Crown } from 'lucide-react';
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

// Niche options WITH emoji labels — MUST match onboarding for consistency
// Keep in sync with CreatorOnboarding.js NICHES array
const NICHE_OPTIONS = [
  { id: 'beauty', label: '💄 Beauty' },
  { id: 'skincare', label: '🧴 Skincare' },
  { id: 'haircare', label: '💇 Haircare' },
  { id: 'fashion', label: '👗 Fashion' },
  { id: 'jewelry', label: '💍 Jewelry' },
  { id: 'activewear', label: '🏃 Activewear' },
  { id: 'fitness', label: '💪 Fitness' },
  { id: 'wellness', label: '🌿 Wellness' },
  { id: 'supplements', label: '💊 Supplements' },
  { id: 'food', label: '🍽️ Food & Beverage' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'lifestyle', label: '🏠 Lifestyle' },
  { id: 'home', label: '🏡 Home & Living' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'gaming', label: '🎮 Gaming' },
  { id: 'pet', label: '🐾 Pet' },
  { id: 'baby', label: '🍼 Baby & Parenting' },
  { id: 'sustainable', label: '♻️ Sustainable' },
  { id: 'luxury', label: '✨ Luxury' },
];

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
  const [unlockedIds, setUnlockedIds] = useState(new Set()); // Brands where contact was revealed
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [pitchesSentThisMonth, setPitchesSentThisMonth] = useState(0);

  // Profile prompt state
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [followerCount, setFollowerCount] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [showNicheEditor, setShowNicheEditor] = useState(false);
  const nicheEditorRef = useRef(null);

  // Close niche editor when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (nicheEditorRef.current && !nicheEditorRef.current.contains(e.target)) {
        setShowNicheEditor(false);
      }
    };
    if (showNicheEditor) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNicheEditor]);

  // Kit nudge interstitial state
  const [kitNudgeBrand, setKitNudgeBrand] = useState(null);
  const [showKitNudge, setShowKitNudge] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState(null);

  // Kit views notification state - "Who Viewed Your Kit" feature
  const [kitViews, setKitViews] = useState({ views_this_week: 0, brands_this_week: 0, views: [], is_pro: false });
  const [showKitViewsBanner, setShowKitViewsBanner] = useState(true);
  const [showKitViewsList, setShowKitViewsList] = useState(false);

  // Pending pitches state (for dead zone engagement)
  const [pendingPitches, setPendingPitches] = useState([]);

  // Sub-tab state for Matches vs Opportunities
  const [activeTab, setActiveTab] = useState('matches');
  const [pitchLimits, setPitchLimits] = useState({ used: 0, limit: 3, canPitch: true });
  const [unlockBalance, setUnlockBalance] = useState({ remaining: 5, tier: 'free', reset_at: null, is_unlimited: false });
  const [opportunityCount, setOpportunityCount] = useState(0);

  // Recent replies for social proof strip (notification feed)
  const [recentReplies, setRecentReplies] = useState([]);
  // Daily pitch count - calculated based on time of day for realistic feel
  // Starts low in morning, increases throughout the day
  const [todayPitchCount, setTodayPitchCount] = useState(() => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Base rate: ~4 pitches per hour on average, starting from 6am
    // 6am-9am: slower (2/hr), 9am-6pm: peak (5/hr), 6pm-11pm: moderate (3/hr)
    let basePitches = 0;
    if (hours >= 6) {
      const activeHours = hours - 6;
      // Morning ramp up (6am-9am): 2 pitches/hr
      const morningHours = Math.min(Math.max(activeHours, 0), 3);
      basePitches += morningHours * 2;
      // Peak hours (9am-6pm): 5 pitches/hr
      const peakHours = Math.min(Math.max(activeHours - 3, 0), 9);
      basePitches += peakHours * 5;
      // Evening (6pm-11pm): 3 pitches/hr
      const eveningHours = Math.max(activeHours - 12, 0);
      basePitches += eveningHours * 3;
      // Add partial hour contribution
      basePitches += Math.floor((minutes / 60) * 3);
    }
    // Add small random variance (+/- 5)
    return Math.max(basePitches + Math.floor(Math.random() * 11) - 5, 0);
  });
  const [socialFeedNotifs, setSocialFeedNotifs] = useState([]);
  const [realBrands, setRealBrands] = useState([]);

  // Pool promo banner state
  const [poolStats, setPoolStats] = useState(null);
  const [poolActiveMembers, setPoolActiveMembers] = useState([]);
  const [hasRecentPoolActivity, setHasRecentPoolActivity] = useState(false);

  // Welcome modal for new users (post-onboarding)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomePitchedIds, setWelcomePitchedIds] = useState(new Set()); // Track brands pitched within welcome flow
  const [isWelcomeFlow, setIsWelcomeFlow] = useState(false); // Flag to return to modal after pitch

  // Upgrade CTA impression tracking
  const [bannerSeen, setBannerSeen] = useState(false);
  const bannerRef = useRef(null);

  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'elite';
  const atLimit = !isPro && pitchesSentThisMonth >= FREE_PITCH_LIMIT;

  useEffect(() => {
    fetchData();
    fetchSubscriptionStatus();
    fetchSavedBrands();
    fetchUnlockedBrands();
    fetchCreatorProfile();
    fetchKitViews();
    fetchOpportunityCount();
    fetchRecentReplies();
    fetchSocialProofBrands();
    fetchPoolData();
  }, []);

  // Check for onboarding completion and show welcome modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const justOnboarded = urlParams.get('onboarding') === 'complete' ||
                          sessionStorage.getItem('justCompletedOnboarding') === 'true';

    if (justOnboarded && !loading && data?.matched?.length > 0) {
      // Only show if user hasn't dismissed it before in this session
      const hasSeenWelcome = sessionStorage.getItem('welcomeModalShown');
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true);
        sessionStorage.setItem('welcomeModalShown', 'true');
        // Clean up the URL param
        if (urlParams.get('onboarding')) {
          urlParams.delete('onboarding');
          const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
          window.history.replaceState({}, '', newUrl);
        }
        // Clear onboarding flag
        sessionStorage.removeItem('justCompletedOnboarding');
      }
    }
  }, [loading, data]);

  // Check for upgrade query param (from email CTAs)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeParam = urlParams.get('upgrade');

    if (upgradeParam) {
      // Map upgrade param to reason text
      const reasonMap = {
        'kit_views': 'See which brands viewed your kit and send follow-up pitches',
        'pitch_limit': 'Send unlimited pitches to any brand',
        'default': 'Unlock Pro features'
      };
      setUpgradeReason(reasonMap[upgradeParam] || reasonMap.default);
      setShowUpgrade(true);

      // Clean up URL
      urlParams.delete('upgrade');
      urlParams.delete('utm_source');
      urlParams.delete('utm_medium');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // ── Social proof notification feed: creator pool and brands ──
  const SOCIAL_CREATORS = useMemo(() => [
    { initials: 'S', color: '#f97316', handle: '@sarah.wellness', followers: '8.2K', niche: 'fitness & wellness', platform: 'ig' },
    { initials: 'J', color: '#7c3aed', handle: '@jadebeautyy', followers: '3.4K', niche: 'beauty', platform: 'tt' },
    { initials: 'M', color: '#059669', handle: '@maya.eats', followers: '6.1K', niche: 'food & bev', platform: 'ig' },
    { initials: 'A', color: '#0ea5e9', handle: '@alex.fit', followers: '12K', niche: 'fitness', platform: 'ig' },
    { initials: 'P', color: '#e11d48', handle: '@petite.skin', followers: '4.7K', niche: 'skincare', platform: 'tt' },
    { initials: 'L', color: '#d97706', handle: '@lena.wellness', followers: '9.3K', niche: 'wellness', platform: 'ig' },
    { initials: 'R', color: '#6366f1', handle: '@runwithrose', followers: '2.9K', niche: 'fitness', platform: 'tt' },
    { initials: 'C', color: '#14b8a6', handle: '@chloe.eats', followers: '5.5K', niche: 'food & bev', platform: 'ig' },
  ], []);

  // Use real brands from API if available, otherwise fall back to empty
  // The API returns brands that definitely exist in our database
  const SOCIAL_BRANDS = useMemo(() => {
    if (realBrands.length > 0) {
      return realBrands;
    }
    // Fallback: return empty - will wait for API
    return [];
  }, [realBrands]);

  // Initialize social feed with 3 notifications when brands are loaded
  useEffect(() => {
    if (SOCIAL_BRANDS.length === 0) return; // Wait for real brands to load
    const initNotifs = SOCIAL_CREATORS.slice(0, 3).map((c, i) => ({
      ...c,
      brand: SOCIAL_BRANDS[i % SOCIAL_BRANDS.length],
      timeLabel: ['just now', '14m ago', '1h ago'][i],
      id: `init-${i}`,
      isNew: i === 0,
    }));
    setSocialFeedNotifs(initNotifs);
  }, [SOCIAL_CREATORS, SOCIAL_BRANDS]);

  // Live notification injection every ~6 seconds
  const notifIndexRef = useRef(3);
  useEffect(() => {
    if (SOCIAL_BRANDS.length === 0) return; // Don't run until brands are loaded
    const interval = setInterval(() => {
      setSocialFeedNotifs(prev => {
        // Age existing time labels
        const aged = prev.map(n => {
          let newTime = n.timeLabel;
          if (newTime === 'just now') newTime = '1m ago';
          else if (newTime === '1m ago') newTime = '3m ago';
          else if (newTime === '3m ago') newTime = '7m ago';
          return { ...n, timeLabel: newTime, isNew: false };
        });

        // Pick next creator (cycle through pool)
        const idx = notifIndexRef.current % SOCIAL_CREATORS.length;
        const creator = SOCIAL_CREATORS[idx];
        const brand = SOCIAL_BRANDS[Math.floor(Math.random() * SOCIAL_BRANDS.length)];
        notifIndexRef.current++;

        // Insert new at top, keep max 3
        const newNotif = {
          ...creator,
          brand,
          timeLabel: 'just now',
          id: `notif-${Date.now()}`,
          isNew: true,
        };
        return [newNotif, ...aged].slice(0, 3);
      });
    }, 5800);

    return () => clearInterval(interval);
  }, [SOCIAL_CREATORS, SOCIAL_BRANDS]);

  // Increment today's pitch count slowly during session
  // Adds 0-1 pitch every 15-25 seconds to feel organic
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayPitchCount(c => c + (Math.random() > 0.6 ? 1 : 0));
    }, 15000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, []);

  // Track upgrade banner impressions for conversion optimization
  useEffect(() => {
    if (!isPro && bannerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !bannerSeen) {
              setBannerSeen(true);
              // Track impression
              axios.post(`${API_BASE}/api/track-event`, {
                event: 'upgrade_cta_impression',
                location: 'for_you_banner',
                user_id: user?.creator_id
              }).catch(err => console.error('Tracking error:', err));
            }
          });
        },
        { threshold: 0.5 } // 50% visible
      );

      observer.observe(bannerRef.current);
      return () => observer.disconnect();
    }
  }, [isPro, bannerSeen, user]);

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

  const fetchSocialProofBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/social-proof-brands`, {
        withCredentials: true
      });
      if (response.data.success && response.data.brands?.length > 0) {
        setRealBrands(response.data.brands);
      }
    } catch (error) {
      // Silently fail - use fallback brands
    }
  };

  const fetchPoolData = async () => {
    try {
      const [statsRes, membersRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE}/api/pool/stats`, { withCredentials: true }),
        axios.get(`${API_BASE}/api/pool/active-members`, { withCredentials: true }),
        axios.get(`${API_BASE}/api/pool/recent-activity`, { withCredentials: true })
      ]);
      if (statsRes.data) setPoolStats(statsRes.data);
      if (membersRes.data?.members) setPoolActiveMembers(membersRes.data.members);
      if (activityRes.data) setHasRecentPoolActivity(activityRes.data.has_recent_activity);
    } catch (error) {
      // Silently fail - pool promo is optional
    }
  };

  const fetchKitViews = async () => {
    try {
      // Use new PR CRM endpoint with brand attribution
      const response = await axios.get(`${API_BASE}/api/pr-crm/kit-views`, {
        withCredentials: true
      });
      if (response.data?.success) {
        setKitViews(response.data);
      }
    } catch (error) {
      // Fallback to old endpoint if new one not deployed
      try {
        const fallback = await axios.get(`${API_BASE}/api/portfolio/views`, {
          withCredentials: true
        });
        if (fallback.data) {
          setKitViews({ ...fallback.data, brands_this_week: 0, views: [], is_pro: isPro });
        }
      } catch {
        // Silently fail
      }
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
          // Normalize niches to lowercase to match NICHE_OPTIONS IDs
          const rawNiches = response.data.profile.niches || [];
          const normalizedNiches = rawNiches.map(n =>
            typeof n === 'string' ? n.toLowerCase().trim() : ''
          ).filter(Boolean);
          setSelectedNiches(normalizedNiches);
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

  // Separate function to fetch unlock balance - can be called after pitch generation
  const fetchUnlockBalance = async () => {
    try {
      const unlockResponse = await axios.get(`${API_BASE}/api/pr-crm/unlocks/balance`, {
        withCredentials: true
      });
      if (unlockResponse.data.success) {
        setUnlockBalance(unlockResponse.data);
      }
    } catch (unlockErr) {
      console.log('Unlock balance not available yet');
    }
  };

  // Fetch list of brands the user has already unlocked (for showing "Unlocked" badge)
  const fetchUnlockedBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/unlocks/brands`, {
        withCredentials: true
      });
      if (response.data.success) {
        setUnlockedIds(new Set(response.data.unlocked_brand_ids));
      }
    } catch (err) {
      console.log('Unlocked brands not available yet');
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

      // Fetch unlock balance for credit unlock model
      await fetchUnlockBalance();
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

      // Track in welcome flow if applicable
      if (isWelcomeFlow) {
        setWelcomePitchedIds(prev => new Set([...prev, contactedBrand.id]));
      }
    }
    setPitchingBrand(null);

    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/pitch-limits`, {
        withCredentials: true
      });
      if (response.data.success) {
        setPitchesSentThisMonth(response.data.used || 0);
        setPitchLimits(response.data);
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

      // If in welcome flow, return to welcome modal instead of navigating
      if (isWelcomeFlow) {
        // Check if all 5 welcome brands have been unlocked
        // Use Set to calculate correct count (brand may already be tracked from onUnlockUsed)
        const newUnlockedCount = new Set([...welcomePitchedIds, contactedBrand.id]).size;
        if (newUnlockedCount >= 5) {
          // All 5 done - close welcome flow
          setIsWelcomeFlow(false);
          setShowWelcomeModal(false);
          message.success('You unlocked all 5 contacts! Check your pipeline for replies.');
          navigate('/creator/dashboard/pr-pipeline');
        } else {
          // More brands to unlock - show modal again
          setShowWelcomeModal(true);
        }
      } else {
        navigate(`/creator/dashboard/pr-pipeline?confirmBrand=${contactedBrand.id}&method=${method}`);
      }
    }
  }, [pitchingBrand, navigate, isWelcomeFlow, welcomePitchedIds]);

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

  // Direct Stripe checkout (skip settings page)
  const handleDirectUpgrade = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/subscription/create-checkout`,
        { tier: 'pro' },
        { withCredentials: true }
      );
      window.location.href = response.data.checkout_url;
    } catch (error) {
      console.error('Upgrade error:', error);
      // Fallback to settings page
      navigate('/creator/dashboard/settings');
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
            <PageTitle>{data?.matched?.length || 0} brands matched to your content</PageTitle>
            <PageSub>Contact them in one tap — your free PR package is one pitch away</PageSub>
          </PageTitleWrap>
          {data?.has_profile && (
            <ProfilePillWrapper ref={nicheEditorRef}>
              <ProfilePill onClick={() => setShowNicheEditor(!showNicheEditor)}>
                <ProfileInfo>
                  <ProfileName>
                  ✦ {selectedNiches.slice(0, 2).map(n => CATEGORY_LABELS[n] || n).join(' & ')}
                  {selectedNiches.length > 2 && <MoreNiches>+{selectedNiches.length - 2}</MoreNiches>}
                </ProfileName>
                  <ProfileNiche>
                    {parseInt(followerCount) >= 1000
                      ? `${(parseInt(followerCount) / 1000).toFixed(0)}K followers`
                      : parseInt(followerCount) > 0
                        ? `${followerCount} followers`
                        : ''}
                  </ProfileNiche>
                </ProfileInfo>
                <ProfileEditBtn>Edit</ProfileEditBtn>
              </ProfilePill>
              {showNicheEditor && (
                <NicheEditorDropdown>
                  <NicheEditorHeader>
                    <NicheEditorTitle>Update your niche</NicheEditorTitle>
                    <NicheEditorClose onClick={() => setShowNicheEditor(false)}>×</NicheEditorClose>
                  </NicheEditorHeader>
                  <NicheEditorGrid>
                    {NICHE_OPTIONS.map(niche => (
                      <NicheEditorChip
                        key={niche.id}
                        $selected={selectedNiches.includes(niche.id)}
                        onClick={() => setSelectedNiches(prev =>
                          prev.includes(niche.id) ? prev.filter(x => x !== niche.id) : [...prev, niche.id]
                        )}
                      >
                        {niche.label}
                      </NicheEditorChip>
                    ))}
                  </NicheEditorGrid>
                  <NicheEditorSave
                    disabled={selectedNiches.length === 0 || savingProfile}
                    onClick={() => { handleSaveProfile(); setShowNicheEditor(false); }}
                  >
                    {savingProfile ? 'Saving...' : 'Save changes'}
                  </NicheEditorSave>
                </NicheEditorDropdown>
              )}
            </ProfilePillWrapper>
          )}
        </PageHeader>

        {/* Persistent Quota Progress Banner */}
        {!isPro && data?.has_profile && !unlockBalance.is_unlimited && (() => {
          const remaining = unlockBalance.remaining || 0;
          const used = 5 - remaining;
          return (
            <QuotaBanner $exhausted={remaining <= 0}>
              <QuotaDots>
                {[0, 1, 2, 3, 4].map(i => (
                  <QuotaDot key={i} $filled={i < used} />
                ))}
              </QuotaDots>
              <QuotaText>
                <QuotaTitle>{remaining} remaining ({used} used of 5)</QuotaTitle>
                <QuotaSub>
                  {remaining <= 0
                    ? 'Get unlimited to contact all your matched brands'
                    : `Resets ${unlockBalance.reset_at ? new Date(unlockBalance.reset_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'next month'}`}
                </QuotaSub>
              </QuotaText>
              {remaining <= 0 ? (
                <QuotaUpgrade onClick={handleDirectUpgrade}>
                  Get unlimited →
                </QuotaUpgrade>
              ) : (
                <QuotaRemaining>
                  {remaining} remaining →
                </QuotaRemaining>
              )}
            </QuotaBanner>
          );
        })()}

        {/* Pro user banner */}
        {isPro && data?.has_profile && (
          <QuotaBanner $isPro>
            <QuotaText>
              <QuotaTitle>Pro · Unlimited</QuotaTitle>
              <QuotaSub>Contact any brand, anytime</QuotaSub>
            </QuotaText>
          </QuotaBanner>
        )}

        {/* Profile Prompt - shown when no niche data yet */}
        {!data?.has_profile && (
          <ProfilePromptCard>
            <PromptIcon>🎯</PromptIcon>
            <PromptTitle>Tell us about your niche</PromptTitle>
            <PromptSub>Takes 10 seconds and unlocks brands matched specifically to you</PromptSub>

            <NicheGrid>
              {NICHE_OPTIONS.map(niche => (
                <NicheChip
                  key={niche.id}
                  $selected={selectedNiches.includes(niche.id)}
                  onClick={() => setSelectedNiches(prev =>
                    prev.includes(niche.id) ? prev.filter(x => x !== niche.id) : [...prev, niche.id]
                  )}
                >
                  {niche.label}
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


        {/* How It Works — Temporarily commented out
        {!isPro && data?.has_profile && pitchedIds.size === 0 && (
          <HowItWorksCard>
            <HowItWorksHeader>
              <HowItWorksEyebrow>How it works</HowItWorksEyebrow>
              <HowItWorksTitle>Pick a brand. We do the rest. <span>You get free PR.</span></HowItWorksTitle>
            </HowItWorksHeader>

            <HowItWorksSteps>
              <HowItWorksStep>
                <StepIconWrap $bg="#fff0f3" $border="#fecdd3">
                  📧
                  <StepNumber>1</StepNumber>
                </StepIconWrap>
                <StepContent>
                  <StepOutcome>We find the right contact</StepOutcome>
                  <StepDetail>
                    Direct <strong>PR emails and application forms</strong> for brands that match your content.
                  </StepDetail>
                  <StepTime>⏱ No guessing</StepTime>
                </StepContent>
              </HowItWorksStep>

              <HowItWorksStep>
                <StepIconWrap $bg="#faf5ff" $border="#e9d5ff">
                  ✍️
                  <StepNumber>2</StepNumber>
                </StepIconWrap>
                <StepContent>
                  <StepOutcome>Your pitch is ready</StepOutcome>
                  <StepDetail>
                    A <strong>proven email template</strong> personalized to your profile. Review, edit, send.
                  </StepDetail>
                  <StepTime>⏱ 30 seconds</StepTime>
                </StepContent>
              </HowItWorksStep>

              <HowItWorksStep>
                <StepIconWrap $bg="#f0fdf4" $border="#bbf7d0">
                  🔁
                  <StepNumber>3</StepNumber>
                </StepIconWrap>
                <StepContent>
                  <StepOutcome>Keep pitching, land collabs</StepOutcome>
                  <StepDetail>
                    The secret? <strong>Professional, consistent outreach.</strong> The more you pitch, the more you land.
                  </StepDetail>
                  <StepTime $bg="#f0fdf4" $color="#059669">🎉 Free PR</StepTime>
                </StepContent>
              </HowItWorksStep>
            </HowItWorksSteps>
          </HowItWorksCard>
        )}
        */}

        {/* Kit Views Banner - "Who Viewed Your Kit" - headline Pro conversion feature */}
        {showKitViewsBanner && (kitViews.brands_this_week > 0 || kitViews.views_this_week > 0) && (
          <KitViewsBanner $highlight={!isPro}>
            <KitViewsIcon>
              <Eye size={18} />
            </KitViewsIcon>
            <KitViewsContent>
              <KitViewsTitle>
                🔥 <strong>{kitViews.brands_this_week || kitViews.views_this_week}</strong> {(kitViews.brands_this_week || kitViews.views_this_week) === 1 ? 'brand' : 'brands'} viewed your kit this week
              </KitViewsTitle>
              {isPro && kitViews.views?.length > 0 ? (
                <>
                  <KitViewsSub>
                    {kitViews.views.slice(0, 2).map(v => v.brand_name).join(', ')}
                    {kitViews.views.length > 2 && ` +${kitViews.views.length - 2} more`}
                  </KitViewsSub>
                  <KitViewsUpgrade onClick={() => setShowKitViewsList(!showKitViewsList)}>
                    {showKitViewsList ? 'Hide details ↑' : 'See all views →'}
                  </KitViewsUpgrade>
                </>
              ) : (
                <KitViewsUpgrade onClick={() => { setUpgradeReason('kit_views'); setShowUpgrade(true); }}>
                  Upgrade to see who's checking you out →
                </KitViewsUpgrade>
              )}
            </KitViewsContent>
            <KitViewsClose onClick={() => setShowKitViewsBanner(false)}>×</KitViewsClose>
          </KitViewsBanner>
        )}

        {/* Kit Views List - Pro users see full details */}
        {isPro && showKitViewsList && kitViews.views?.length > 0 && (
          <KitViewsList>
            {kitViews.views.map(view => (
              <KitViewRow key={view.id}>
                <KitViewBrandLogo>
                  {view.logo_url ? (
                    <img src={view.logo_url} alt={view.brand_name} />
                  ) : (
                    <span>{view.brand_name?.charAt(0) || '?'}</span>
                  )}
                </KitViewBrandLogo>
                <KitViewInfo>
                  <KitViewBrandName>{view.brand_name}</KitViewBrandName>
                  <KitViewMeta>
                    {view.category && <span>{view.category}</span>}
                    <span>{new Date(view.viewed_at).toLocaleDateString()}</span>
                    {view.view_count > 1 && <KitViewBadge>Viewed {view.view_count}x</KitViewBadge>}
                  </KitViewMeta>
                </KitViewInfo>
                {!view.has_replied && (
                  <KitViewAction onClick={() => navigate(`/creator/dashboard/inbox`)}>
                    Follow up →
                  </KitViewAction>
                )}
              </KitViewRow>
            ))}
          </KitViewsList>
        )}

        {/* Pool Promo Banner - viral, exciting design */}
        <PoolPromoBanner onClick={() => navigate('/creator/dashboard/pool')}>
          <PoolAvatarStack>
            {poolActiveMembers.length > 0 ? (
              poolActiveMembers.slice(0, 3).map((member, i) => (
                <PoolAvatarImg key={member.id} $index={i} $color={['#7C3AED', '#E11D48', '#0EA5E9'][i]}>
                  {member.profile_image_url ? (
                    <img src={member.profile_image_url} alt={member.username} />
                  ) : (
                    (member.display_name || member.username)?.[0]?.toUpperCase() || '?'
                  )}
                </PoolAvatarImg>
              ))
            ) : (
              <>
                <PoolAvatarImg $index={0} $color="#7C3AED">
                  <img src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/@justavatar.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvQGp1c3RhdmF0YXIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTc5NjcxMywiZXhwIjoyNDEyNTE2NzEzfQ.X-lOx8_72aWLHu2rC-MiqC2h43p5ebHIoqr98QAWcXo" alt="Creator" />
                </PoolAvatarImg>
                <PoolAvatarImg $index={1} $color="#E11D48">
                  <img src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/@fitspace.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvQGZpdHNwYWNlLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODE3OTY3NDUsImV4cCI6MTgxMzMzMjc0NX0.ltLA07dWixaQfRTfHc3ff36XOWT_ObEfBQgx15s-BC4" alt="Creator" />
                </PoolAvatarImg>
                <PoolAvatarImg $index={2} $color="#0EA5E9">
                  <img src="https://kyawgtojxoglvlhzsotm.supabase.co/storage/v1/object/sign/newcollab/fitness%20avatar.jpeg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83MmM4MjFmNC03NzYxLTRlYWUtYTYzOS0zN2NlNmRkNzIzNGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJuZXdjb2xsYWIvZml0bmVzcyBhdmF0YXIuanBlZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODE3OTY3NjYsImV4cCI6MTgxMzMzMjc2Nn0.QXbJRXzoXn1Kp_OoBaEl504k2qhoRybOCeSZIowPn40" alt="Creator" />
                </PoolAvatarImg>
              </>
            )}
          </PoolAvatarStack>
          <PoolBannerContent>
            {hasRecentPoolActivity && poolStats?.followers_this_month > 0 ? (
              <>
                <PoolBannerTitle>🔥 +{poolStats.followers_this_month} new followers this month</PoolBannerTitle>
                <PoolBannerSubtitle>Keep boosting to grow faster</PoolBannerSubtitle>
              </>
            ) : (
              <>
                <PoolBannerTitle>🚀 Grow your followers fast</PoolBannerTitle>
                <PoolBannerSubtitle>Join creators boosting each other</PoolBannerSubtitle>
              </>
            )}
          </PoolBannerContent>
          <PoolBannerCTA>
            {hasRecentPoolActivity ? 'Keep boosting →' : 'Join Pool →'}
          </PoolBannerCTA>
        </PoolPromoBanner>

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
        {/* Pending Pitch Banner — celebrates momentum */}
        {pendingPitches && pendingPitches.length > 0 && (
          <PendingPitchBanner>
            <PendingIcon>🎉</PendingIcon>
            <PendingContent>
              <PendingTitle>
                Nice work! You've reached out to {pendingPitches.length} {pendingPitches.length === 1 ? 'brand' : 'brands'}
              </PendingTitle>
              <PendingSubtitle>
                Keep going. Most creators land their first PR package after pitching 5-10 brands.
              </PendingSubtitle>
            </PendingContent>
            <PendingLink onClick={() => navigate('/creator/dashboard/pr-pipeline')}>
              View Inbox →
            </PendingLink>
          </PendingPitchBanner>
        )}

        {/* Live Activity Ticker - compact single line with horizontal scroll */}
        {socialFeedNotifs.length > 0 && (
          <LiveTicker>
            <TickerContent>
              <TickerDot />
              <TickerText>
                <strong>{todayPitchCount}</strong> pitches sent today
                {socialFeedNotifs.slice(0, 3).map((notif, i) => (
                  <React.Fragment key={notif.id}>
                    <TickerDivider>·</TickerDivider>
                    <TickerItem>{notif.handle} → {notif.brand?.name}</TickerItem>
                  </React.Fragment>
                ))}
              </TickerText>
            </TickerContent>
          </LiveTicker>
        )}

        {/* Section 1: Matched for You (Pro gate) */}
        <Section>
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
                  isUnlocked={unlockedIds.has(brand.id)}
                  atLimit={atLimit}
                  onPitch={() => handlePitchNow(brand)}
                  onUpgrade={() => { setUpgradeReason('matched'); setShowUpgrade(true); }}
                  matchScore={brand.match_score}
                />
              ))}
            </CardGrid>
          ) : (
            /* Free users: 3 visible cards + locked cards with visible stats */
            <>
              {/* First 3 visible cards - creates curiosity to see more */}
              <CardGrid $cols={3} style={{ marginBottom: 20 }}>
                {data?.matched?.slice(0, 3).map(brand => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    isPro={isPro}
                    hasPitched={pitchedIds.has(brand.id)}
                    isSaved={savedIds.has(brand.id)}
                    isUnlocked={unlockedIds.has(brand.id)}
                    atLimit={atLimit}
                    onPitch={() => handlePitchNow(brand)}
                    onUpgrade={() => { setUpgradeReason('matched'); setShowUpgrade(true); }}
                    matchScore={brand.match_score}
                  />
                ))}
              </CardGrid>

              {/* Locked matches section */}
              {data?.matched?.length > 3 && (
                <>
                  <MatchSectionLabel>🔒 {(data?.matched?.length || 0) - 3} more matches</MatchSectionLabel>

                  {/* Upgrade CTA — moved BEFORE locked cards for better visibility */}
                  <UnlockBanner
                    ref={bannerRef}
                    onClick={() => {
                      // Track click
                      axios.post(`${API_BASE}/api/track-event`, {
                        event: 'upgrade_cta_click',
                        location: 'for_you_banner',
                        user_id: user?.creator_id
                      }).catch(err => console.error('Tracking error:', err));
                      setUpgradeReason('matched_banner');
                      setShowUpgrade(true);
                    }}
                  >
                    <UnlockBannerContent>
                      <UnlockBannerIcon>
                        <Sparkles size={20} />
                      </UnlockBannerIcon>
                      <UnlockBannerText>
                        <UnlockBannerTitle>
                          {(data?.matched?.length || 0) - 3} more high-quality matches
                        </UnlockBannerTitle>
                        <UnlockBannerSub>
                          Unlock them with Pro · $19/mo for unlimited contacts
                        </UnlockBannerSub>
                      </UnlockBannerText>
                    </UnlockBannerContent>
                    <UnlockBannerBtn>
                      Get unlimited
                      <ArrowRight size={16} />
                    </UnlockBannerBtn>
                  </UnlockBanner>

                  {/* Locked match cards - modern glassmorphism design */}
                  <LockedMatchList>
                    {data?.matched?.slice(3, 6).map((brand, i) => {
                      const CARD_STATS = [
                        { rate: 48, multiplier: 5 },
                        { rate: 37, multiplier: 4 },
                        { rate: 29, multiplier: 3 },
                      ];
                      const stats = CARD_STATS[i] || CARD_STATS[0];
                      const replyRate = brand.response_rate || stats.rate;
                      return (
                        <LockedMatchCard
                          key={brand.id || i}
                          onClick={() => {
                            axios.post(`${API_BASE}/api/track-event`, {
                              event: 'upgrade_cta_click',
                              location: 'locked_card',
                              user_id: user?.creator_id
                            }).catch(err => console.error('Tracking error:', err));
                            setUpgradeReason('locked_card');
                            setShowUpgrade(true);
                          }}
                        >
                          <LockedCardBlur>
                            {brand.logo && <LockedBrandLogo src={brand.logo} alt="" />}
                          </LockedCardBlur>
                          <LockedCardContent>
                            <LockedStatBadge>
                              <LockedStatValue>{replyRate}%</LockedStatValue>
                              <LockedStatLabel>reply rate</LockedStatLabel>
                            </LockedStatBadge>
                            <LockedMatchInfo>
                              <LockedMatchHeadline>High-converting brand match</LockedMatchHeadline>
                              <LockedMatchMeta>
                                {brand.category && <span>{categoryLabel(brand.category)}</span>}
                                <span> · ~${brand.price_point || 45} PR value</span>
                              </LockedMatchMeta>
                            </LockedMatchInfo>
                            <LockedIcon>
                              <Lock size={16} />
                            </LockedIcon>
                            {/* Hover CTA - appears on card hover */}
                            <LockedCardCTA>
                              <span>Unlock with Pro</span>
                              <ArrowRight size={12} />
                            </LockedCardCTA>
                          </LockedCardContent>
                        </LockedMatchCard>
                      );
                    })}
                  </LockedMatchList>
                </>
              )}
            </>
          )}
        </Section>

        {/* Kit Builder Prompt - shown AFTER brand matches, so the reward (brands) is first */}
        {creatorProfile && !creatorProfile.has_media_kit && (!creatorProfile.portfolio_post_count || creatorProfile.portfolio_post_count === 0) && (
          <KitBuilderCard onClick={() => navigate('/creator/dashboard/my-kit')}>
            <KitBuilderProgress>
              <KitProgressRing>
                <KitProgressCircle />
                <KitProgressText>0%</KitProgressText>
              </KitProgressRing>
            </KitBuilderProgress>
            <KitBuilderContent>
              <KitBuilderTitle>Complete your media kit</KitBuilderTitle>
              <KitBuilderDesc>
                Creators with kits get <strong>3× more brand responses</strong>. Takes 2 minutes.
              </KitBuilderDesc>
              <KitBuilderStats>
                <KitStat>
                  <Eye size={12} />
                  <span>Brands check your kit before replying</span>
                </KitStat>
              </KitBuilderStats>
            </KitBuilderContent>
            <KitBuilderBtn>
              Complete Kit
              <ArrowRight size={14} />
            </KitBuilderBtn>
          </KitBuilderCard>
        )}

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
                      isUnlocked={unlockedIds.has(brand.id)}
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

        {/* New Brands on newcollab — 4 most recently added (limited to 4) */}
        {data?.newest?.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionLeft>
              <SectionIcon $bg="#EEF2FF">✨</SectionIcon>
              <SectionTitleWrap>
                <SectionTitleRow>
                  <SectionTitle>New brands on newcollab</SectionTitle>
                  <NewCountPill>{data.newest.length} new</NewCountPill>
                </SectionTitleRow>
                <SectionDesc>Contact them now to unlock your next PR package</SectionDesc>
              </SectionTitleWrap>
            </SectionLeft>
          </SectionHeader>

          <SeasonalGrid>
            {data?.newest?.slice(0, 4).map((brand, idx) => {
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
                  <SeasonalReason>✨ Just added{brand.category ? ` · ${categoryLabel(brand.category)}` : ''}</SeasonalReason>
                  <SeasonalStats>
                    {displayRate && (
                      <div>
                        <SeasonalStatVal className="green">{Math.max(35, Math.min(65, displayRate))}%</SeasonalStatVal>
                        <SeasonalStatLbl>Reply rate</SeasonalStatLbl>
                      </div>
                    )}
                    <div>
                      <SeasonalStatVal>~${brand.price_point || (35 + (idx * 15))}</SeasonalStatVal>
                      <SeasonalStatLbl>PR value</SeasonalStatLbl>
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
        )}
          </>
        )}
      </PageInner>

      {/* Modals */}
      {pitchingBrand && (
        <AIPitchModal
          isOpen={!!pitchingBrand}
          onClose={() => {
            setPitchingBrand(null);
            // Return to welcome modal if in welcome flow
            if (isWelcomeFlow) {
              setShowWelcomeModal(true);
            }
          }}
          brand={pitchingBrand}
          onPitchSent={handlePitchSent}
          onUnlockUsed={() => {
            fetchUnlockBalance();
            fetchUnlockedBrands();
            // Mark as unlocked in welcome flow immediately (not just after pitch sent)
            if (isWelcomeFlow && pitchingBrand) {
              setWelcomePitchedIds(prev => new Set([...prev, pitchingBrand.id]));
            }
          }}
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

      {/* Welcome Modal - Post-onboarding first pitch guide */}
      {showWelcomeModal && data?.matched?.length > 0 && (
        <WelcomeOverlay>
          <WelcomeModal onClick={(e) => e.stopPropagation()}>
            <WelcomeClose onClick={() => { setShowWelcomeModal(false); setIsWelcomeFlow(false); }}>×</WelcomeClose>
            <WelcomeEmoji>{welcomePitchedIds.size > 0 ? '🚀' : '✨'}</WelcomeEmoji>
            <WelcomeTitle>
              {welcomePitchedIds.size === 0
                ? '5 Brand Contacts, On Us'
                : welcomePitchedIds.size < 3
                  ? 'Great start! Keep going'
                  : welcomePitchedIds.size < 5
                    ? 'Almost there!'
                    : 'All set!'}
            </WelcomeTitle>
            <WelcomeSub>
              {welcomePitchedIds.size === 0 ? (
                <>Unlock <strong>5 brand contacts</strong> free this month. Each reveals a verified PR email + AI-drafted outreach.</>
              ) : (
                <>Creators who contact 5+ brands are <strong>3x more likely</strong> to land PR packages.</>
              )}
            </WelcomeSub>

            <WelcomeQuota>
              <WelcomeQuotaDots>
                {[0, 1, 2, 3, 4].map(i => (
                  <WelcomeQuotaDot key={i} $filled={i < welcomePitchedIds.size} $completed={i < welcomePitchedIds.size} />
                ))}
              </WelcomeQuotaDots>
              <span>{welcomePitchedIds.size} of 5 unlocked</span>
            </WelcomeQuota>

            {welcomePitchedIds.size === 0 && (
              <WelcomeUrgency>
                <strong>Pro tip:</strong> Unlock your first brand contact now — our AI drafts your pitch in seconds.
              </WelcomeUrgency>
            )}

            <WelcomeBrands>
              {data.matched.slice(0, 5).map((brand, idx) => {
                // Generate 2-char initials from brand name
                const brandName = brand.name || brand.brand_name || '';
                const words = brandName.split(' ').filter(Boolean);
                const initials = words.length >= 2
                  ? (words[0][0] + words[1][0]).toUpperCase()
                  : brandName.slice(0, 2).toUpperCase() || 'BR';
                const brandLogo = brand.logo || brand.logo_url;
                const isPitched = welcomePitchedIds.has(brand.id);

                return (
                  <WelcomeBrandCard key={brand.id || idx} $pitched={isPitched}>
                    <WelcomeBrandLogo $hasImage={!!brandLogo} $pitched={isPitched}>
                      {isPitched ? (
                        <span style={{ color: '#10B981', fontSize: 16 }}>✓</span>
                      ) : brandLogo ? (
                        <img src={brandLogo} alt={brandName} onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </WelcomeBrandLogo>
                    <WelcomeBrandInfo>
                      <WelcomeBrandName $pitched={isPitched}>{brandName}</WelcomeBrandName>
                      <WelcomeBrandMeta>
                        {isPitched ? (
                          <span style={{ color: '#10B981', fontWeight: 600 }}>Unlocked ✓</span>
                        ) : (
                          <>
                            {brand.match_score && <span className="pct">{brand.match_score}% match</span>}
                            {brand.category && <><span>·</span><span>{brand.category}</span></>}
                          </>
                        )}
                      </WelcomeBrandMeta>
                    </WelcomeBrandInfo>
                    {isPitched ? (
                      <WelcomePitchedBadge>✓</WelcomePitchedBadge>
                    ) : (
                      <WelcomePitchBtn onClick={() => {
                        setIsWelcomeFlow(true);
                        setShowWelcomeModal(false);
                        setPitchingBrand(brand);
                      }}>
                        Unlock
                      </WelcomePitchBtn>
                    )}
                  </WelcomeBrandCard>
                );
              })}
            </WelcomeBrands>

            <WelcomeFooter>
              <WelcomeSkip onClick={() => { setShowWelcomeModal(false); setIsWelcomeFlow(false); }}>
                I'll explore first →
              </WelcomeSkip>
            </WelcomeFooter>
          </WelcomeModal>
        </WelcomeOverlay>
      )}

      {/* Kit Nudge Interstitial */}
      {showKitNudge && (
        <KitNudgeOverlay onClick={handleKitNudgeSkip}>
          <KitNudgeCard onClick={(e) => e.stopPropagation()}>
            <KitNudgeStat>3×</KitNudgeStat>
            <KitNudgeTitle>
              Creators with a media kit get 3x more replies
            </KitNudgeTitle>
            <KitNudgeSub>
              Build yours in 2 minutes before contacting{' '}
              {kitNudgeBrand?.name || kitNudgeBrand?.brand_name || 'this brand'}.
            </KitNudgeSub>
            <KitNudgePrimary onClick={handleKitNudgeBuild}>
              Build my kit
            </KitNudgePrimary>
            <KitNudgeSecondary onClick={handleKitNudgeSkip}>
              Continue without kit
            </KitNudgeSecondary>
          </KitNudgeCard>
        </KitNudgeOverlay>
      )}

      {/* Floating Upgrade Button - FAB style, always visible for free users */}
      {!isPro && data?.matched?.length > 3 && (
        <UpgradeFAB
          onClick={() => {
            axios.post(`${API_BASE}/api/track-event`, {
              event: 'upgrade_cta_click',
              location: 'floating_button',
              user_id: user?.creator_id
            }).catch(err => console.error('Tracking error:', err));
            setUpgradeReason('sticky_cta');
            setShowUpgrade(true);
          }}
          aria-label="Upgrade to Pro"
        >
          <Crown size={16} />
          <span>Upgrade to Pro</span>
        </UpgradeFAB>
      )}
    </PageWrap>
  );
};

// Brand Card Component (inline for this page)
const BrandCard = ({ brand, isPro, hasPitched, isSaved, isUnlocked, atLimit, onPitch, onUpgrade, badge, matchScore, showMomentum }) => {
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
        {matchScore && !isUnlocked && (
          <MatchBadge>{Math.round(matchScore)}% match</MatchBadge>
        )}
        {isUnlocked && (
          <UnlockedBadge><Check size={12} /> Unlocked</UnlockedBadge>
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
            <span>Reply rate this week</span>
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
                  <StatLabel>Reply rate</StatLabel>
                </StatItem>
                <StatDivider />
              </>
            )}
            <StatItem>
              <StatValue>~${brand.price_point || 45}</StatValue>
              <StatLabel>PR value</StatLabel>
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

const QuotaBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  background: #1F2937;
  border-radius: 14px;
  padding: 16px 20px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
  }
`;

const QuotaDots = styled.div`
  display: flex;
  gap: 6px;
`;

const QuotaDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$filled ? '#EC4899' : '#4B5563'};
  transition: background 0.2s;
`;

const QuotaText = styled.div`
  flex: 1;
  min-width: 0;
`;

const QuotaTitle = styled.div`
  font-weight: 700;
  font-size: 15px;
  color: #F9FAFB;
`;

const QuotaSub = styled.div`
  font-size: 13px;
  color: #9CA3AF;
  margin-top: 2px;
`;

const QuotaRemaining = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #EC4899;
  white-space: nowrap;
`;

const QuotaUpgrade = styled.button`
  background: linear-gradient(135deg, #EC4899, #8B5CF6);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
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

const ProfilePillWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
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
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${tokens.primary};
  }

  @media (max-width: 768px) {
    justify-content: space-between;
  }

  @media (max-width: 400px) {
    gap: 8px;
    padding: 8px 10px;
  }
`;

const ProfileEditBtn = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${tokens.primary};
  padding: 4px 8px;
  border-radius: 6px;
  background: ${tokens.primaryLight};
  transition: all 0.15s ease;

  ${ProfilePill}:hover & {
    background: ${tokens.primary};
    color: white;
  }
`;

const NicheEditorDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: white;
  border: 1px solid ${tokens.border};
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  padding: 16px;
  z-index: 100;

  @media (max-width: 400px) {
    width: 280px;
    right: -40px;
  }
`;

const NicheEditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const NicheEditorTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${tokens.textPrimary};
`;

const NicheEditorClose = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: ${tokens.textMuted};
  cursor: pointer;
  padding: 0;
  line-height: 1;

  &:hover {
    color: ${tokens.textPrimary};
  }
`;

const NicheEditorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
  max-height: 200px;
  overflow-y: auto;
`;

const NicheEditorChip = styled.button`
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  border: 1.5px solid ${p => p.$selected ? tokens.primary : tokens.border};
  background: ${p => p.$selected ? tokens.primaryLight : 'white'};
  color: ${p => p.$selected ? tokens.primary : tokens.textSecondary};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${tokens.primary};
    color: ${tokens.primary};
  }
`;

const NicheEditorSave = styled.button`
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: ${tokens.primary};
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 400px) {
    font-size: 12px;
  }
`;

const MoreNiches = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${tokens.primary};
  background: ${tokens.primaryLight};
  padding: 2px 6px;
  border-radius: 10px;
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

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const newPillPulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.5); }
  70% { box-shadow: 0 0 0 6px rgba(225, 29, 72, 0); }
  100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
`;

const NewCountPill = styled.span`
  display: inline-flex;
  align-items: center;
  background: #E11D48;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 100px;
  white-space: nowrap;
  animation: ${newPillPulse} 2s infinite;
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

const UnlockedBadge = styled.div`
  position: absolute;
  top: -10px;
  right: 10px;
  background: #D1FAE5;
  color: #065F46;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 100px;
  letter-spacing: 0.2px;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
  border: 1px solid #A7F3D0;
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 12px;
    height: 12px;
  }

  @media (max-width: 640px) {
    top: -8px;
    right: 8px;
    font-size: 10px;
    padding: 4px 8px;
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

// Pool Promo Banner - viral, exciting design with mobile responsiveness
const PoolPromoBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%);
  border-radius: 14px;
  margin-bottom: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
  }

  @media (max-width: 480px) {
    padding: 12px 14px;
    gap: 10px;
  }
`;

const PoolAvatarStack = styled.div`
  display: flex;
  flex-shrink: 0;
`;

const PoolAvatarImg = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.9);
  background: ${p => p.$color || '#7C3AED'};
  color: white;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: ${p => p.$index > 0 ? '-8px' : '0'};
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    margin-left: ${p => p.$index > 0 ? '-6px' : '0'};
  }
`;

const PoolBannerContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const PoolBannerTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: white;
  margin-bottom: 2px;
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const PoolBannerSubtitle = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.85);

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const PoolBannerCTA = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: white;
  background: rgba(255,255,255,0.2);
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
  white-space: nowrap;

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 6px 10px;
  }

  &:hover {
    background: rgba(255,255,255,0.3);
  }
`;

// ── Variant A: Notification Feed Social Proof ──
const SocialFeedStrip = styled.div`
  width: 100%;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
`;

const SocialFeedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 8px;
  border-bottom: 1px solid #f3f4f6;
  flex-wrap: wrap;
  gap: 4px;

  @media (max-width: 480px) {
    padding: 8px 10px 6px;
  }
`;

const LiveBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`;

const LiveDot = styled.div`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #059669;
  animation: socialPulse 1.6s ease-in-out infinite;

  @keyframes socialPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.85); }
  }
`;

const WeekCount = styled.div`
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;

  strong {
    color: #111827;
    font-weight: 700;
  }

  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const SocialFeed = styled.div`
  padding: 4px 0;
  max-height: 148px;
  overflow: hidden;
`;

const NotifRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  transition: background 0.15s;
  animation: ${p => p.$isNew ? 'slideIn 0.4s cubic-bezier(.22,1,.36,1) both, flashBg 0.9s ease-out both' : 'slideIn 0.4s cubic-bezier(.22,1,.36,1) both'};

  &:hover { background: #f9fafb; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes flashBg {
    0% { background: #ecfdf5; }
    100% { background: transparent; }
  }

  @media (max-width: 480px) {
    gap: 8px;
    padding: 8px 10px;
  }
`;

const NotifDivider = styled.div`
  height: 1px;
  background: #f9fafb;
  margin: 0 14px;
`;

const NotifAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  position: relative;
`;

const PlatformDot = styled.div`
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 1.5px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  background: ${p => p.$platform === 'ig' ? '#e1306c' : '#000'};
  color: #fff;
`;

const NotifBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotifLine = styled.div`
  font-size: 12.5px;
  color: #374151;
  line-height: 1.4;

  @media (min-width: 481px) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const NotifHandle = styled.span`
  font-weight: 700;
  color: #111827;
`;

const NotifBrand = styled.span`
  font-weight: 700;
  color: ${p => p.$eventType === 'package' ? '#7c3aed' : p.$eventType === 'contacted' ? '#2563eb' : '#059669'};
`;

const NotifMeta = styled.div`
  font-size: 11px;
  color: #9ca3af;
  margin-top: 1px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    font-size: 10px;
    gap: 4px;
  }
`;

const FollowersChip = styled.span`
  background: #f3f4f6;
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 10px;
  font-weight: 600;
  color: #6b7280;
`;

const ReplyBadge = styled.div`
  flex-shrink: 0;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 20px;
  padding: 3px 9px;
  font-size: 10.5px;
  font-weight: 700;
  color: #059669;
  white-space: nowrap;

  @media (max-width: 480px) {
    padding: 2px 7px;
    font-size: 9.5px;
  }
`;

const PackageBadge = styled.div`
  flex-shrink: 0;
  background: #faf5ff;
  border: 1px solid #e9d5ff;
  border-radius: 20px;
  padding: 3px 9px;
  font-size: 10.5px;
  font-weight: 700;
  color: #7c3aed;
  white-space: nowrap;

  @media (max-width: 480px) {
    padding: 2px 7px;
    font-size: 9.5px;
  }
`;

const ContactedBadge = styled.div`
  flex-shrink: 0;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  padding: 3px 9px;
  font-size: 10.5px;
  font-weight: 700;
  color: #2563eb;
  white-space: nowrap;

  @media (max-width: 480px) {
    padding: 2px 7px;
    font-size: 9.5px;
  }
`;

const SocialFeedFooter = styled.div`
  padding: 8px 14px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  @media (max-width: 480px) {
    padding: 6px 10px;
  }
`;

const RefreshLabel = styled.div`
  font-size: 10.5px;
  color: #d1d5db;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const RefreshDot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #059669;
  animation: socialPulse 2s ease-in-out infinite;
`;

// ── Live Activity Ticker — compact single line (~32px) ──
const LiveTicker = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 14px;
  margin-bottom: 16px;
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 6px 10px;
    margin-bottom: 12px;
    border-radius: 6px;
  }
`;

const TickerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { display: none; }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const TickerDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
  animation: tickerPulse 1.5s ease-in-out infinite;

  @keyframes tickerPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.9); }
  }
`;

const TickerText = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  font-size: 12px;
  color: #6b7280;
  text-decoration: none;

  strong {
    color: #111827;
    font-weight: 600;
    margin-right: 3px;
    text-decoration: none;
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const TickerDivider = styled.span`
  margin: 0 8px;
  color: #d1d5db;
  text-decoration: none;

  @media (max-width: 480px) {
    margin: 0 6px;
  }
`;

const TickerItem = styled.span`
  color: #374151;
  font-weight: 500;
  text-decoration: none;
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
  gap: 10px;
  margin-bottom: 16px;
`;

const LockedMatchCard = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%);
  border: 1.5px solid #E2E8F0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.12);
    border-color: #A78BFA;
  }

  @media (max-width: 640px) {
    border-radius: 14px;
  }
`;

const LockedCardBlur = styled.div`
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  opacity: 0.08;
  filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LockedBrandLogo = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
`;

const LockedCardContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;

  @media (max-width: 640px) {
    padding: 12px 14px;
    gap: 12px;
  }
`;

const LockedStatBadge = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  border: 1px solid #A7F3D0;
  border-radius: 10px;
  padding: 8px 12px;
  min-width: 58px;
  flex-shrink: 0;
`;

const LockedStatValue = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #059669;
  line-height: 1;
`;

const LockedStatLabel = styled.div`
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
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 4px;
`;

const LockedMatchMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
`;

const LockedIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #EDE9FE, #DDD6FE);
  color: #7C3AED;
  flex-shrink: 0;
`;

const UnlockBanner = styled.div`
  background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);
  border: 1.5px solid #C4B5FD;
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 8px;

  &:hover {
    border-color: #A78BFA;
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    flex-direction: column;
    text-align: center;
    padding: 20px 18px;
    gap: 14px;
  }
`;

const UnlockBannerContent = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const UnlockBannerIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #8B5CF6, #A78BFA);
  color: white;
  flex-shrink: 0;
`;

const UnlockBannerText = styled.div`
  flex: 1;
`;

const UnlockBannerTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 3px;
  line-height: 1.3;
`;

const UnlockBannerSub = styled.div`
  font-size: 13px;
  color: #6B7280;
`;

const UnlockBannerBtn = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #7C3AED, #8B5CF6);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);

  &:hover {
    background: linear-gradient(135deg, #6D28D9, #7C3AED);
    box-shadow: 0 6px 16px rgba(124, 58, 237, 0.35);
  }

  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
  }
`;

// Floating Action Button (FAB) for Upgrade - follows best practices from Notion, Linear, Grammarly
const UpgradeFAB = styled.button`
  /* Fixed positioning - always visible */
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999;

  /* Styling */
  background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 14px 24px 14px 20px;

  /* Typography */
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  white-space: nowrap;

  /* Flexbox for icon + text */
  display: flex;
  align-items: center;
  gap: 8px;

  /* Elevation & shadows */
  box-shadow:
    0 4px 12px rgba(124, 58, 237, 0.25),
    0 8px 24px rgba(124, 58, 237, 0.15);

  /* Interactions */
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  /* Prevent text selection */
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  /* Hover state */
  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow:
      0 6px 16px rgba(124, 58, 237, 0.3),
      0 12px 32px rgba(124, 58, 237, 0.2);
    background: linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%);
  }

  /* Active state */
  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow:
      0 2px 8px rgba(124, 58, 237, 0.25);
  }

  /* Focus state for accessibility */
  &:focus-visible {
    outline: 2px solid #8B5CF6;
    outline-offset: 2px;
  }

  /* Mobile optimization */
  @media (max-width: 768px) {
    bottom: 80px;
    right: 16px;
    padding: 16px 28px 16px 24px;
    font-size: 15px;
    gap: 10px;

    /* Larger touch target for mobile */
    min-width: 48px;
    min-height: 48px;

    /* Stronger shadow on mobile for visibility */
    box-shadow:
      0 8px 24px rgba(124, 58, 237, 0.3),
      0 16px 48px rgba(124, 58, 237, 0.2);
  }

  /* Tablet */
  @media (min-width: 769px) and (max-width: 1024px) {
    bottom: 20px;
    right: 20px;
  }

  /* Small screens - compact version */
  @media (max-width: 480px) {
    padding: 14px 22px 14px 18px;
    font-size: 14px;

    /* Hide text on very small screens, show icon only */
    span {
      display: none;
    }

    /* Make it circular when text hidden */
    border-radius: 50%;
    width: 56px;
    height: 56px;
    padding: 0;
    justify-content: center;
  }

  /* Ensure it doesn't overlap with bottom nav or other fixed elements */
  @media (max-height: 600px) {
    bottom: 12px;
    right: 12px;
    padding: 12px 20px 12px 16px;
    font-size: 13px;
  }
`;

// Locked Card CTA - appears on hover
const LockedCardCTA = styled.div`
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #7C3AED, #8B5CF6);
  color: white;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  white-space: nowrap;
  pointer-events: none;

  ${LockedMatchCard}:hover & {
    opacity: 1;
  }
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

// How It Works Card — Variant A: Outcome icons, light card
const HowItWorksCard = styled.div`
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 16px;
  padding: 22px 24px 20px;
  margin-bottom: 24px;
  box-shadow: ${tokens.shadowCard};

  @media (max-width: 640px) {
    padding: 18px 16px 16px;
    border-radius: 14px;
  }
`;

const HowItWorksHeader = styled.div`
  margin-bottom: 18px;

  @media (max-width: 640px) {
    margin-bottom: 14px;
  }
`;

const HowItWorksEyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #E11D48;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 4px;
`;

const HowItWorksTitle = styled.h3`
  font-size: 17px;
  font-weight: 800;
  color: ${tokens.textPrimary};
  line-height: 1.25;
  margin: 0;

  span {
    color: #059669;
  }

  @media (max-width: 640px) {
    font-size: 15px;
  }
`;

const HowItWorksSteps = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0;
  position: relative;

  /* Connector line between steps */
  &::before {
    content: '';
    position: absolute;
    top: 22px;
    left: calc(16.6% + 12px);
    right: calc(16.6% + 12px);
    height: 2px;
    background: linear-gradient(90deg, #E11D48 0%, #7c3aed 50%, #059669 100%);
    opacity: 0.25;
    z-index: 0;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;

    &::before {
      display: none;
    }
  }
`;

const HowItWorksStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 12px;
  position: relative;
  z-index: 1;

  @media (max-width: 640px) {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    padding: 0;
    gap: 12px;
  }
`;

const StepIconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-bottom: 10px;
  position: relative;
  flex-shrink: 0;
  background: ${props => props.$bg || '#fff0f3'};
  border: 2px solid ${props => props.$border || '#fecdd3'};

  @media (max-width: 640px) {
    width: 40px;
    height: 40px;
    font-size: 18px;
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${tokens.textPrimary};
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StepContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StepOutcome = styled.div`
  font-size: 13.5px;
  font-weight: 800;
  color: ${tokens.textPrimary};
  line-height: 1.25;
  margin-bottom: 5px;

  @media (max-width: 640px) {
    font-size: 13px;
    margin-bottom: 3px;
  }
`;

const StepDetail = styled.div`
  font-size: 11.5px;
  color: ${tokens.textMuted};
  line-height: 1.45;

  strong {
    color: #374151;
    font-weight: 600;
  }

  @media (max-width: 640px) {
    font-size: 11px;
  }
`;

const StepTime = styled.span`
  display: inline-block;
  margin-top: 6px;
  background: ${props => props.$bg || '#f3f4f6'};
  border-radius: 20px;
  padding: 2px 8px;
  font-size: 10.5px;
  font-weight: 700;
  color: ${props => props.$color || '#6b7280'};

  @media (max-width: 640px) {
    margin-top: 4px;
    font-size: 10px;
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

// Welcome modal styled components (post-onboarding)
const WelcomeOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
`;

const WelcomeModal = styled.div`
  background: white;
  border-radius: 18px;
  padding: 30px 26px 24px;
  max-width: 420px;
  width: 100%;
  position: relative;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 480px) {
    padding: 24px 20px 20px;
    border-radius: 16px;
  }
`;

const WelcomeClose = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  border: none;
  background: #F1F2F4;
  border-radius: 50%;
  font-size: 15px;
  color: #8A8F98;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  &:hover {
    background: #E5E7EB;
  }
`;

const WelcomeEmoji = styled.div`
  font-size: 34px;
  text-align: center;
  margin-bottom: 6px;
`;

const WelcomeTitle = styled.h2`
  font-size: 19px;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin: 0 0 8px 0;
`;

const WelcomeSub = styled.p`
  font-size: 13.5px;
  color: #6B7280;
  text-align: center;
  line-height: 1.45;
  margin: 0 0 4px 0;

  strong {
    color: #111827;
  }
`;

const WelcomeQuota = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 14px 0 16px;
  font-size: 12.5px;
  color: #6B7280;
`;

const WelcomeQuotaDots = styled.div`
  display: flex;
  gap: 5px;
`;

const WelcomeQuotaDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${props => props.$filled ? '#10B981' : '#E5E7EB'};
  transition: background 0.2s;
`;

const WelcomeUrgency = styled.div`
  font-size: 12.5px;
  text-align: center;
  color: #111827;
  background: #F4F3FF;
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 18px;

  strong {
    color: #5B4DFF;
  }
`;

const WelcomeBrands = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const WelcomeBrandCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: ${props => props.$pitched ? '#F0FDF4' : 'white'};
  border-radius: 12px;
  border: 1px solid ${props => props.$pitched ? '#BBF7D0' : '#ECECEF'};
  margin-bottom: 10px;
  transition: background 0.2s, border-color 0.2s;

  &:last-child {
    margin-bottom: 0;
  }
`;

const WelcomeBrandLogo = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #F1F2F4;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: ${props => props.$hasImage ? 'cover' : 'contain'};
  }

  span {
    font-size: 13px;
    font-weight: 800;
    color: #374151;
  }
`;

const WelcomeBrandInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const WelcomeBrandName = styled.div`
  font-weight: 700;
  font-size: 13.5px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const WelcomeBrandMeta = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 1px;
  font-size: 11.5px;
  color: #6B7280;

  .pct {
    color: #1AA15D;
    font-weight: 700;
  }
`;

const WelcomePitchBtn = styled.button`
  background: #5B4DFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
  flex-shrink: 0;

  &:hover {
    opacity: 0.9;
  }
`;

const WelcomePitchedBadge = styled.div`
  background: #D1FAE5;
  color: #059669;
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
`;

const WelcomeFooter = styled.div`
  margin-top: 10px;
  text-align: center;
`;

const WelcomeSkip = styled.button`
  background: none;
  border: none;
  color: #B6B9C0;
  font-size: 11.5px;
  cursor: pointer;
  padding: 4px 8px;
  text-decoration: none;

  &:hover {
    color: #9CA3AF;
  }
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

// Kit Views Banner - "Who Viewed Your Kit" headline feature
const KitViewsBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  background: ${p => p.$highlight ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)'};
  border: 1px solid ${p => p.$highlight ? '#FCD34D' : '#C7D2FE'};
  border-radius: 14px;
  padding: 14px 18px;
  margin-bottom: 16px;
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

// Kit Views List - Pro users see full brand details
const KitViewsList = styled.div`
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 14px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const KitViewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #F3F4F6;
  transition: background 0.15s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #F9FAFB;
  }
`;

const KitViewBrandLogo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  span {
    font-size: 18px;
    font-weight: 700;
    color: #6B7280;
  }
`;

const KitViewInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const KitViewBrandName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111;
`;

const KitViewMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  font-size: 12px;
  color: #6B7280;
`;

const KitViewBadge = styled.span`
  background: #EEF2FF;
  color: #4F46E5;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
`;

const KitViewAction = styled.button`
  background: #111;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #333;
  }
`;

// Kit Builder Prompt - for users without a media kit
const KitBuilderCard = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  background: #fff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 18px 22px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  &:hover {
    border-color: #3B82F6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12);
  }

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    padding: 18px;
  }
`;

const KitBuilderProgress = styled.div`
  flex-shrink: 0;

  @media (max-width: 700px) {
    display: none;
  }
`;

const KitProgressRing = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: conic-gradient(#E5E7EB 0deg, #E5E7EB 360deg);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const KitProgressCircle = styled.div`
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: white;
`;

const KitProgressText = styled.div`
  position: relative;
  font-size: 12px;
  font-weight: 700;
  color: #9CA3AF;
`;

const KitBuilderContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const KitBuilderTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px;
  line-height: 1.3;
`;

const KitBuilderDesc = styled.p`
  font-size: 13px;
  color: #6B7280;
  margin: 0 0 8px;
  line-height: 1.4;

  strong {
    color: #059669;
    font-weight: 600;
  }
`;

const KitBuilderStats = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const KitStat = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #9CA3AF;

  svg {
    color: #3B82F6;
  }
`;

const KitBuilderBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  font-family: inherit;

  &:hover {
    background: #2563EB;
  }

  @media (max-width: 700px) {
    justify-content: center;
    padding: 14px 24px;
  }
`;

export default ForYou;

