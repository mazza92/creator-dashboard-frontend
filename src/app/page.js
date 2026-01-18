import Founding50Client from './Founding50Client';

// SEO metadata for landing page
export const metadata = {
  title: 'Get PR Packages & Paid Partnerships from Brands | Free PR Packages for Creators | Newcollab',
  description: 'Join 10,000+ creators receiving free PR packages and paid brand partnerships. Get matched with 1,000+ brands sending PR packages to small influencers. Free signup, no credit card required.',
  keywords: 'PR packages for creators, free PR packages, brands sending PR packages, PR packages for small influencers, how to get PR packages, PR packages 2025, micro influencer PR packages, brand PR packages, influencer PR packages, get PR packages from brands, PR package opportunities, free PR packages for influencers, PR packages for content creators, brands that send PR packages, PR package signup',
  openGraph: {
    title: 'Get PR Packages & Paid Partnerships from Brands | Newcollab',
    description: 'Join 10,000+ creators receiving free PR packages and paid brand partnerships. Get matched with 1,000+ brands sending PR packages to small influencers.',
    type: 'website',
    url: 'https://newcollab.co',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get PR Packages & Paid Partnerships from Brands | Newcollab',
    description: 'Join 10,000+ creators receiving free PR packages and paid brand partnerships.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co',
  },
};

export default function HomePage() {
  return <Founding50Client />;
}
