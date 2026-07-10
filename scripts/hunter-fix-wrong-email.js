/**
 * Find replacement emails for brands marked as 'WRONG EMAIL'
 * Uses Hunter.io domain search to find valid PR emails
 */

const axios = require('axios');

const API_BASE = 'https://api.newcollab.co';
const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
const ADMIN_TOKEN = 'pr-hunter-admin-2026';

if (!HUNTER_API_KEY) {
  console.error('HUNTER_API_KEY not set');
  process.exit(1);
}

let found = 0;
let notFound = 0;
let creditsUsed = 0;
const replacements = [];

async function findEmail(domain) {
  const { data } = await axios.get('https://api.hunter.io/v2/domain-search', {
    params: { domain, api_key: HUNTER_API_KEY, type: 'generic', limit: 5 }
  });
  creditsUsed++;

  const emails = data.data.emails || [];
  const prEmails = emails.filter(e =>
    /^(pr|press|media|partnerships?|collab|influencer|creator|marketing|brand|info|contact|hello)@/i.test(e.value)
  );

  if (prEmails.length > 0) return prEmails.sort((a, b) => b.confidence - a.confidence)[0];
  if (emails.length > 0) return emails.sort((a, b) => b.confidence - a.confidence)[0];
  return null;
}

async function updateBrand(id, email) {
  await axios.patch(
    `${API_BASE}/api/admin/brands/${id}`,
    { contact_email: email },
    { headers: { 'X-Admin-Token': ADMIN_TOKEN } }
  );
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Fetching all brands...\n');

  const { data } = await axios.get(`${API_BASE}/api/admin/brands?limit=10000`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN }
  });
  const brands = data.brands || [];

  // Filter brands with 'WRONG EMAIL' marker (case insensitive)
  const wrongEmailBrands = brands.filter(b =>
    b.contact_email && b.contact_email.toLowerCase().includes('wrong email')
  );

  console.log(`Found ${wrongEmailBrands.length} brands marked as 'WRONG EMAIL'\n`);
  console.log('='.repeat(60) + '\n');

  for (const brand of wrongEmailBrands) {
    console.log(`🏷️  ${brand.name} (${brand.slug})`);
    console.log(`   Current: ${brand.contact_email}`);

    if (!brand.website) {
      console.log(`   ❌ No website, skipping\n`);
      notFound++;
      continue;
    }

    // Extract domain
    let domain;
    try {
      let url = brand.website;
      if (!url.startsWith('http')) url = 'https://' + url;
      domain = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      console.log(`   ❌ Invalid website URL\n`);
      notFound++;
      continue;
    }

    console.log(`   🔎 Searching: ${domain}`);

    try {
      const email = await findEmail(domain);
      if (email) {
        console.log(`   ✅ Found: ${email.value} (${email.confidence}%)`);
        await updateBrand(brand.id, email.value);
        replacements.push({ name: brand.name, slug: brand.slug, old: brand.contact_email, new: email.value });
        found++;
      } else {
        console.log(`   ❌ No email found on ${domain}`);
        notFound++;
      }
      console.log('');
      await sleep(150);
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}\n`);
      notFound++;
    }
  }

  console.log('='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Brands processed: ${wrongEmailBrands.length}`);
  console.log(`Replacements found & updated: ${found}`);
  console.log(`No replacement available: ${notFound}`);
  console.log(`Credits used: ${creditsUsed}`);

  if (replacements.length > 0) {
    console.log('\nReplacements made:');
    replacements.forEach(r => console.log(`  ${r.name}: ${r.new}`));
  }

  // Save results
  const fs = require('fs');
  fs.writeFileSync('wrong-email-fixes.json', JSON.stringify(replacements, null, 2));
  console.log('\nResults saved to wrong-email-fixes.json');
}

main().catch(e => console.error(e));
