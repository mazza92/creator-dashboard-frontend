import KBeautyDirectoryClient from './KBeautyDirectoryClient';

// SEO metadata for K-Beauty Directory
export const metadata = {
  title: 'K-Beauty PR Application Forms - Korean Beauty Brands (2026) | NewCollab',
  description: 'Direct K-beauty PR application forms. Find Korean beauty brand PR lists, requirements, and application links. Brands sending PR to micro-influencers.',
  keywords: 'k-beauty pr application forms, k-beauty pr list, korean beauty pr, k-beauty influencer pr, korean skincare pr, k-beauty pr packages, cosrx pr list, laneige pr application',
  openGraph: {
    title: 'K-Beauty PR Application Forms - Korean Beauty Brands',
    description: 'Access direct PR application forms for K-beauty and Korean skincare brands. Requirements and micro-influencer friendly options.',
    type: 'website',
    url: 'https://newcollab.co/directory/k-beauty',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'K-Beauty PR Application Forms - Korean Beauty Brands',
    description: 'Direct K-beauty PR application forms with requirements and contact info.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/k-beauty',
  },
};

export default function KBeautyDirectoryPage() {
  return <KBeautyDirectoryClient />;
}
