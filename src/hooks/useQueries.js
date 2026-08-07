import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../config/api';
import axios from 'axios';

const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};
const API_BASE = getApiBase();

// Query keys for cache management
export const queryKeys = {
  profile: ['profile'],
  session: ['session'],
  user: ['user'],
  creatorStats: (creatorId) => ['creatorStats', creatorId],
  forYouBrands: (userId) => ['forYouBrands', userId],
  subscription: ['subscription'],
  pitchLimits: ['pitchLimits'],
  unlockBalance: ['unlockBalance'],
  savedBrands: ['savedBrands'],
  unlockedBrands: ['unlockedBrands'],
  kitViews: ['kitViews'],
  opportunities: ['opportunities'],
  managerBar: ['managerBar'],
  poolStats: ['poolStats'],
  creatorProfile: ['creatorProfile'],
  sponsorDrafts: ['sponsorDrafts'],
};

// User profile - most frequently accessed, cache aggressively
export const useProfile = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const response = await apiClient.get('/profile', { withCredentials: true });
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

// Session data - for brand_id fallback
export const useSession = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      const response = await apiClient.get('/api/session', { withCredentials: true });
      return response.data.session_contents || response.data || {};
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// Combined user data (profile + session)
export const useUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.user,
    queryFn: async () => {
      // Fetch both in parallel
      const [profileRes, sessionRes] = await Promise.all([
        apiClient.get('/profile', { withCredentials: true }),
        apiClient.get('/api/session', { withCredentials: true }).catch(() => ({ data: {} })),
      ]);

      const profileData = profileRes.data;
      const sessionData = sessionRes.data.session_contents || sessionRes.data || {};

      if (profileData.user_id) {
        return {
          id: profileData.user_id,
          role: profileData.user_role,
          creator_id: profileData.creator_id,
          brand_id: profileData.brand_id || sessionData.brand_id,
        };
      }
      return null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
};

// Creator stats for dashboard
export const useCreatorStats = (creatorId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.creatorStats(creatorId),
    queryFn: async () => {
      const response = await apiClient.get('/creators/me/stats', { withCredentials: true });
      return response.data;
    },
    enabled: !!creatorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Subscription status - cache for 5 minutes
export const useSubscription = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/subscription/status`, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Pitch limits
export const usePitchLimits = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.pitchLimits,
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/pitch-limits`, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// Unlock balance
export const useUnlockBalance = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.unlockBalance,
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/unlock-balance`, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// For You brands - the main feed
export const useForYouBrands = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.forYouBrands(userId),
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/for-you`, {
        withCredentials: true,
      });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 3 * 60 * 1000,
    ...options,
  });
};

// Saved brands (pipeline)
export const useSavedBrands = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.savedBrands,
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/pipeline`, {
        withCredentials: true,
      });
      return response.data?.brands || [];
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// Unlocked brands
export const useUnlockedBrands = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.unlockedBrands,
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/unlocked`, {
        withCredentials: true,
      });
      return response.data?.brands || [];
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// Kit views
export const useKitViews = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.kitViews,
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/pr-crm/kit-views`, {
          withCredentials: true,
        });
        return response.data;
      } catch {
        // Fallback to portfolio views
        const fallback = await axios.get(`${API_BASE}/api/portfolio/views`, {
          withCredentials: true,
        });
        return fallback.data;
      }
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Opportunities count
export const useOpportunityCount = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.opportunities,
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-crm/opportunities/count`, {
        withCredentials: true,
      });
      return response.data?.count || 0;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// AI Manager bar data
export const useManagerBar = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.managerBar,
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/pr-ready`, {
        withCredentials: true,
      });
      if (response.data?.success) {
        return response.data.manager_bar || null;
      }
      return null;
    },
    staleTime: 10 * 60 * 1000,
    // Initialize with cached value from sessionStorage
    initialData: () => {
      try {
        const cached = sessionStorage.getItem('nc_manager_bar_cache');
        return cached ? JSON.parse(cached) : undefined;
      } catch {
        return undefined;
      }
    },
    ...options,
  });
};

// Pool stats
export const usePoolStats = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.poolStats,
    queryFn: async () => {
      const [statsRes, membersRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE}/api/pool/stats`, { withCredentials: true }).catch(() => null),
        axios.get(`${API_BASE}/api/pool/members`, { withCredentials: true }).catch(() => null),
        axios.get(`${API_BASE}/api/pool/recent-activity`, { withCredentials: true }).catch(() => null),
      ]);
      return {
        stats: statsRes?.data || null,
        members: membersRes?.data?.members || [],
        hasRecentActivity: activityRes?.data?.has_recent_activity || false,
      };
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Creator profile for kit nudge
export const useCreatorProfile = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.creatorProfile,
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/api/creator/profile`, {
        withCredentials: true,
      });
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    ...options,
  });
};

// Sponsor drafts
export const useSponsorDrafts = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.sponsorDrafts,
    queryFn: async () => {
      const response = await apiClient.get('/my-sponsor-drafts', { withCredentials: true });
      return response.data;
    },
    staleTime: 2 * 60 * 1000,
    ...options,
  });
};

// Mutation hooks for actions

// Save brand to pipeline
export const useSaveBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId) => {
      const response = await axios.post(
        `${API_BASE}/api/pr-crm/pipeline/add`,
        { brand_id: brandId },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate saved brands cache
      queryClient.invalidateQueries({ queryKey: queryKeys.savedBrands });
    },
  });
};

// Remove brand from pipeline
export const useRemoveBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId) => {
      const response = await axios.post(
        `${API_BASE}/api/pr-crm/pipeline/remove`,
        { brand_id: brandId },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedBrands });
    },
  });
};

// Unlock brand contact
export const useUnlockBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId) => {
      const response = await axios.post(
        `${API_BASE}/api/pr-crm/unlock`,
        { brand_id: brandId },
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related caches
      queryClient.invalidateQueries({ queryKey: queryKeys.unlockedBrands });
      queryClient.invalidateQueries({ queryKey: queryKeys.unlockBalance });
    },
  });
};

// Prefetch utilities for instant navigation

export const usePrefetch = () => {
  const queryClient = useQueryClient();

  return {
    prefetchForYou: (userId) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.forYouBrands(userId),
        queryFn: async () => {
          const response = await axios.get(`${API_BASE}/api/pr-crm/for-you`, {
            withCredentials: true,
          });
          return response.data;
        },
        staleTime: 3 * 60 * 1000,
      });
    },
    prefetchSubscription: () => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.subscription,
        queryFn: async () => {
          const response = await axios.get(`${API_BASE}/api/subscription/status`, {
            withCredentials: true,
          });
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchProfile: () => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.profile,
        queryFn: async () => {
          const response = await apiClient.get('/profile', { withCredentials: true });
          return response.data;
        },
        staleTime: 10 * 60 * 1000,
      });
    },
  };
};

export default {
  queryKeys,
  useProfile,
  useSession,
  useUser,
  useCreatorStats,
  useSubscription,
  usePitchLimits,
  useUnlockBalance,
  useForYouBrands,
  useSavedBrands,
  useUnlockedBrands,
  useKitViews,
  useOpportunityCount,
  useManagerBar,
  usePoolStats,
  useCreatorProfile,
  useSponsorDrafts,
  useSaveBrand,
  useRemoveBrand,
  useUnlockBrand,
  usePrefetch,
};
