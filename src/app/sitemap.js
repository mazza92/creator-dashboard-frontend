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
  let blogEntries = [];
  try {
    const posts = getAllPosts();
    blogEntries = posts.map(post => ({
      url: post.canonicalUrl || `${BASE}/blog/${post.slug}`,
      lastModified: post.date ? new Date(post.date).toISOString() : now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));
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
      .filter(b => isGoodSlug(b.slug))
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
