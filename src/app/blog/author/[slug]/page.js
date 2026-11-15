import { notFound } from 'next/navigation';
import { getAllPosts } from '../../../../../lib/blog';
import { BLOG_AUTHORS, authorSlug, getAuthorBySlug } from '../../../../lib/blogAuthors';
import AuthorPageClient from './AuthorPageClient';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(BLOG_AUTHORS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = getAuthorBySlug(slug);
  if (!a) return {};
  const url = `https://newcollab.co/blog/author/${a.slug}`;
  const title = `${a.name}, ${a.role} | Newcollab Blog`;
  return {
    title,
    description: a.bio,
    alternates: { canonical: url },
    openGraph: { title, description: a.bio, url, type: 'profile', siteName: 'Newcollab' },
  };
}

export default async function AuthorPage({ params }) {
  const { slug } = await params;
  const a = getAuthorBySlug(slug);
  if (!a) notFound();
  const url = `https://newcollab.co/blog/author/${a.slug}`;
  const posts = (getAllPosts() || [])
    .filter((p) => authorSlug(p.author?.name) === a.slug)
    .sort((x, y) => String(y.dateModified || y.date || '').localeCompare(String(x.dateModified || x.date || '')))
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt || p.metaDescription || '',
      date: p.dateModified || p.date || null,
      readTime: p.readTime || null,
      image: p.image || null,
    }));

  const entity = {
    '@type': a.type,
    '@id': `${url}#author`,
    name: a.name,
    url,
    description: a.bio,
    ...(a.type === 'Person' ? { jobTitle: a.role, worksFor: { '@type': 'Organization', name: 'Newcollab', url: 'https://newcollab.co' } } : {}),
    ...(a.image ? { image: a.image } : {}),
    ...(a.sameAs?.length ? { sameAs: a.sameAs } : {}),
  };
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'ProfilePage', '@id': `${url}#page`, url, name: a.name, mainEntity: { '@id': `${url}#author` } },
      entity,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://newcollab.co' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://newcollab.co/blog' },
          { '@type': 'ListItem', position: 3, name: a.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AuthorPageClient author={a} posts={posts} />
    </>
  );
}
