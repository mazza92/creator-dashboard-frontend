import { notFound } from 'next/navigation';
import IntegrationClient from '../IntegrationClient';
import { SITE, assistantSlugs, buildSchemas, getAssistant, otherAssistants } from '../_catalog';

export function generateStaticParams() {
  return assistantSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const a = getAssistant(slug);
  if (!a) return {};
  const url = `${SITE}/integrations/${a.slug}`;
  return {
    title: a.title,
    description: a.description,
    keywords: a.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: a.title,
      description: a.description,
      type: 'website',
      url,
      siteName: 'Newcollab',
    },
    twitter: {
      card: 'summary_large_image',
      title: a.title,
      description: a.description,
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

export default async function IntegrationRoute({ params }) {
  const { slug } = await params;
  const a = getAssistant(slug);
  if (!a) notFound();

  return (
    <>
      {buildSchemas(a).map((schema) => <JsonLd key={schema['@type']} data={schema} />)}
      <IntegrationClient assistant={a} others={otherAssistants(a.slug)} />
    </>
  );
}
