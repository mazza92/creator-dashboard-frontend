import LandFirstPRPackageClient from './LandFirstPRPackageClient';

export const metadata = {
  title: 'Land your first PR package | Newcollab',
  description: 'Your AI manager matches you to brands that gift creators your size, writes the pitch, and coaches you until they say yes.',
  keywords: 'PR packages, influencer PR, brand deals, micro creators, nano influencers, free products, brand partnerships',
  alternates: {
    canonical: 'https://newcollab.co/land-your-first-pr-package',
  },
  openGraph: {
    title: 'Land your first PR package | Newcollab',
    description: 'Your AI manager matches you to brands that gift creators your size, writes the pitch, and coaches you until they say yes.',
    type: 'website',
    url: 'https://newcollab.co/land-your-first-pr-package',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Land your first PR package | Newcollab',
    description: 'Your AI manager matches you to brands that gift creators your size, writes the pitch, and coaches you until they say yes.',
  },
};

export default function LandFirstPRPackagePage() {
  return <LandFirstPRPackageClient />;
}
