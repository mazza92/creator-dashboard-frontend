const axios = require('axios');

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api.newcollab.co';

/**
 * Content Quality Analysis for Brand Pages
 *
 * This script identifies brand pages with thin/low-quality content
 * that are likely causing "Crawled - currently not indexed" issues.
 */

// Content quality scoring
function analyzeBrandContent(brand) {
  const issues = [];
  let contentScore = 0;
  const maxScore = 100;

  // 1. Description check (30 points)
  if (!brand.description) {
    issues.push('NO_DESCRIPTION');
  } else if (brand.description.length < 50) {
    issues.push('SHORT_DESCRIPTION');
    contentScore += 10;
  } else if (brand.description.length < 100) {
    issues.push('BRIEF_DESCRIPTION');
    contentScore += 20;
  } else {
    contentScore += 30;
  }

  // Check for generic/scraped descriptions
  const genericPatterns = [
    /official website/i,
    /official site/i,
    /shop online/i,
    /buy online/i,
    /free shipping/i,
    /best prices/i,
    /shop now/i,
    /click here/i,
    /visit our website/i,
    /welcome to/i,
  ];
  if (brand.description && genericPatterns.some(p => p.test(brand.description))) {
    issues.push('GENERIC_DESCRIPTION');
    contentScore -= 10;
  }

  // 2. Requirements check (20 points)
  const requirements = brand.requirements || {};
  const platforms = requirements.platforms || brand.platforms || [];
  const regions = requirements.regions || brand.regions || [];
  const niches = brand.niches || [];
  const minFollowers = requirements.minFollowers || brand.minFollowers;

  if (platforms.length > 0) contentScore += 5;
  if (regions.length > 0) contentScore += 5;
  if (niches.length > 0) contentScore += 5;
  if (minFollowers > 0) contentScore += 5;

  if (platforms.length === 0 && regions.length === 0 && niches.length === 0 && !minFollowers) {
    issues.push('NO_REQUIREMENTS');
  }

  // 3. Stats check (15 points)
  const stats = brand.stats || {};
  const responseRate = stats.responseRate || brand.responseRate;
  const avgResponseTime = stats.avgResponseTime || brand.avgResponseTime;

  if (responseRate > 0) contentScore += 8;
  if (avgResponseTime > 0) contentScore += 7;
  if (!responseRate && !avgResponseTime) {
    issues.push('NO_STATS');
  }

  // 4. Social/Connect check (15 points)
  if (brand.website) contentScore += 5;
  if (brand.instagram) contentScore += 5;
  if (brand.tiktok) contentScore += 5;
  if (!brand.website && !brand.instagram && !brand.tiktok) {
    issues.push('NO_SOCIAL_LINKS');
  }

  // 5. Logo check (10 points)
  if (brand.logo) {
    contentScore += 10;
  } else {
    issues.push('NO_LOGO');
  }

  // 6. Category check (10 points)
  if (brand.category) {
    contentScore += 10;
  } else {
    issues.push('NO_CATEGORY');
  }

  // Determine quality tier
  let tier;
  if (contentScore >= 70) tier = 'HIGH';
  else if (contentScore >= 40) tier = 'MEDIUM';
  else if (contentScore >= 20) tier = 'LOW';
  else tier = 'CRITICAL';

  return {
    slug: brand.slug,
    name: brand.name,
    score: Math.max(0, Math.min(contentScore, maxScore)),
    tier,
    issues,
    hasDescription: !!brand.description,
    descriptionLength: brand.description?.length || 0,
    hasLogo: !!brand.logo,
    hasCategory: !!brand.category,
    platformCount: platforms.length,
    hasStats: !!(responseRate || avgResponseTime),
    hasSocialLinks: !!(brand.website || brand.instagram || brand.tiktok),
  };
}

async function fetchAllBrands() {
  let allBrands = [];
  let page = 1;
  let hasMore = true;

  console.log('Fetching all brands...\n');

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

async function main() {
  console.log('='.repeat(70));
  console.log('BRAND CONTENT QUALITY ANALYZER');
  console.log('='.repeat(70));
  console.log();

  const brands = await fetchAllBrands();
  const analyses = brands.map(analyzeBrandContent);

  // Sort by score (lowest first)
  analyses.sort((a, b) => a.score - b.score);

  // Group by tier
  const tiers = {
    CRITICAL: analyses.filter(a => a.tier === 'CRITICAL'),
    LOW: analyses.filter(a => a.tier === 'LOW'),
    MEDIUM: analyses.filter(a => a.tier === 'MEDIUM'),
    HIGH: analyses.filter(a => a.tier === 'HIGH'),
  };

  // Summary
  console.log('='.repeat(70));
  console.log('CONTENT QUALITY SUMMARY');
  console.log('='.repeat(70));
  console.log();
  console.log(`Total brands analyzed: ${analyses.length}`);
  console.log();
  console.log('Quality Distribution:');
  console.log(`  🔴 CRITICAL (score 0-19):  ${tiers.CRITICAL.length} pages - WILL NOT BE INDEXED`);
  console.log(`  🟠 LOW (score 20-39):      ${tiers.LOW.length} pages - UNLIKELY to be indexed`);
  console.log(`  🟡 MEDIUM (score 40-69):   ${tiers.MEDIUM.length} pages - MAY be indexed`);
  console.log(`  🟢 HIGH (score 70-100):    ${tiers.HIGH.length} pages - SHOULD be indexed`);
  console.log();

  // Issue breakdown
  const issueCounts = {};
  for (const analysis of analyses) {
    for (const issue of analysis.issues) {
      issueCounts[issue] = (issueCounts[issue] || 0) + 1;
    }
  }

  console.log('='.repeat(70));
  console.log('ISSUE BREAKDOWN');
  console.log('='.repeat(70));
  console.log();
  const sortedIssues = Object.entries(issueCounts).sort((a, b) => b[1] - a[1]);
  for (const [issue, count] of sortedIssues) {
    const pct = ((count / analyses.length) * 100).toFixed(1);
    console.log(`  ${issue.padEnd(25)} ${count.toString().padStart(4)} pages (${pct}%)`);
  }
  console.log();

  // Critical pages (most urgent)
  console.log('='.repeat(70));
  console.log('CRITICAL PAGES - REQUIRE IMMEDIATE ATTENTION');
  console.log('='.repeat(70));
  console.log();

  const criticalSample = tiers.CRITICAL.slice(0, 20);
  for (const brand of criticalSample) {
    console.log(`  ${brand.slug}`);
    console.log(`    Name: ${brand.name}`);
    console.log(`    Score: ${brand.score}/100`);
    console.log(`    Issues: ${brand.issues.join(', ')}`);
    console.log();
  }
  if (tiers.CRITICAL.length > 20) {
    console.log(`  ... and ${tiers.CRITICAL.length - 20} more critical pages\n`);
  }

  // Low quality pages
  if (tiers.LOW.length > 0) {
    console.log('='.repeat(70));
    console.log('LOW QUALITY PAGES - SHOULD BE IMPROVED OR NOINDEXED');
    console.log('='.repeat(70));
    console.log();

    const lowSample = tiers.LOW.slice(0, 15);
    for (const brand of lowSample) {
      console.log(`  ${brand.slug} (score: ${brand.score}) - ${brand.issues.join(', ')}`);
    }
    if (tiers.LOW.length > 15) {
      console.log(`  ... and ${tiers.LOW.length - 15} more low-quality pages\n`);
    }
    console.log();
  }

  // Recommendations
  console.log('='.repeat(70));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(70));
  console.log();

  const noDescCount = issueCounts['NO_DESCRIPTION'] || 0;
  const noReqCount = issueCounts['NO_REQUIREMENTS'] || 0;
  const noLogoCount = issueCounts['NO_LOGO'] || 0;

  console.log('1. ADD NOINDEX TO CRITICAL PAGES:');
  console.log(`   ${tiers.CRITICAL.length} pages should have noindex tag added`);
  console.log();

  console.log('2. IMPROVE CONTENT OR REMOVE FROM SITEMAP:');
  console.log(`   ${tiers.LOW.length + tiers.CRITICAL.length} pages need content improvements`);
  console.log();

  console.log('3. PRIORITY FIXES:');
  if (noDescCount > 0) {
    console.log(`   - Add descriptions to ${noDescCount} brands`);
  }
  if (noReqCount > 0) {
    console.log(`   - Add requirements/details to ${noReqCount} brands`);
  }
  if (noLogoCount > 0) {
    console.log(`   - Add logos to ${noLogoCount} brands`);
  }
  console.log();

  // Export data for further processing
  const exportData = {
    summary: {
      total: analyses.length,
      critical: tiers.CRITICAL.length,
      low: tiers.LOW.length,
      medium: tiers.MEDIUM.length,
      high: tiers.HIGH.length,
    },
    criticalSlugs: tiers.CRITICAL.map(a => a.slug),
    lowQualitySlugs: tiers.LOW.map(a => a.slug),
    allAnalyses: analyses,
  };

  console.log('='.repeat(70));
  console.log('SLUGS TO ADD TO NOINDEX/EXCLUDE LIST');
  console.log('='.repeat(70));
  console.log();
  console.log('// Critical pages - add these to EXCLUDED_SLUGS in generate-sitemap.js');
  console.log('const CRITICAL_SLUGS = [');
  for (const slug of tiers.CRITICAL.map(a => a.slug).slice(0, 50)) {
    console.log(`  '${slug}',`);
  }
  if (tiers.CRITICAL.length > 50) {
    console.log(`  // ... and ${tiers.CRITICAL.length - 50} more`);
  }
  console.log('];');
  console.log();

  return exportData;
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { analyzeBrandContent, fetchAllBrands };
