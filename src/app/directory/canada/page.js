import { Suspense } from 'react';
import CanadaDirectoryClient from './CanadaDirectoryClient';

// SEO metadata for Canada Directory
export const metadata = {
  title: 'Canadian Brand PR Forms - PR Packages Canada (2026)',
  description: 'Direct PR application forms for Canadian brands. Find PR packages Canada, requirements, and how to get PR as a Canadian influencer. Top Canadian beauty, skincare, and lifestyle brands accepting micro-influencers.',
  keywords: 'pr packages canada, canadian brands pr packages, how to get pr packages canada, canada brand pr, canadian influencer pr, pr list canada, canadian beauty brands pr, brands that send pr to canada, micro influencer brands canada',
  openGraph: {
    title: 'Canadian Brand PR Application Forms - How to Get PR in Canada',
    description: 'Access PR application forms for Canadian brands sending PR packages to micro-influencers. Requirements, contact info, and Canadian brand resources.',
    type: 'website',
    url: 'https://newcollab.co/directory/canada',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canadian Brand PR Application Forms - PR Packages Canada',
    description: 'Direct PR application forms for Canadian influencers. Find Canadian brands sending PR packages.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/canada',
  },
};

export default function CanadaDirectoryPage() {
  return (
    <>
      {/* Server-rendered h1 for SEO - visually hidden, client component renders visible title */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        Canadian Brand PR Application Forms
      </h1>
      <Suspense fallback={null}>
        <CanadaDirectoryClient />
      </Suspense>
    </>
  );
}
