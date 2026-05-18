const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api.newcollab.co';
const SITE_URL = 'https://newcollab.co';

/**
 * Bad slug patterns - these indicate low-quality URLs that shouldn't be in sitemap
 * These are typically website taglines scraped instead of brand names
 */
const BAD_SLUG_PATTERNS = [
  /expect-more-pay-less/i,
  /contemporary.*furniture/i,
  /luxury.*creams.*serums/i,
  /skin-care-hair-care/i,
  /skin-care-products-for/i,
  /maquillage.*soins/i,
  /official-website/i,
  /official-online-store/i,
  /official-site/i,
  /shop-.*-for-/i,
  /buy-.*-supplements/i,
  /home-furniture-home-decor/i,
  /welcome-to-/i,
  /---/,  // Triple dash = URL encoding issues
  /makeup-and-beauty-products-makeup/i,
  /fresh-dog-food-delivered/i,
];

/**
 * Known bad slugs to exclude from sitemap
 */
const EXCLUDED_SLUGS = new Set([
  'target-expect-more-pay-less',
  'contemporary-mid-century-modern-furniture',
  'luxury-skin-creams-serums',
  'maquillage-soins-des-pores-et-services-beaut',
  'skin-care-hair-care-for-healthy-results',
  'skin-care-products-for-healthier-skin',
  'luxury-organic-bedding-sheets-towels',
  'buy-collagen-protein-powder-collagen-supplements',
  'shop-athleta-for-womens-yoga-clothing-technical-athletic-clothing-and-athleisure',
  'home-furniture-home-decor-housewares',
  'makeup-and-beauty-products-makeup-tips-try-on-looks-and-more',
  'fresh-dog-food-delivered',
]);

/**
 * Check if a brand slug is valid for sitemap inclusion
 */
function isValidBrandSlug(slug) {
  // Check exclusion list
  if (EXCLUDED_SLUGS.has(slug)) {
    return false;
  }

  // Check bad patterns
  if (BAD_SLUG_PATTERNS.some(pattern => pattern.test(slug))) {
    return false;
  }

  // Reject excessively long slugs (likely taglines)
  if (slug.length > 50) {
    return false;
  }

  // Reject slugs with too many hyphens (likely taglines)
  if ((slug.match(/-/g) || []).length > 6) {
    return false;
  }

  return true;
}

/**
 * Check if a brand has enough content to be worth indexing
 * Brands with thin content should be excluded from sitemap
 */
function hasQualityContent(brand) {
  let contentScore = 0;

  // Description is the most important (40 points)
  if (brand.description && brand.description.length >= 100) {
    contentScore += 40;
  } else if (brand.description && brand.description.length >= 50) {
    contentScore += 25;
  } else if (brand.description) {
    contentScore += 10;
  }

  // Category adds context (15 points)
  if (brand.category) {
    contentScore += 15;
  }

  // Logo adds visual uniqueness (15 points)
  if (brand.logo) {
    contentScore += 15;
  }

  // Requirements add unique data (20 points)
  const platforms = brand.platforms || [];
  const regions = brand.regions || [];
  const niches = brand.niches || [];
  const minFollowers = brand.minFollowers;

  if (platforms.length > 0) contentScore += 5;
  if (regions.length > 0) contentScore += 5;
  if (niches.length > 0) contentScore += 5;
  if (minFollowers > 0) contentScore += 5;

  // Application method adds value (10 points)
  if (brand.application_url || brand.applicationMethod) {
    contentScore += 10;
  }

  // Minimum threshold: 40 points to be included in sitemap
  // This ensures brands have at least description + category or equivalent
  return contentScore >= 40;
}

async function fetchAllBrands() {
  let allBrands = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await axios.get(`${API_BASE}/api/public/brands`, {
      params: { page, limit: 100 }
    });

    allBrands = allBrands.concat(response.data.brands);

    const { totalPages } = response.data.pagination;
    hasMore = page < totalPages;
    page += 1;
  }

  return allBrands;
}

async function fetchPublicCreators() {
  try {
    // Fetch creators with public profiles from marketplace
    const response = await axios.get(`${API_BASE}/api/marketplace/creators`, {
      params: { limit: 500 }
    });
    return response.data.creators || [];
  } catch (error) {
    console.warn('Could not fetch creators for sitemap:', error.message);
    return [];
  }
}

async function getPostDate(slug, postsDir) {
  try {
    const postPath = path.join(postsDir, `${slug}.json`);
    const postContent = await fs.readFile(postPath, 'utf8');
    const postData = JSON.parse(postContent);
    
    // Use date from JSON if available, convert to ISO format
    if (postData.date) {
      // If date is in YYYY-MM-DD format, convert to ISO
      if (postData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Date(postData.date + 'T00:00:00Z').toISOString();
      }
      return new Date(postData.date).toISOString();
    }
    
    // Fallback to file modification date
    const stats = await fs.stat(postPath);
    return stats.mtime.toISOString();
  } catch (error) {
    // If file doesn't exist or can't be read, use current date
    return new Date().toISOString();
  }
}

async function generateSitemap() {
  try {
    const postsDir = path.join(__dirname, '../src/content/posts');
    const postsIndex = JSON.parse(await fs.readFile(path.join(postsDir, 'posts.json'), 'utf8'));
    const [brands, creators] = await Promise.all([
      fetchAllBrands(),
      fetchPublicCreators()
    ]);
    const now = new Date().toISOString();

    // Get post dates (read-only, no modifications to blog posts)
    const postDates = await Promise.all(
      postsIndex.map(slug => getPostDate(slug, postsDir))
    );

    // Format brand lastmod date (use updated_at if available, otherwise use now)
    const formatBrandLastmod = (brand) => {
      if (brand.updated_at) {
        return new Date(brand.updated_at).toISOString();
      }
      return now;
    };

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${now}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/marketplace</loc>
    <lastmod>${now}</lastmod>
    <priority>0.9</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/directory</loc>
    <lastmod>${now}</lastmod>
    <priority>0.9</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/directory/skincare</loc>
    <lastmod>${now}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/directory/k-beauty</loc>
    <lastmod>${now}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/directory/australia</loc>
    <lastmod>${now}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>${now}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/contact</loc>
    <lastmod>${now}</lastmod>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/privacy-policy</loc>
    <lastmod>${now}</lastmod>
    <priority>0.5</priority>
    <changefreq>yearly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/terms-of-service</loc>
    <lastmod>${now}</lastmod>
    <priority>0.5</priority>
    <changefreq>yearly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/brands/pr-packages</loc>
    <lastmod>${now}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/register</loc>
    <lastmod>${now}</lastmod>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/register/creator</loc>
    <lastmod>${now}</lastmod>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>${SITE_URL}/register/brand</loc>
    <lastmod>${now}</lastmod>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>
  ${postsIndex.map((slug, index) => `
  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${postDates[index]}</lastmod>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>
  `).join('')}
  ${brands.filter(brand => isValidBrandSlug(brand.slug) && hasQualityContent(brand)).map(brand => `
  <url>
    <loc>${SITE_URL}/brand/${brand.slug}</loc>
    <lastmod>${formatBrandLastmod(brand)}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
  `).join('')}
  ${creators.filter(c => c.username).map(creator => `
  <url>
    <loc>${SITE_URL}/c/${creator.username}</loc>
    <lastmod>${creator.updated_at ? new Date(creator.updated_at).toISOString() : now}</lastmod>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>
  `).join('')}
</urlset>`;

    await fs.writeFile(path.join(__dirname, '../public/sitemap.xml'), sitemap);

    const validSlugBrands = brands.filter(brand => isValidBrandSlug(brand.slug));
    const qualityBrands = validSlugBrands.filter(brand => hasQualityContent(brand));
    const badSlugCount = brands.length - validSlugBrands.length;
    const thinContentCount = validSlugBrands.length - qualityBrands.length;

    console.log('Sitemap generated successfully!');
    console.log(`- Added homepage and static pages`);
    console.log(`- Added ${postsIndex.length} blog posts`);
    console.log(`- Added ${qualityBrands.length} brand pages`);
    console.log(`  (filtered ${badSlugCount} bad slugs, ${thinContentCount} thin content)`);
    console.log(`- Added ${creators.length} creator profiles`);
    console.log(`- Added registration pages`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap(); 