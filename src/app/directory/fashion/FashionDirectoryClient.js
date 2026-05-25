'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectoryClient from '../DirectoryClient';

export default function FashionDirectoryClient({ initialBrands, initialTotal }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams.get('category')) {
      router.replace('/directory/fashion?category=fashion');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="Fashion Brand PR Application Forms"
      collectionDescription="Apply directly to fashion brand PR lists. Browse PR application forms, response rates, and follower requirements for fashion brands — including options for micro and nano influencers."
      initialCategory="Fashion"
      initialBrands={initialBrands}
      initialTotal={initialTotal}
    />
  );
}
