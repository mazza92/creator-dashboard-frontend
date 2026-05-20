'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectoryClient from '../DirectoryClient';

/**
 * Skincare Collection Page
 * Pre-filtered brand directory for skincare brands
 * Targets GSC keyword: "skincare pr list" (154 impressions, Position 30.8)
 */
export default function SkincareDirectoryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Set category filter to "Skincare" on mount if not already set
    if (!searchParams.get('category')) {
      router.replace('/directory/skincare?category=skincare');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="Skincare Brand PR Application Forms"
      collectionDescription="Access direct PR application forms for skincare and beauty brands. Find requirements, contact information, and brands that send PR to micro-influencers."
      initialCategory="Skincare"
    />
  );
}
