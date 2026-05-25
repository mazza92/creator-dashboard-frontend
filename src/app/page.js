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

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'newcollab',
  url: 'https://newcollab.co',
  description:
    'PR forms directory and brand outreach tool for nano and micro creators — 500+ brands with open PR application forms, AI pitch emails, and auto media kit.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://newcollab.co/brands?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I get my first brand deal as a small creator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sign up for newcollab, browse the brand directory filtered to your niche, and send an AI-generated pitch with your auto-attached media kit. Most creators land their first deal within 2 weeks — the key is sending enough pitches and following up. The free plan gives you 3 pitches a month to start.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need a media kit to pitch brands?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes — it's the #1 reason brands ignore cold emails. newcollab auto-generates yours from your profile, so every pitch includes your stats, audience demographics, niche, and past collabs. No design skills needed.",
      },
    },
    {
      '@type': 'Question',
      name: 'How many followers do you need to work with brands?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No minimum. 63% of brands prefer working with nano and micro creators (1K–50K followers) — engagement is more genuine and content feels authentic. newcollab filters brands by follower fit so you only see relevant opportunities.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a PR package?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A PR package is when a brand sends you their products for free in exchange for content on your channels — a post, TikTok, story, or reel. You pitch the brand directly via email with your media kit. newcollab handles finding the brand, writing the pitch, and tracking the reply.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I find PR forms for brands?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "newcollab's brand directory lists 500+ brands with open PR forms and direct application links across beauty, fashion, skincare, food, tech, and wellness. You can filter by niche and send a personalised AI pitch in one click — no need to hunt for contact emails or application URLs.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is a brand PR application form?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A brand PR application form is a public submission page where creators apply to receive gifted products (PR packages) in exchange for social media content. Brands use these forms to vet creators by niche, follower count, and engagement rate. newcollab lists brands with open PR forms and lets you apply with an AI-generated pitch and auto-attached media kit.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is newcollab free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — free plan includes full brand directory access, auto media kit, PR pipeline, and 3 AI pitches per month. Pro ($12/month) unlocks unlimited pitches, batch send, full For You feed, and the $PR Value dashboard.',
      },
    },
  ],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Visually hidden H1 — crawlers read it, client component renders the visible version */}
      <h1 style={srOnly}>Land brand deals. On repeat. No guessing.</h1>
      <LandingPageClient />
    </>
  );
}
