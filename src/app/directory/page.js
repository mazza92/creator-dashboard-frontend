import DirectoryClient from './DirectoryClient';

export const metadata = {
  title: '500+ PR Forms for Brands (2026): Direct Application Links | Newcollab',
  description:
    'Browse 500+ verified PR forms for brands—direct application links, PR list requirements, and micro-influencer friendly options. Filter by beauty, skincare, K-beauty & fashion. Apply free.',
  keywords:
    'pr forms for brands, pr forms, pr application form, pr list application, skincare pr list, k-beauty pr forms, brands that send pr to small influencers, influencer pr list requirements',
  alternates: {
    canonical: 'https://newcollab.co/directory',
  },
  openGraph: {
    title: '500+ PR Forms for Brands: Direct Application Links',
    description:
      'Verified PR forms for brands with direct application links. 500+ beauty, skincare, and lifestyle brands—micro-influencer friendly. Start applying today.',
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
        500+ PR Forms for Brands: Direct Application Links
      </h1>
      <DirectoryClient />
    </>
  );
}

