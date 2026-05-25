import { Suspense } from 'react';
import FashionDirectoryClient from './FashionDirectoryClient';

export const metadata = {
  title: 'Fashion Brand PR Application Forms - Apply to Fashion Brand PR Lists (2026) | NewCollab',
  description: 'Direct fashion brand PR application forms for influencers. Find fashion brand PR list requirements, response rates, and follower minimums. Many fashion brands accept creators from 1K followers.',
  keywords: 'fashion brand pr list, fashion pr application form, fashion brands pr, fashion influencer pr, how to get fashion pr, fashion pr packages, fashion brands that send pr, fashion pr requirements',
  openGraph: {
    title: 'Fashion Brand PR Application Forms - Apply to Fashion Brand PR Lists',
    description: 'Access direct PR application forms for fashion brands. See response rates, follower requirements, and micro-influencer friendly options.',
    type: 'website',
    url: 'https://newcollab.co/directory/fashion',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fashion Brand PR Application Forms - Apply to Fashion Brand PR Lists',
    description: 'Direct fashion PR application forms with response rates and follower requirements.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/fashion',
  },
};

export const revalidate = 3600;

const srOnly = {
  position: 'absolute', width: '1px', height: '1px', padding: 0,
  margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap', border: 0,
};

export default async function FashionDirectoryPage() {
  let initialBrands = [];
  let initialTotal = 0;
  try {
    const res = await fetch(
      'https://api.newcollab.co/api/public/brands?page=1&limit=48&category=fashion',
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      initialBrands = Array.isArray(data.brands) ? data.brands : [];
      initialTotal = data?.pagination?.total || 0;
    }
  } catch (_) {}

  return (
    <>
      <h1 style={srOnly}>Fashion Brand PR Application Forms</h1>
      <Suspense fallback={null}>
        <FashionDirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>
    </>
  );
}
