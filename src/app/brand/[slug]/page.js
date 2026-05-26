import { notFound } from 'next/navigation';
import Link from 'next/link';
import BrandUnlockClient from './BrandUnlockClient';
import BrandPageLayout from './BrandPageLayout';
import { resolveBrandStats } from '../../../utils/brandStats';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.newcollab.co';

export const revalidate = 3600;

/**
 * Detect low-quality brand slugs that shouldn't be indexed.
 * These are typically auto-generated from scraped meta titles/descriptions.
 */
function isLowQualitySlug(slug, brandName) {
  if (!slug) return true;

  // Too long = probably scraped from meta description
  if (slug.length > 50) return true;

  // Generic product/website terms that indicate scraped content
  const junkPatterns = [
    /official.*website/i,
    /official.*site/i,
    /site-officiel/i,
    /welcome-to-/i,
    /^buy-/i,
    /^shop-/i,
    /-shop$/i,
    /-store$/i,
    /-home$/i,
    /-us$/i,
    /-eu$/i,
    /skin-care.*products/i,
    /beauty-products/i,
    /makeup-and-beauty/i,
    /home-furniture/i,
    /clothing-and/i,
    /-for-healthier-/i,
    /-for-healthy-/i,
    /luxury-organic/i,
    /luxury-skin/i,
    /technical-apparel/i,
    /maquillage-soins/i,
    /collagen-protein/i,
    /collagen-supplements/i,
  ];

  if (junkPatterns.some(p => p.test(slug))) return true;

  // If slug doesn't remotely match brand name (if we have it)
  if (brandName) {
    const normalizedBrand = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    // If brand name is reasonably short and slug doesn't contain any part of it
    if (normalizedBrand.length <= 20 && !normalizedSlug.includes(normalizedBrand.slice(0, 5))) {
      // Check if slug is way longer than brand name (scraped content)
      if (slug.length > normalizedBrand.length * 3) return true;
    }
  }

  return false;
}

/**
 * Check if brand has enough content to be worth indexing.
 * Pages with thin content get noindex to prevent quality issues.
 */
function hasThinContent(brand) {
  if (!brand) return true;

  let contentScore = 0;

  // Description is critical - must have meaningful content
  if (brand.description && brand.description.length >= 100) {
    contentScore += 40;
  } else if (brand.description && brand.description.length >= 50) {
    contentScore += 25;
  } else if (brand.description) {
    contentScore += 10;
  }

  // Category provides context
  if (brand.category) contentScore += 15;

  // Logo provides visual uniqueness
  if (brand.logo) contentScore += 15;

  // Requirements add unique data
  const platforms = brand.platforms || [];
  const regions = brand.regions || [];
  const niches = brand.niches || [];
  if (platforms.length > 0) contentScore += 5;
  if (regions.length > 0) contentScore += 5;
  if (niches.length > 0) contentScore += 5;
  if (brand.minFollowers > 0) contentScore += 5;

  // Application method adds value
  if (brand.applicationMethod || brand.application_url) contentScore += 10;

  // Threshold: below 40 is thin content
  return contentScore < 40;
}

async function fetchBrand(slug, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/api/public/brands/${slug}`, {
        next: { revalidate },
        signal: AbortSignal.timeout(15000), // Increased from 5s to 15s
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      if (attempt === retries) {
        console.error(`Failed to fetch brand ${slug} after ${retries + 1} attempts:`, err);
        return null;
      }
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  return null;
}

async function fetchRelatedBrands(category, currentSlug) {
  if (!category) return [];
  try {
    const res = await fetch(`${API_BASE}/api/public/brands?category=${encodeURIComponent(category)}&limit=7`, {
      next: { revalidate },
      signal: AbortSignal.timeout(15000), // Increased from 5s to 15s
    });
    if (!res.ok) return [];
    const data = await res.json();
    const brands = data.brands || data || [];
    return brands.filter(b => b.slug !== currentSlug).slice(0, 6);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    // Pre-generate top 500 pages at build time for better SEO coverage
    // This ensures most commonly accessed brands are available immediately
    // Remaining pages use ISR (revalidate: 3600)
    const res = await fetch(`${API_BASE}/api/public/brands?limit=500`, {
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const brands = data.brands || data || [];
    return brands.map(b => ({ slug: b.slug })).filter(b => b.slug);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const brand = await fetchBrand(slug);

  if (!brand) {
    return { title: 'Brand Not Found | Newcollab' };
  }

  const title = brand?.seo?.title || `${brand.name} PR List & Application | Newcollab`;
  const description =
    brand?.seo?.description ||
    `Apply to ${brand.name} PR list. ${brand.description ? brand.description.slice(0, 120) : `Get free products and collaborate with ${brand.name}.`}`;

  // Check if this is a low-quality page that shouldn't be indexed
  // Either bad slug pattern OR thin content triggers noindex
  const shouldNoIndex = isLowQualitySlug(slug, brand.name) || hasThinContent(brand);

  return {
    title,
    description,
    // Add noindex for low-quality or thin-content brand pages
    ...(shouldNoIndex && { robots: { index: false, follow: true } }),
    alternates: { canonical: `https://newcollab.co/brand/${brand.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `https://newcollab.co/brand/${brand.slug}`,
      images: brand.logo ? [{ url: brand.logo, width: 200, height: 200, alt: `${brand.name} logo` }] : [],
      siteName: 'Newcollab',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: brand.logo ? [brand.logo] : [],
    },
  };
}

function JsonLd({ brand }) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: brand.website || `https://newcollab.co/brand/${brand.slug}`,
    ...(brand.logo && { logo: brand.logo }),
    ...(brand.description && { description: brand.description }),
    ...(brand.instagram && {
      sameAs: [`https://instagram.com/${brand.instagram.replace('@', '')}`],
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Directory', item: 'https://newcollab.co/directory' },
      ...(brand.category
        ? [{ '@type': 'ListItem', position: 2, name: brand.category.charAt(0).toUpperCase() + brand.category.slice(1), item: `https://newcollab.co${categoryDirectoryUrl(brand.category)}` }]
        : []),
      { '@type': 'ListItem', position: brand.category ? 3 : 2, name: brand.name, item: `https://newcollab.co/brand/${brand.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}

/**
 * Categories that have a dedicated static directory page.
 * These get clean /directory/{slug} URLs instead of ?category= params
 * so Googlebot can crawl them without JS.
 */
const STATIC_CATEGORY_PAGES = {
  beauty:    '/directory/beauty',
  fashion:   '/directory/fashion',
  wellness:  '/directory/wellness',
  lifestyle: '/directory/lifestyle',
  skincare:  '/directory/skincare',
  'k-beauty':'/directory/k-beauty',
  australia: '/directory/australia',
};

function categoryDirectoryUrl(category) {
  if (!category) return '/directory';
  const key = category.toLowerCase();
  return STATIC_CATEGORY_PAGES[key] || `/directory?category=${encodeURIComponent(category)}`;
}

// Format follower counts
function formatFollowers(num) {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${Math.round(num / 1000)}K`;
  return num.toString();
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const brand = await fetchBrand(slug);

  if (!brand) notFound();

  const relatedBrands = await fetchRelatedBrands(brand.category, brand.slug);

  const requirements = brand.requirements || {};
  const stats = brand.stats || {};
  const platforms = requirements.platforms || brand.platforms || [];
  const regions = requirements.regions || brand.regions || [];
  const niches = brand.niches || [];
  const minFollowers = requirements.minFollowers || brand.minFollowers;
  const maxFollowers = requirements.maxFollowers || brand.maxFollowers;
  const resolvedStats = resolveBrandStats({
    slug: brand.slug,
    category: brand.category,
    responseRate: stats.responseRate ?? brand.responseRate,
    avgResponseTime: stats.avgResponseTime ?? brand.avgResponseTime,
    totalPitches: stats.totalPitches ?? brand.total_pitches,
    totalResponses: stats.totalResponses ?? brand.responses_received,
  });
  const responseRate = resolvedStats.responseRate;
  const avgResponseTime = resolvedStats.avgResponseTime;
  const totalPitches = resolvedStats.totalPitches;
  const responsesReceived = resolvedStats.totalResponses;
  const hasDirectLink = Boolean(brand?.gated?.hasDirectLink);
  const hasEmail = Boolean(brand?.gated?.hasEmailContact);
  const isAcceptingPR = brand.is_accepting_pr ?? brand.accepting_pr ?? true;
  const collabType = brand.collab_type || brand.collaboration_type;

  const categoryLabel = brand.category
    ? brand.category.charAt(0).toUpperCase() + brand.category.slice(1)
    : null;

  // Extract domain from website
  const getDomain = (url) => {
    if (!url) return null;
    try {
      return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    } catch { return null; }
  };

  const domain = getDomain(brand.website);

  return (
    <BrandPageLayout canonicalUrl={`https://newcollab.co/brand/${brand.slug}`}>
      <JsonLd brand={brand} />
      <style>{`
        /* Page wrapper - light gray background like dashboard */
        .bp-wrap {
          background: #F5F5F7;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .bp-page {
          max-width: 1160px;
          margin: 0 auto;
          /* 140px desktop nav height + 24px breathing room */
          padding: 164px 24px 80px;
        }

        @media (max-width: 768px) {
          /* 96px mobile nav height + 20px breathing room */
          .bp-page { padding: 116px 20px 80px; }
        }

        /* Back link */
        .bp-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #8C8C8C;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          margin-bottom: 20px;
          transition: color 0.15s;
        }
        .bp-back:hover { color: #0F0F0F; }
        .bp-back svg { width: 14px; height: 14px; }

        /* Brand header card */
        .bp-header {
          background: #FFFFFF;
          border: 1px solid #E8E8E8;
          border-radius: 20px;
          padding: 24px 28px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(15,15,15,0.05), 0 1px 8px rgba(15,15,15,0.04);
        }
        .bp-logo {
          width: 80px;
          height: 80px;
          background: #F4F4F4;
          border: 1px solid #E8E8E8;
          border-radius: 16px;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          overflow: hidden;
          padding: 10px;
        }
        .bp-logo img { width: 100%; height: 100%; object-fit: contain; }
        .bp-logo-letter {
          font-weight: 900;
          color: #E11D48;
          font-size: 32px;
        }
        .bp-header-info { flex: 1; min-width: 0; }
        .bp-title {
          margin: 0 0 10px 0;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #0F0F0F;
        }
        .bp-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .bp-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
        }
        .bp-badge-featured {
          background: linear-gradient(135deg, #FBBF24, #F59E0B);
          color: #78350F;
          box-shadow: 0 2px 6px rgba(251,191,36,0.25);
        }
        .bp-badge-category {
          background: #F4F4F4;
          color: #4B4B4B;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          font-size: 11px;
        }
        .bp-website {
          color: #8C8C8C;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s;
        }
        .bp-website:hover { color: #0F0F0F; }
        .bp-header-right { flex-shrink: 0; }
        .bp-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
        }
        .bp-status-open {
          background: #ECFDF5;
          color: #059669;
          border: 1px solid #A7F3D0;
        }
        .bp-status-closed {
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FECACA;
        }
        .bp-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Grid layout */
        .bp-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 16px;
          align-items: start;
        }
        .bp-main { display: flex; flex-direction: column; gap: 16px; }
        .bp-sidebar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: sticky;
          top: 76px;
        }

        /* Social proof bar */
        .bp-social-proof {
          background: #FFFFFF;
          border: 1px solid #E8E8E8;
          border-radius: 14px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(15,15,15,0.05);
        }
        .bp-social-proof-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #059669;
        }
        .bp-social-proof-text {
          font-size: 13px;
          color: #4B4B4B;
        }
        .bp-social-proof-text strong { color: #0F0F0F; font-weight: 700; }
        .bp-social-proof-text .green { color: #059669; font-weight: 700; }

        /* Cards */
        .bp-card {
          background: #FFFFFF;
          border: 1px solid #E8E8E8;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(15,15,15,0.05), 0 1px 8px rgba(15,15,15,0.04);
        }
        .bp-card-title {
          font-size: 15px;
          font-weight: 700;
          margin-bottom: 16px;
          letter-spacing: -0.2px;
          color: #0F0F0F;
        }
        .bp-card-desc {
          font-size: 14px;
          color: #4B4B4B;
          line-height: 1.7;
          margin: 0;
        }

        /* Stats grid */
        .bp-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .bp-stat-card {
          background: #F4F4F4;
          border-radius: 14px;
          padding: 18px 16px;
          text-align: center;
        }
        .bp-stat-value {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -1px;
          margin-bottom: 4px;
        }
        .bp-stat-value-green { color: #059669; }
        .bp-stat-value-dark { color: #0F0F0F; }
        .bp-stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #8C8C8C;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .bp-stat-sub {
          font-size: 11px;
          color: #8C8C8C;
          margin-top: 3px;
        }

        /* Requirements list with icons */
        .bp-req-list { display: flex; flex-direction: column; gap: 12px; }
        .bp-req-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .bp-req-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #F4F4F4;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          margin-top: 1px;
          color: #4B4B4B;
        }
        .bp-req-label {
          font-size: 13px;
          font-weight: 600;
          color: #0F0F0F;
        }
        .bp-req-value {
          font-size: 12.5px;
          color: #8C8C8C;
          margin-top: 2px;
        }

        /* Social media list */
        .bp-social-list { display: flex; flex-direction: column; gap: 8px; }
        .bp-social-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: #F4F4F4;
          border-radius: 10px;
        }
        .bp-social-icon {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: white;
          border: 1px solid #E8E8E8;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #4B4B4B;
        }
        .bp-social-handle {
          font-size: 13px;
          font-weight: 600;
          color: #0F0F0F;
          flex: 1;
        }
        .bp-social-followers {
          font-size: 12px;
          color: #8C8C8C;
        }

        /* CTA Card */
        .bp-cta-card {
          background: #FFFFFF;
          border: 1px solid #E8E8E8;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(15,15,15,0.06), 0 1px 3px rgba(15,15,15,0.04);
        }
        .bp-cta-top { padding: 22px 22px 0; }
        .bp-cta-brand-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .bp-cta-brand-logo {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #F4F4F4;
          border: 1px solid #E8E8E8;
          display: grid;
          place-items: center;
          overflow: hidden;
          padding: 5px;
          flex-shrink: 0;
        }
        .bp-cta-brand-logo img { width: 100%; height: 100%; object-fit: contain; }
        .bp-cta-brand-name {
          font-size: 15px;
          font-weight: 700;
          color: #0F0F0F;
        }
        .bp-cta-brand-sub {
          font-size: 12px;
          color: #8C8C8C;
          margin-top: 2px;
        }
        .bp-email-teaser {
          background: #F4F4F4;
          border: 1px solid #E8E8E8;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bp-email-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: white;
          border: 1px solid #E8E8E8;
          display: grid;
          place-items: center;
          flex-shrink: 0;
          color: #4B4B4B;
        }
        .bp-email-wrap { flex: 1; overflow: hidden; }
        .bp-email-label {
          font-size: 10px;
          color: #8C8C8C;
          margin-bottom: 3px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        .bp-email-blurred {
          font-size: 13.5px;
          font-weight: 600;
          color: #0F0F0F;
          filter: blur(4px);
          user-select: none;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
        }
        .bp-unlock-badge {
          background: #FFF1F3;
          color: #E11D48;
          border: 1px solid #FECDD3;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 100px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .bp-quick-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }
        .bp-quick-stat {
          background: #F4F4F4;
          border-radius: 10px;
          padding: 10px 12px;
          text-align: center;
        }
        .bp-quick-stat-val {
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }
        .bp-quick-stat-lbl {
          font-size: 10.5px;
          color: #8C8C8C;
          margin-top: 2px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          font-weight: 600;
        }
        .bp-cta-divider {
          border: none;
          border-top: 1px solid #E8E8E8;
          margin: 0 -22px 18px;
        }
        .bp-cta-bottom { padding: 0 22px 22px; }
        .bp-value-props { display: flex; flex-direction: column; gap: 12px; }
        .bp-value-prop {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .bp-vp-icon {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          color: #059669;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }
        .bp-vp-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #0F0F0F;
        }
        .bp-vp-sub {
          font-size: 11.5px;
          color: #8C8C8C;
          margin-top: 2px;
        }

        /* Trust card */
        .bp-trust-card {
          background: #FFFFFF;
          border: 1px solid #E8E8E8;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 1px 3px rgba(15,15,15,0.05);
        }
        .bp-trust-list { display: flex; flex-direction: column; gap: 10px; }
        .bp-trust-row {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13px;
          font-weight: 500;
          color: #4B4B4B;
        }
        .bp-trust-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          color: #059669;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        /* Related brands section */
        .bp-related {
          background: #FFFFFF;
          border: 1px solid #E8E8E8;
          border-radius: 20px;
          padding: 32px 28px;
          text-align: center;
          margin-top: 20px;
          box-shadow: 0 1px 3px rgba(15,15,15,0.05);
        }
        .bp-related-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 6px 0;
          letter-spacing: -0.3px;
          color: #0F0F0F;
        }
        .bp-related-sub {
          font-size: 13px;
          color: #8C8C8C;
          margin: 0 0 20px 0;
        }
        .bp-brand-chips {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .bp-brand-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          background: #F4F4F4;
          border: 1px solid #E8E8E8;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          color: #0F0F0F;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .bp-brand-chip:hover { background: white; border-color: #D4D4D4; }
        .bp-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #059669;
          flex-shrink: 0;
        }
        .bp-browse-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #E11D48;
          font-size: 13.5px;
          font-weight: 700;
          text-decoration: none;
        }
        .bp-browse-link:hover { color: #BE123C; }

        /* SEO Footer */
        .bp-seo-footer {
          background: white;
          border: 1px solid #E8E8E8;
          border-radius: 18px;
          padding: 24px;
          margin-top: 20px;
          box-shadow: 0 1px 3px rgba(15,15,15,0.05);
        }
        .bp-seo-footer h2 {
          font-size: 16px;
          font-weight: 700;
          color: #0F0F0F;
          margin: 0 0 12px;
        }
        .bp-seo-footer p {
          color: #4B4B4B;
          line-height: 1.8;
          font-size: 14px;
          margin: 0;
        }

        /* SVG Icons inline */
        .icon-sm { width: 14px; height: 14px; }
        .icon-md { width: 15px; height: 15px; }
        .icon-check { width: 11px; height: 11px; }

        /* MOBILE RESPONSIVE */
        @media (max-width: 860px) {
          .bp-grid {
            grid-template-columns: 1fr;
          }
          .bp-sidebar {
            position: static;
            order: -1;
          }
        }

        @media (max-width: 640px) {
          .bp-page { padding: 116px 16px 80px; }
          .bp-header {
            flex-wrap: wrap;
            padding: 18px;
            gap: 14px;
          }
          .bp-logo { width: 60px; height: 60px; border-radius: 12px; }
          .bp-title { font-size: 22px; }
          .bp-header-right { width: 100%; }
          .bp-card { padding: 18px; }
          .bp-stats-grid { grid-template-columns: 1fr; }
          .bp-stat-value { font-size: 24px; }
          .bp-related { padding: 24px 18px; }
        }
      `}</style>

      <div className="bp-wrap">
        <div className="bp-page">

          {/* Back link */}
          <Link href="/directory" className="bp-back">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-sm">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Directory
          </Link>

          {/* Brand header */}
          <header className="bp-header">
            <div className="bp-logo">
              {brand.logo ? (
                <img src={brand.logo} alt={`${brand.name} logo`} />
              ) : (
                <span className="bp-logo-letter">{brand.name?.slice(0, 1) || 'B'}</span>
              )}
            </div>
            <div className="bp-header-info">
              <h1 className="bp-title">{brand.name}</h1>
              <div className="bp-meta">
                {brand.isFeatured && (
                  <span className="bp-badge bp-badge-featured">Featured</span>
                )}
                {categoryLabel && (
                  <span className="bp-badge bp-badge-category">{categoryLabel}</span>
                )}
                {domain && (
                  <a href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`} target="_blank" rel="noopener noreferrer" className="bp-website">
                    {domain} →
                  </a>
                )}
              </div>
            </div>
            <div className="bp-header-right">
              <div className={`bp-status-pill ${isAcceptingPR ? 'bp-status-open' : 'bp-status-closed'}`}>
                <span className="bp-status-dot" style={{ animation: isAcceptingPR ? undefined : 'none' }}></span>
                {isAcceptingPR ? 'Accepting PR' : 'Not Accepting PR'}
              </div>
            </div>
          </header>

          <div className="bp-grid">
            {/* Main content */}
            <div className="bp-main">
              {/* Social proof */}
              {totalPitches > 0 && (
                <div className="bp-social-proof">
                  <div className="bp-social-proof-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-md">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <div className="bp-social-proof-text">
                    <strong>{totalPitches} creators</strong> have contacted this brand
                    {responsesReceived > 0 && (
                      <> · <span className="green">{responsesReceived} got a response</span></>
                    )}
                  </div>
                </div>
              )}

              {/* About section */}
              {brand.description && (
                <section className="bp-card">
                  <div className="bp-card-title">About {brand.name}</div>
                  <p className="bp-card-desc">{brand.description}</p>
                </section>
              )}

              {/* Stats section */}
              <section className="bp-card">
                <div className="bp-card-title">Brand Stats</div>
                <div className="bp-stats-grid">
                  <div className="bp-stat-card">
                    <div className="bp-stat-value bp-stat-value-green">{responseRate}%</div>
                    <div className="bp-stat-label">Response Rate</div>
                    <div className="bp-stat-sub">{responseRate >= 40 ? 'Above average' : 'Industry average'}</div>
                  </div>
                  <div className="bp-stat-card">
                    <div className="bp-stat-value bp-stat-value-dark">~{avgResponseTime}d</div>
                    <div className="bp-stat-label">Avg. Response</div>
                    <div className="bp-stat-sub">When they reply</div>
                  </div>
                </div>
              </section>

              {/* What They're Looking For */}
              {(minFollowers > 0 || niches?.length > 0 || platforms?.length > 0 || collabType) && (
                <section className="bp-card">
                  <div className="bp-card-title">What They're Looking For</div>
                  <div className="bp-req-list">
                    {minFollowers > 0 && (
                      <div className="bp-req-row">
                        <div className="bp-req-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-md">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                        </div>
                        <div>
                          <div className="bp-req-label">Minimum Followers</div>
                          <div className="bp-req-value">{formatFollowers(minFollowers)}+ followers on any platform</div>
                        </div>
                      </div>
                    )}
                    {niches?.length > 0 && (
                      <div className="bp-req-row">
                        <div className="bp-req-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-md">
                            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                          </svg>
                        </div>
                        <div>
                          <div className="bp-req-label">Niche</div>
                          <div className="bp-req-value">{niches.join(', ')}</div>
                        </div>
                      </div>
                    )}
                    {platforms?.length > 0 && (
                      <div className="bp-req-row">
                        <div className="bp-req-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-md">
                            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>
                          </svg>
                        </div>
                        <div>
                          <div className="bp-req-label">Preferred Platforms</div>
                          <div className="bp-req-value">{platforms.join(', ')}</div>
                        </div>
                      </div>
                    )}
                    {collabType && (
                      <div className="bp-req-row">
                        <div className="bp-req-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-md">
                            <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><path d="M12 12V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 12h4"/><path d="m17.66 12.34 1.41-1.41"/><path d="M18 12h4"/>
                          </svg>
                        </div>
                        <div>
                          <div className="bp-req-label">Collaboration Type</div>
                          <div className="bp-req-value">{collabType}</div>
                        </div>
                      </div>
                    )}
                    {regions?.length > 0 && (
                      <div className="bp-req-row">
                        <div className="bp-req-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-md">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                        </div>
                        <div>
                          <div className="bp-req-label">Regions</div>
                          <div className="bp-req-value">{regions.join(', ')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Social media */}
              {(brand.instagram || brand.tiktok) && (
                <section className="bp-card">
                  <div className="bp-card-title">Social Media</div>
                  <div className="bp-social-list">
                    {brand.instagram && (
                      <div className="bp-social-row">
                        <div className="bp-social-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-sm">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                          </svg>
                        </div>
                        <span className="bp-social-handle">@{brand.instagram.replace('@', '')}</span>
                        {brand.instagram_followers && (
                          <span className="bp-social-followers">{formatFollowers(brand.instagram_followers)} followers</span>
                        )}
                      </div>
                    )}
                    {brand.tiktok && (
                      <div className="bp-social-row">
                        <div className="bp-social-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-sm">
                            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                          </svg>
                        </div>
                        <span className="bp-social-handle">@{brand.tiktok.replace('@', '')}</span>
                        {brand.tiktok_followers && (
                          <span className="bp-social-followers">{formatFollowers(brand.tiktok_followers)} followers</span>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="bp-sidebar">
              {/* CTA Card */}
              <div className="bp-cta-card">
                <div className="bp-cta-top">
                  <div className="bp-cta-brand-row">
                    <div className="bp-cta-brand-logo">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} />
                      ) : (
                        <span style={{ fontWeight: 900, color: '#E11D48', fontSize: 18 }}>{brand.name?.slice(0, 1) || 'B'}</span>
                      )}
                    </div>
                    <div>
                      <div className="bp-cta-brand-name">Contact {brand.name}</div>
                      <div className="bp-cta-brand-sub">Direct PR team access</div>
                    </div>
                  </div>

                  {/* Email teaser */}
                  <div className="bp-email-teaser">
                    <div className="bp-email-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-md">
                        <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                      </svg>
                    </div>
                    <div className="bp-email-wrap">
                      <div className="bp-email-label">PR Contact Email</div>
                      <div className="bp-email-blurred">pr@{domain || 'brandname'}.com</div>
                    </div>
                    <span className="bp-unlock-badge">Unlock</span>
                  </div>

                  {/* Quick stats */}
                  <div className="bp-quick-stats">
                    <div className="bp-quick-stat">
                      <div className="bp-quick-stat-val" style={{ color: '#059669' }}>{responseRate}%</div>
                      <div className="bp-quick-stat-lbl">Response rate</div>
                    </div>
                    <div className="bp-quick-stat">
                      <div className="bp-quick-stat-val" style={{ color: '#0F0F0F' }}>~{avgResponseTime}d</div>
                      <div className="bp-quick-stat-lbl">Avg. reply time</div>
                    </div>
                  </div>

                  <BrandUnlockClient
                    slug={brand.slug}
                    brandId={brand.id}
                    brandName={brand.name}
                    hasDirectLink={hasDirectLink}
                    hasEmail={hasEmail}
                  />
                </div>

                <hr className="bp-cta-divider" />

                <div className="bp-cta-bottom">
                  <div className="bp-value-props">
                    <div className="bp-value-prop">
                      <div className="bp-vp-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-check">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <div>
                        <div className="bp-vp-title">Direct PR team contact</div>
                        <div className="bp-vp-sub">Not a generic form — real email access</div>
                      </div>
                    </div>
                    <div className="bp-value-prop">
                      <div className="bp-vp-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-check">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <div>
                        <div className="bp-vp-title">AI-generated pitch email</div>
                        <div className="bp-vp-sub">Personalised to your profile in seconds</div>
                      </div>
                    </div>
                    <div className="bp-value-prop">
                      <div className="bp-vp-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-check">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <div>
                        <div className="bp-vp-title">Track your outreach</div>
                        <div className="bp-vp-sub">See opens, replies and follow-ups</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust card */}
              <div className="bp-trust-card">
                <div className="bp-trust-list">
                  {brand.is_verified && (
                    <div className="bp-trust-row">
                      <div className="bp-trust-check">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-check">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      Verified Brand
                    </div>
                  )}
                  {isAcceptingPR && (
                    <div className="bp-trust-row">
                      <div className="bp-trust-check">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-check">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      Actively Reviewing Applications
                    </div>
                  )}
                  <div className="bp-trust-row">
                    <div className="bp-trust-check">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-check">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    Free to Apply
                  </div>
                  <div className="bp-trust-row">
                    <div className="bp-trust-check">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-check">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    Open to Nano & Micro Creators
                  </div>
                </div>
              </div>
            </aside>
          </div>

          {/* Related brands */}
          {relatedBrands.length > 0 && (
            <section className="bp-related">
              <h2 className="bp-related-title">More Brands in {categoryLabel || 'this category'}</h2>
              <p className="bp-related-sub">Discover more brands open to creator collaborations</p>
              <div className="bp-brand-chips">
                {relatedBrands.slice(0, 5).map(rb => {
                  const rbName = rb.name || rb.brand_name;
                  return (
                    <Link key={rb.slug} href={`/brand/${rb.slug}`} className="bp-brand-chip">
                      <span className="bp-live-dot"></span>
                      {rbName}
                    </Link>
                  );
                })}
              </div>
              <Link href={categoryDirectoryUrl(brand.category)} className="bp-browse-link">
                Browse all {categoryLabel || ''} brands →
              </Link>
            </section>
          )}

          {/* SEO content footer */}
          <section className="bp-seo-footer">
            <h2>How to Apply to {brand.name} PR List</h2>
            <p>
              {brand.name} accepts PR applications from content creators{minFollowers > 0 ? ` with ${formatFollowers(minFollowers)}+ followers` : ''}{platforms.length > 0 ? ` on ${platforms.join(', ')}` : ''}.
              {brand.applicationMethod === 'form' ? ` Apply directly through their application form.` : brand.applicationMethod === 'email' ? ` Reach out via their PR email.` : ` Unlock the application details above to get started.`}
              {' '}Create a free Newcollab account to track your application, discover more brands, and manage your PR pipeline.
            </p>
          </section>
        </div>
      </div>
    </BrandPageLayout>
  );
}
