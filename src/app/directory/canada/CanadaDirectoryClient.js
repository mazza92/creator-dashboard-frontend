'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectoryClient from '../DirectoryClient';

/**
 * Canada Collection Page
 * Pre-filtered brand directory for Canadian brands
 * Targets GSC keywords:
 * - "canadian brands pr packages"
 * - "how to get pr packages canada"
 * - "canada brand pr"
 * - "pr list canada"
 */
export default function CanadaDirectoryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Set country filter on mount if not already set
    if (!searchParams.get('category') && !searchParams.get('country')) {
      router.replace('/directory/canada?country=Canada');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="Canadian Brand PR Application Forms"
      collectionDescription="Access direct PR application forms for Canadian brands sending PR packages to micro-influencers. Find requirements, contact information, and top Canadian beauty, skincare, and lifestyle brands open to creator partnerships."
      initialCountry="Canada"
    />
  );
}
