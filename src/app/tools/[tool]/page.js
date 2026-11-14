import { notFound } from 'next/navigation';
import ToolPage from '../ToolPage';
import { SITE, TOOLS, pageTitle } from '../_catalog';

export function generateStaticParams() {
  return Object.keys(TOOLS).map((tool) => ({ tool }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { tool } = await params;
  const t = TOOLS[tool];
  if (!t) return {};
  const url = `${SITE}/tools/${tool}`;
  const title = pageTitle(t, null);
  const description = `${t.tagline} Free ${t.name.toLowerCase()} for UGC creators, no signup. With examples, tips and FAQ.`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', siteName: 'Newcollab' } };
}

export default async function ToolRoute({ params }) {
  const { tool } = await params;
  if (!TOOLS[tool]) notFound();
  return <ToolPage toolSlug={tool} />;
}
