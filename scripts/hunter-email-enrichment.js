/**
 * Hunter.io Email Enrichment Script
 *
 * Uses Hunter.io API to verify and enrich brand emails
 *
 * Usage:
 *   HUNTER_API_KEY=your_key node scripts/hunter-email-enrichment.js [--verify-only] [--find-only] [--limit=100] [--dry-run]
 *
 * Options:
 *   --verify-only   Only verify existing emails (don't search for new ones)
 *   --find-only     Only find emails for brands without contact_email
 *   --limit=N       Process maximum N brands (default: unlimited)
 *   --dry-run       Show what would be done without making API calls
 *   --skip=N        Skip first N brands (for resuming)
 */

const axios = require('axios');

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://api.newcollab.co';
const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
const ADMIN_TOKEN = 'pr-hunter-admin-2026';

// Parse CLI args
const args = process.argv.slice(2);
const VERIFY_ONLY = args.includes('--verify-only');
const FIND_ONLY = args.includes('--find-only');
const DRY_RUN = args.includes('--dry-run');
const LIMIT = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1]) || Infinity;
const SKIP = parseInt(args.find(a => a.startsWith('--skip='))?.split('=')[1]) || 0;

// Stats tracking
const stats = {
  totalBrands: 0,
  brandsWithEmail: 0,
  brandsWithoutEmail: 0,
  emailsVerified: 0,
  emailsFound: 0,
  emailsValid: 0,
  emailsInvalid: 0,
  emailsUnknown: 0,
  emailsUpdated: 0,
  creditsUsed: 0,
  errors: []
};

// Helper for API requests with retry
async function apiRequest(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1));
    }
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Extract domain from URL
function extractDomain(url) {
  if (!url) return null;
  try {
    // Handle URLs that may not have protocol
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    // Try basic extraction
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/\s]+)/);
    return match ? match[1].replace(/^www\./, '') : null;
  }
}

// Fetch all published brands
async function fetchPublishedBrands() {
  console.log('📥 Fetching published brands...\n');

  const { data } = await axios.get(`${API_BASE}/api/admin/brands`, {
    params: { limit: 10000 },
    headers: { 'X-Admin-Token': ADMIN_TOKEN }
  });

  const brands = (data.brands || data || []).filter(b =>
    b.status === 'published' || !b.status
  );

  console.log(`✅ Found ${brands.length} published brands\n`);
  return brands;
}

// Verify email with Hunter.io
async function verifyEmail(email) {
  if (!HUNTER_API_KEY) throw new Error('HUNTER_API_KEY not set');

  const { data } = await axios.get('https://api.hunter.io/v2/email-verifier', {
    params: { email, api_key: HUNTER_API_KEY }
  });

  stats.creditsUsed++;

  return {
    status: data.data.status, // valid, invalid, accept_all, webmail, disposable, unknown
    score: data.data.score,
    result: data.data.result,
    regexp: data.data.regexp,
    gibberish: data.data.gibberish,
    smtp_server: data.data.smtp_server,
    smtp_check: data.data.smtp_check
  };
}

// Find email for domain with Hunter.io
async function findEmailForDomain(domain) {
  if (!HUNTER_API_KEY) throw new Error('HUNTER_API_KEY not set');

  const { data } = await axios.get('https://api.hunter.io/v2/domain-search', {
    params: {
      domain,
      api_key: HUNTER_API_KEY,
      type: 'generic', // Look for generic emails like pr@, info@, contact@
      limit: 5
    }
  });

  stats.creditsUsed++;

  // Look for PR-related emails first
  const emails = data.data.emails || [];
  const prEmails = emails.filter(e =>
    /^(pr|press|media|partnerships?|collab|influencer|creator|marketing|brand)@/i.test(e.value)
  );

  // Return best match
  if (prEmails.length > 0) {
    return prEmails.sort((a, b) => b.confidence - a.confidence)[0];
  }

  if (emails.length > 0) {
    return emails.sort((a, b) => b.confidence - a.confidence)[0];
  }

  return null;
}

// Results storage
const results = {
  verified: [],
  found: [],
  invalid: []
};

// Update brand in database (only contact_email field is reliably supported)
async function updateBrand(brandId, updates) {
  // Only update contact_email if it's a new email find
  if (updates.contact_email) {
    await axios.patch(
      `${API_BASE}/api/admin/brands/${brandId}`,
      { contact_email: updates.contact_email },
      { headers: { 'X-Admin-Token': ADMIN_TOKEN } }
    );
    stats.emailsUpdated++;
  }
  // For verification results, just store locally (API may not support email_status field)
}

// Process a single brand
async function processBrand(brand, index) {
  const { id, name, slug, contact_email, website, email_status } = brand;

  console.log(`\n[${index}] 🏷️  ${name} (${slug})`);

  // Skip if already verified this session or has valid status
  if (email_status === 'valid' || email_status === 'verified') {
    console.log('   ⏭️  Already verified, skipping');
    return;
  }

  // Verify existing email
  if (contact_email && !FIND_ONLY) {
    console.log(`   📧 Verifying: ${contact_email}`);

    if (DRY_RUN) {
      console.log('   🔍 [DRY RUN] Would verify email');
      stats.emailsVerified++;
      return;
    }

    try {
      const result = await verifyEmail(contact_email);
      stats.emailsVerified++;

      let emailStatus;
      if (result.status === 'valid' || (result.status === 'accept_all' && result.score >= 50)) {
        emailStatus = 'valid';
        stats.emailsValid++;
        console.log(`   ✅ Valid (score: ${result.score})`);
        results.verified.push({ id, name, slug, email: contact_email, status: 'valid', score: result.score });
      } else if (result.status === 'invalid') {
        emailStatus = 'invalid';
        stats.emailsInvalid++;
        console.log(`   ❌ Invalid: ${result.result}`);
        results.invalid.push({ id, name, slug, email: contact_email, status: 'invalid', reason: result.result });
      } else {
        emailStatus = 'unknown';
        stats.emailsUnknown++;
        console.log(`   ⚠️  Unknown: ${result.status} (score: ${result.score})`);
        results.verified.push({ id, name, slug, email: contact_email, status: 'unknown', score: result.score });
      }

      // Note: Not updating DB for verification status (field may not exist in schema)

      // Small delay to respect rate limits (10 requests/second for Hunter)
      await sleep(150);

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      stats.errors.push({ brand: name, error: error.message });
    }

    return;
  }

  // Find email for brands without one
  if (!contact_email && !VERIFY_ONLY) {
    const domain = extractDomain(website);

    if (!domain) {
      console.log('   ⏭️  No website, cannot search for email');
      return;
    }

    console.log(`   🔎 Searching for email on: ${domain}`);

    if (DRY_RUN) {
      console.log('   🔍 [DRY RUN] Would search for email');
      stats.emailsFound++;
      return;
    }

    try {
      const found = await findEmailForDomain(domain);

      if (found) {
        stats.emailsFound++;
        console.log(`   ✅ Found: ${found.value} (confidence: ${found.confidence}%)`);

        // Store result
        results.found.push({ id, name, slug, email: found.value, confidence: found.confidence, domain });

        // Update brand with found email (contact_email field is supported)
        await updateBrand(id, { contact_email: found.value });

      } else {
        console.log('   ❌ No email found');
      }

      await sleep(150);

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      stats.errors.push({ brand: name, error: error.message });
    }
  }
}

// Main function
async function main() {
  console.log('═'.repeat(60));
  console.log('🔍 HUNTER.IO EMAIL ENRICHMENT');
  console.log('═'.repeat(60));

  if (!HUNTER_API_KEY) {
    console.error('\n❌ HUNTER_API_KEY environment variable not set!');
    console.log('\nUsage: HUNTER_API_KEY=your_key node scripts/hunter-email-enrichment.js');
    process.exit(1);
  }

  console.log(`\n📋 Options:`);
  console.log(`   Mode: ${VERIFY_ONLY ? 'Verify Only' : FIND_ONLY ? 'Find Only' : 'Verify + Find'}`);
  console.log(`   Limit: ${LIMIT === Infinity ? 'No limit' : LIMIT}`);
  console.log(`   Skip: ${SKIP}`);
  console.log(`   Dry Run: ${DRY_RUN ? 'Yes' : 'No'}`);

  try {
    // Get account info
    if (!DRY_RUN) {
      const { data: account } = await axios.get('https://api.hunter.io/v2/account', {
        params: { api_key: HUNTER_API_KEY }
      });
      console.log(`\n📊 Hunter.io Account:`);
      console.log(`   Plan: ${account.data.plan_name}`);
      console.log(`   Credits: ${account.data.requests.searches.available} searches, ${account.data.requests.verifications.available} verifications`);
    }

    // Fetch brands
    const allBrands = await fetchPublishedBrands();
    stats.totalBrands = allBrands.length;

    // Categorize
    const withEmail = allBrands.filter(b => b.contact_email);
    const withoutEmail = allBrands.filter(b => !b.contact_email && b.website);
    const noWebsite = allBrands.filter(b => !b.contact_email && !b.website);

    stats.brandsWithEmail = withEmail.length;
    stats.brandsWithoutEmail = withoutEmail.length;

    console.log(`\n📊 Brand breakdown:`);
    console.log(`   With email: ${withEmail.length}`);
    console.log(`   Without email (has website): ${withoutEmail.length}`);
    console.log(`   No email & no website: ${noWebsite.length}`);

    // Determine which brands to process
    let toProcess = [];

    if (VERIFY_ONLY) {
      // Filter to only unverified emails
      toProcess = withEmail.filter(b => !b.email_status || b.email_status === 'unverified');
      console.log(`\n🎯 Processing ${Math.min(toProcess.length, LIMIT)} brands for email verification`);
    } else if (FIND_ONLY) {
      toProcess = withoutEmail;
      console.log(`\n🎯 Processing ${Math.min(toProcess.length, LIMIT)} brands for email discovery`);
    } else {
      // Prioritize verification, then discovery
      const unverified = withEmail.filter(b => !b.email_status || b.email_status === 'unverified');
      toProcess = [...unverified, ...withoutEmail];
      console.log(`\n🎯 Processing ${Math.min(toProcess.length, LIMIT)} brands (${unverified.length} verify + ${withoutEmail.length} find)`);
    }

    // Apply skip and limit
    toProcess = toProcess.slice(SKIP, SKIP + LIMIT);

    console.log(`\n${'─'.repeat(60)}`);

    // Process brands
    for (let i = 0; i < toProcess.length; i++) {
      await processBrand(toProcess[i], SKIP + i + 1);

      // Progress update every 25 brands
      if ((i + 1) % 25 === 0) {
        console.log(`\n📊 Progress: ${i + 1}/${toProcess.length} | Credits used: ${stats.creditsUsed}`);
      }
    }

    // Final report
    console.log('\n' + '═'.repeat(60));
    console.log('📊 FINAL REPORT');
    console.log('═'.repeat(60));
    console.log(`\nTotal brands processed: ${toProcess.length}`);
    console.log(`Emails verified: ${stats.emailsVerified}`);
    console.log(`  ✅ Valid: ${stats.emailsValid}`);
    console.log(`  ❌ Invalid: ${stats.emailsInvalid}`);
    console.log(`  ⚠️  Unknown: ${stats.emailsUnknown}`);
    console.log(`Emails found (new): ${stats.emailsFound}`);
    console.log(`Database updates: ${stats.emailsUpdated}`);
    console.log(`\n💰 Hunter.io credits used: ${stats.creditsUsed}`);

    if (stats.errors.length > 0) {
      console.log(`\n❌ Errors (${stats.errors.length}):`);
      stats.errors.slice(0, 10).forEach(({ brand, error }) => {
        console.log(`   - ${brand}: ${error}`);
      });
      if (stats.errors.length > 10) {
        console.log(`   ... and ${stats.errors.length - 10} more`);
      }
    }

    // Save results to JSON file
    const fs = require('fs').promises;
    const outputPath = require('path').join(__dirname, '../hunter-results.json');
    await fs.writeFile(outputPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      stats,
      results
    }, null, 2));
    console.log(`\n💾 Results saved to: hunter-results.json`);

    console.log('\n✅ Enrichment complete!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    if (error.response?.data) {
      console.error('   API Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run
main();
