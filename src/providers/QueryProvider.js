import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure React Query with aggressive caching for fast perceived load times
// Matches modern SaaS patterns: Notion, Linear, Figma
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes even after unmount
      gcTime: 30 * 60 * 1000,
      // Show cached data immediately while refetching in background
      refetchOnWindowFocus: false,
      // Don't retry failed requests immediately
      retry: 1,
      retryDelay: 1000,
      // Enable structural sharing for optimal re-renders
      structuralSharing: true,
    },
  },
});

// Export for use in prefetching
export { queryClient };

export const QueryProvider = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

export default QueryProvider;
