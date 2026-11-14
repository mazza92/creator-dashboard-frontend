import { getAllPosts } from '../../../lib/blog';
import BlogPageClient from './BlogPageClient';

// This page uses Static Site Generation (SSG) for maximum SEO
export const metadata = {
  title: 'Brand Deals & PR Packages Guides for Creators | Newcollab Blog',
  description: 'Brand lists, PR application forms, pitch email templates and guides to help small creators get PR packages, UGC work and paid brand deals in 2026.',
  keywords: 'free link in bio for paid partnerships, sponsorships for influencers, brand sponsorships for influencers, paid partnerships, influencer sponsorships, micro-influencer brand deals, creator monetization, brand partnerships, content strategy, influencer marketing',
  openGraph: {
    title: 'Brand Deals & PR Packages Guides for Creators | Newcollab Blog',
    description: 'Brand lists, PR application forms, pitch email templates and guides to help small creators get PR packages, UGC work and paid brand deals in 2026.',
    type: 'website',
    url: 'https://newcollab.co/blog',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand Deals & PR Packages Guides for Creators | Newcollab Blog',
    description: 'Brand lists, PR application forms, pitch email templates and guides to help small creators get PR packages, UGC work and paid brand deals in 2026.',
    creator: '@newcollab',
  },
};

// Generate static params at build time
export async function generateStaticParams() {
  // This ensures all blog posts are pre-rendered
  return [];
}

// BlogPageClient renders the page's only <h1> (it is server-rendered too).

// This function runs at build time to generate the page
export default async function BlogPage() {
  try {
    // Fetch all posts at build time (SSG)
    const posts = getAllPosts() || [];

    // Get unique categories safely
    const categories = posts.length > 0
      ? [...new Set(posts.map(post => post.category).filter(Boolean))].filter(Boolean)
      : [];

    return (
      <>
        <BlogPageClient initialPosts={posts} categories={categories} />
      </>
    );
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return (
      <>
        <BlogPageClient initialPosts={[]} categories={[]} />
      </>
    );
  }
}
