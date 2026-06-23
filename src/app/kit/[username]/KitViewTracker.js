'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Client-side component to track kit views with brand attribution.
 * Reads the ref token from URL and sends tracking request to backend.
 * This enables view tracking while keeping the page statically generated (ISR).
 */
export default function KitViewTracker({ username }) {
  const searchParams = useSearchParams();
  const refToken = searchParams.get('ref');

  // Debug logging
  console.log('[KitViewTracker] searchParams:', searchParams.toString());
  console.log('[KitViewTracker] refToken:', refToken);
  console.log('[KitViewTracker] username:', username);

  useEffect(() => {
    if (!refToken || !username) {
      console.log('[KitViewTracker] Skipping - refToken:', refToken, 'username:', username);
      return;
    }

    // Send tracking request to backend
    const trackView = async () => {
      try {
        const apiBase = typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? 'http://localhost:5000'
          : 'https://api.newcollab.co';
        await fetch(`${apiBase}/api/portfolio/public/${username}?ref=${refToken}`, {
          method: 'GET',
          credentials: 'include',
        });
        console.log('[KitViewTracker] View tracked with ref:', refToken);
      } catch (error) {
        console.error('[KitViewTracker] Failed to track view:', error);
      }
    };

    trackView();
  }, [refToken, username]);

  // This component doesn't render anything
  return null;
}
