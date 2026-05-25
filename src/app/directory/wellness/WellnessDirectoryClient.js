'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectoryClient from '../DirectoryClient';

export default function WellnessDirectoryClient({ initialBrands, initialTotal }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams.get('category')) {
      router.replace('/directory/wellness?category=wellness');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="Wellness Brand PR Application Forms"
      collectionDescription="Apply directly to wellness brand PR lists. Browse PR application forms, response rates, and follower requirements for fitness, health, and wellness brands — including options for nano and micro creators."
      initialCategory="Wellness"
      initialBrands={initialBrands}
      initialTotal={initialTotal}
    />
  );
}
