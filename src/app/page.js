import LandingPageClient from './LandingPageClient';
import HomeFaqSchemaScript from './HomeFaqSchemaScript';

// SEO metadata for landing page
export const metadata = {
  title: 'newcollab - Brand PR Forms & Outreach for Micro Creators',
  description: 'Browse 2,000+ brands with open PR forms and direct application links. Send AI pitch emails, auto-generate your media kit, and track every outreach. The complete PR forms directory and brand deal system for micro creators.',
  keywords: 'PR forms for brands, brand PR forms, PR application forms for influencers, brands with open PR forms, how to get brand deals, PR packages for micro creators, brand outreach tool, media kit for content creators, micro influencer brand deals, brand collaboration forms',
  openGraph: {
    title: 'newcollab - 2,000+ Brand PR Forms & Outreach for Creators',
    description: 'Browse brands with open PR forms and application links. AI pitch emails, auto media kit, deal tracking — all in one place for nano and micro creators.',
    type: 'website',
    url: 'https://newcollab.co',
    siteName: 'newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'newcollab - Brand Outreach for Micro Creators',
    description: 'The complete brand deal system for nano and micro creators.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'newcollab',
  url: 'https://newcollab.co',
  description:
    'PR forms directory and brand outreach tool for nano and micro creators — 2,000+ brands with open PR application forms, AI pitch emails, and auto media kit.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://newcollab.co/brands?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'newcollab',
  url: 'https://newcollab.co',
  logo: 'https://newcollab.co/logo.png',
  description: 'Newcollab helps creators in the US, Canada, Australia, and UK land brand PR packages with direct application forms, AI pitch emails, and auto-generated media kits.',
  areaServed: ['US', 'CA', 'AU', 'GB'],
  sameAs: [
    'https://instagram.com/newcollab',
    'https://twitter.com/newcollab',
    'https://tiktok.com/@newcollab'
  ]
};

const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD rendered server-side so it appears in the initial HTML response */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <HomeFaqSchemaScript />
      {/* Visually hidden H1 — crawlers read it, client component renders the visible version */}
      <h1 style={srOnly}>Land brand deals. On repeat. No guessing.</h1>
      <LandingPageClient />
    </>
  );
}
