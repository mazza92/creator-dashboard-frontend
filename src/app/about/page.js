import AboutClient from './AboutClient';

export const metadata = {
  title: 'About Newcollab | Gifted UGC for brands and PR tools for creators',
  description:
    'Newcollab is a gifted UGC roster for DTC brands and a PR-forms directory plus free UGC portfolio builder for creators. It is not a paid UGC marketplace. Built by Mazza.',
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
