import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ExternalLink, Sparkles, Zap } from 'lucide-react';
import { Avatar, message } from 'antd';
import api from '../config/api';
import UpgradeModal from '../creator-portal/UpgradeModal';

// ============================================================
// STYLED COMPONENTS
// ============================================================

const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 24px 20px 100px;
`;

// Dark credit bar (matching mockup)
const CreditBar = styled.div`
  background: #0F0F0F;
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CreditLeft = styled.div``;

const CreditLabel = styled.div`
  font-size: 10px;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const CreditValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: #E11D48;
`;

const CreditRight = styled.div`
  text-align: right;
`;

// Green flashy followers gained in header
const FollowersGained = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(16, 185, 129, 0.15);
  border-radius: 8px;
  padding: 8px 12px;
`;

const GainNumber = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: #10B981;
  animation: pulse-glow 1.5s ease-in-out infinite;

  @keyframes pulse-glow {
    0%, 100% {
      text-shadow: 0 0 4px rgba(16, 185, 129, 0.4);
    }
    50% {
      text-shadow: 0 0 12px rgba(16, 185, 129, 0.8), 0 0 20px rgba(16, 185, 129, 0.4);
    }
  }
`;

const GainLabel = styled.span`
  font-size: 11px;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const VisibilityStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: ${p => p.$active ? '#F97316' : '#9CA3AF'};
`;

// Pulsing fire animation for active status
const PulsingFire = styled.span`
  display: inline-flex;
  align-items: center;
  animation: fire-pulse 1.2s ease-in-out infinite;

  @keyframes fire-pulse {
    0%, 100% {
      transform: scale(1);
      filter: drop-shadow(0 0 2px rgba(249, 115, 22, 0.4));
    }
    50% {
      transform: scale(1.15);
      filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.8)) drop-shadow(0 0 12px rgba(234, 88, 12, 0.5));
    }
  }

  svg {
    color: #F97316;
  }
`;

// Progress bar for weekly goal
const ProgressSection = styled.div`
  margin-bottom: 20px;
`;

const ProgressTrack = styled.div`
  height: 6px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #E11D48, #F43F5E);
  width: ${p => Math.min((p.$progress / p.$goal) * 100, 100)}%;
  transition: width 0.3s ease;
`;

const ProgressLabel = styled.div`
  font-size: 11px;
  color: #6B7280;
  margin-top: 6px;
  text-align: center;
`;

// Card list container
const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const CreatorCard = styled.div`
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
`;

const CardAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background: #F3F4F6;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CreatorName = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #0F0F0F;
`;

const CreatorMeta = styled.div`
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
`;

const MatchTag = styled.span`
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  background: #F3E8FF;
  color: #7C3AED;
  padding: 3px 10px;
  border-radius: 20px;
  margin-top: 6px;
`;

const CardActions = styled.div`
  padding: 0 16px 16px;
  display: flex;
  gap: 10px;
`;

const FollowButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  background: #0F0F0F;
  font-size: 13px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: #1a1a1a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Confirmation action button - needs to look like an action, not a completed state
const ConfirmButton = styled.button`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #10B981;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  font-weight: 700;
  color: #059669;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  animation: pulse-border 1.5s infinite;

  @keyframes pulse-border {
    0%, 100% { border-color: #10B981; }
    50% { border-color: #34D399; box-shadow: 0 0 8px rgba(16, 185, 129, 0.3); }
  }

  &:hover {
    background: #ECFDF5;
    transform: scale(1.02);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    animation: none;
  }
`;

// Locked overlay when out of credits
const LockedOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  z-index: 10;
`;

const LockedIcon = styled.div`
  font-size: 32px;
`;

const LockedTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #0F0F0F;
`;

const LockedText = styled.div`
  font-size: 12px;
  color: #6B7280;
`;

const ProButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: #7C3AED;
  font-size: 13px;
  font-weight: 700;
  color: white;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;

  &:hover {
    background: #6D28D9;
  }
`;

// Success banner after confirming
const SuccessBanner = styled(motion.div)`
  background: linear-gradient(135deg, #1a1a1a, #2d0a13);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 16px;
  color: white;
`;

const SuccessTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 4px;
`;

const SuccessDesc = styled.div`
  font-size: 12px;
  color: #D1D5DB;
  line-height: 1.5;
`;

// Who boosted you section
const SupportersSection = styled.div`
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 16px;
  margin-top: 24px;
`;

const SupportersTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #0F0F0F;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PulsingDot = styled.span`
  width: 8px;
  height: 8px;
  background: #10B981;
  border-radius: 50%;
  display: inline-block;
  animation: pulse-dot 1.5s ease-in-out infinite;

  @keyframes pulse-dot {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
    }
    50% {
      transform: scale(1.1);
      box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
    }
  }
`;

const SupporterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #F3F4F6;

  &:last-child {
    border-bottom: none;
  }
`;

const SupporterInfo = styled.div`
  font-size: 13px;
  color: #0F0F0F;

  b {
    font-weight: 600;
  }

  span {
    color: #9CA3AF;
    font-size: 11px;
  }
`;


// Fixed toast at bottom
const BottomToast = styled(motion.div)`
  position: fixed;
  bottom: 80px;
  left: 16px;
  right: 16px;
  max-width: 500px;
  margin: 0 auto;
  background: #0F0F0F;
  color: white;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 999;
`;

// Empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 48px 20px;
  background: white;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #F3E8FF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;

  svg {
    width: 28px;
    height: 28px;
    color: #7C3AED;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #0F0F0F;
  margin: 0 0 6px;
`;

const EmptyText = styled.p`
  font-size: 13px;
  color: #6B7280;
  margin: 0;
`;

// Blurred card overlay for "show more" effect
const BlurredCardOverlay = styled.div`
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.9) 60%, white 100%);
    pointer-events: none;
    border-radius: 16px;
  }
`;

// Modern modal overlay for first-time users
const IntroModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const IntroModal = styled(motion.div)`
  background: white;
  border-radius: 24px;
  padding: 40px 28px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const IntroIconContainer = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 40px;
`;

const IntroTitle = styled.h2`
  font-size: 24px;
  font-weight: 800;
  color: #0F0F0F;
  margin: 0 0 8px;
`;

const IntroSubtitle = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 0 0 28px;
  line-height: 1.5;
`;

// 3-step how it works
const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  text-align: left;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: #F9FAFB;
  padding: 14px 16px;
  border-radius: 12px;
`;

const StepNumber = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F97316, #EA580C);
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StepText = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  padding-top: 3px;
  font-weight: 500;
`;

const IntroButton = styled.button`
  width: 100%;
  padding: 16px 28px;
  background: linear-gradient(135deg, #F97316, #EA580C);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5);
  }

  &:active {
    transform: translateY(0);
  }
`;

// TikTok icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Instagram icon
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// ============================================================
// COMPONENT
// ============================================================

const BASE_DAILY_LIMIT = 5;  // Base: 5/day, +2 bonus at 3-day streak
const INITIAL_VISIBLE = 3;
const INTRO_SEEN_KEY = 'pool_intro_seen';

const Pool = () => {
  const [credits, setCredits] = useState(null);
  const [allMatches, setAllMatches] = useState([]); // Full list of fetched creators
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pendingCreatorId, setPendingCreatorId] = useState(null); // Track which creator is pending confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [lastSupportedName, setLastSupportedName] = useState('');
  // Initialize showIntro from localStorage immediately (not in async useEffect)
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem(INTRO_SEEN_KEY));
  const [hasMore, setHasMore] = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Track IDs we've supported in this session to prevent showing them again
  const supportedIdsRef = useRef(new Set());

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [creditsRes, matchesRes, supportersRes] = await Promise.all([
          api.get('/api/pool/credits'),
          api.get('/api/pool/matches?limit=50'),
          api.get('/api/pool/supporters').catch(() => ({ data: { supporters: [] } }))
        ]);
        setCredits(creditsRes.data);

        // Set matches from API - filter out any we've already supported in this session
        const matches = (matchesRes.data.matches || []).filter(m => !supportedIdsRef.current.has(m.id));
        setAllMatches(matches);
        setHasMore(matches.length >= 20);
        setSupporters(supportersRes.data.supporters || []);
      } catch (error) {
        console.error('Error fetching pool data:', error);
        message.error('Failed to load pool data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Mark intro as seen and dismiss
  const dismissIntro = () => {
    localStorage.setItem(INTRO_SEEN_KEY, 'true');
    setShowIntro(false);
  };

  // Daily quota: free users get 3 boosts per day
  // Dynamic daily limit from API (base 5 + 2 streak bonus at 3+ days)
  const dailyLimit = credits?.daily_limit || BASE_DAILY_LIMIT;
  const streakBonus = credits?.streak_bonus || 0;
  const hasStreakBonus = credits?.has_streak_bonus || false;
  const streakDays = credits?.streak_days || 0;
  const givenToday = credits?.given_today || 0;
  const isOutOfCredits = !credits?.is_pro && givenToday >= dailyLimit;
  // Visibility: Pro users always visible, free users visible only when they have balance AND haven't exhausted quota
  const isVisible = credits?.is_pro || ((credits?.balance || 0) > 0 && !isOutOfCredits);

  const getDeepLinks = (platform, username) => {
    if (platform === 'tiktok') {
      return {
        app: `tiktok://user?username=${username}`,
        web: `https://www.tiktok.com/@${username}`
      };
    }
    return {
      app: `instagram://user?username=${username}`,
      web: `https://instagram.com/${username}`
    };
  };

  const handleFollow = useCallback((creator) => {
    const platform = creator.instagram_handle ? 'instagram' : 'tiktok';
    const username = creator.instagram_handle || creator.tiktok_handle;

    if (!username) {
      // Fallback to kit if no social handle
      window.open(`/creator/${creator.username}`, '_blank');
      return;
    }

    const { web } = getDeepLinks(platform, username);

    // Open social profile in new tab (more reliable than deep linking on desktop)
    window.open(web, '_blank');

    // Immediately show confirmation button for this creator
    setPendingCreatorId(creator.id);
  }, []);

  // Load more creators
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      // Pass current visible IDs + supported IDs to avoid duplicates
      const currentIds = allMatches.map(m => m.id);
      const allExcludeIds = [...currentIds, ...Array.from(supportedIdsRef.current)];
      const excludeIds = allExcludeIds.join(',');
      const response = await api.get(`/api/pool/matches?limit=50&exclude=${excludeIds}`);
      const newMatches = (response.data.matches || []).filter(m => !supportedIdsRef.current.has(m.id));

      if (newMatches.length > 0) {
        setAllMatches(prev => [...prev, ...newMatches]);
      }
      setHasMore(newMatches.length >= 20);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, allMatches]);

  const confirmSupport = async (creator) => {
    if (!creator || isProcessing) return;

    // Check quota before allowing support (prevent edge case of exceeding daily limit)
    if (!credits?.is_pro && givenToday >= dailyLimit) {
      message.info('Daily limit reached. Come back tomorrow!');
      setPendingCreatorId(null);
      return;
    }

    setIsProcessing(true);
    try {
      const platform = creator.instagram_handle ? 'instagram' : 'tiktok';
      const response = await api.post('/api/pool/support', {
        target_id: creator.id,
        platform: platform
      });

      if (response.data.success) {
        // Track as supported locally
        supportedIdsRef.current.add(creator.id);

        setLastSupportedName(creator.instagram_handle || creator.tiktok_handle || creator.username);
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 5000);

        // Update credits with fresh data from response
        setCredits(prev => ({
          ...prev,
          balance: response.data.new_balance,
          streak_days: response.data.streak_days,
          given_today: (prev?.given_today || prev?.given_this_week || 0) + 1
        }));

        // Remove from list immediately
        removeCreatorFromList(creator.id);
      }
    } catch (error) {
      console.error('Error confirming support:', error);
      if (error.response?.data?.error === 'Already boosted this creator') {
        message.info('You already boosted this creator');
        supportedIdsRef.current.add(creator.id);
        removeCreatorFromList(creator.id);
      } else {
        message.error('Failed to confirm boost');
      }
    } finally {
      setIsProcessing(false);
      setPendingCreatorId(null);
    }
  };

  const removeCreatorFromList = (creatorId) => {
    setPendingCreatorId(null);
    setAllMatches(prev => {
      const newMatches = prev.filter(m => m.id !== creatorId);
      // Auto-load more if running low - keep at least 10 creators in queue
      if (newMatches.length < 10 && hasMore && !loadingMore) {
        loadMore();
      }
      return newMatches;
    });
  };

  const formatFollowers = (count) => {
    if (!count) return '—';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Format niche - extract first item from array/JSON if needed
  const formatNiche = (niche) => {
    if (!niche) return null;
    // If it's already a clean string
    if (typeof niche === 'string') {
      // Check if it's a JSON array string
      if (niche.startsWith('[')) {
        try {
          const parsed = JSON.parse(niche);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed[0];
          }
        } catch {
          // Not valid JSON, return as-is but clean up
          return niche.replace(/[\[\]"]/g, '').split(',')[0].trim();
        }
      }
      return niche;
    }
    // If it's an array
    if (Array.isArray(niche) && niche.length > 0) {
      return niche[0];
    }
    return String(niche);
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <PageContainer>
        <CreditBar>
          <CreditLeft>
            <CreditLabel>Loading...</CreditLabel>
            <CreditValue>—</CreditValue>
          </CreditLeft>
        </CreditBar>
      </PageContainer>
    );
  }

  // Use givenToday for display (defined above in isOutOfCredits logic)

  return (
    <PageContainer>
      {/* First-time intro modal */}
      <AnimatePresence>
        {showIntro && (
          <IntroModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissIntro}
          >
            <IntroModal
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <IntroIconContainer>🔥</IntroIconContainer>
              <IntroTitle>Welcome to the Pool</IntroTitle>
              <IntroSubtitle>A give-to-get community where creators grow together</IntroSubtitle>
              <StepsContainer>
                <Step>
                  <StepNumber>1</StepNumber>
                  <StepText>Follow 5 creators in your niche today (up to 7 with streak bonus!)</StepText>
                </Step>
                <Step>
                  <StepNumber>2</StepNumber>
                  <StepText>Your profile becomes visible to others</StepText>
                </Step>
                <Step>
                  <StepNumber>3</StepNumber>
                  <StepText>Get followed back by creators like you</StepText>
                </Step>
              </StepsContainer>
              <IntroButton onClick={dismissIntro}>
                Let's boost my followers 🔥
              </IntroButton>
            </IntroModal>
          </IntroModalOverlay>
        )}
      </AnimatePresence>

      {/* Main content */}
      <>
      {/* Followers Gained Banner - ALWAYS visible for social proof */}
      <FollowersGained style={{ marginBottom: '12px', justifyContent: 'center', padding: '12px 16px' }}>
        <GainNumber>+{credits?.received_this_week || 0}</GainNumber>
        <GainLabel>followers gained<br/>this week from Pool</GainLabel>
      </FollowersGained>

      {/* Dark credit bar */}
      <CreditBar>
        <CreditLeft>
          <CreditLabel>
            Daily boosts left
            {hasStreakBonus && <span style={{ color: '#F97316', marginLeft: '4px' }}>🔥+{streakBonus}</span>}
          </CreditLabel>
          <CreditValue>{credits?.is_pro ? '∞' : Math.max(0, dailyLimit - givenToday)}</CreditValue>
        </CreditLeft>
        <CreditRight>
          <CreditLabel>Your growth</CreditLabel>
          <VisibilityStatus $active={isVisible}>
            {isVisible ? (
              <><PulsingFire><Flame size={16} /></PulsingFire> Active</>
            ) : (
              <>⏸ Paused</>
            )}
          </VisibilityStatus>
        </CreditRight>
      </CreditBar>

      {/* Streak progress indicator */}
      {!credits?.is_pro && streakDays > 0 && (
        <div style={{
          background: hasStreakBonus ? 'linear-gradient(135deg, #FEF3C7, #FDE68A)' : '#F9FAFB',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: hasStreakBonus ? '#92400E' : '#6B7280'
        }}>
          <span style={{ fontSize: '16px' }}>🔥</span>
          <span>
            <b>{streakDays}-day streak!</b>
            {hasStreakBonus
              ? ' +2 bonus boosts unlocked'
              : ` ${3 - streakDays} more day${3 - streakDays > 1 ? 's' : ''} for +2 bonus boosts`
            }
          </span>
        </div>
      )}

      {/* Daily progress - hide when quota reached since we show the locked banner */}
      {!credits?.is_pro && !isOutOfCredits && (
        <ProgressSection>
          <ProgressTrack>
            <ProgressFill $progress={givenToday} $goal={dailyLimit} />
          </ProgressTrack>
          <ProgressLabel>
            {Math.min(givenToday, dailyLimit)} of {dailyLimit} boosts given today
            {givenToday >= dailyLimit && ' ✓'}
          </ProgressLabel>
        </ProgressSection>
      )}

      {/* Success banner - only show quota progress for free users */}
      <AnimatePresence>
        {showSuccessBanner && !credits?.is_pro && (
          <SuccessBanner
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SuccessTitle>🎉 {Math.min(givenToday, dailyLimit)} of {dailyLimit} boosts given today</SuccessTitle>
            <SuccessDesc>
              {givenToday >= dailyLimit
                ? "You're growing! Come back tomorrow for more boosts."
                : `Boost ${dailyLimit - givenToday} more to unlock full growth today.`
              }
            </SuccessDesc>
          </SuccessBanner>
        )}
      </AnimatePresence>

      {/* Out of credits - upgrade prompt at top */}
      {isOutOfCredits && (
        <div style={{
          background: 'linear-gradient(135deg, #581C87, #7C3AED)',
          borderRadius: '14px',
          padding: '20px',
          marginBottom: '16px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🚀</div>
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
            Get unlimited boosts from creators in the Pool
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9, lineHeight: 1.5, marginBottom: '16px' }}>
            You've used today's 3 boosts. Go Pro for unlimited daily boosts and priority placement — never miss new followers.
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            style={{
              background: 'white',
              color: '#7C3AED',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Upgrade to Pro →
          </button>
        </div>
      )}

      {/* Creator cards list - continuous feed */}
      <CardList>
        {allMatches.length > 0 ? (
          <>
            {/* For free users: 3 active cards, rest blurred. For pro: all active */}
            {allMatches.slice(0, credits?.is_pro ? visibleCount : Math.max(visibleCount, 6)).map((creator, idx) => {
              // Free users: first 3 are active (based on remaining quota), rest are blurred
              const remainingQuota = credits?.is_pro ? 999 : Math.max(0, dailyLimit - givenToday);
              const isLocked = !credits?.is_pro && idx >= remainingQuota;

              return (
                <CreatorCard
                  key={creator.id}
                  style={isLocked ? { opacity: 0.4, filter: 'blur(3px)', pointerEvents: 'none' } : {}}
                >
                  <CardTop>
                    <CardAvatar>
                      {creator.profile_image_url ? (
                        <img src={creator.profile_image_url} alt={creator.username} />
                      ) : (
                        <Avatar size={56} style={{ background: '#E5E7EB', fontSize: '20px' }}>
                          {(creator.display_name || creator.username)?.[0]?.toUpperCase()}
                        </Avatar>
                      )}
                    </CardAvatar>
                    <CardInfo>
                      <CreatorName>@{creator.instagram_handle || creator.tiktok_handle || creator.username}</CreatorName>
                      <CreatorMeta>
                        {formatFollowers(creator.followers_count)} followers
                        {creator.niche && ` · ${formatNiche(creator.niche)}`}
                      </CreatorMeta>
                      {creator.match_score >= 80 && (
                        <MatchTag>Matches your tier</MatchTag>
                      )}
                    </CardInfo>
                  </CardTop>
                  {!isLocked && (
                    <CardActions>
                      {pendingCreatorId === creator.id ? (
                        <ConfirmButton onClick={() => confirmSupport(creator)} disabled={isProcessing}>
                          {isProcessing ? 'Confirming...' : '✔️ Followed, get my follow back'}
                        </ConfirmButton>
                      ) : (
                        <FollowButton onClick={() => handleFollow(creator)} style={{ flex: 1 }}>
                          {creator.instagram_handle ? (
                            <InstagramIcon />
                          ) : creator.tiktok_handle ? (
                            <TikTokIcon />
                          ) : (
                            <ExternalLink size={14} />
                          )}
                          {creator.instagram_handle ? 'Follow on Instagram →' : creator.tiktok_handle ? 'Follow on TikTok →' : 'View Kit'}
                        </FollowButton>
                      )}
                    </CardActions>
                  )}
                </CreatorCard>
              );
            })}


            {/* Load more for pro users */}
            {credits?.is_pro && allMatches.length > visibleCount && (
              <BlurredCardOverlay onClick={() => {
                setVisibleCount(prev => prev + 3);
                if (allMatches.length - visibleCount < 5 && hasMore) {
                  loadMore();
                }
              }} style={{ cursor: 'pointer' }}>
                <CreatorCard>
                  <CardTop>
                    <CardAvatar>
                      <Avatar size={56} style={{ background: '#E5E7EB', fontSize: '20px' }}>
                        {(allMatches[visibleCount]?.display_name || allMatches[visibleCount]?.username)?.[0]?.toUpperCase()}
                      </Avatar>
                    </CardAvatar>
                    <CardInfo>
                      <CreatorName>+{allMatches.length - visibleCount} more creators</CreatorName>
                      <CreatorMeta>Tap to see more</CreatorMeta>
                    </CardInfo>
                  </CardTop>
                </CreatorCard>
              </BlurredCardOverlay>
            )}
          </>
        ) : (
          <EmptyState>
            <EmptyIcon><Sparkles /></EmptyIcon>
            <EmptyTitle>No more creators right now</EmptyTitle>
            <EmptyText>Check back later for more matches in your niche</EmptyText>
          </EmptyState>
        )}
      </CardList>

      {/* Your Pool Gains - always show this section */}
      <SupportersSection>
        <SupportersTitle><PulsingDot /> Who boosted you this week</SupportersTitle>
        {supporters.length > 0 ? (
          <>
            {supporters.slice(0, 5).map((supporter, idx) => (
              <SupporterRow key={idx}>
                <SupporterInfo>
                  <b>@{supporter.username}</b> followed you · <span>{formatTimeAgo(supporter.confirmed_at)}</span>
                </SupporterInfo>
                <button
                  onClick={() => {
                    const platform = supporter.platform || 'instagram';
                    const handle = supporter.username;
                    if (platform === 'tiktok') {
                      window.open(`https://www.tiktok.com/@${handle}`, '_blank');
                    } else {
                      window.open(`https://instagram.com/${handle}`, '_blank');
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    color: '#6B7280',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Didn't follow back?
                </button>
              </SupporterRow>
            ))}
          </>
        ) : (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '13px',
            background: '#F9FAFB',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            No one has boosted you yet this week.<br/>
            Keep boosting creators to stay visible!
          </div>
        )}
      </SupportersSection>
      </>

      {/* Bottom tip toast */}
      <AnimatePresence>
        {!pendingCreatorId && !showSuccessBanner && givenToday > 0 && givenToday < dailyLimit && (
          <BottomToast
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Zap size={16} color="#E11D48" />
            Boosting creators increases how often you appear in others' feeds
          </BottomToast>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="pool"
      />
    </PageContainer>
  );
};

export default Pool;
