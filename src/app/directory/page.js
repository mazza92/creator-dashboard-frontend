import { Suspense } from 'react';
import { SiteFooter } from '../components/LandingPageLayoutNext';
import DirectoryBrandLinks from './DirectoryBrandLinks';
import DirectoryClient from './DirectoryClient';
import { DIRECTORY_FACTS } from '../../lib/citationFacts';
import { jsonLd } from '@/src/lib/jsonLd';

export const metadata = {
  title: 'UGC Brand Directory: 3,000+ Brands to Pitch as a UGC Creator (2026)',
  description:
    'Browse 3,000+ beauty, skincare, K-beauty and fashion brands to pitch as a UGC creator: who they work with, how to reach them, and a pitch Polly writes for you. Free to start.',
  keywords:
    'ugc brand directory, brands that work with ugc creators, brands to pitch for ugc, beauty brands ugc, skincare brands ugc creators, k-beauty ugc, ugc collabs, ugc brand deals',
  alternates: {
    canonical: 'https://newcollab.co/directory',
  },
  openGraph: {
    title: 'UGC Brand Directory: 3,000+ Brands to Pitch as a UGC Creator',
    description:
      'Beauty, skincare and lifestyle brands to pitch as a UGC creator, with who they work with and how to reach them. Polly writes the pitch.',
    type: 'website',
    url: 'https://newcollab.co/directory',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UGC Brand Directory: 3,000+ Brands to Pitch',
    description:
      'Brands to pitch as a UGC creator: who they work with, how to reach them, and a pitch written for you.',
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

  const datasetSchema = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'Newcollab UGC brand directory',
    description:
      'Brands UGC creators can pitch, from Newcollab’s live brand index: brands listed with a public creator application or contact. The live total is on https://newcollab.co/directory.',
    url: DIRECTORY_FACTS.url,
    // The page regenerates hourly from the live index, so the dataset is as fresh as the render.
    dateModified: new Date().toISOString().slice(0, 10),
    license: 'https://newcollab.co/terms-of-service',
    creator: { '@type': 'Organization', name: 'Newcollab', url: 'https://newcollab.co' },
    ...(initialTotal ? { variableMeasured: `${initialTotal} brands with a public application URL` } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(datasetSchema) }}
      />
      <h1 style={srOnly}>UGC Brand Directory: 3,000+ Brands to Pitch as a UGC Creator</h1>
      <Suspense fallback={null}>
        <DirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>
      <DirectoryBrandLinks />
      <SiteFooter />
    </>
  );
}

