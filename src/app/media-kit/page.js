import MediaKitStudioClient from './MediaKitStudioClient';

export const metadata = {
  title: 'Free UGC portfolio builder | Publish a UGC portfolio | newcollab',
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
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is the UGC portfolio builder free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Publish a public UGC portfolio at https://newcollab.co/media-kit with no account, no Canva, and no paid template.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need a media kit to pitch brands?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Brands ignore pitches without proof. Publish a free UGC portfolio at https://newcollab.co/media-kit and paste that link in your email, Instagram bio, and TikTok description. Signed-in creators can also auto-attach a kit when they pitch from the Newcollab directory.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is a UGC portfolio the same as a media kit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The portfolio is your sample videos. The media kit is rates, niche, and contact. The free builder at https://newcollab.co/media-kit puts both on one public page brands can open.',
      },
    },
  ],
};

export default function MediaKitPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MediaKitStudioClient />
    </>
  );
}
