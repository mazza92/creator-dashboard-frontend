'use client';

import { useEffect } from 'react';

/**
 * Injects the FAQPage JSON-LD into <head> after mount via useEffect.
 *
 * Why useEffect instead of returning a <script> JSX element?
 *
 * The previous approach (returning a <script dangerouslySetInnerHTML>)
 * had a critical flaw: if the page has *any* unrelated hydration error
 * (e.g. timezone-dependent date formatting), React bails out and re-renders
 * the entire tree on the client. The server-pre-rendered <script>FAQPage</script>
 * stays in the DOM while React also inserts a second one during client re-render.
 * Google then finds two FAQPage blocks → "Duplicate field 'FAQPage'" in GSC.
 *
 * With useEffect:
 *   1. Nothing is server-pre-rendered for this component (returns null).
 *   2. The script is inserted exactly once after mount (guarded by ID check).
 *   3. Hydration mismatches elsewhere cannot cause a duplicate.
 *   4. Google's crawler executes JavaScript and finds the schema.
 */
export default function BlogFaqSchemaScript({ faq }) {
  useEffect(() => {
    if (!faq?.length) return;

    const SCRIPT_ID = 'faq-page-schema-ld';
    if (document.getElementById(SCRIPT_ID)) return;

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

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById(SCRIPT_ID);
      if (el) el.remove();
    };
  }, [faq]);

  return null;
}
