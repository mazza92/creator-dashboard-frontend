import SkincareDirectoryClient from './SkincareDirectoryClient';

// SEO metadata for Skincare Directory
export const metadata = {
  title: 'Skincare Brand PR Application Forms - 75+ Beauty Brands (2026) | NewCollab',
  description: 'Direct skincare brand PR application forms. Find skincare PR list requirements, application links, and brands sending PR to micro-influencers. Filter by follower count.',
  keywords: 'skincare pr list, skincare pr application form, skincare brands pr, beauty pr list, skincare influencer pr, skincare pr packages, how to get skincare pr, skincare pr requirements',
  openGraph: {
    title: 'Skincare Brand PR Application Forms - 75+ Beauty Brands',
    description: 'Access direct PR application forms for 75+ skincare brands. Requirements, contact info, and micro-influencer friendly options.',
    type: 'website',
    url: 'https://newcollab.co/directory/skincare',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skincare Brand PR Application Forms - 75+ Beauty Brands',
    description: 'Direct skincare PR application forms with requirements and contact info.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/skincare',
  },
};

export default function SkincareDirectoryPage() {
  return (
    <>
      {/* Server-rendered h1 for SEO - visually hidden, client component renders visible title */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        Skincare Brand PR Application Forms
      </h1>
      <SkincareDirectoryClient />
    </>
  );
}
