const axios = require('axios');

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api.newcollab.co';

/**
 * Bad Slug Patterns to identify problematic brand URLs
 * These patterns indicate slugs generated from website taglines/descriptions rather than brand names
 */
const BAD_SLUG_PATTERNS = [
  // Website tagline patterns
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
  /---/,  // Triple dash indicates URL encoding issues
  // Excessively long slugs (likely taglines)
];

/**
 * Slug corrections map
 * Format: { bad_slug: correct_slug }
 * If correct_slug is null, the brand should be deleted/hidden
 */
const SLUG_CORRECTIONS = {
  // Direct corrections
  'target-expect-more-pay-less': 'target',
  'christan-louboutin': 'christian-louboutin',
  'crme-de-la-mer': 'creme-de-la-mer',
  'belif---official-website': 'belif',
  'laura-mercier---us': 'laura-mercier',

  // Duplicates to remove (set to null means should be hidden/deleted)
  'contemporary-mid-century-modern-furniture': null, // duplicate of article
  'luxury-skin-creams-serums': null, // duplicate of la-mer
  'maquillage-soins-des-pores-et-services-beaut': null, // clinique french
  'skin-care-hair-care-for-healthy-results': null,
  'skin-care-products-for-healthier-skin': null,
  'luxury-organic-bedding-sheets-towels': null,
  'buy-collagen-protein-powder-collagen-supplements': null, // vital proteins dupe
  'shop-athleta-for-womens-yoga-clothing-technical-athletic-clothing-and-athleisure': null,
  'home-furniture-home-decor-housewares': null, // pottery barn dupe
  'welcome-to-nivea': 'nivea',
  'olay-official-site': 'olay',
  'makeup-and-beauty-products-makeup-tips-try-on-looks-and-more': null,
  'fresh-dog-food-delivered': null, // farmer's dog dupe
  'fashionnovacom': 'fashion-nova',
  'varley-official-online-store': 'varley',
  'farfetch-france': 'farfetch',
  'sandro-site-officiel': 'sandro',
  'gisou-eu': 'gisou',
  'inkey-usa': 'inkey-list',
  'drjart-skincare': 'dr-jart',
  'laneige-international': 'laneige',
};

/**
 * Fetch all brands from API
 */
async function fetchAllBrands() {
  let allBrands = [];
  let page = 1;
  let hasMore = true;

  console.log('Fetching all brands...');

  while (hasMore) {
    try {
      const response = await axios.get(`${API_BASE}/api/public/brands`, {
        params: { page, limit: 100 }
      });

      allBrands = allBrands.concat(response.data.brands);

      const { totalPages } = response.data.pagination;
      hasMore = page < totalPages;
      page += 1;

      process.stdout.write(`\r  Fetched page ${page - 1}/${totalPages}...`);
    } catch (error) {
      console.error('\nError fetching brands:', error.message);
      break;
    }
  }

  console.log(`\n  Total: ${allBrands.length} brands\n`);
  return allBrands;
}

/**
 * Identify brands with problematic slugs
 */
function identifyBadSlugs(brands) {
  const badBrands = [];

  for (const brand of brands) {
    const slug = brand.slug;
    let reason = null;

    // Check against known corrections
    if (SLUG_CORRECTIONS.hasOwnProperty(slug)) {
      reason = SLUG_CORRECTIONS[slug]
        ? `Should be: ${SLUG_CORRECTIONS[slug]}`
        : 'Duplicate/invalid - should be removed';
    }
    // Check against bad patterns
    else if (BAD_SLUG_PATTERNS.some(pattern => pattern.test(slug))) {
      reason = 'Matches bad pattern (website tagline)';
    }
    // Check for excessively long slugs (likely taglines)
    else if (slug.length > 40) {
      reason = `Slug too long (${slug.length} chars)`;
    }
    // Check for too many hyphens (indicates tagline)
    else if ((slug.match(/-/g) || []).length > 5) {
      reason = `Too many hyphens (${(slug.match(/-/g) || []).length})`;
    }

    if (reason) {
      badBrands.push({
        id: brand.id,
        name: brand.name,
        slug: slug,
        reason: reason,
        correction: SLUG_CORRECTIONS[slug] || 'NEEDS_REVIEW'
      });
    }
  }

  return badBrands;
}

/**
 * Generate SQL statements to fix bad slugs
 */
function generateFixSQL(badBrands) {
  const updateStatements = [];
  const deleteStatements = [];

  for (const brand of badBrands) {
    if (brand.correction === null) {
      // Mark for deletion/hiding
      deleteStatements.push(
        `-- Delete/hide: ${brand.name} (${brand.slug})\n` +
        `UPDATE brands SET is_visible = false WHERE slug = '${brand.slug}';`
      );
    } else if (brand.correction && brand.correction !== 'NEEDS_REVIEW') {
      // Fix the slug
      updateStatements.push(
        `-- Fix: ${brand.name} (${brand.slug} -> ${brand.correction})\n` +
        `UPDATE brands SET slug = '${brand.correction}' WHERE id = ${brand.id};`
      );
    }
  }

  return { updateStatements, deleteStatements };
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(70));
  console.log('BAD SLUG IDENTIFIER & FIXER');
  console.log('='.repeat(70));
  console.log();

  // Fetch all brands
  const brands = await fetchAllBrands();

  // Identify bad slugs
  const badBrands = identifyBadSlugs(brands);

  // Sort by reason
  badBrands.sort((a, b) => a.reason.localeCompare(b.reason));

  // Report
  console.log('='.repeat(70));
  console.log(`FOUND ${badBrands.length} PROBLEMATIC SLUGS`);
  console.log('='.repeat(70));
  console.log();

  // Group by reason
  const byReason = {};
  for (const brand of badBrands) {
    const key = brand.reason.split(' ')[0];
    if (!byReason[key]) byReason[key] = [];
    byReason[key].push(brand);
  }

  for (const [reason, brands] of Object.entries(byReason)) {
    console.log(`\n--- ${reason} (${brands.length}) ---`);
    for (const brand of brands.slice(0, 10)) {
      console.log(`  ${brand.slug}`);
      console.log(`    Name: ${brand.name}`);
      console.log(`    Reason: ${brand.reason}`);
      if (brand.correction && brand.correction !== 'NEEDS_REVIEW') {
        console.log(`    Correction: ${brand.correction || 'REMOVE'}`);
      }
    }
    if (brands.length > 10) {
      console.log(`  ... and ${brands.length - 10} more`);
    }
  }

  // Generate SQL
  const { updateStatements, deleteStatements } = generateFixSQL(badBrands);

  console.log('\n' + '='.repeat(70));
  console.log('RECOMMENDED SQL FIXES');
  console.log('='.repeat(70));

  if (updateStatements.length > 0) {
    console.log('\n-- UPDATE STATEMENTS (fix slugs):');
    console.log(updateStatements.join('\n\n'));
  }

  if (deleteStatements.length > 0) {
    console.log('\n-- DELETE/HIDE STATEMENTS:');
    console.log(deleteStatements.join('\n\n'));
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total brands checked: ${brands.length}`);
  console.log(`Problematic slugs found: ${badBrands.length}`);
  console.log(`  - Fixable: ${updateStatements.length}`);
  console.log(`  - Should remove: ${deleteStatements.length}`);
  console.log(`  - Needs manual review: ${badBrands.length - updateStatements.length - deleteStatements.length}`);

  // Export list of bad slugs for sitemap filtering
  const badSlugList = badBrands.map(b => b.slug);
  console.log('\n\nBad slugs to filter from sitemap:');
  console.log(JSON.stringify(badSlugList, null, 2));

  return badBrands;
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { fetchAllBrands, identifyBadSlugs, SLUG_CORRECTIONS, BAD_SLUG_PATTERNS };
