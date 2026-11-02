import UgcBrandsClient from './UgcBrandsClient';

const TITLE = 'Performance UGC for DTC Brands: Pay Per View | Newcollab';
const DESCRIPTION =
  'Real creators post about your product on TikTok and Instagram. You pay for the views they deliver, not a fixed fee per video, and turn the winners into ads. Built for small and growing DTC brands.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: 'performance UGC, pay per view UGC, UGC for DTC brands, performance influencer marketing, TikTok UGC creators, UGC ads, creator content for ads, influencer marketing pay per view',
  openGraph: {
    title: 'Pay for views, not promises: performance UGC for DTC brands',
    description: DESCRIPTION,
    type: 'website',
    url: 'https://newcollab.co/ugc',
    siteName: 'Newcollab',
    images: [{ url: 'https://newcollab.co/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Performance UGC for DTC brands | Newcollab',
    description: 'Creators post about your product. You pay per view delivered and boost the winners as ads.',
    site: '@newcollab_',
  },
  alternates: { canonical: 'https://newcollab.co/ugc' },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Newcollab performance UGC',
  provider: { '@type': 'Organization', name: 'Newcollab', url: 'https://newcollab.co' },
  serviceType: 'Performance-based UGC and influencer marketing',
  areaServed: ['US', 'CA', 'GB', 'AU', 'EU'],
  description: DESCRIPTION,
  url: 'https://newcollab.co/ugc',
};

export default function UgcPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <UgcBrandsClient />
    </>
  );
}
