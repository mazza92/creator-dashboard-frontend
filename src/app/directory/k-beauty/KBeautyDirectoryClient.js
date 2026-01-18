'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectoryClient from '../DirectoryClient';

/**
 * K-Beauty Collection Page
 * Pre-filtered brand directory for K-beauty brands
 * Targets GSC keyword: "k-beauty pr application forms" (64 impressions, Position 12.6)
 */
export default function KBeautyDirectoryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Set search filter to "K-beauty" on mount if not already set
    if (!searchParams.get('search')) {
      router.replace('/directory/k-beauty?search=K-beauty');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="K-Beauty PR Application Forms"
      collectionDescription="Access direct PR application forms for Korean beauty and K-beauty brands. Find requirements, contact information, and brands that send PR to micro-influencers."
      initialSearch="K-beauty"
    />
  );
}
