import { notFound } from 'next/navigation';
import { getPostBySlug, getAllPostSlugs, getRelatedPosts } from '../../../../lib/blog';
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
  const post = getPostBySlug(params.slug);
  
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
      canonical: `https://newcollab.co/blog/${post.slug}`,
    },
  };
}

// This page uses Static Site Generation (SSG) with Incremental Static Regeneration (ISR)
// Pages are pre-rendered at build time and can be regenerated on-demand
export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function BlogPostPage({ params }) {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = getRelatedPosts(params.slug, post, 3);

  // Create structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [
      {
        "@type": "ImageObject",
        "url": post.image,
        "width": 1200,
        "height": 630
      }
    ],
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role,
      "image": post.author.image,
      "url": "https://newcollab.co/blog",
      ...(post.author.description && { "description": post.author.description })
    },
    "publisher": {
      "@type": "Organization",
      "name": "Newcollab",
      "url": "https://newcollab.co",
      "logo": {
        "@type": "ImageObject",
        "url": "https://newcollab.co/logo.png",
        "width": 600,
        "height": 60
      }
    },
    "description": post.metaDescription || post.excerpt,
    "keywords": post.keywords?.join(', ') || post.tags?.join(', '),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://newcollab.co/blog/${post.slug}`
    },
    "url": `https://newcollab.co/blog/${post.slug}`,
    "wordCount": post.content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0,
    "articleSection": post.category,
    "articleBody": post.content?.replace(/<[^>]*>/g, '').substring(0, 500) || post.excerpt,
    ...(post.faq && post.faq.length > 0 && {
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": post.faq.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    })
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://newcollab.co/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://newcollab.co/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": `https://newcollab.co/blog/${post.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <BlogPostClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}
