const axios = require('axios');
const fs = require('fs');
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

async function generateImageSitemap() {
  try {
    console.log('🔍 Fetching all brands from API...');
    const brands = await fetchAllBrands();
    console.log(`📊 Total brands: ${brands.length}`);

    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

`;

    // Add each brand page with its logo as an image
    brands.forEach(brand => {
      if (brand.logo) {
        const brandUrl = `${SITE_URL}/brand/${brand.slug}`;
        const logoUrl = brand.logo.startsWith('http') ? brand.logo : `${SITE_URL}${brand.logo}`;
        
        xml += `  <!-- ${brand.name} -->
  <url>
    <loc>${brandUrl}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>${logoUrl}</image:loc>
      <image:title>${brand.name} Logo</image:title>${brand.description ? `
      <image:caption>${brand.description.replace(/<[^>]*>/g, '').substring(0, 200)}</image:caption>` : ''}
    </image:image>
  </url>

`;
      }
    });

    xml += `</urlset>`;

    // Write to public folder
    const outputPath = path.join(__dirname, '../public/sitemap-images.xml');
    fs.writeFileSync(outputPath, xml, 'utf8');

    console.log(`\n✅ Image sitemap generated successfully!`);
    console.log(`📁 Location: ${outputPath}`);
    console.log(`🔗 URL: ${SITE_URL}/sitemap-images.xml`);
    console.log(`📊 Brands with logos: ${brands.filter(b => b.logo).length}`);
  } catch (error) {
    console.error('❌ Error generating image sitemap:', error.message);
    if (error.response) {
      console.error('   API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
generateImageSitemap();
