import { Suspense } from 'react';
import LifestyleDirectoryClient from './LifestyleDirectoryClient';

export const metadata = {
  title: 'Lifestyle Brand PR Application Forms - Home & Travel Brands (2026) | NewCollab',
  description: 'Direct lifestyle brand PR application forms for influencers. Find home, travel, and lifestyle brand PR list requirements, response rates, and follower minimums. Many accept creators from 1K followers.',
  keywords: 'lifestyle brand pr list, lifestyle pr application form, lifestyle brands pr, lifestyle influencer pr, home brand pr list, travel brand pr, lifestyle brands that send pr to influencers, lifestyle pr requirements',
  openGraph: {
    title: 'Lifestyle Brand PR Application Forms - Home & Travel Brands',
    description: 'Access direct PR application forms for lifestyle brands. See response rates, follower requirements, and micro-influencer friendly options.',
    type: 'website',
    url: 'https://newcollab.co/directory/lifestyle',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lifestyle Brand PR Application Forms - Home & Travel Brands',
    description: 'Direct lifestyle PR application forms with response rates and follower requirements.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/lifestyle',
  },
};

export const revalidate = 3600;

const srOnly = {
  position: 'absolute', width: '1px', height: '1px', padding: 0,
  margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap', border: 0,
};

export default async function LifestyleDirectoryPage() {
  let initialBrands = [];
  let initialTotal = 0;
  try {
    const res = await fetch(
      'https://api.newcollab.co/api/public/brands?page=1&limit=48&category=lifestyle',
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
      <h1 style={srOnly}>Lifestyle Brand PR Application Forms</h1>
      <Suspense fallback={null}>
        <LifestyleDirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>
    </>
  );
}
