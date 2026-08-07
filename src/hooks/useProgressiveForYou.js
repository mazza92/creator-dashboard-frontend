import { useQuery, useQueries } from '@tanstack/react-query';
import axios from 'axios';

const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};
const API_BASE = getApiBase();

/**
 * Progressive loading hook for ForYou page
 *
 * Prioritization strategy (matches modern SaaS like Linear, Notion):
 * 1. CRITICAL (blocks UI): Main feed, subscription status
 * 2. IMPORTANT (show skeleton): Saved brands, unlocked brands
 * 3. DEFERRED (load in background): Social proof, pool data, kit views
 *
 * Benefits:
 * - Shows meaningful content faster (perceived performance)
 * - Caches data for instant subsequent loads
 * - Deduplicates requests across components
 */
export const useProgressiveForYou = () => {
  // CRITICAL: Main feed data - this is what users came for
  const forYouQuery = useQuery({
    queryKey: ['forYou', 'mainFeed'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/for-you`, {
        withCredentials: true,
      });
      if (response.data.success) {
        return response.data;
      }
      throw new Error('Failed to load recommendations');
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // CRITICAL: Subscription status - affects UI rendering
  const subscriptionQuery = useQuery({
    queryKey: ['subscription', 'status'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/subscription/status`, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // IMPORTANT: Pitch limits - affects CTA visibility
  const pitchLimitsQuery = useQuery({
    queryKey: ['pitchLimits'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/pitch-limits`, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // IMPORTANT: Unlock balance - affects unlock CTAs
  const unlockBalanceQuery = useQuery({
    queryKey: ['unlockBalance'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/unlocks/balance`, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // IMPORTANT: Pipeline data - shows saved/pitched status
  const pipelineQuery = useQuery({
    queryKey: ['pipeline'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/pipeline`, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // IMPORTANT: Unlocked brands - shows unlock status
  const unlockedBrandsQuery = useQuery({
    queryKey: ['unlockedBrands'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/unlocks/brands`, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  // DEFERRED: Secondary data (loaded after critical data)
  // These use enabled: to defer until critical data is loaded
  const isCriticalLoaded = !forYouQuery.isLoading && !subscriptionQuery.isLoading;

  const managerBarQuery = useQuery({
    queryKey: ['managerBar'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-ready`, {
        withCredentials: true,
      });
      return response.data?.success ? response.data.manager_bar : null;
    },
    staleTime: 10 * 60 * 1000,
    enabled: isCriticalLoaded,
    // Use cached value from sessionStorage as initial data
    initialData: () => {
      try {
        const cached = sessionStorage.getItem('nc_manager_bar_cache');
        return cached ? JSON.parse(cached) : undefined;
      } catch {
        return undefined;
      }
    },
  });

  const kitViewsQuery = useQuery({
    queryKey: ['kitViews'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/pr-crm/kit-views`, {
          withCredentials: true,
        });
        return response.data;
      } catch {
        const fallback = await axios.get(`${API_BASE}/api/portfolio/views`, {
          withCredentials: true,
        });
        return fallback.data;
      }
    },
    staleTime: 5 * 60 * 1000,
    enabled: isCriticalLoaded,
  });

  const opportunitiesQuery = useQuery({
    queryKey: ['opportunities', 'count'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/opportunities/list`, {
        withCredentials: true,
      });
      if (response.data.success) {
        const matched = response.data.matched || [];
        const others = response.data.others || [];
        return matched.length + others.length;
      }
      return 0;
    },
    staleTime: 5 * 60 * 1000,
    enabled: isCriticalLoaded,
  });

  const socialProofQuery = useQuery({
    queryKey: ['socialProof', 'brands'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/social-proof-brands`, {
        withCredentials: true,
      });
      return response.data?.brands || [];
    },
    staleTime: 10 * 60 * 1000,
    enabled: isCriticalLoaded,
  });

  const poolDataQuery = useQuery({
    queryKey: ['pool', 'data'],
    queryFn: async () => {
      const [statsRes, membersRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE}/api/pool/stats`, { withCredentials: true }).catch(() => null),
        axios.get(`${API_BASE}/api/pool/active-members`, { withCredentials: true }).catch(() => null),
        axios.get(`${API_BASE}/api/pool/recent-activity`, { withCredentials: true }).catch(() => null),
      ]);
      return {
        stats: statsRes?.data || null,
        members: membersRes?.data?.members || [],
        hasRecentActivity: activityRes?.data?.has_recent_activity || false,
      };
    },
    staleTime: 5 * 60 * 1000,
    enabled: isCriticalLoaded,
  });

  // Derived state
  const isPro = ['pro', 'elite'].includes(subscriptionQuery.data?.tier || 'free');

  // Process pipeline data
  const savedIds = new Set(
    pipelineQuery.data?.pipeline?.map(item => item.brand_id) || []
  );
  const pitchedIds = new Set(
    pipelineQuery.data?.pipeline
      ?.filter(item => item.send_confirmed || item.pitched_at)
      .map(item => item.brand_id) || []
  );
  const unlockedIds = new Set(
    unlockedBrandsQuery.data?.unlocked_brand_ids || []
  );

  return {
    // Loading states (progressive)
    isLoading: forYouQuery.isLoading, // Only block on critical data
    isCriticalLoading: forYouQuery.isLoading || subscriptionQuery.isLoading,
    isSecondaryLoading: !isCriticalLoaded,

    // Critical data
    data: forYouQuery.data,
    subscriptionTier: subscriptionQuery.data?.tier || 'free',
    isPro,

    // Important data
    pitchLimits: pitchLimitsQuery.data || { used: 0, limit: 3, canPitch: true },
    unlockBalance: unlockBalanceQuery.data || { remaining: 3, tier: 'free', reset_at: null, is_unlimited: false },
    savedIds,
    pitchedIds,
    unlockedIds,

    // Deferred data
    managerBar: managerBarQuery.data,
    kitViews: kitViewsQuery.data || { views_this_week: 0, brands_this_week: 0, views: [], is_pro: false },
    opportunityCount: opportunitiesQuery.data || 0,
    socialProofBrands: socialProofQuery.data || [],
    poolData: poolDataQuery.data || { stats: null, members: [], hasRecentActivity: false },

    // Refetch functions
    refetchPipeline: pipelineQuery.refetch,
    refetchUnlockBalance: unlockBalanceQuery.refetch,
    refetchUnlockedBrands: unlockedBrandsQuery.refetch,

    // Error states
    error: forYouQuery.error,
    isError: forYouQuery.isError,
  };
};

export default useProgressiveForYou;
