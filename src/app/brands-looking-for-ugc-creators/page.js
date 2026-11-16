import SimplePage from '../features/SimplePage';
import { HUBS, HUB_BASE, fetchHubIndex } from './_hubs';

export const revalidate = 3600;

const TITLE = 'Brands Looking for UGC Creators, by Niche (Updated Daily) | Newcollab';
const DESCRIPTION =
  'Brands that buy creator content right now, by niche: seen running ads, running creator-style ads, gifting creators or hiring for paid UGC. Beauty, skincare, supplements, fashion, wellness, food and more.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `https://newcollab.co${HUB_BASE}` },
  openGraph: { title: TITLE, description: DESCRIPTION, url: `https://newcollab.co${HUB_BASE}`, type: 'website', siteName: 'Newcollab' },
};

export default async function HubIndex() {
  const data = await fetchHubIndex();
  const totals = Object.fromEntries((data?.categories || []).map((c) => [c.category, c.total]));
  const items = HUBS.map((h) => ({
    href: `${HUB_BASE}/${h.slug}`,
    title: `${h.label} brands looking for UGC creators`,
    text: `${totals[h.slug] ? `${totals[h.slug]} brands with a real UGC signal. ` : ''}${h.tip}`,
  }));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Brands looking for UGC creators, by niche',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.title, url: `https://newcollab.co${it.href}` })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SimplePage
        canonical={`https://newcollab.co${HUB_BASE}`}
        crumbs={[['/', 'Home'], [null, 'Brands looking for UGC creators']]}
        eyebrow="UGC brands by niche"
        title="Brands looking for UGC creators, by niche"
        intro="Every brand here shows a real sign that it buys creator content: an open paid UGC brief, creator-style ads, ads seen in the last 30 days, or gifting creators. Lists update daily. Pick your niche."
        items={items}
      />
    </>
  );
}
