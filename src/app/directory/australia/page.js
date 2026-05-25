import { Suspense } from 'react';
import AustraliaDirectoryClient from './AustraliaDirectoryClient';

// SEO metadata for Australia Directory
export const metadata = {
  title: 'Australian Brand PR Application Forms - How to Get PR Packages in Australia (2026) | NewCollab',
  description: 'Direct PR application forms for Australian brands. Find PR packages Australia, requirements, and how to get PR as an Australian influencer. Local and international brands shipping to AU.',
  keywords: 'pr packages australia, how to get pr packages in australia, australian brand pr, australia influencer pr, pr list australia, australian beauty pr, brands that send pr to australia',
  openGraph: {
    title: 'Australian Brand PR Application Forms - How to Get PR in Australia',
    description: 'Access PR application forms for brands sending PR packages to Australia. Requirements, contact info, and Australian influencer resources.',
    type: 'website',
    url: 'https://newcollab.co/directory/australia',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Australian Brand PR Application Forms - PR Packages Australia',
    description: 'Direct PR application forms for Australian influencers. Find brands sending PR to Australia.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/australia',
  },
};

export default function AustraliaDirectoryPage() {
  return (
    <>
      {/* Server-rendered h1 for SEO - visually hidden, client component renders visible title */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        Australian Brand PR Application Forms
      </h1>
      <Suspense fallback={null}>
        <AustraliaDirectoryClient />
      </Suspense>
    </>
  );
}
