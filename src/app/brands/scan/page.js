import { Suspense } from 'react';
import BrandScanClient from './BrandScanClient';

const PAGE_URL = 'https://newcollab.co/brands/scan';
const TITLE = 'Brand Scan: see the TikTok creators behind any brand | Newcollab';
const DESCRIPTION =
  'Free TikTok creator lookup for brands. Type any brand to see the creators posting about it, the hooks they repeat, and the videos with the most views. Then gift vetted creators to make the same content for you.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    'tiktok creator lookup, competitor influencer analysis, see creators posting about a brand, brand creator search, tiktok ugc research, influencer gifting research, competitor tiktok creators',
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: 'See the TikTok creators behind any brand',
    description: DESCRIPTION,
    type: 'website',
    url: PAGE_URL,
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'See the TikTok creators behind any brand',
    description: DESCRIPTION,
    creator: '@newcollab',
  },
};

const APP_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Newcollab Brand Scan',
  url: PAGE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: DESCRIPTION,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Newcollab', url: 'https://newcollab.co' },
};

export default function BrandScanPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(APP_SCHEMA) }} />
      <Suspense fallback={null}>
        <BrandScanClient />
      </Suspense>
    </>
  );
}
