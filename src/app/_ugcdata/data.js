// Monthly UGC data pages (Nov 2026 organic pivot to UGC creators in the US, CA and AU): built on data only Newcollab
// has. Backend: GET /api/public/brands-running-ugc-ads and /api/public/brands-replying.

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.newcollab.co';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
  'November', 'December'];

// "November 2026": the page is regenerated hourly, so the label moves with the data.
export function monthLabel(now = new Date()) {
  return `${MONTHS[now.getUTCMonth()]} ${now.getUTCFullYear()}`;
}

export async function fetchData(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function faqSchema(faq) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
}

export function listSchema(url, name, brands) {
  return {
    '@type': 'CollectionPage',
    url,
    name,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: brands.length,
      itemListElement: brands.map((b, i) => ({ '@type': 'ListItem', position: i + 1, name: b.name, url: `https://newcollab.co/brand/${b.slug}` })),
    },
  };
}

export const HUB_LINKS = [
  ['beauty', 'Beauty'], ['skincare', 'Skincare'], ['fashion', 'Fashion'], ['haircare', 'Haircare'],
  ['home', 'Home'], ['wellness', 'Wellness'], ['food', 'Food & drink'], ['jewelry', 'Jewelry'],
];
