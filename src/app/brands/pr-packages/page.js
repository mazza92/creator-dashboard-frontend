import PRPackagesClient from './PRPackagesClient';

export const metadata = {
  title: 'Newcollab for Brands | The UGC Content Library You Own',
  description:
    'Ship gifted product to 5 vetted creators every month. Get 5-10 UGC videos with full copyright. Run them as paid ads. $299/month, first campaign free.',
  keywords:
    'ugc content, ugc videos, brand ugc, influencer gifting, pr packages for brands, ugc creators, content library, paid ads creative, tiktok ads, meta ads, creator content',
  alternates: {
    canonical: 'https://newcollab.co/brands/pr-packages',
  },
  openGraph: {
    title: 'The UGC Content Library You Own | Newcollab for Brands',
    description:
      '5-10 UGC videos every month. Full copyright. $299/month, first campaign free.',
    type: 'website',
    url: 'https://newcollab.co/brands/pr-packages',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The UGC Content Library You Own | Newcollab for Brands',
    description:
      '5-10 UGC videos every month. Full copyright. $299/month, first campaign free.',
    creator: '@newcollab',
  },
};

export default function PRPackagesPage() {
  return <PRPackagesClient />;
}
