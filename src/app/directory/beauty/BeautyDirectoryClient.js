'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectoryClient from '../DirectoryClient';

export default function BeautyDirectoryClient({ initialBrands, initialTotal }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams.get('category')) {
      router.replace('/directory/beauty?category=beauty');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="Beauty Brand PR Application Forms"
      collectionDescription="Apply directly to beauty brand PR lists. Browse application forms, response rates, and follower requirements for 100+ beauty brands — nano and micro-influencer friendly options included."
      initialCategory="Beauty"
      initialBrands={initialBrands}
      initialTotal={initialTotal}
    />
  );
}
