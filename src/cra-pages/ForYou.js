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
import PRPackageModal from '../creator-portal/PRPackageModal';
import { UnlockModalV2 } from '../creator-portal/unlockV2';
import OpportunitiesTab from '../creator-portal/OpportunitiesTab';

// Feature flag for V2 modal testing - set to true to use new verdict-first design
const USE_UNLOCK_V2 = true;
import { getCategoryColors } from '../utils/categoryColors';
import { categoryLabel, CANONICAL_CATEGORIES, CATEGORY_LABELS } from '../constants/brandCategories';
import LoadingSpinner from '../components/LoadingSpinner';
import { creatorTokens as tokens } from '../theme/creatorTokens';

const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};
const API_BASE = getApiBase();

const FREE_PITCH_LIMIT = 3;

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

  // Profile niches (labels / hot section only — edit lives on Discover)
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [followerCount, setFollowerCount] = useState('');

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
  const [activeTab, setActiveTab] = useState(() => (
    sessionStorage.getItem('foryouForceOpportunities') ? 'opportunities' : 'matches'
  ));
  const [pitchLimits, setPitchLimits] = useState({ used: 0, limit: 3, canPitch: true });
  const [unlockBalance, setUnlockBalance] = useState({ remaining: 3, tier: 'free', reset_at: null, is_unlimited: false });
  const [opportunityCount, setOpportunityCount] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem('foryouForceOpportunities')) {
      sessionStorage.setItem('foryouTabPicked', '1');
      sessionStorage.removeItem('foryouForceOpportunities');
      setActiveTab('opportunities');
    }
  }, []);

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
        const count = matched.length + others.length;
        setOpportunityCount(count);
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
        const payload = { ...response.data };
        if (Array.isArray(payload.matched)) {
          // Trust mentor LLM order from backend; light safety net only
          payload.matched = [...payload.matched]
            .filter((b) => {
              const score = Number(b.match_score);
              const tier = (b.fit_tier || '').toLowerCase();
              const status = (b.fit_status || '').toLowerCase();
              if (tier === 'stretch_match' || tier === 'not_recommended') return false;
              if (status === 'poor_fit' || status === 'build_first') return false;
              if (Number.isFinite(score) && score < 35) return false;
              const cat = String(b.category || '').toLowerCase();
              const niches = (payload.profile?.niches || []).join(' ').toLowerCase();
              const parenting = /parent|baby|kid|family|mom|mum/.test(niches);
              if (parenting && /fashion|luxury|apparel|clothing|streetwear/.test(cat)) return false;
              return true;
            });
          // Keep backend mentor order — do not re-sort by SQL/price heuristics
        }
        setData(payload);
        if (response.data.profile) {
          // Normalize niches to lowercase for labels / hot section
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

    // Kit nudge AFTER first unlock/pitch — never block the first aha moment
    const unlockCount = Number(localStorage.getItem('nc_unlock_count') || '0');
    const hasSeenNudge = localStorage.getItem('nc_kit_nudge_seen');
    const hasKit = creatorProfile?.has_media_kit ||
                   (creatorProfile?.portfolio_post_count && creatorProfile.portfolio_post_count > 0);

    if (!hasKit && !hasSeenNudge && unlockCount >= 1) {
      localStorage.setItem('nc_kit_nudge_seen', 'true');
      setKitNudgeBrand(brand);
      setShowKitNudge(true);
      return;
    }

    // Mark brand as coming from For You to ensure consistent fit rating
    setPitchingBrand({ ...brand, is_for_you_match: true });
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
    const stayOpen = Boolean(context?.stayOpen);
    const alreadyRecorded = Boolean(context?.alreadyRecorded);
    const goPipeline = context?.goPipeline;

    if (contactedBrand && !alreadyRecorded) {
      setPitchedIds(prev => new Set([...prev, contactedBrand.id]));
      setSavedIds(prev => new Set([...prev, contactedBrand.id]));
      try {
        const prev = Number(localStorage.getItem('nc_unlock_count') || '0');
        localStorage.setItem('nc_unlock_count', String(prev + 1));
      } catch (_) { /* ignore */ }

      if (isWelcomeFlow) {
        setWelcomePitchedIds(prev => new Set([...prev, contactedBrand.id]));
      }
    }

    if (stayOpen) {
      message.success(
        method === 'form'
          ? 'Form opened. Next: keep building while you wait.'
          : 'Email opened. Next: keep building while you wait.'
      );
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
      return;
    }

    setPitchingBrand(null);

    if (!alreadyRecorded) {
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
    }

    if (contactedBrand) {
      if (isWelcomeFlow) {
        const newUnlockedCount = new Set([...welcomePitchedIds, contactedBrand.id]).size;
        if (newUnlockedCount >= 3) {
          setIsWelcomeFlow(false);
          setShowWelcomeModal(false);
          message.success('Nice work. Check your pipeline for follow-ups.');
          navigate('/creator/dashboard/pr-pipeline');
        } else {
          setShowWelcomeModal(true);
        }
      } else if (goPipeline) {
        message.success('Saved. Confirm the send in your pipeline.');
        navigate(`/creator/dashboard/pr-pipeline?confirmBrand=${contactedBrand.id}&method=${method}`);
      } else {
        message.success('Pitch started. Unlock another brand or apply to open gigs.');
      }
    }
  }, [pitchingBrand, navigate, isWelcomeFlow, welcomePitchedIds]);

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
        {/* Page Header — match-first (search lives on Discover) */}
        <PageHeader>
          <PageTitleWrap>
            <PageEyebrow>Personalized for you</PageEyebrow>
            <PageTitle>
              Brands matched to <PageTitleEm>your</PageTitleEm> content
            </PageTitle>
            <PageSub>
              {data?.matched?.length
                ? `${data.matched.length} brands that fit your niche — unlock the PR email or form, then pitch.`
                : 'Unlock the PR email or form for brands that fit your niche, then pitch.'}
            </PageSub>
            <DiscoverLink
              type="button"
              onClick={() => navigate('/creator/dashboard/pr-brands')}
            >
              Search all brands <ArrowRight size={14} />
            </DiscoverLink>
          </PageTitleWrap>
        </PageHeader>

        {/* Free plan: two clear credit trackers */}
        {!isPro && data?.has_profile && !unlockBalance.is_unlimited && (() => {
          const unlocksLeft = unlockBalance.remaining ?? 3;
          const appsUsed = Math.min(FREE_PITCH_LIMIT, pitchLimits?.used ?? pitchesSentThisMonth ?? 0);
          const appsLeft = Math.max(0, FREE_PITCH_LIMIT - appsUsed);
          const showUpgrade = unlocksLeft <= 0 || appsLeft <= 0;
          return (
            <>
              <CreditTrackers>
                <CreditTracker $low={unlocksLeft <= 0}>
                  <CreditTrackerTop>
                    <CreditTrackerLabel>Unlocks</CreditTrackerLabel>
                    <CreditTrackerCount $low={unlocksLeft <= 0}>
                      {unlocksLeft}<CreditTrackerMax>/3</CreditTrackerMax>
                    </CreditTrackerCount>
                  </CreditTrackerTop>
                  <CreditPipsRow>
                    {[0, 1, 2].map((i) => (
                      <CreditPip key={i} $available={i < unlocksLeft} $tone="unlock" />
                    ))}
                  </CreditPipsRow>
                  <CreditTrackerHint>Strategy + brand contacts</CreditTrackerHint>
                </CreditTracker>

                <CreditTracker $low={appsLeft <= 0}>
                  <CreditTrackerTop>
                    <CreditTrackerLabel>Applications</CreditTrackerLabel>
                    <CreditTrackerCount $low={appsLeft <= 0}>
                      {appsLeft}<CreditTrackerMax>/3</CreditTrackerMax>
                    </CreditTrackerCount>
                  </CreditTrackerTop>
                  <CreditPipsRow>
                    {[0, 1, 2].map((i) => (
                      <CreditPip key={i} $available={i < appsLeft} $tone="app" />
                    ))}
                  </CreditPipsRow>
                  <CreditTrackerHint>Open applications</CreditTrackerHint>
                </CreditTracker>
              </CreditTrackers>
              {showUpgrade && (
                <CreditUpgradeBar>
                  <CreditUpgradeHint>
                    {unlocksLeft <= 0 && appsLeft <= 0
                      ? "You're out of free unlocks and applications."
                      : unlocksLeft <= 0
                        ? "You're out of free unlocks."
                        : "You're out of free applications."}
                  </CreditUpgradeHint>
                  <QuotaUpgrade onClick={handleDirectUpgrade}>Upgrade for unlimited</QuotaUpgrade>
                </CreditUpgradeBar>
              )}
            </>
          );
        })()}

        {/* Pro user badge - minimal */}
        {isPro && data?.has_profile && (
          <QuotaBanner $isPro>
            <QuotaText>
              <QuotaTitle $isPro>Pro</QuotaTitle>
              <QuotaSub $isPro>Unlimited unlocks & applications</QuotaSub>
            </QuotaText>
          </QuotaBanner>
        )}

        {/* Kit CTA after first unlock/pitch — don't compete with first aha */}
        {creatorProfile && !creatorProfile.has_media_kit && (!creatorProfile.portfolio_post_count || creatorProfile.portfolio_post_count === 0) && data?.has_profile && (pitchedIds.size > 0 || Number(localStorage.getItem('nc_unlock_count') || '0') >= 1) && (
          <KitBuilderCard onClick={() => navigate('/creator/dashboard/my-kit')}>
            <KitBuilderProgress>
              <FileText size={20} />
            </KitBuilderProgress>
            <KitBuilderContent>
              <KitBuilderTitle>
                <span>Create your portfolio</span>
              </KitBuilderTitle>
              <KitBuilderDesc>
                Most brands ask for one. Show your best work — and see who views it.
              </KitBuilderDesc>
            </KitBuilderContent>
            <KitBuilderBtn>
              Create portfolio →
            </KitBuilderBtn>
          </KitBuilderCard>
        )}

        {/* Profile Prompt - niches live on Discover now */}
        {!data?.has_profile && (
          <ProfilePromptCard>
            <PromptIcon>🎯</PromptIcon>
            <PromptTitle>Complete your profile niches</PromptTitle>
            <PromptSub>
              Set niches during onboarding so Discover can prioritize relevant brands.
              For You matches still use your real social content.
            </PromptSub>
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

        {/* Pool Promo — commented out for For You rebuild (secondary nav only)
        {(isPro || pitchedIds.size > 0 || (pitchLimits?.used || 0) > 0) && (
        <PoolPromoBanner onClick={() => navigate('/creator/dashboard/pool')}>
          ...
        </PoolPromoBanner>
        )}
        */}

        {/* Sub-tabs: Matches vs Opportunities */}
        <SubTabRow>
          <SubTab
            $active={activeTab === 'matches'}
            onClick={() => {
              sessionStorage.setItem('foryouTabPicked', '1');
              setActiveTab('matches');
            }}
          >
            Matches
            {(data?.matched?.length || 0) > 0 && (
              <CountBadge>{data.matched.length}</CountBadge>
            )}
          </SubTab>
          <SubTab
            $active={activeTab === 'opportunities'}
            onClick={() => {
              sessionStorage.setItem('foryouTabPicked', '1');
              setActiveTab('opportunities');
            }}
          >
            Opportunities
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

        {/* Matches Tab Content — rebuild: only matched brands (all 8) */}
        {activeTab === 'matches' && (
          <>
        {/* Pending Pitch / View Inbox — commented out for For You rebuild
        {pendingPitches && pendingPitches.length > 0 && (
          <PendingPitchBanner>...</PendingPitchBanner>
        )}
        */}

        {/* Live Activity Ticker — kept as light social proof under tabs */}
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

        <Section>
          <CardGrid $cols={2}>
            {(data?.matched || []).map(brand => (
              <BrandCard
                key={brand.id}
                brand={brand}
                hasPitched={pitchedIds.has(brand.id)}
                isUnlocked={unlockedIds.has(brand.id)}
                onPitch={() => handlePitchNow(brand)}
                matchScore={brand.match_score}
              />
            ))}
          </CardGrid>
        </Section>

        {/* Trending Now — commented out for For You rebuild
        {data?.hot?.length > 0 && (...)}
        */}

        {/* New brands on newcollab — commented out for For You rebuild
        {data?.newest?.length > 0 && (...)}
        */}
          </>
        )}
      </PageInner>

      {/* Modals - PR Package Modal (V2 or legacy) */}
      {pitchingBrand && (
        USE_UNLOCK_V2 ? (
          <UnlockModalV2
            isOpen={!!pitchingBrand}
            onClose={() => {
              fetchUnlockedBrands();
              fetchUnlockBalance();
              if (isWelcomeFlow && pitchingBrand) {
                setWelcomePitchedIds(prev => new Set([...prev, pitchingBrand.id]));
              }
              setPitchingBrand(null);
              if (isWelcomeFlow) {
                setShowWelcomeModal(true);
              }
            }}
            brand={pitchingBrand}
            onPitchSent={(brand, ctx) => {
              handlePitchSent(brand, ctx);
              fetchUnlockBalance();
              fetchUnlockedBrands();
              if (isWelcomeFlow && pitchingBrand && !ctx?.stayOpen) {
                setWelcomePitchedIds(prev => new Set([...prev, pitchingBrand.id]));
              }
            }}
            onOpenOpportunities={() => {
              sessionStorage.setItem('foryouTabPicked', '1');
              setActiveTab('opportunities');
              setPitchingBrand(null);
              if (isWelcomeFlow) {
                setIsWelcomeFlow(false);
                setShowWelcomeModal(false);
              }
            }}
            isPro={isPro}
          />
        ) : (
          <PRPackageModal
            isOpen={!!pitchingBrand}
            onClose={() => {
              // Refresh unlocked brands when modal closes (unlock happens on package generation)
              fetchUnlockedBrands();
              fetchUnlockBalance();
              // Update welcome flow state if brand was unlocked
              if (isWelcomeFlow && pitchingBrand) {
                setWelcomePitchedIds(prev => new Set([...prev, pitchingBrand.id]));
              }
              setPitchingBrand(null);
              // Return to welcome modal if in welcome flow
              if (isWelcomeFlow) {
                setShowWelcomeModal(true);
              }
            }}
            brand={pitchingBrand}
            onPitchSent={(brand) => {
              handlePitchSent(brand);
              // Also trigger unlock callbacks
              fetchUnlockBalance();
              fetchUnlockedBrands();
              if (isWelcomeFlow && pitchingBrand) {
                setWelcomePitchedIds(prev => new Set([...prev, pitchingBrand.id]));
              }
            }}
            isPro={isPro}
          />
        )
      )}

      {showUpgrade && (
        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          currentCount={pitchesSentThisMonth}
          limit={FREE_PITCH_LIMIT}
          pitchLimits={pitchLimits}
          feature={upgradeReason === 'matched' ? 'for_you' : (upgradeReason || 'limit_reached')}
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
                ? 'Start your first free product'
                : welcomePitchedIds.size < 2
                  ? 'Nice — keep going'
                  : welcomePitchedIds.size < 3
                    ? 'Almost there!'
                    : 'All set!'}
            </WelcomeTitle>
            <WelcomeSub>
              {welcomePitchedIds.size === 0 ? (
                <>Brands won’t find a small account on their own. Use your free unlocks to pitch brands that gift — with a contact + pitch that looks professional.</>
              ) : (
                <>Creators who pitch several brands are <strong>far more likely</strong> to land a free product.</>
              )}
            </WelcomeSub>

            <WelcomeQuota>
              <WelcomeQuotaDots>
                {[0, 1, 2].map(i => (
                  <WelcomeQuotaDot key={i} $filled={i < welcomePitchedIds.size} $completed={i < welcomePitchedIds.size} />
                ))}
              </WelcomeQuotaDots>
              <span>{welcomePitchedIds.size} of 3 unlocks started</span>
            </WelcomeQuota>

            {welcomePitchedIds.size === 0 && (
              <WelcomeUrgency>
                <strong>Tip:</strong> Unlock a brand now — verified contact + ready-to-send pitch.
              </WelcomeUrgency>
            )}

            <WelcomeBrands>
              {data.matched.slice(0, 3).map((brand, idx) => {
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
const isMicroFriendlyBrand = (brand) => {
  if (!brand) return false;
  if (brand.micro_friendly === true || brand.is_micro_friendly === true) return true;
  if (brand.micro_friendly === false || brand.is_micro_friendly === false) return false;
  // Temporary heuristic until Claude enrichment assigns micro_friendly on brands
  const min = brand.min_followers;
  if (min == null || min === '' || Number(min) === 0) return true;
  return Number(min) <= 10000;
};

const brandHasEmail = (brand) => {
  const email = brand?.contact_email || brand?.pr_email || brand?.email || brand?.verified_email;
  if (email && String(email).includes('@')) return true;
  return !!(brand?.hasEmailContact || brand?.has_email_contact || brand?.has_email || brand?.verified_contact);
};
const brandHasForm = (brand) => {
  const url = brand?.application_form_url || brand?.application_url || brand?.pr_form_url || brand?.form_url;
  if (url && String(url).length > 4) return true;
  return !!(brand?.has_application_form || brand?.hasApplication || brand?.has_application);
};
const brandIsAffiliateForm = (brand) => {
  const url = String(brand?.application_form_url || brand?.application_url || brand?.pr_form_url || '').toLowerCase();
  return /superfiliate|affiliate|ambassador|portal\/sign/.test(url);
};

const BrandCard = ({ brand, hasPitched, isUnlocked, onPitch, matchScore }) => {
  const microFriendly = isMicroFriendlyBrand(brand);
  const hasEmail = brandHasEmail(brand);
  const hasForm = brandHasForm(brand);
  const isAffiliate = hasForm && brandIsAffiliateForm(brand);
  const blurb = brand.description || brand.match_reason || brand.why_match ||
    (brand.category ? `${categoryLabel(brand.category)} brand matched to your content.` : 'Brand matched to your content.');
  const minFollowers = brand.min_followers ?? brand.minFollowers;

  return (
    <Card
      as={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isUnlocked && (
        <CardTopMeta>
          <UnlockedInline><Check size={12} /> Unlocked</UnlockedInline>
        </CardTopMeta>
      )}

      <CardNameRow>
        {(brand.logo || brand.logo_url) ? (
          <CardAvatar
            src={brand.logo || brand.logo_url}
            alt=""
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <CardAvatarFallback>{(brand.name || brand.brand_name || '?').charAt(0)}</CardAvatarFallback>
        )}
        <div>
          <CardName>{brand.name || brand.brand_name}</CardName>
          {brand.category && <CardNiche>{categoryLabel(brand.category)}</CardNiche>}
        </div>
      </CardNameRow>

      <CardDesc>{blurb}</CardDesc>

      <CardTags>
        {microFriendly && <Pill $tone="ok">Micro-friendly</Pill>}
        {hasEmail && <Pill $tone="email">PR email</Pill>}
        {hasForm && <Pill $tone="form">Program form</Pill>}
        {isAffiliate && <Pill $tone="aff">Affiliate signup</Pill>}
        {minFollowers > 0 && (
          <Pill>{(Number(minFollowers) / 1000).toFixed(0)}K+ followers</Pill>
        )}
      </CardTags>

      <PreviewStats>
        {brand.response_rate != null && brand.response_rate !== '' && (
          <PreviewStat>
            {brand.response_rate}%
            <em>reply rate</em>
          </PreviewStat>
        )}
        <PreviewStat>
          ~${brand.price_point || 45}
          <em>PR value</em>
        </PreviewStat>
        {matchScore ? (
          <PreviewStat>
            {Math.round(matchScore)}%
            <em>match</em>
          </PreviewStat>
        ) : null}
      </PreviewStats>

      <PitchBtn
        onClick={onPitch}
        $pitched={hasPitched || isUnlocked}
        disabled={hasPitched}
      >
        {hasPitched ? (
          <><Check size={16} /> Contacted</>
        ) : isUnlocked ? (
          <><Mail size={16} /> {tokens.ctaViewBrandPr}</>
        ) : (
          <><Mail size={16} /> {tokens.ctaGetBrandPr}</>
        )}
      </PitchBtn>
    </Card>
  );
};

// Styled Components
const PageWrap = styled.div`
  background: ${tokens.paper};
  min-height: 100vh;
  overflow-x: hidden;
  width: 100%;
  font-family: ${tokens.fontSans};
`;

const PageInner = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  padding: 32px 24px 80px;

  @media (max-width: 640px) {
    padding: 20px 14px 80px;
  }
`;

const MicroFriendlyTag = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  border-radius: 6px;
  background: ${tokens.accentSoft};
  color: ${tokens.accentDeep};
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
    margin-bottom: 20px;
  }
`;

// Compact Unlock Tracker - Modern inline design (inspired by Spotify/Notion)
const QuotaBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${props => props.$isPro ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' : '#F9FAFB'};
  border: ${props => props.$isPro ? 'none' : '1px solid #E5E7EB'};
  border-radius: 10px;
  padding: 10px 14px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    gap: 10px;
    padding: 10px 12px;
  }
`;

const CreditTrackers = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-bottom: 1rem;
  max-width: 480px;
  align-items: stretch;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    max-width: none;
  }
`;

const CreditTracker = styled.div`
  background: ${p => (p.$low ? '#FEF2F2' : tokens.white)};
  border: 1px solid ${p => (p.$low ? '#FECACA' : '#ebebeb')};
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const CreditTrackerTop = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

const CreditTrackerLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #374151;
  letter-spacing: 0.01em;
`;

const CreditTrackerCount = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: ${p => (p.$low ? '#DC2626' : '#111827')};
  line-height: 1;
  font-variant-numeric: tabular-nums;
`;

const CreditTrackerMax = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #9CA3AF;
  margin-left: 1px;
`;

const CreditPipsRow = styled.div`
  display: flex;
  gap: 4px;
`;

const CreditPip = styled.div`
  flex: 1;
  max-width: 36px;
  height: 7px;
  border-radius: 999px;
  background: ${p => {
    if (!p.$available) return '#E5E7EB';
    return p.$tone === 'app' ? '#6366F1' : '#10B981';
  }};
  transition: background 0.2s ease;
`;

const CreditTrackerHint = styled.div`
  font-size: 11px;
  color: #9CA3AF;
  line-height: 1.3;
`;

const CreditUpgradeBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const CreditUpgradeHint = styled.div`
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
`;

// Segmented progress bar - compact and modern
const QuotaDots = styled.div`
  display: flex;
  gap: 3px;
`;

const QuotaDot = styled.div`
  width: 24px;
  height: 6px;
  border-radius: 3px;
  background: ${props => props.$filled ? '#10B981' : '#E5E7EB'};
  transition: all 0.3s ease;

  @media (max-width: 640px) {
    width: 20px;
    height: 5px;
  }
`;

const QuotaText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuotaTitle = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: ${props => props.$isPro ? '#fff' : '#374151'};
`;

const QuotaSub = styled.div`
  font-size: 12px;
  color: ${props => props.$isPro ? 'rgba(255,255,255,0.8)' : '#9CA3AF'};
`;

const QuotaRemaining = styled.div`
  font-weight: 600;
  font-size: 12px;
  color: #10B981;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const QuotaUpgrade = styled.button`
  background: #111827;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #1F2937;
  }
`;

const PageTitleWrap = styled.div`
  flex: 1;
  min-width: 0;
`;

const PageEyebrow = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #8a8a8a;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.35rem;
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 640px) {
    font-size: 10px;
  }
`;

const PageTitle = styled.h1`
  font-family: ${tokens.fontDisplay};
  font-size: clamp(1.7rem, 3vw, 2.35rem);
  font-weight: 400;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0 0 8px;
  color: ${tokens.textPrimary};

  @media (max-width: 640px) {
    font-size: 1.55rem;
  }
`;

const PageTitleEm = styled.span`
  font-style: normal;
  font-weight: 500;
  color: ${tokens.accentDeep};
  box-shadow: inset 0 -0.12em 0 ${tokens.accentBorder};
`;

const PageSub = styled.p`
  font-size: 0.95rem;
  color: ${tokens.textMuted};
  margin: 0;
  max-width: 36rem;
  line-height: 1.45;

  @media (max-width: 640px) {
    font-size: 0.88rem;
  }
`;

const DiscoverLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 0.85rem;
  margin-bottom: 0.25rem;
  padding: 0;
  border: 0;
  background: none;
  font-family: ${tokens.fontSans};
  font-size: 0.88rem;
  font-weight: 600;
  color: ${tokens.accentDeep};
  cursor: pointer;

  &:hover {
    color: ${tokens.accent};
  }

  svg {
    flex-shrink: 0;
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
  grid-template-columns: repeat(${p => p.$cols || 2}, 1fr);
  gap: 0.85rem;

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

// Brand Card Styles — matches preview-creator-dashboard-rebuild.html
const Card = styled.div`
  background: ${tokens.white};
  border: 1px solid #ebebeb;
  border-radius: 14px;
  padding: 1rem 1.05rem;
  position: relative;
  transition: border-color 0.2s, transform 0.2s;
  box-shadow: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  overflow: visible;

  &:hover {
    border-color: #b8d5cb;
    transform: translateY(-2px);
  }

  @media (max-width: 640px) {
    padding: 0.95rem 1rem;
  }
`;

const CardTopMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
`;

const UnlockedInline = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${tokens.accent};
`;

const MetaPill = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  border-radius: 6px;
  background: ${p => (
    p.$tone === 'hot' ? '#fdeee9' :
    p.$tone === 'match' ? '#f4f4f4' :
    tokens.accentSoft
  )};
  color: ${p => (
    p.$tone === 'hot' ? '#b33a1f' :
    p.$tone === 'match' ? '#444' :
    tokens.accentDeep
  )};
`;

const CardNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
`;

const CardAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: contain;
  background: #fafafa;
  border: 1px solid #f0f0f0;
  flex-shrink: 0;
`;

const CardAvatarFallback = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(145deg, #1a1a1a, #3d3d3d);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
`;

const CardNiche = styled.div`
  font-size: 0.8rem;
  color: ${tokens.muted};
  margin-top: 1px;
`;

const Pill = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.22rem 0.5rem;
  border-radius: 6px;
  background: ${p => (
    p.$tone === 'ok' ? tokens.accentSoft :
    p.$tone === 'email' ? '#fef3c7' :
    p.$tone === 'form' ? '#eff6ff' :
    p.$tone === 'aff' ? '#fce7f3' :
    '#f4f4f4'
  )};
  color: ${p => (
    p.$tone === 'ok' ? tokens.accentDeep :
    p.$tone === 'email' ? '#92400e' :
    p.$tone === 'form' ? '#1d4ed8' :
    p.$tone === 'aff' ? '#9d174d' :
    '#444'
  )};
`;

const PreviewStats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.1rem;
`;

const PreviewStat = styled.div`
  em {
    display: block;
    font-style: normal;
    font-weight: 500;
    font-size: 0.68rem;
    color: ${tokens.muted};
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
  font-size: 1.05rem;
  font-weight: 700;
  text-align: left;
  margin-bottom: 0;
  letter-spacing: -0.02em;
  word-break: break-word;
  line-height: 1.2;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

const CardDesc = styled.div`
  font-size: 0.86rem;
  color: ${tokens.muted};
  text-align: left;
  margin-bottom: 0;
  flex: 1;
  line-height: 1.5;
  /* Full description — no clamp (rebuild preview) */
  overflow: visible;
  white-space: normal;
`;

const CardTags = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 0.3rem;
  flex-wrap: wrap;
  margin-bottom: 0;
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
  padding: 0.7rem 1rem;
  background: ${p => p.$pitched ? tokens.accentSoft : tokens.action};
  color: ${p => p.$pitched ? tokens.accentDeep : '#fff'};
  border: ${p => p.$pitched ? `1px solid ${tokens.accentBorder}` : 'none'};
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: ${p => p.$pitched ? 'default' : 'pointer'};
  font-family: ${tokens.fontSans};
  transition: transform 0.12s, background 0.2s;
  margin-top: 0.25rem;

  &:hover:not(:disabled) {
    background: ${p => p.$pitched ? tokens.accentSoft : '#1C1C1C'};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
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
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 999;

  background: ${tokens.action};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.85rem 1.15rem;

  font-size: 0.9rem;
  font-weight: 600;
  font-family: ${tokens.fontSans};
  white-space: nowrap;

  display: flex;
  align-items: center;
  gap: 8px;

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);

  cursor: pointer;
  transition: background 0.2s, transform 0.12s;

  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: ${tokens.accentDeep};
    transform: translateY(-1px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${tokens.accent};
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


// Sub-tabs — preview .seg style
const SubTabRow = styled.div`
  display: flex;
  gap: 0.75rem;
  border-bottom: 1px solid ${tokens.line};
  margin-bottom: 0.85rem;
`;

const SubTab = styled.button`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0.5rem 0.1rem 0.65rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: ${p => (p.$active ? tokens.ink : '#999')};
  background: none;
  border: none;
  border-bottom: 2px solid ${p => (p.$active ? tokens.ink : 'transparent')};
  margin-bottom: -1px;
  cursor: pointer;
  font-family: ${tokens.fontSans};
  transition: color 0.15s;

  &:hover {
    color: ${tokens.ink};
  }
`;

const CountBadge = styled.span`
  background: ${tokens.ink};
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

// Kit nudge — preview .nudge style
const KitBuilderCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: linear-gradient(90deg, #f0faf6, #fff7f3);
  border: 1px solid ${tokens.line};
  border-radius: 12px;
  padding: 0.85rem 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${tokens.accentBorder};
  }

  @media (max-width: 700px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
`;

const KitBuilderProgress = styled.div`
  display: none;
`;

const KitProgressRing = styled.div`
  display: none;
`;

const KitProgressCircle = styled.div`
  display: none;
`;

const KitProgressText = styled.div`
  display: none;
`;

const KitBuilderContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const KitBuilderTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${tokens.ink};
  margin: 0 0 3px;
  line-height: 1.3;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const KitBuilderDesc = styled.p`
  font-size: 0.84rem;
  color: ${tokens.muted};
  margin: 0;
  line-height: 1.4;
`;

const KitBuilderStats = styled.div`
  display: none;
`;

const KitStat = styled.div`
  display: none;
`;

const KitBuilderBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${tokens.action};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
  font-family: ${tokens.fontSans};
  box-shadow: none;

  &:hover {
    background: ${tokens.accentDeep};
  }

  @media (max-width: 700px) {
    justify-content: center;
    width: 100%;
  }
`;

export default ForYou;

