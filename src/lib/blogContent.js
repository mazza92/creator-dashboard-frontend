/**
 * Client-safe blog content helpers (no Node fs imports).
 */

export function stripEmbeddedFaqFromContent(html) {
  if (!html || typeof html !== 'string') return html;

  const faqHeading = html.match(/<h2[^>]*\bid=['"]faq['"][^>]*>/i);
  if (!faqHeading) return html;

  const start = faqHeading.index;
  const afterFaq = html.slice(start);
  const ctaMatch = afterFaq.match(/<div\s+class=['"]cta-section/i);
  if (ctaMatch) {
    return html.slice(0, start) + afterFaq.slice(ctaMatch.index);
  }

  return html.slice(0, start);
}

export function getPostContentHtml(post) {
  const html = post?.content || '';
  if (post?.faq?.length) {
    return stripEmbeddedFaqFromContent(html);
  }
  return html;
}
