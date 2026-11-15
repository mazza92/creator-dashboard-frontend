// Six topic hubs replace 33 one-off categories: one real page per hub (/blog/topic/<slug>), every post linked from
// its hub and from /blog, so crawlers and AI engines see clear topic clusters.

export const BLOG_TOPICS = [
  {
    slug: 'ugc-creators',
    title: 'UGC Creator Guides',
    short: 'UGC creators',
    emoji: '🎬',
    description: 'How to become a UGC creator, build a portfolio, film UGC brands pay for, and find UGC jobs, with no followers needed.',
  },
  {
    slug: 'pr-packages',
    title: 'PR Packages & PR Lists',
    short: 'PR packages',
    emoji: '🎁',
    description: 'Which brands send PR packages to small creators, their application forms and PR emails, by niche and country.',
  },
  {
    slug: 'rates-and-brand-deals',
    title: 'Rates, Pay & Brand Deals',
    short: 'Rates & deals',
    emoji: '💸',
    description: 'What to charge for UGC and sponsored posts, how creators get paid, contracts and usage rights, and brand partnerships.',
  },
  {
    slug: 'pitching-brands',
    title: 'Pitching Brands',
    short: 'Pitching',
    emoji: '✉️',
    description: 'Pitch emails, templates and follow-ups that get brands to reply, with real examples.',
  },
  {
    slug: 'growth-and-platforms',
    title: 'Growth, Platforms & Tools',
    short: 'Growth & platforms',
    emoji: '📈',
    description: 'TikTok, Instagram and YouTube for creators, the platforms and tools worth using, and growing an audience brands notice.',
  },
  {
    slug: 'for-brands',
    title: 'Influencer Marketing for Brands',
    short: 'For brands',
    emoji: '🏷️',
    description: 'How brands run gifting and UGC programs with micro-influencers on a budget.',
  },
];

const CATEGORY_TOPIC = {
  'For Brands': 'for-brands',
  'Influencer Marketing': 'for-brands',
  'Brand Strategy': 'for-brands',
  'Fashion Marketing': 'for-brands',
  'PR & Outreach': 'pitching-brands',
  'Monetization': 'rates-and-brand-deals',
  'Brand Deals': 'rates-and-brand-deals',
  'Creator Income': 'rates-and-brand-deals',
  'Brand Partnerships': 'rates-and-brand-deals',
  'Brand Collaborations': 'rates-and-brand-deals',
  'Brand Lists': 'pr-packages',
  'Brand Guides': 'pr-packages',
  'Niche Roundups': 'pr-packages',
  'Australian Creators': 'pr-packages',
};

/** The hub a post belongs to: explicit post.topic, then title keywords, then its old category. */
export function topicForPost(post) {
  if (!post) return 'growth-and-platforms';
  if (post.topic && BLOG_TOPICS.some((t) => t.slug === post.topic)) return post.topic;
  const title = String(post.title || '').toLowerCase();
  const forBrands = /for (small )?brands|brand'?s guide|influencer marketing (on a budget|for)|run (a|an) (influencer|ugc)/.test(title);
  if (forBrands) return 'for-brands';
  if (/\bpr (package|list|application|form)|pr email|send pr|pr packages|gift(ed|ing) (brands|list)|brands that (send|accept|pay|gift)|sending pr|pr forms|pr to (small|micro)/.test(title)) return 'pr-packages';
  if (/\bpitch|email template|follow[- ]up|dm brands|reach out/.test(title)) return 'pitching-brands';
  if (/\bugc\b/.test(title)) {
    return /\brates?\b|how much to charge|contract|usage rights/.test(title) ? 'rates-and-brand-deals' : 'ugc-creators';
  }
  if (/\brates?\b|charge|how much|\bpay\b|\bpays\b|paid|contract|usage rights|brand deal|sponsor|partnership/.test(title)) {
    return 'rates-and-brand-deals';
  }
  const byCategory = CATEGORY_TOPIC[post.category];
  // "Influencer Marketing" posts written for creators belong with the creator guides, not the brand hub.
  if (byCategory === 'for-brands' && /creator|as an? influencer/.test(title)) return 'growth-and-platforms';
  return byCategory || 'growth-and-platforms';
}

export function getTopic(slug) {
  return BLOG_TOPICS.find((t) => t.slug === slug) || null;
}

export function groupPostsByTopic(posts) {
  const out = Object.fromEntries(BLOG_TOPICS.map((t) => [t.slug, []]));
  (posts || []).forEach((p) => out[topicForPost(p)].push(p));
  return out;
}
