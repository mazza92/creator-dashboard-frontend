import PRPackagesClient from './PRPackagesClient';
import {
  PAGE_URL,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildHowToSchema,
  buildServiceSchema,
  buildWebPageSchema,
} from './content';

export const metadata = {
  title: 'Gifted UGC creators for DTC brands | $299, first campaign free',
  description:
    'Scan any brand to see the TikTok creators and hooks behind it, then gift vetted UGC creators who make the same content for you. 5–10 ad-ready videos with 6-month commercial use. First campaign free, then $299/mo if you opt in.',
  keywords:
    'find ugc creators, ugc creators for brands, gifted ugc, gifted ugc platform, pr packages for brands, product seeding, ugc for ads, ugc for meta ads, dtc ugc creators, brand ugc content, tiktok creator lookup, competitor influencer analysis, brand scan',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Find UGC creators for your brand | Gifted PR packages',
    description:
      'Vetted UGC creators on a branded roster. Select, lock, ship. 5–10 videos with 6-month commercial reuse. First campaign free, then $299/month.',
    type: 'website',
    url: PAGE_URL,
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find UGC creators for your brand | Gifted PR packages',
    description:
      'Vetted UGC creators on a branded roster. Select, lock, ship. 5–10 videos with 6-month commercial reuse. First campaign free, then $299/month.',
    creator: '@newcollab',
  },
  other: {
    'article:modified_time': '2026-10-26',
  },
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.newcollab.co').replace(/\/+$/, '');

// A real Brand Scan for the example card, refreshed every 6 hours. null keeps the card number-free.
async function getScanExample() {
  try {
    const res = await fetch(`${API_BASE}/api/public/brand-scan/example`, { next: { revalidate: 21600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.success ? data.example : null;
  } catch (e) {
    return null;
  }
}

function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function PRPackagesPage() {
  const scanExample = await getScanExample();
  return (
    <>
      <JsonLd data={buildWebPageSchema()} />
      <JsonLd data={buildFaqPageSchema()} />
      <JsonLd data={buildServiceSchema()} />
      <JsonLd data={buildHowToSchema()} />
      <JsonLd data={buildBreadcrumbSchema()} />
      <PRPackagesClient scanExample={scanExample} />
    </>
  );
}
