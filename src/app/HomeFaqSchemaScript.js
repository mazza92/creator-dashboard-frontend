'use client';

/**
 * Renders the homepage FAQPage JSON-LD as a client component.
 * Same pattern as BlogFaqSchemaScript — keeps the JSON-LD out of the RSC
 * flight payload so Google doesn't find two FAQPage instances on the page.
 */

const FAQ_ITEMS = [
  {
    question: 'How do I get my first brand deal as a small creator?',
    answer:
      'Sign up for newcollab, browse the brand directory filtered to your niche, and send an AI-generated pitch with your auto-attached media kit. Most creators land their first deal within 2 weeks — the key is sending enough pitches and following up. The free plan gives you 3 pitches a month to start.',
  },
  {
    question: 'Do I need a media kit to pitch brands?',
    answer:
      "Yes — it's the #1 reason brands ignore cold emails. newcollab auto-generates yours from your profile, so every pitch includes your stats, audience demographics, niche, and past collabs. No design skills needed.",
  },
  {
    question: 'How many followers do you need to work with brands?',
    answer:
      'No minimum. 63% of brands prefer working with nano and micro creators (1K–50K followers) — engagement is more genuine and content feels authentic. newcollab filters brands by follower fit so you only see relevant opportunities.',
  },
  {
    question: 'What is a PR package?',
    answer:
      'A PR package is when a brand sends you their products for free in exchange for content on your channels — a post, TikTok, story, or reel. You pitch the brand directly via email with your media kit. newcollab handles finding the brand, writing the pitch, and tracking the reply.',
  },
  {
    question: 'Where can I find PR forms for brands?',
    answer:
      "newcollab's brand directory lists 2,000+ brands with open PR forms and direct application links across beauty, fashion, skincare, food, tech, and wellness. You can filter by niche and send a personalised AI pitch in one click — no need to hunt for contact emails or application URLs.",
  },
  {
    question: 'What is a brand PR application form?',
    answer:
      'A brand PR application form is a public submission page where creators apply to receive gifted products (PR packages) in exchange for social media content. Brands use these forms to vet creators by niche, follower count, and engagement rate. newcollab lists brands with open PR forms and lets you apply with an AI-generated pitch and auto-attached media kit.',
  },
  {
    question: 'Is newcollab free?',
    answer:
      'Yes — free plan includes full brand directory access, auto media kit, PR pipeline, and 3 AI pitches per month. Pro ($19/month) unlocks unlimited pitches, batch send, full For You feed, and the $PR Value dashboard.',
  },
];

export default function HomeFaqSchemaScript() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
