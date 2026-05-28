'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectoryClient from '../DirectoryClient';

/**
 * UK Collection Page
 * Pre-filtered brand directory for UK brands
 * Targets GSC keywords:
 * - "uk brands pr packages"
 * - "how to get pr packages uk"
 * - "british brand pr"
 * - "pr list uk"
 */
export default function UKDirectoryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Set country filter on mount if not already set
    if (!searchParams.get('category') && !searchParams.get('country')) {
      router.replace('/directory/uk?country=UK');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="UK Brand PR Application Forms"
      collectionDescription="Access direct PR application forms for UK brands sending PR packages to micro-influencers. Find requirements, contact information, and top British beauty, fashion, and lifestyle brands open to creator partnerships."
      initialCountry="UK"
    />
  );
}
