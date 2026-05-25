'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DirectoryClient from '../DirectoryClient';

export default function LifestyleDirectoryClient({ initialBrands, initialTotal }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams.get('category')) {
      router.replace('/directory/lifestyle?category=lifestyle');
    }
  }, [searchParams, router]);

  return (
    <DirectoryClient
      collectionTitle="Lifestyle Brand PR Application Forms"
      collectionDescription="Apply directly to lifestyle brand PR lists. Browse PR application forms, response rates, and follower requirements for home, travel, and lifestyle brands — open to micro and nano creators."
      initialCategory="Lifestyle"
      initialBrands={initialBrands}
      initialTotal={initialTotal}
    />
  );
}
