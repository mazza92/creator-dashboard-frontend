import PRPackagesClient from './PRPackagesClient';

export const metadata = {
  title: 'Send PR Packages to Influencers | Brand PR Packages | Newcollab',
  description:
    'Send PR packages to influencers and turn gifting into paid partnerships. Find creators, run PR campaigns, and grow your brand with Newcollab.',
  keywords:
    'send pr packages to influencers, brand pr packages, influencer gifting, pr packages for creators, influencer marketing, creator partnerships',
  alternates: {
    canonical: 'https://newcollab.co/brands/pr-packages',
  },
  openGraph: {
    title: 'Send PR Packages to Influencers | Newcollab',
    description:
      'Send PR packages to influencers and turn gifting into paid partnerships with Newcollab.',
    type: 'website',
    url: 'https://newcollab.co/brands/pr-packages',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Send PR Packages to Influencers | Newcollab',
    description:
      'Send PR packages to influencers and turn gifting into paid partnerships with Newcollab.',
    creator: '@newcollab',
  },
};

export default function PRPackagesPage() {
  return <PRPackagesClient />;
}

