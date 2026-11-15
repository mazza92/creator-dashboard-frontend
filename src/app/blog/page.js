import { getAllPosts } from '../../../lib/blog';
import { BLOG_TOPICS, groupPostsByTopic } from '../../lib/blogTopics';
import BlogPageClient from './BlogPageClient';

const TITLE = 'UGC Creator Guides: Rates, Brand Deals & PR Packages | Newcollab Blog';
const DESCRIPTION =
  'Guides for UGC creators in the US, Canada and Europe: UGC rates, how to make UGC videos brands pay for, building a UGC portfolio, and brands that send PR packages or pay for UGC.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://newcollab.co/blog' },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', url: 'https://newcollab.co/blog', siteName: 'Newcollab' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, creator: '@newcollab' },
};

export const revalidate = 3600;

const PINNED = [
  'ugc-rates-how-much-to-charge-2026',
  'how-to-make-ugc-videos-brands-pay-for-2026',
  'how-to-build-a-ugc-portfolio-brands-want-2026',
];

/** Only what a card needs: keeps the page payload small while every post stays linked in the HTML. */
function cardOf(p) {
  return {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || p.metaDescription || '',
    date: p.dateModified || p.date || null,
    readTime: p.readTime || null,
    image: p.image || null,
  };
}

function byNewest(a, b) {
  return String(b.dateModified || b.date || '').localeCompare(String(a.dateModified || a.date || ''));
}

export default function BlogPage() {
  const posts = (getAllPosts() || []).slice().sort(byNewest);
  const groups = groupPostsByTopic(posts);
  const hubs = BLOG_TOPICS.map((t) => ({ ...t, posts: groups[t.slug].map(cardOf) })).filter((h) => h.posts.length);
  const featured = PINNED.map((s) => posts.find((p) => p.slug === s)).filter(Boolean).map(cardOf);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': 'https://newcollab.co/blog#blog',
        name: 'Newcollab Blog',
        url: 'https://newcollab.co/blog',
        description: DESCRIPTION,
        publisher: { '@type': 'Organization', name: 'Newcollab', url: 'https://newcollab.co' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://newcollab.co' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://newcollab.co/blog' },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Topics',
        itemListElement: hubs.map((h, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: h.title,
          url: `https://newcollab.co/blog/topic/${h.slug}`,
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogPageClient hubs={hubs} featured={featured} total={posts.length} />
    </>
  );
}
