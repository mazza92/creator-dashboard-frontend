import { Suspense } from 'react';
import BeautyDirectoryClient from './BeautyDirectoryClient';

export const metadata = {
  title: 'Beauty Brand PR Application Forms - 100+ Beauty Brands (2026) | NewCollab',
  description: 'Direct beauty brand PR application forms for micro-influencers. Find beauty PR list requirements, application links, and brands sending PR packages to creators with 1K+ followers.',
  keywords: 'beauty pr list, beauty brand pr application form, beauty brands pr, beauty influencer pr, how to get beauty pr, beauty pr packages, beauty brands that send pr to small influencers, beauty pr requirements',
  openGraph: {
    title: 'Beauty Brand PR Application Forms - 100+ Beauty Brands',
    description: 'Access direct PR application forms for 100+ beauty brands. Response rates, follower requirements, and nano-influencer friendly options.',
    type: 'website',
    url: 'https://newcollab.co/directory/beauty',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beauty Brand PR Application Forms - 100+ Beauty Brands',
    description: 'Direct beauty PR application forms with response rates and follower requirements.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/beauty',
  },
};

export const revalidate = 3600;

const srOnly = {
  position: 'absolute', width: '1px', height: '1px', padding: 0,
  margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap', border: 0,
};

export default async function BeautyDirectoryPage() {
  let initialBrands = [];
  let initialTotal = 0;
  try {
    const res = await fetch(
      'https://api.newcollab.co/api/public/brands?page=1&limit=48&category=beauty',
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
      <h1 style={srOnly}>Beauty Brand PR Application Forms</h1>
      <Suspense fallback={null}>
        <BeautyDirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>
    </>
  );
}
