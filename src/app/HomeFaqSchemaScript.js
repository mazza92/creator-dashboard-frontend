'use client';

/**
 * Renders the homepage FAQPage JSON-LD as a client component.
 * Same pattern as BlogFaqSchemaScript — keeps the JSON-LD out of the RSC
 * flight payload so Google doesn't find two FAQPage instances on the page.
 */

import { HOME_FAQ as FAQ_ITEMS } from './homeFaq';

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
