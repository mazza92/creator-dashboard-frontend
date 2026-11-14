import { getAllPosts } from '../../../lib/blog';
import BlogPageClient from './BlogPageClient';

// This page uses Static Site Generation (SSG) for maximum SEO
export const metadata = {
  title: 'UGC Creator Guides: Rates, Brand Deals & PR Packages | Newcollab Blog',
  description: 'Guides for UGC creators in the US, Canada and Europe: UGC rates, how to make UGC videos brands pay for, building a UGC portfolio, and brands that send PR packages or pay for UGC.',
  keywords: 'free link in bio for paid partnerships, sponsorships for influencers, brand sponsorships for influencers, paid partnerships, influencer sponsorships, micro-influencer brand deals, creator monetization, brand partnerships, content strategy, influencer marketing',
  openGraph: {
    title: 'UGC Creator Guides: Rates, Brand Deals & PR Packages | Newcollab Blog',
    description: 'Guides for UGC creators in the US, Canada and Europe: UGC rates, how to make UGC videos brands pay for, building a UGC portfolio, and brands that send PR packages or pay for UGC.',
    type: 'website',
    url: 'https://newcollab.co/blog',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UGC Creator Guides: Rates, Brand Deals & PR Packages | Newcollab Blog',
    description: 'Guides for UGC creators in the US, Canada and Europe: UGC rates, how to make UGC videos brands pay for, building a UGC portfolio, and brands that send PR packages or pay for UGC.',
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
