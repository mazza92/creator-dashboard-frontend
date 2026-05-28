import { Suspense } from 'react';
import UKDirectoryClient from './UKDirectoryClient';

// SEO metadata for UK Directory
export const metadata = {
  title: 'UK Brand PR Application Forms - How to Get PR Packages in the UK (2026) | NewCollab',
  description: 'Direct PR application forms for UK brands. Find PR packages UK, requirements, and how to get PR as a British influencer. Top UK beauty, fashion, and lifestyle brands accepting micro-influencers.',
  keywords: 'pr packages uk, uk brands pr packages, how to get pr packages uk, british brand pr, uk influencer pr, pr list uk, uk beauty brands pr, brands that send pr to uk, micro influencer brands uk',
  openGraph: {
    title: 'UK Brand PR Application Forms - How to Get PR in the UK',
    description: 'Access PR application forms for UK brands sending PR packages to micro-influencers. Requirements, contact info, and British brand resources.',
    type: 'website',
    url: 'https://newcollab.co/directory/uk',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UK Brand PR Application Forms - PR Packages UK',
    description: 'Direct PR application forms for British influencers. Find UK brands sending PR packages.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/uk',
  },
};

export default function UKDirectoryPage() {
  return (
    <>
      {/* Server-rendered h1 for SEO - visually hidden, client component renders visible title */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        UK Brand PR Application Forms
      </h1>
      <Suspense fallback={null}>
        <UKDirectoryClient />
      </Suspense>
    </>
  );
}
