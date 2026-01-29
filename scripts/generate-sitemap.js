const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api.newcollab.co';
const SITE_URL = 'https://newcollab.co';

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
    const brands = await fetchAllBrands();
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
    <loc>${SITE_URL}/blog</loc>
    <lastmod>${now}</lastmod>
    <priority>1.0</priority>
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
  ${postsIndex.map((slug, index) => `
  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${postDates[index]}</lastmod>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>
  `).join('')}
  ${brands.map(brand => `
  <url>
    <loc>${SITE_URL}/brand/${brand.slug}</loc>
    <lastmod>${formatBrandLastmod(brand)}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
  `).join('')}
</urlset>`;

    await fs.writeFile(path.join(__dirname, '../public/sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully!');
    console.log(`- Added ${postsIndex.length} blog posts`);
    console.log(`- Added ${brands.length} brand pages`);
    console.log(`- Added public pages and category directories`);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap(); 