'use client';

/**
 * Renders FAQ JSON-LD as a client component.
 *
 * Why a client component?
 * Server components serialize their dangerouslySetInnerHTML props into the
 * Next.js RSC flight payload (__next_f.push scripts). Google's structured data
 * extractor parses those payloads and finds the FAQPage JSON, producing a
 * "Duplicate field FAQPage" error in GSC. Keeping the schema-building logic
 * here means the RSC payload only carries raw faq[] data (question/answer pairs),
 * not a recognisable JSON-LD block.
 */
export default function BlogFaqSchemaScript({ faq }) {
  if (!faq?.length) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
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
