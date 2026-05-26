/**
 * Build JSON-LD for blog posts. FAQPage must be a separate top-level block —
 * nesting FAQPage inside BlogPosting causes GSC "Duplicate field FAQPage" errors.
 */

function faqQuestions(faq) {
  return faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  }));
}

export function buildBlogPostingSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    image: [
      {
        '@type': 'ImageObject',
        url: post.image,
        width: 1200,
        height: 630,
      },
    ],
    datePublished: post.date,
    dateModified: post.dateModified || post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
      image: post.author.image,
      url: 'https://newcollab.co/blog',
      ...(post.author.description && { description: post.author.description }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Newcollab',
      url: 'https://newcollab.co',
      logo: {
        '@type': 'ImageObject',
        url: 'https://newcollab.co/logo.png',
        width: 600,
        height: 60,
      },
    },
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords?.join(', ') || post.tags?.join(', '),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://newcollab.co/blog/${post.slug}`,
    },
    url: `https://newcollab.co/blog/${post.slug}`,
    wordCount: post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0,
    articleSection: post.category,
    articleBody:
      post.content?.replace(/<[^>]*>/g, '').substring(0, 500) || post.excerpt,
  };
}

export function buildFaqPageSchema(post) {
  if (!post.faq?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqQuestions(post.faq),
  };
}

export function buildBlogBreadcrumbSchema(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://newcollab.co/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://newcollab.co/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://newcollab.co/blog/${post.slug}`,
      },
    ],
  };
}
