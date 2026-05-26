import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs, getRelatedPosts, getPostCanonicalUrl } from '../../../../lib/blog';
import { buildBlogPostingSchema, buildBlogBreadcrumbSchema } from '../../../lib/blogStructuredData';
import BlogFaqSchemaScript from './BlogFaqSchemaScript';
import BlogPostClient from './BlogPostClient';

// Generate static params for all blog posts at build time (SSG)
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | Newcollab Blog',
    };
  }

  return {
    title: `${post.title} | Newcollab Creator Blog`,
    description: post.metaDescription || post.excerpt,
    keywords: post.keywords?.join(', ') || post.tags?.join(', '),
    authors: [{ name: post.author.name }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.image],
      url: `https://newcollab.co/blog/${post.slug}`,
      siteName: 'Newcollab',
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [post.author.name],
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription || post.excerpt,
      images: [post.image],
      creator: '@newcollab',
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    alternates: {
      canonical: getPostCanonicalUrl(post),
    },
  };
}

// This page uses Static Site Generation (SSG) with Incremental Static Regeneration (ISR)
// Pages are pre-rendered at build time and can be regenerated on-demand
export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = getRelatedPosts(slug, post, 3);

  const blogPostingSchema = buildBlogPostingSchema(post);
  const breadcrumbData = buildBlogBreadcrumbSchema(post);

  // Strip fields that are unused by the client but bloat the RSC payload and
  // contain nested JSON-LD fragments (post.schema has mainEntity: FAQPage which
  // Google can extract from the serialised RSC flight data).
  const { schema: _unusedSchema, ...postForClient } = post;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }}
      />
      <BlogFaqSchemaScript faq={post.faq} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      {/* Server-rendered h1 for SEO - visually hidden, client component renders visible title */}
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        {post.title}
      </h1>
      <BlogPostClient
        post={postForClient}
        relatedPosts={relatedPosts}
        canonicalUrl={getPostCanonicalUrl(post)}
      />
    </>
  );
}
