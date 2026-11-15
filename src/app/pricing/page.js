import PricingClient from './PricingClient';
import { PRICING_FAQ } from './faq';

const TITLE = 'Newcollab Pricing: Free Plan and Pro at $19/month for UGC Creators';
const DESCRIPTION =
  'Newcollab is free for UGC creators: 3,000+ brands with PR contacts, a free UGC portfolio, free tools and 3 brand applications a month. Pro is $19/month: Polly pitches brands every weekday, every paid UGC gig, unlimited applications. Cancel anytime.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://newcollab.co/pricing' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: 'https://newcollab.co/pricing', type: 'website', siteName: 'Newcollab' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default function PricingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Newcollab',
        url: 'https://newcollab.co',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: DESCRIPTION,
        offers: [
          { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD', url: 'https://newcollab.co/pricing' },
          {
            '@type': 'Offer', name: 'Pro', price: '19', priceCurrency: 'USD', url: 'https://newcollab.co/pricing',
            priceSpecification: { '@type': 'UnitPriceSpecification', price: '19', priceCurrency: 'USD', unitCode: 'MON' },
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: PRICING_FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://newcollab.co' },
          { '@type': 'ListItem', position: 2, name: 'Pricing', item: 'https://newcollab.co/pricing' },
        ],
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PricingClient />
    </>
  );
}
