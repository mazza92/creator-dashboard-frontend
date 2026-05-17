const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api.newcollab.co';
const ADMIN_TOKEN = 'pr-hunter-admin-2026';

// Generic/missing description patterns
const GENERIC_PATTERNS = [
  /^PR applications/i,
  /^Brand/i,
  /^Influencer/i,
  /^Contact/i,
  /^Apply/i,
  /^Join/i,
  /^Welcome/i,
  /^Looking for/i,
  /^We are/i,
  /^Get/i,
  /^Find/i,
  /^Discover/i,
  /^Explore/i,
  /^Check out/i,
  /^Visit/i,
  /^Click/i,
  /^Link/i,
  /^Form/i,
  /^Application/i,
  /^Collaboration/i,
  /^Partnership/i,
  /^Ambassador/i,
  /^Program/i,
  /^Opportunity/i,
  /^Request/i,
  /^Submit/i,
  /^Fill/i,
  /^Complete/i,
  /^Access/i,
  /^Sign up/i,
  /^Register/i,
  /^Learn more/i,
  /^See more/i,
  /^Read more/i,
  /^More info/i,
  /^Info/i,
  /^Details/i,
  /^About/i,
  /^Description/i,
  /^N\/A/i,
  /^TBD/i,
  /^Coming soon/i,
  /^To be determined/i,
  /^Pending/i,
  /^None/i,
  /^N\/A/i,
  /^TBA/i,
  /^\.\.\./i,
  /^---/i,
  /^___/i,
  /^xxx/i,
  /^test/i,
  /^placeholder/i,
  /^sample/i,
  /^example/i,
];

function isGenericOrMissing(description) {
  if (!description || description.trim().length < 20) {
    return true;
  }
  
  const desc = description.trim();
  return GENERIC_PATTERNS.some(pattern => pattern.test(desc));
}

async function fetchAllBrands() {
  let allBrands = [];
  let page = 1;
  let hasMore = true;

  console.log('🔍 Fetching all brands from API...\n');

  while (hasMore) {
    try {
      const response = await axios.get(`${API_BASE}/api/public/brands`, {
        params: { page, limit: 100 }
      });

      allBrands = allBrands.concat(response.data.brands);
      const { totalPages } = response.data.pagination;
      hasMore = page < totalPages;
      
      console.log(`  ✓ Fetched page ${page} of ${totalPages} (${allBrands.length} brands so far)`);
      page += 1;
    } catch (error) {
      console.error(`❌ Error fetching page ${page}:`, error.message);
      break;
    }
  }

  return allBrands;
}

function analyzeBrands(brands) {
  const issues = {
    missing: [],
    generic: [],
    byCategory: {}
  };

  brands.forEach(brand => {
    const hasIssue = isGenericOrMissing(brand.description);
    
    if (hasIssue) {
      const issue = {
        id: brand.id,
        slug: brand.slug,
        name: brand.name,
        category: brand.category || 'other',
        description: brand.description || '(missing)',
        length: brand.description ? brand.description.length : 0
      };

      if (!brand.description || brand.description.trim().length < 20) {
        issues.missing.push(issue);
      } else {
        issues.generic.push(issue);
      }

      // Group by category
      const cat = brand.category || 'other';
      if (!issues.byCategory[cat]) {
        issues.byCategory[cat] = [];
      }
      issues.byCategory[cat].push(issue);
    }
  });

  return issues;
}

function generateReport(issues) {
  const totalIssues = issues.missing.length + issues.generic.length;
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 DATA QUALITY REPORT');
  console.log('='.repeat(60));
  console.log(`\nTotal brands with issues: ${totalIssues}`);
  console.log(`  - Missing descriptions: ${issues.missing.length}`);
  console.log(`  - Generic descriptions: ${issues.generic.length}`);

  console.log('\n📋 Issues by Category:');
  const sortedCategories = Object.entries(issues.byCategory)
    .sort((a, b) => b[1].length - a[1].length);
  
  sortedCategories.forEach(([category, brands]) => {
    console.log(`  ${category}: ${brands.length} brands`);
  });

  console.log('\n📝 Sample Issues:');
  const samples = [...issues.missing.slice(0, 5), ...issues.generic.slice(0, 5)];
  samples.forEach((brand, idx) => {
    console.log(`\n  ${idx + 1}. ${brand.name} (${brand.category})`);
    console.log(`     Description: "${brand.description.substring(0, 100)}${brand.description.length > 100 ? '...' : ''}"`);
    console.log(`     Slug: ${brand.slug}`);
  });

  return {
    totalIssues,
    missing: issues.missing.length,
    generic: issues.generic.length,
    byCategory: issues.byCategory
  };
}

async function saveIssuesToFile(issues) {
  const outputPath = path.join(__dirname, '../data-quality-issues.json');
  const data = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalIssues: issues.missing.length + issues.generic.length,
      missing: issues.missing.length,
      generic: issues.generic.length,
      byCategory: Object.fromEntries(
        Object.entries(issues.byCategory).map(([cat, brands]) => [cat, brands.length])
      )
    },
    missing: issues.missing,
    generic: issues.generic,
    byCategory: issues.byCategory
  };

  await fs.writeFile(outputPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n💾 Issues saved to: ${outputPath}`);
}

async function updateBrandDescription(brandId, description) {
  try {
    const response = await axios.patch(
      `${API_BASE}/api/admin/brands/${brandId}`,
      { description },
      {
        headers: {
          'X-Admin-Token': ADMIN_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

async function main() {
  try {
    // Step 1: Fetch all brands
    const brands = await fetchAllBrands();
    console.log(`\n✅ Fetched ${brands.length} total brands\n`);

    // Step 2: Analyze for issues
    console.log('🔍 Analyzing brands for data quality issues...\n');
    const issues = analyzeBrands(brands);

    // Step 3: Generate report
    const report = generateReport(issues);

    // Step 4: Save to file
    await saveIssuesToFile(issues);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Analysis complete!');
    console.log('='.repeat(60));
    console.log('\nNext steps:');
    console.log('1. Review data-quality-issues.json');
    console.log('2. Research brands and write accurate descriptions');
    console.log('3. Use updateBrandDescription() function to update via API');
    console.log('\nExample update:');
    console.log('  await updateBrandDescription(brandId, "Accurate description here...")');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Export functions for use in other scripts
if (require.main === module) {
  main();
} else {
  module.exports = {
    fetchAllBrands,
    analyzeBrands,
    isGenericOrMissing,
    updateBrandDescription,
    generateReport
  };
}
