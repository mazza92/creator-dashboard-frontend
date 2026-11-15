// Blog authors: a real author box and page per author (E-E-A-T), with Person / Organization schema.
// Add a photo (image) and profile links (sameAs) here; every post by that author picks them up.

export const BLOG_AUTHORS = {
  mazza: {
    slug: 'mazza',
    name: 'Mazza',
    role: 'Founder, Newcollab',
    image: null,
    bio: 'Founder of Newcollab, where aspiring UGC creators in the US, Canada and Europe publish a free UGC portfolio and land gifted and paid brand deals. Writes about pitching, rates and getting your first brand yes.',
    sameAs: [],
    type: 'Person',
  },
  'newcollab-editorial-team': {
    slug: 'newcollab-editorial-team',
    name: 'Newcollab Editorial Team',
    role: 'Newcollab',
    image: null,
    bio: 'The Newcollab team researches brands, PR programs and UGC rates for creators in the US, Canada and Europe, using data from the 3,000+ brands and the creators on the platform. Every guide is checked against live brand data and updated when programs change.',
    sameAs: [],
    type: 'Organization',
  },
};

export function authorSlug(name) {
  return String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** The registry entry for a post's author, falling back to what the post itself says. */
export function getAuthor(postAuthor) {
  const slug = authorSlug(postAuthor?.name);
  const known = BLOG_AUTHORS[slug];
  return {
    slug,
    name: postAuthor?.name || 'Newcollab',
    role: known?.role || postAuthor?.role || 'Newcollab',
    image: known?.image || postAuthor?.image || null,
    bio: known?.bio || postAuthor?.description || '',
    sameAs: known?.sameAs || [],
    type: known?.type || 'Person',
  };
}

export function getAuthorBySlug(slug) {
  return BLOG_AUTHORS[slug] || null;
}
