const fs = require('fs').promises;
const path = require('path');

async function generateSitemap() {
  try {
    const postsDir = path.join(__dirname, '../src/content/posts');
    const postsIndex = JSON.parse(await fs.readFile(path.join(postsDir, 'posts.json'), 'utf8'));
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://newcollab.co/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://newcollab.co/marketplace</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.9</priority>
    <changefreq>weekly</changefreq>
  </url>
  ${postsIndex.map(slug => `
  <url>
    <loc>https://newcollab.co/blog/${slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>
  `).join('')}
</urlset>`;

    await fs.writeFile(path.join(__dirname, '../public/sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap(); 