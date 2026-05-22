import LandingPageClient from './LandingPageClient';

// SEO metadata for landing page
export const metadata = {
  title: 'newcollab — PR Forms for Brands & Brand Outreach Tool for Micro Creators',
  description: 'Browse 500+ brands with open PR forms and direct application links. Send AI pitch emails, auto-generate your media kit, and track every outreach. The complete PR forms directory and brand deal system for micro creators.',
  keywords: 'PR forms for brands, brand PR forms, PR application forms for influencers, brands with open PR forms, how to get brand deals, PR packages for micro creators, brand outreach tool, media kit for content creators, micro influencer brand deals, brand collaboration forms',
  openGraph: {
    title: 'newcollab — 500+ Brand PR Forms & Outreach Tool for Micro Creators',
    description: 'Browse brands with open PR forms and application links. AI pitch emails, auto media kit, deal tracking — all in one place for nano and micro creators.',
    type: 'website',
    url: 'https://newcollab.co',
    siteName: 'newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'newcollab — Brand Outreach for Micro Creators',
    description: 'The complete brand deal system for nano and micro creators.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co',
  },
};

export default function HomePage() {
  return (
    <>
      {/* Server-rendered h1 for SEO - visually hidden, client component renders visible title */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        Land brand deals. On repeat. No guessing.
      </h1>
      <LandingPageClient />
    </>
  );
}
