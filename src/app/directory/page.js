import { Suspense } from 'react';
import DirectoryClient from './DirectoryClient';

export const metadata = {
  title: '2,000+ PR Forms for Brands (2026): Direct Application Links | Newcollab',
  description:
    'Browse 2,000+ verified PR forms for brands—direct application links, PR list requirements, and micro-influencer friendly options. Filter by beauty, skincare, K-beauty & fashion. Apply free.',
  keywords:
    'pr forms for brands, pr forms, pr application form, pr list application, skincare pr list, k-beauty pr forms, brands that send pr to small influencers, influencer pr list requirements',
  alternates: {
    canonical: 'https://newcollab.co/directory',
  },
  openGraph: {
    title: '2,000+ PR Forms for Brands: Direct Application Links',
    description:
      'Verified PR forms for brands with direct application links. 2,000+ beauty, skincare, and lifestyle brands—micro-influencer friendly. Start applying today.',
    type: 'website',
    url: 'https://newcollab.co/directory',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand PR Directory - Direct PR Application Forms',
    description:
      'Browse brands with PR application forms, requirements, and influencer-friendly programs.',
    creator: '@newcollab',
  },
};

// Revalidate every hour — brand list is stable but gets weekly updates
export const revalidate = 3600;

const srOnly = {
  position: 'absolute', width: '1px', height: '1px', padding: 0,
  margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap', border: 0,
};

export default async function DirectoryPage() {
  // Fetch first page of brands server-side so they appear in the initial HTML for crawlers
  let initialBrands = [];
  let initialTotal = 0;
  try {
    const res = await fetch(
      'https://api.newcollab.co/api/public/brands?page=1&limit=48',
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      initialBrands = Array.isArray(data.brands) ? data.brands : [];
      initialTotal = data?.pagination?.total || 0;
    }
  } catch (_) {
    // fall back to client-side fetching — DirectoryClient handles this gracefully
  }

  return (
    <>
      <h1 style={srOnly}>2,000+ PR Forms for Brands: Direct Application Links</h1>
      <Suspense fallback={null}>
        <DirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>
    </>
  );
}

