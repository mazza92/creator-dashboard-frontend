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
  return (
    <>
      {/* Server-rendered h1 for SEO - visually hidden, client component renders visible title */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        Direct PR Application Forms — Brand Directory
      </h1>
      <DirectoryClient />
    </>
  );
}

