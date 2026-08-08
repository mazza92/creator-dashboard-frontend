import React, { useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};
const API_BASE = getApiBase();

/**
 * Prefetch configuration for routes
 * Maps route paths to their data prefetch functions
 */
const PREFETCH_CONFIG = {
  '/creator/dashboard/for-you': async (queryClient) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['forYou', 'mainFeed'],
        queryFn: async () => {
          const response = await axios.get(`${API_BASE}/api/pr-crm/for-you`, {
            withCredentials: true,
          });
          return response.data;
        },
        staleTime: 3 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['subscription', 'status'],
        queryFn: async () => {
          const response = await axios.get(`${API_BASE}/api/subscription/status`, {
            withCredentials: true,
          });
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  },

  '/creator/dashboard/overview': async (queryClient) => {
    await queryClient.prefetchQuery({
      queryKey: ['creatorStats'],
      queryFn: async () => {
        const response = await axios.get(`${API_BASE}/creators/me/stats`, {
          withCredentials: true,
        });
        return response.data;
      },
      staleTime: 2 * 60 * 1000,
    });
  },

  '/creator/dashboard/pr-pipeline': async (queryClient) => {
    await queryClient.prefetchQuery({
      queryKey: ['pipeline'],
      queryFn: async () => {
        const response = await axios.get(`${API_BASE}/api/pr-crm/pipeline`, {
          withCredentials: true,
        });
        return response.data;
      },
      staleTime: 2 * 60 * 1000,
    });
  },

  '/creator/dashboard/pool': async (queryClient) => {
    await queryClient.prefetchQuery({
      queryKey: ['pool', 'data'],
      queryFn: async () => {
        const [statsRes, membersRes] = await Promise.all([
          axios.get(`${API_BASE}/api/pool/stats`, { withCredentials: true }).catch(() => null),
          axios.get(`${API_BASE}/api/pool/active-members`, { withCredentials: true }).catch(() => null),
        ]);
        return {
          stats: statsRes?.data || null,
          members: membersRes?.data?.members || [],
        };
      },
      staleTime: 5 * 60 * 1000,
    });
  },

  '/creator/dashboard/pr-brands': async (queryClient) => {
    await queryClient.prefetchQuery({
      queryKey: ['directory', 'brands'],
      queryFn: async () => {
        const response = await axios.get(`${API_BASE}/api/pr-crm/for-you`, {
          withCredentials: true,
        });
        return response.data;
      },
      staleTime: 3 * 60 * 1000,
    });
  },

  '/creator/dashboard/pr-ready': async (queryClient) => {
    await queryClient.prefetchQuery({
      queryKey: ['managerBar'],
      queryFn: async () => {
        const response = await axios.get(`${API_BASE}/api/pr-ready`, {
          withCredentials: true,
        });
        return response.data?.success ? response.data : null;
      },
      staleTime: 10 * 60 * 1000,
    });
  },

  '/creator/dashboard/my-kit': async (queryClient) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['portfolio', 'posts'],
        queryFn: async () => {
          const response = await axios.get(`${API_BASE}/api/portfolio/posts`, {
            withCredentials: true,
          });
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['portfolio', 'settings'],
        queryFn: async () => {
          const response = await axios.get(`${API_BASE}/api/portfolio/settings`, {
            withCredentials: true,
          });
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
      }),
    ]);
  },
};

/**
 * PrefetchLink - A Link component that prefetches route data on hover
 *
 * Usage:
 * <PrefetchLink to="/creator/dashboard/for-you">For You</PrefetchLink>
 *
 * Benefits:
 * - Data starts loading before navigation (feels instant)
 * - Uses React Query cache (no duplicate requests)
 * - Graceful fallback if prefetch fails
 */
export const PrefetchLink = ({
  to,
  children,
  prefetchDelay = 100,
  ...props
}) => {
  const queryClient = useQueryClient();
  let timeoutId = null;

  const handleMouseEnter = useCallback(() => {
    // Debounce to avoid prefetching on quick hover-overs
    timeoutId = setTimeout(() => {
      const prefetchFn = PREFETCH_CONFIG[to];
      if (prefetchFn) {
        prefetchFn(queryClient).catch(() => {
          // Silently fail - prefetch is an optimization, not required
        });
      }
    }, prefetchDelay);
  }, [to, queryClient, prefetchDelay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }, []);

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
};

/**
 * PrefetchNavLink - Same as PrefetchLink but with NavLink (active states)
 */
export const PrefetchNavLink = ({
  to,
  children,
  prefetchDelay = 100,
  ...props
}) => {
  const queryClient = useQueryClient();
  let timeoutId = null;

  const handleMouseEnter = useCallback(() => {
    timeoutId = setTimeout(() => {
      const prefetchFn = PREFETCH_CONFIG[to];
      if (prefetchFn) {
        prefetchFn(queryClient).catch(() => {});
      }
    }, prefetchDelay);
  }, [to, queryClient, prefetchDelay]);

  const handleMouseLeave = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }, []);

  return (
    <NavLink
      to={to}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      {...props}
    >
      {children}
    </NavLink>
  );
};

/**
 * usePrefetch - Hook for manual prefetching
 *
 * Usage:
 * const { prefetch } = usePrefetch();
 * prefetch('/creator/dashboard/for-you');
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetch = useCallback((path) => {
    const prefetchFn = PREFETCH_CONFIG[path];
    if (prefetchFn) {
      prefetchFn(queryClient).catch(() => {});
    }
  }, [queryClient]);

  return { prefetch };
};

export default PrefetchLink;
