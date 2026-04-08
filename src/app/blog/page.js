import { getAllPosts } from '../../../lib/blog';
import BlogPageClient from './BlogPageClient';

// This page uses Static Site Generation (SSG) for maximum SEO
export const metadata = {
  title: 'Free Link in Bio for Paid Partnerships | Sponsorships for Influencers Blog | Newcollab',
  description: 'Discover how to get free link in bio for paid partnerships and sponsorships for influencers. Expert tips on brand deals, micro-influencer strategies, and creator monetization.',
  keywords: 'free link in bio for paid partnerships, sponsorships for influencers, brand sponsorships for influencers, paid partnerships, influencer sponsorships, micro-influencer brand deals, creator monetization, brand partnerships, content strategy, influencer marketing',
  openGraph: {
    title: 'Free Link in Bio for Paid Partnerships | Sponsorships for Influencers Blog | Newcollab',
    description: 'Discover how to get free link in bio for paid partnerships and sponsorships for influencers. Expert tips on brand deals, micro-influencer strategies, and creator monetization.',
    type: 'website',
    url: 'https://newcollab.co/blog',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Link in Bio for Paid Partnerships | Sponsorships for Influencers Blog | Newcollab',
    description: 'Discover how to get free link in bio for paid partnerships and sponsorships for influencers. Expert tips on brand deals, micro-influencer strategies, and creator monetization.',
    creator: '@newcollab',
  },
};

// Generate static params at build time
export async function generateStaticParams() {
  // This ensures all blog posts are pre-rendered
  return [];
}

// Visually hidden h1 style for SEO
const srOnlyStyle = { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };

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
        {/* Server-rendered h1 for SEO - visually hidden, client component renders visible title */}
        <h1 style={srOnlyStyle}>
          Free Link in Bio for Paid Partnerships &amp; Sponsorships for Influencers
        </h1>
        <BlogPageClient initialPosts={posts} categories={categories} />
      </>
    );
  } catch (error) {
    console.error('Error loading blog posts:', error);
    return (
      <>
        <h1 style={srOnlyStyle}>
          Free Link in Bio for Paid Partnerships &amp; Sponsorships for Influencers
        </h1>
        <BlogPageClient initialPosts={[]} categories={[]} />
      </>
    );
  }
}
