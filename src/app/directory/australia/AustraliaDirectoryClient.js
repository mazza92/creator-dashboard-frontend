'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectoryClient from '../DirectoryClient';

/**
 * Australia Collection Page
 * Pre-filtered brand directory for Australian brands
 * Targets GSC keywords:
 * - "pr packages australia" (179 impressions, Position 6.5)
 * - "how to get pr packages in australia" (281 impressions, Position 7.0)
 */
export default function AustraliaDirectoryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Set both category and country filters on mount if not already set
    // Using category filter for consistency with other directory pages
    if (!searchParams.get('category') && !searchParams.get('country')) {
      router.replace('/directory/australia?country=Australia');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="Australian Brand PR Application Forms"
      collectionDescription="Access direct PR application forms for brands sending PR packages to Australia. Find requirements, contact information, and both local Australian brands and international brands shipping to AU."
      initialCountry="Australia"
    />
  );
}
