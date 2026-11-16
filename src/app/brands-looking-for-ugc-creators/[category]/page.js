import { notFound } from 'next/navigation';
import { HUBS, HUB_BASE, MIN_BRANDS, fetchHub, getHub } from '../_hubs';
import HubClient from './HubClient';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return HUBS.map((h) => ({ category: h.slug }));
}

function faqFor(hub, data) {
  const c = data?.counts || {};
  const total = data?.total || 0;
  const label = hub.label.toLowerCase();
  return [
    [`Which ${label} brands are looking for UGC creators?`,
      `${total} ${label} brands on Newcollab show a real sign of buying creator content: ${c.hot || 0} were seen running ads in the last 30 days, ${c.creatorAds || 0} run creator-style ads, ${c.gifting || 0} have been seen gifting creators${c.briefs ? ` and ${c.briefs} have a paid UGC brief open` : ''}. The list is updated daily.`],
    [`How do I pitch ${label} brands as a UGC creator?`,
      `${hub.tip} Keep the email under 120 words, name one product, propose one video and link two samples from your UGC portfolio.`],
    [`How much do ${label} brands pay for UGC?`,
      'Brands rarely publish UGC rates. Beginner UGC creators usually charge $50 to $150 per video for organic use, plus a separate fee when the brand runs the video as an ad.'],
    ['Do I need followers to work with these brands?',
      'No. UGC is paid for the video, not your audience. A portfolio with three or four sample videos in the niche matters more than follower count.'],
  ];
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  const hub = getHub(category);
  if (!hub) return {};
  const data = await fetchHub(hub.slug);
  const total = data?.total || 0;
  const url = `https://newcollab.co${HUB_BASE}/${hub.slug}`;
  const title = `${hub.label} Brands Looking for UGC Creators (${total || 'Updated'} Brands, Updated Daily) | Newcollab`;
  const description = `${total ? `${total} ` : ''}${hub.label.toLowerCase()} brands that buy creator content right now: seen running ads, running creator-style ads, gifting creators or hiring for paid UGC. Updated daily, with how to pitch each one.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    ...(total < MIN_BRANDS ? { robots: { index: false, follow: true } } : {}),
    openGraph: { title, description, url, type: 'website', siteName: 'Newcollab' },
  };
}

export default async function HubPage({ params }) {
  const { category } = await params;
  const hub = getHub(category);
  if (!hub) notFound();
  const data = await fetchHub(hub.slug);
  const brands = data?.brands || [];
  const url = `https://newcollab.co${HUB_BASE}/${hub.slug}`;
  const faq = faqFor(hub, data);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        url,
        name: `${hub.label} brands looking for UGC creators`,
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: brands.length,
          itemListElement: brands.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, url: `https://newcollab.co/brand/${b.slug}` })),
        },
      },
      { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://newcollab.co' },
          { '@type': 'ListItem', position: 2, name: 'Brands looking for UGC creators', item: `https://newcollab.co${HUB_BASE}` },
          { '@type': 'ListItem', position: 3, name: hub.label, item: url },
        ],
      },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HubClient hub={hub} data={data} faq={faq} others={HUBS.filter((h) => h.slug !== hub.slug)} />
    </>
  );
}
