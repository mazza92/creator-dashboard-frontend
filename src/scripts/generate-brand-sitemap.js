/**
 * Generate dynamic sitemap.xml with all brand URLs
 * Run: node src/scripts/generate-brand-sitemap.js
 * Output: public/sitemap-brands.xml
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api.newcollab.co';
const SITE_URL = 'https://newcollab.co';

async function generateBrandSitemap() {
  try {
    console.log('🔍 Fetching all brands from API...');

    let allBrands = [];
    let page = 1;
    let hasMore = true;

    // Fetch all brands (paginated)
    while (hasMore) {
      const response = await axios.get(`${API_BASE}/api/public/brands`, {
        params: { page, limit: 100 }
      });

      allBrands = allBrands.concat(response.data.brands);

      const { totalPages } = response.data.pagination;
      hasMore = page < totalPages;
      page++;

      console.log(`  ✓ Fetched page ${page - 1} of ${totalPages}`);
    }

    console.log(`\n📊 Total brands: ${allBrands.length}`);

    // Generate XML sitemap
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Brand Directory Landing Page -->
  <url>
    <loc>${SITE_URL}/directory</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

`;

    // Add each brand page
    allBrands.forEach(brand => {
      const brandUrl = `${SITE_URL}/brand/${brand.slug}`;

      xml += `  <!-- ${brand.name} -->
  <url>
    <loc>${brandUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

      // Add brand logo as image sitemap extension
      if (brand.logo) {
        xml += `
    <image:image>
      <image:loc>${brand.logo}</image:loc>
      <image:title>${brand.name} Logo</image:title>
    </image:image>`;
      }

      xml += `
  </url>

`;
    });

    xml += `</urlset>`;

    // Write to public folder
    const outputPath = path.join(__dirname, '../../public/sitemap-brands.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');

    console.log(`\n✅ Sitemap generated successfully!`);
    console.log(`📁 Location: ${outputPath}`);
    console.log(`🔗 URL: ${SITE_URL}/sitemap-brands.xml`);
    console.log(`\n📌 Next steps:`);
    console.log(`   1. Deploy to Vercel (sitemap will be accessible)`);
    console.log(`   2. Submit to Google Search Console: https://search.google.com/search-console`);
    console.log(`   3. Schedule cron job to regenerate weekly (keep sitemap fresh)`);

    // Also update main sitemap index if it exists
    updateMainSitemap();

  } catch (error) {
    console.error('❌ Error generating sitemap:', error.message);
    if (error.response) {
      console.error('   API Response:', error.response.data);
    }
    process.exit(1);
  }
}

function updateMainSitemap() {
  const mainSitemapPath = path.join(__dirname, '../../public/sitemap.xml');

  // Check if main sitemap exists
  if (!fs.existsSync(mainSitemapPath)) {
    // Create a sitemap index
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SITE_URL}/sitemap-brands.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;

    fs.writeFileSync(mainSitemapPath, sitemapIndex, 'utf8');
    console.log(`\n📄 Created main sitemap index at ${mainSitemapPath}`);
  } else {
    console.log(`\n📄 Main sitemap already exists at ${mainSitemapPath}`);
    console.log(`   Make sure it references sitemap-brands.xml`);
  }
}

// Run the script
generateBrandSitemap();
