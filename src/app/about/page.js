import AboutClient from './AboutClient';

export const metadata = {
  title: 'About Newcollab | Creator-Brand Partnership Platform',
  description: 'Built by a creator for creators. 10+ years of experience in influencer marketing, from talent agencies to global brands. Empowering creators, transforming brand partnerships.',
  alternates: {
    canonical: 'https://newcollab.co/about',
  },
  openGraph: {
    title: 'About Newcollab | Creator-Brand Partnership Platform',
    description: 'Built by a creator for creators. 10+ years of experience in influencer marketing.',
    type: 'website',
    url: 'https://newcollab.co/about',
    siteName: 'Newcollab',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
