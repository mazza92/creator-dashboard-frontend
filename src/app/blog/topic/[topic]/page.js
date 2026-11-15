import { notFound } from 'next/navigation';
import { getAllPosts } from '../../../../../lib/blog';
import { BLOG_TOPICS, getTopic, groupPostsByTopic } from '../../../../lib/blogTopics';
import TopicPageClient from './TopicPageClient';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_TOPICS.map((t) => ({ topic: t.slug }));
}

export async function generateMetadata({ params }) {
  const { topic: slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return {};
  const url = `https://newcollab.co/blog/topic/${topic.slug}`;
  const title = `${topic.title}: Guides for UGC Creators | Newcollab Blog`;
  return {
    title,
    description: topic.description,
    alternates: { canonical: url },
    openGraph: { title, description: topic.description, url, type: 'website', siteName: 'Newcollab' },
    twitter: { card: 'summary_large_image', title, description: topic.description },
  };
}

function byNewest(a, b) {
  return String(b.dateModified || b.date || '').localeCompare(String(a.dateModified || a.date || ''));
}

export default async function TopicPage({ params }) {
  const { topic: slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();
  const posts = (groupPostsByTopic(getAllPosts() || [])[topic.slug] || []).slice().sort(byNewest);
  const url = `https://newcollab.co/blog/topic/${topic.slug}`;
  const cards = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || p.metaDescription || '',
    date: p.dateModified || p.date || null,
    readTime: p.readTime || null,
    image: p.image || null,
  }));
  const others = BLOG_TOPICS.filter((t) => t.slug !== topic.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        url,
        name: topic.title,
        description: topic.description,
        isPartOf: { '@type': 'Blog', '@id': 'https://newcollab.co/blog#blog', url: 'https://newcollab.co/blog' },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: posts.length,
          itemListElement: posts.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `https://newcollab.co/blog/${p.slug}`,
            name: p.title,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://newcollab.co' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://newcollab.co/blog' },
          { '@type': 'ListItem', position: 3, name: topic.title, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopicPageClient topic={topic} posts={cards} others={others} />
    </>
  );
}
