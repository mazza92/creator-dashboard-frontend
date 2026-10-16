import IntegrationsHubClient from './IntegrationsHubClient';
import { API, LAST_UPDATED_ISO, SITE, allAssistants } from './_catalog';

const TITLE = 'Find UGC Creators in ChatGPT, Claude, Gemini and Any AI Assistant | Newcollab';
const DESCRIPTION =
  'Add Newcollab to ChatGPT, Claude, Gemini or any MCP client and search vetted UGC creators by niche, platform and country. Free, read-only, no API key.';

export const revalidate = 3600;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'UGC creator search AI',
    'influencer search MCP server',
    'find UGC creators with AI',
    'ChatGPT influencer marketing app',
    'Claude influencer marketing connector',
    'Gemini influencer search app',
    'AI influencer discovery tool',
  ],
  alternates: { canonical: `${SITE}/integrations` },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', url: `${SITE}/integrations`, siteName: 'Newcollab' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, creator: '@newcollab' },
};

function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function IntegrationsHubRoute() {
  const assistants = allAssistants();
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: TITLE,
          url: `${SITE}/integrations`,
          dateModified: LAST_UPDATED_ISO,
          description: DESCRIPTION,
          hasPart: assistants.map((a) => ({
            '@type': 'WebPage',
            name: a.navTitle,
            url: `${SITE}/integrations/${a.slug}`,
          })),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: 'AI integrations', item: `${SITE}/integrations` },
          ],
        }}
      />
      <IntegrationsHubClient
        assistants={assistants.map((a) => ({
          slug: a.slug,
          name: a.name,
          vendor: a.vendor,
          appTerm: a.appTerm,
          navTitle: a.navTitle,
          description: a.description,
          listed: a.listed,
          hubStatus: a.hubStatus || null,
        }))}
        genericMcpUrl={`${API}/claude/mcp`}
      />
    </>
  );
}
