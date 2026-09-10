import { notFound } from 'next/navigation';
import BrandClusterClient from '../_cluster/BrandClusterClient';
import {
  SITE,
  buildClusterBreadcrumbSchema,
  buildClusterFaqSchema,
  buildClusterHowToSchema,
  buildClusterServiceSchema,
  clusterSlugs,
  getClusterPage,
} from '../_cluster/catalog';

export function generateStaticParams() {
  return clusterSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = getClusterPage(slug);
  if (!page) return {};
  const url = `${SITE}/brands/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: page.title,
      description: page.description,
      type: 'website',
      url,
      siteName: 'Newcollab',
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      creator: '@newcollab',
    },
  };
}

function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function BrandClusterRoute({ params }) {
  const { slug } = await params;
  const page = getClusterPage(slug);
  if (!page) notFound();

  return (
    <>
      <JsonLd data={buildClusterFaqSchema(page)} />
      <JsonLd data={buildClusterServiceSchema(page)} />
      <JsonLd data={buildClusterHowToSchema(page)} />
      <JsonLd data={buildClusterBreadcrumbSchema(page)} />
      <BrandClusterClient page={page} />
    </>
  );
}
