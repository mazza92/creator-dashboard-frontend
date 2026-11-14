import { notFound } from 'next/navigation';
import PortfolioHubView from '../PortfolioHubView';
import { HUB_COPY, MIN_INDEXABLE, SITE, fetchHub, itemListSchema } from '../_hub';
import { jsonLd } from '@/src/lib/jsonLd';

export const revalidate = 3600;

export function generateStaticParams() {
  return Object.keys(HUB_COPY).map((hub) => ({ hub }));
}

export async function generateMetadata({ params }) {
  const { hub } = await params;
  const copy = HUB_COPY[hub];
  if (!copy) return {};
  const data = await fetchHub(hub);
  const n = (data.creators || []).length;
  const url = `${SITE}/ugc-portfolio-examples/${hub}`;
  const title = `${copy.label} UGC Portfolio Examples (2026) | Newcollab`;
  const description = `${n ? `${n} real` : 'Real'} ${copy.label.toLowerCase()} UGC portfolio examples from creators approved on Newcollab this month. See their samples, niches and reach, then build your own free.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: n >= MIN_INDEXABLE ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description, type: 'website', url, siteName: 'Newcollab' },
  };
}

export default async function UgcPortfolioHubPage({ params }) {
  const { hub } = await params;
  const copy = HUB_COPY[hub];
  if (!copy) notFound();
  const data = await fetchHub(hub);
  const url = `${SITE}/ugc-portfolio-examples/${hub}`;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema(`${copy.label} UGC portfolio examples`, url, data.creators || [])) }} />
      <PortfolioHubView
        title={`${copy.label} UGC Portfolio Examples`}
        intro={copy.intro}
        hubs={data.hubs || []}
        activeHub={hub}
        creators={data.creators || []}
        total={data.total || 0}
        canonicalUrl={url}
      />
    </>
  );
}
