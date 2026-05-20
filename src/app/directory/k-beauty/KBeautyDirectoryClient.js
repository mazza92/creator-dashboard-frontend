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
    // Set category filter to "Beauty" on mount if not already set
    if (!searchParams.get('category')) {
      router.replace('/directory/k-beauty?category=skincare');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="K-Beauty & Korean Beauty PR Application Forms"
      collectionDescription="Access direct PR application forms for Korean beauty, K-beauty, and Asian beauty brands. Find requirements, contact information, and brands that send PR to micro-influencers."
      initialCategory="Beauty"
    />
  );
}
