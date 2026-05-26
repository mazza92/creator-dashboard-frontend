import { getAllPosts } from '../../lib/blog';

const BASE = 'https://newcollab.co';

// Revalidate hourly — brand list changes weekly, blogs monthly, but we keep
// the window short so new brands appear in GSC quickly.
export const revalidate = 3600;

const STATIC_PAGES = [
  { url: '/',                          priority: 1.0, changeFrequency: 'daily'   },
  { url: '/directory',                 priority: 0.9, changeFrequency: 'daily'   },
  { url: '/directory/skincare',        priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/k-beauty',        priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/beauty',          priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/fashion',         priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/wellness',        priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/lifestyle',       priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/directory/australia',       priority: 0.8, changeFrequency: 'weekly'  },
  { url: '/brands/pr-packages',        priority: 0.8, changeFrequency: 'weekly'  },
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
  if (!slug || slug.length > 50) return false;
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

export default async function sitemap() {
  const now = new Date().toISOString();

  // --- Static pages ---
  const staticEntries = STATIC_PAGES.map(p => ({
    url: `${BASE}${p.url}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  // --- Blog posts (read from filesystem) ---
  // Always use the post's own /blog/<slug> URL — not canonicalUrl — so the
  // sitemap has no duplicate entries. The canonical <link> tag on each page
  // is the correct signal for Google to consolidate duplicate/redirected posts.
  let blogEntries = [];
  try {
    const posts = getAllPosts();
    const seen = new Set();
    blogEntries = posts
      .map(post => ({
        url: `${BASE}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date).toISOString() : now,
        changeFrequency: 'monthly',
        priority: 0.8,
      }))
      .filter(entry => {
        if (seen.has(entry.url)) return false;
        seen.add(entry.url);
        return true;
      });
  } catch (err) {
    console.error('[sitemap] Failed to read blog posts:', err);
  }

  // --- Brand pages (paginate through API — hard cap is 100/page, 444 total) ---
  let brandEntries = [];
  try {
    const PAGE_SIZE = 100;
    let page = 1;
    let totalPages = 1;
    const allBrands = [];

    do {
      const res = await fetch(
        `https://api.newcollab.co/api/public/brands?page=${page}&limit=${PAGE_SIZE}`,
        { next: { revalidate } },
      );
      if (!res.ok) break;
      const data = await res.json();
      const brands = Array.isArray(data.brands) ? data.brands : (Array.isArray(data) ? data : []);
      allBrands.push(...brands);
      totalPages = data.pagination?.totalPages ?? 1;
      page++;
    } while (page <= totalPages);

    brandEntries = allBrands
      .filter(b => isGoodSlug(b.slug) && hasEnoughContent(b))
      .map(b => ({
        url: `${BASE}/brand/${b.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
  } catch (err) {
    console.error('[sitemap] Failed to fetch brands:', err);
  }

  return [...staticEntries, ...blogEntries, ...brandEntries];
}
