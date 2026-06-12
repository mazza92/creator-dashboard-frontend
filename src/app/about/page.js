import AboutClient from './AboutClient';

export const metadata = {
  title: 'About newcollab | Built for Creators Who Want Brand Deals',
  description:
    'newcollab was built by a founder who spent years in influencer marketing and saw the same problem everywhere: creators with great content, no system to reach brands. So we built one.',
  alternates: {
    canonical: 'https://newcollab.co/about',
  },
  openGraph: {
    title: 'About newcollab | Built for Creators Who Want Brand Deals',
    description:
      'A solo-founder product, built after years watching talented creators get ignored — not because their content was bad, but because they had no system.',
    type: 'website',
    url: 'https://newcollab.co/about',
    siteName: 'newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About newcollab | Built for Creators Who Want Brand Deals',
    description: 'The complete brand outreach tool for nano and micro creators.',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
