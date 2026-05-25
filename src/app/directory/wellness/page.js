import { Suspense } from 'react';
import WellnessDirectoryClient from './WellnessDirectoryClient';

export const metadata = {
  title: 'Wellness Brand PR Application Forms - Health & Fitness Brands (2026) | NewCollab',
  description: 'Direct wellness and fitness brand PR application forms for influencers. Find health brand PR list requirements, response rates, and follower minimums. Fabletics, Silk & Snow, and more.',
  keywords: 'wellness brand pr list, fitness brand pr application form, health brands pr, wellness influencer pr, how to get wellness pr, fitness brands that send pr, wellness pr requirements, fabletics pr list',
  openGraph: {
    title: 'Wellness Brand PR Application Forms - Health & Fitness Brands',
    description: 'Access direct PR application forms for wellness and fitness brands. See response rates, follower requirements, and micro-influencer options.',
    type: 'website',
    url: 'https://newcollab.co/directory/wellness',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wellness Brand PR Application Forms - Health & Fitness Brands',
    description: 'Direct wellness PR application forms with response rates and follower requirements.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/wellness',
  },
};

export const revalidate = 3600;

const srOnly = {
  position: 'absolute', width: '1px', height: '1px', padding: 0,
  margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap', border: 0,
};

export default async function WellnessDirectoryPage() {
  let initialBrands = [];
  let initialTotal = 0;
  try {
    const res = await fetch(
      'https://api.newcollab.co/api/public/brands?page=1&limit=48&category=wellness',
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
      <h1 style={srOnly}>Wellness Brand PR Application Forms</h1>
      <Suspense fallback={null}>
        <WellnessDirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>
    </>
  );
}
