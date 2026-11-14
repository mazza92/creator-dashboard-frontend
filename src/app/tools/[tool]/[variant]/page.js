import { notFound } from 'next/navigation';
import ToolPage from '../../ToolPage';
import { SITE, TOOLS, pageTitle, resolveVariant, variantsFor } from '../../_catalog';

export function generateStaticParams() {
  return Object.keys(TOOLS).flatMap((tool) => variantsFor(tool).map((v) => ({ tool, variant: v.slug })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { tool, variant } = await params;
  const t = TOOLS[tool];
  const v = t && resolveVariant(tool, variant);
  if (!v) return {};
  const url = `${SITE}/tools/${tool}/${variant}`;
  const title = pageTitle(t, v);
  const description = v.type === 'region'
    ? `Free UGC rate calculator for ${v.data.label} creators: price UGC videos in ${v.data.currency} with usage rights, extra hooks, raw footage and rush fees.`
    : v.type === 'platform'
      ? `Free ${v.label} ${t.short.toLowerCase()} for UGC creators. ${v.data.intro}`
      : `Free ${v.label.toLowerCase()} ${t.short.toLowerCase()} for UGC creators, with example ${t.kind === 'hooks' ? 'hooks' : t.kind === 'script' ? 'script' : 'pitch email'} for a ${v.data.product}. No signup.`;
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: 'website', siteName: 'Newcollab' } };
}

export default async function ToolVariantRoute({ params }) {
  const { tool, variant } = await params;
  const v = TOOLS[tool] && resolveVariant(tool, variant);
  if (!v) notFound();
  return <ToolPage toolSlug={tool} variant={v} />;
}
