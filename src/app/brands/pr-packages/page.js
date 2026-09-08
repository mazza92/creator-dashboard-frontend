import PRPackagesClient from './PRPackagesClient';

export const metadata = {
  title: 'Newcollab for Brands | Gifted UGC You Can Run as Ads',
  description:
    'Your brand gets a private roster that fills with vetted UGC creators. Select, lock, ship. Ad-ready videos with 6-month commercial reuse. $299/month, first campaign free.',
  keywords:
    'ugc content, ugc videos, brand ugc, influencer gifting, pr packages for brands, ugc creators, content library, paid ads creative, tiktok ads, meta ads, creator content',
  alternates: {
    canonical: 'https://newcollab.co/brands/pr-packages',
  },
  openGraph: {
    title: 'Gifted UGC You Can Run as Ads | Newcollab for Brands',
    description:
      'Branded roster. Auto-filled creators. Select, lock, ship. Reuse in ads for 6 months. $299/month, first campaign free.',
    type: 'website',
    url: 'https://newcollab.co/brands/pr-packages',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gifted UGC You Can Run as Ads | Newcollab for Brands',
    description:
      'Branded roster. Auto-filled creators. Select, lock, ship. Reuse in ads for 6 months. $299/month, first campaign free.',
    creator: '@newcollab',
  },
};

export default function PRPackagesPage() {
  return <PRPackagesClient />;
}
