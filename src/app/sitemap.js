import { getAllPosts } from '../../lib/blog';

const BASE = 'https://newcollab.co';
const BRANDS_API = 'https://api.newcollab.co/api/public/brands';
const PAGE_SIZE = 100;
const MAX_PAGES = 50;
const FETCH_CONCURRENCY = 6;
const FETCH_BUDGET_MS = 12000;

// Revalidate hourly — brand list changes weekly, blogs monthly, but we keep
// the window short so new brands appear in GSC quickly.
export const revalidate = 3600;
export const maxDuration = 60;

const STATIC_PAGES = [
  { url: '/',                          priority: 1.0, changeFrequency: 'daily'   },
  { url: '/directory',                 priority: 0.9, changeFrequency: 'daily'   },
  { url: '/pr-list',                   priority: 0.9, changeFrequency: 'daily'   },
  { url: '/directory/skincare',        priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/k-beauty',        priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/beauty',          priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/fashion',         priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/wellness',        priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/lifestyle',       priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/australia',       priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/us',              priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/uk',              priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/canada',          priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/brands/pr-packages',        priority: 0.9, changeFrequency: 'weekly'  },
  { url: '/brands/ugc-creators',       priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/brands/product-seeding',    priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/brands/ugc-for-ads',        priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/brands/vs-ugc-agency',      priority: 0.8, changeFrequency: 'monthly' },
  { url: '/brands/vs-joinbrands',      priority: 0.8, changeFrequency: 'monthly' },
  { url: '/brands/vs-billo',           priority: 0.8, changeFrequency: 'monthly' },
  { url: '/brands/beauty-ugc',         priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/blog',                      priority: 0.9, changeFrequency: 'daily'   },
  { url: '/about',                     priority: 0.7, changeFrequency: 'monthly' },
  { url: '/contact',                   priority: 0.7, changeFrequency: 'monthly' },
  { url: '/privacy-policy',            priority: 0.4, changeFrequency: 'yearly'  },
  { url: '/terms-of-service',          priority: 0.4, changeFrequency: 'yearly'  },
];

// Brand slugs that are known to be low-quality (scraped meta titles).
// Mirrors the isLowQualitySlug() logic in brand/[slug]/page.js.
const JUNK_PATTERNS = [
  /official.*website/i, /official.*site/i, /site-officiel/i, /welcome-to-/i,
  /^buy-/i, /^shop-/i, /-shop$/i, /-store$/i, /-home$/i, /-us$/i, /-eu$/i,
  /skin-care.*products/i, /beauty-products/i, /makeup-and-beauty/i,
  /home-furniture/i, /clothing-and/i, /-for-healthier-/i, /-for-healthy-/i,
  /luxury-organic/i, /luxury-skin/i, /technical-apparel/i,
  /maquillage-soins/i, /collagen-protein/i, /collagen-supplements/i,
];

function isGoodSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  if (slug.length > 50 || /[/?#\s]/.test(slug)) return false;
  return !JUNK_PATTERNS.some(p => p.test(slug));
}

// Mirrors hasThinContent() in brand/[slug]/page.js.
// Only submit pages that will actually be indexed (score >= 55).
function hasEnoughContent(brand) {
  let score = 0;
  const desc = brand.description || '';
  if (desc.length >= 100) score += 40;
  else if (desc.length >= 50) score += 25;
  else if (desc.length > 0) score += 10;
  if (brand.category) score += 15;
  if (brand.logo) score += 15;
  const platforms = Array.isArray(brand.platforms) ? brand.platforms : [];
  const regions   = Array.isArray(brand.regions)   ? brand.regions   : [];
  const niches    = Array.isArray(brand.niches)     ? brand.niches    : [];
  if (platforms.length > 0) score += 5;
  if (regions.length > 0)   score += 5;
  if (niches.length > 0)    score += 5;
  if ((brand.minFollowers || 0) > 0) score += 5;
  if (brand.applicationMethod || brand.application_url) score += 10;
  return score >= 55;
}

function safeDate(value, fallback) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d;
}

function sitemapEntry(url, lastModified, changeFrequency, priority) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    return {
      url: parsed.href,
      lastModified: safeDate(lastModified, new Date()),
      changeFrequency,
      priority,
    };
  } catch {
    return null;
  }
}

function staticEntries(now) {
  return STATIC_PAGES
    .map(p => sitemapEntry(`${BASE}${p.url}`, now, p.changeFrequency, p.priority))
    .filter(Boolean);
}

function blogEntries(now) {
  try {
    const posts = getAllPosts();
    const seen = new Set();
    return posts
      .map(post => {
        if (!post?.slug) return null;
        const url = `${BASE}/blog/${post.slug}`;
        if (seen.has(url)) return null;
        seen.add(url);
        return sitemapEntry(
          url,
          post.date ? safeDate(post.date, now) : now,
          'monthly',
          0.8,
        );
      })
      .filter(Boolean);
  } catch (err) {
    console.error('[sitemap] Failed to read blog posts:', err);
    return [];
  }
}

async function fetchBrandPage(page, signal) {
  const res = await fetch(
    `${BRANDS_API}?page=${page}&limit=${PAGE_SIZE}`,
    {
      headers: {
        Accept: 'application/json',
        Origin: BASE,
        'User-Agent': 'NewcollabSitemap/1.0 (+https://newcollab.co)',
      },
      next: { revalidate },
      signal,
    },
  );
  if (!res.ok) {
    throw new Error(`brands page ${page} HTTP ${res.status}`);
  }
  const data = await res.json();
  const brands = Array.isArray(data.brands) ? data.brands : (Array.isArray(data) ? data : []);
  const totalPages = Number(data.pagination?.totalPages) || 1;
  return { brands, totalPages };
}

async function fetchAllBrands() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_BUDGET_MS);
  try {
    const first = await fetchBrandPage(1, controller.signal);
    const totalPages = Math.min(Math.max(first.totalPages, 1), MAX_PAGES);
    const remaining = [];
    for (let page = 2; page <= totalPages; page++) remaining.push(page);

    const restBrands = [];
    for (let i = 0; i < remaining.length; i += FETCH_CONCURRENCY) {
      if (controller.signal.aborted) break;
      const batch = remaining.slice(i, i + FETCH_CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(page => fetchBrandPage(page, controller.signal)),
      );
      for (const result of results) {
        if (result.status === 'fulfilled') {
          restBrands.push(...result.value.brands);
        } else {
          console.error('[sitemap] Brand page failed:', result.reason);
        }
      }
    }
    return [...first.brands, ...restBrands];
  } finally {
    clearTimeout(timer);
  }
}

function brandEntries(brands, now) {
  const seen = new Set();
  return brands
    .filter(b => isGoodSlug(b.slug) && hasEnoughContent(b))
    .map(b => sitemapEntry(`${BASE}/brand/${b.slug}`, now, 'weekly', 0.8))
    .filter(entry => {
      if (!entry || seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    });
}

export default async function sitemap() {
  const now = new Date();
  const pages = staticEntries(now);
  const posts = blogEntries(now);

  try {
    const brands = await fetchAllBrands();
    return [...pages, ...posts, ...brandEntries(brands, now)];
  } catch (err) {
    console.error('[sitemap] Failed to fetch brands:', err);
    return [...pages, ...posts];
  }
}
