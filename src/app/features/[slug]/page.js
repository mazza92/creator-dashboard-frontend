import { notFound } from 'next/navigation';
import { FEATURES, getFeature } from '../_data';
import { fetchShowcase } from '../showcase';
import FeaturePageClient from './FeaturePageClient';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const f = getFeature(slug);
  if (!f) return {};
  const url = `https://newcollab.co/features/${f.slug}`;
  return {
    title: f.title,
    description: f.description,
    alternates: { canonical: url },
    openGraph: { title: f.title, description: f.description, url, type: 'website', siteName: 'Newcollab' },
    twitter: { card: 'summary_large_image', title: f.title, description: f.description },
  };
}

export default async function FeaturePage({ params }) {
  const { slug } = await params;
  const f = getFeature(slug);
  if (!f) notFound();
  const showcase = f.live ? await fetchShowcase() : null;
  const url = `https://newcollab.co/features/${f.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${url}#app`,
        name: `Newcollab ${f.eyebrow}`,
        url,
        description: f.answer,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: [
          { '@type': 'Offer', name: 'Free', price: '0', priceCurrency: 'USD' },
          { '@type': 'Offer', name: 'Pro', price: '19', priceCurrency: 'USD', category: 'subscription' },
        ],
        publisher: { '@type': 'Organization', name: 'Newcollab', url: 'https://newcollab.co' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: f.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://newcollab.co' },
          { '@type': 'ListItem', position: 2, name: 'Features', item: 'https://newcollab.co/features' },
          { '@type': 'ListItem', position: 3, name: f.nav, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FeaturePageClient feature={f} showcase={showcase} others={FEATURES.filter((x) => x.slug !== f.slug)} />
    </>
  );
}
