'use client';

import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import PublicKitStudio from '../../kit-builder/PublicKitStudio';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Free UGC portfolio builder',
  applicationCategory: 'BusinessApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  url: 'https://newcollab.co/media-kit',
  description:
    'Free UGC portfolio builder for creators. Publish a public UGC portfolio and paste the link in your Instagram bio or TikTok description.',
};

export default function MediaKitStudioClient() {
  return (
    <LandingPageLayoutNext hideFooter canonicalUrl="https://newcollab.co/media-kit">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PublicKitStudio />
    </LandingPageLayoutNext>
  );
}
