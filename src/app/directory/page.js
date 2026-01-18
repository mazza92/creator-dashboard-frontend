import DirectoryClient from './DirectoryClient';

export const metadata = {
  title: 'Brand PR Directory - Direct PR Application Forms (2026) | Newcollab',
  description:
    'Browse brands with PR application forms, requirements, and influencer-friendly programs. Filter by category and search by brand name.',
  keywords:
    'brand pr list, pr application forms, brands that send pr, influencer pr directory, beauty pr list, skincare pr list, k-beauty pr list',
  alternates: {
    canonical: 'https://newcollab.co/directory',
  },
  openGraph: {
    title: 'Brand PR Directory - Direct PR Application Forms',
    description:
      'Browse brands with PR application forms, requirements, and influencer-friendly programs.',
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

export default function DirectoryPage() {
  return <DirectoryClient />;
}

