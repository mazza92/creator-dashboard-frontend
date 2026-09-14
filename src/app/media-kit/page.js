import MediaKitStudioClient from './MediaKitStudioClient';

export const metadata = {
  title: 'Free UGC portfolio builder | Publish a UGC portfolio | newcollab',
  description:
    'Free UGC portfolio builder for creators. Publish a public UGC portfolio with rates, posts, and packages — no Canva, no account. Paste the link in your Instagram bio and TikTok description so brands can open it.',
  keywords: [
    'portfolio',
    'UGC portfolio',
    'free UGC portfolio',
    'free portfolio builder',
    'free UGC portfolio builder',
    'UGC media kit',
    'creator portfolio',
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
};

export default function MediaKitPage() {
  return <MediaKitStudioClient />;
}
