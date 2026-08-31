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

export function buildHowToSchema(post) {
  const howTo = post.howTo;
  if (!howTo?.name || !howTo?.steps?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description || post.metaDescription || post.excerpt,
    image: post.image,
    totalTime: howTo.totalTime || undefined,
    supply: (howTo.supply || []).map((name) => ({ '@type': 'HowToSupply', name })),
    tool: (howTo.tool || []).map((name) => ({ '@type': 'HowToTool', name })),
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function buildItemListSchema(post) {
  const items = post.itemList;
  if (!items?.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: post.title,
    description: post.metaDescription || post.excerpt,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      description: item.description,
    })),
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
