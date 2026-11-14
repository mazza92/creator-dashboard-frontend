import MediaKitStudioClient from './MediaKitStudioClient';
import UgcPortfolioGuide, { PORTFOLIO_FAQ } from './UgcPortfolioGuide';
import { jsonLd } from '@/src/lib/jsonLd';

export const metadata = {
  title: 'Free UGC Portfolio Builder & Template (2026) | Newcollab',
  description:
    'Free UGC portfolio builder for creators. Publish a public UGC portfolio with rates, posts, and packages — no Canva, no account. Paste the link in your Instagram bio and TikTok description so brands can open it.',
  keywords: [
    'free UGC portfolio builder',
    'UGC portfolio builder',
    'free UGC portfolio',
    'UGC portfolio',
    'creator portfolio',
    'UGC media kit',
    'free media kit',
    'media kit for UGC creators',
    'free portfolio builder',
    'portfolio',
  ],
  alternates: { canonical: 'https://newcollab.co/media-kit' },
  openGraph: {
    title: 'Free UGC portfolio builder | newcollab',
    description:
      'Build and publish a free UGC portfolio brands can open. Copy the URL into your bio to track when a brand views it.',
    type: 'website',
    url: 'https://newcollab.co/media-kit',
    siteName: 'newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free UGC portfolio builder | newcollab',
    description:
      'Publish a public UGC portfolio in minutes. No Canva, no account. Paste the link in your Instagram bio and TikTok description.',
    creator: '@newcollab',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free UGC portfolio builder',
  alternateName: ['UGC media kit builder', 'Free creator portfolio', 'UGC portfolio builder'],
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://newcollab.co/media-kit',
  description:
    'Free UGC portfolio builder for creators. Publish a public UGC portfolio with rates, sample posts, and packages — no Canva and no account. Share the link in your Instagram bio or TikTok description.',
  featureList: [
    'Publish a public UGC portfolio without an account',
    'Add rates, packages, sample posts, and brand quotes',
    'Live preview while you edit',
    'Share a newcollab.co/kit link in Instagram and TikTok bios',
  ],
  audience: { '@type': 'Audience', audienceType: 'UGC creators' },
  publisher: { '@type': 'Organization', name: 'newcollab', url: 'https://newcollab.co' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: PORTFOLIO_FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function MediaKitPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <MediaKitStudioClient>
        <UgcPortfolioGuide />
      </MediaKitStudioClient>
    </>
  );
}
