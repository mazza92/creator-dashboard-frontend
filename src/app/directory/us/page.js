import { Suspense } from 'react';
import USDirectoryClient from './USDirectoryClient';

// SEO metadata for US Directory
export const metadata = {
  title: 'US Brand PR Application Forms - How to Get PR Packages in the United States (2026) | NewCollab',
  description: 'Direct PR application forms for US brands. Find PR packages USA, requirements, and how to get PR as an American influencer. Top US beauty, fashion, and lifestyle brands accepting micro-influencers.',
  keywords: 'pr packages usa, us brands pr packages, how to get pr packages usa, american brand pr, us influencer pr, pr list usa, us beauty brands pr, brands that send pr to usa, micro influencer brands usa',
  openGraph: {
    title: 'US Brand PR Application Forms - How to Get PR in the USA',
    description: 'Access PR application forms for US brands sending PR packages to micro-influencers. Requirements, contact info, and American brand resources.',
    type: 'website',
    url: 'https://newcollab.co/directory/us',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'US Brand PR Application Forms - PR Packages USA',
    description: 'Direct PR application forms for American influencers. Find US brands sending PR packages.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/us',
  },
};

export default function USDirectoryPage() {
  return (
    <>
      {/* Server-rendered h1 for SEO - visually hidden, client component renders visible title */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        US Brand PR Application Forms
      </h1>
      <Suspense fallback={null}>
        <USDirectoryClient />
      </Suspense>
    </>
  );
}
