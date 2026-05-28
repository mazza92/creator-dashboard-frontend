'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectoryClient from '../DirectoryClient';

/**
 * US Collection Page
 * Pre-filtered brand directory for US brands
 * Targets GSC keywords:
 * - "us brands pr packages"
 * - "how to get pr packages usa"
 * - "american brand pr"
 * - "pr list usa"
 */
export default function USDirectoryClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Set country filter on mount if not already set
    if (!searchParams.get('category') && !searchParams.get('country')) {
      router.replace('/directory/us?country=US');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="US Brand PR Application Forms"
      collectionDescription="Access direct PR application forms for US brands sending PR packages to micro-influencers. Find requirements, contact information, and top American beauty, fashion, and lifestyle brands open to creator partnerships."
      initialCountry="US"
    />
  );
}
