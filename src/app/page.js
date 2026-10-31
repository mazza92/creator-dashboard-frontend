import HomeClient from './HomeClient';
import HomeFaqSchemaScript from './HomeFaqSchemaScript';

const TITLE = 'Newcollab: PR Packages, Brand Deals & Paid UGC for Creators';
const DESCRIPTION =
  'Get gifted, get paid, get seen. Apply to brand gift lists for PR packages, find paid UGC gigs, browse 2,700+ brands with open PR forms and build a free UGC portfolio. No follower minimum.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: 'PR packages for creators, how to get PR packages, paid UGC jobs, UGC creator jobs, brand deals for small creators, PR forms for brands, brands with open PR forms, gifted collaborations, free UGC portfolio, media kit for creators, micro influencer brand deals, get paid to post on TikTok',
  openGraph: {
    title: TITLE,
    description: 'Gift lists, paid UGC gigs and 2,700+ brands with open PR forms. Free UGC portfolio. No follower minimum.',
    type: 'website',
    url: 'https://newcollab.co',
    siteName: 'Newcollab',
    images: [{ url: 'https://newcollab.co/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: 'Get gifted, get paid, get seen. PR packages, paid UGC gigs and brand deals for creators.',
    site: '@newcollab_',
  },
  alternates: {
    canonical: 'https://newcollab.co',
  },
};

// Brand cards and the brand count refresh hourly.
export const revalidate = 3600;

// Production counts (2026-10-31). The brand count is replaced by the live directory total when the API answers.
const STATS = { brands: 2788, gigs: 323, lists: 276, creators: 3690 };

const ABOUT =
  'Newcollab helps creators get gifted, get paid and get seen: brand gift lists for PR packages, paid UGC gigs, a directory of brands with open PR forms, a free UGC portfolio builder and Polly, an AI agent that pitches brands. Brands use Newcollab to run gifted UGC rosters.';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Newcollab',
  url: 'https://newcollab.co',
  description: ABOUT,
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://newcollab.co/brands?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Newcollab',
  url: 'https://newcollab.co',
  logo: 'https://newcollab.co/logo.png',
  description: ABOUT,
  areaServed: ['US', 'CA', 'GB', 'AU', 'NZ', 'EU'],
  sameAs: [
    'https://www.instagram.com/newcollab.co/',
    'https://www.tiktok.com/@newcollabco',
    'https://x.com/newcollab_',
    'https://www.linkedin.com/company/newcollab/',
  ],
};

async function loadBrands() {
  try {
    const res = await fetch('https://api.newcollab.co/api/public/brands?page=1&limit=12', { next: { revalidate: 3600 } });
    if (!res.ok) return { brands: [], total: 0 };
    const data = await res.json();
    const brands = (Array.isArray(data.brands) ? data.brands : [])
      .filter((b) => b && b.slug && b.name)
      .map((b) => ({ slug: b.slug, name: b.name, logo: b.logo || null, category: b.category || null }));
    return { brands, total: Number(data?.pagination?.total) || 0 };
  } catch (_) {
    return { brands: [], total: 0 };
  }
}

export default async function HomePage() {
  const { brands, total } = await loadBrands();
  const stats = { ...STATS, brands: total > 1000 ? total : STATS.brands };
  return (
    <>
      {/* JSON-LD rendered server-side so it appears in the initial HTML response */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <HomeFaqSchemaScript />
      <HomeClient brands={brands} stats={stats} />
    </>
  );
}
