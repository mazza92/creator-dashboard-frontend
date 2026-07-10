/**
 * Find replacement emails for brands with invalid emails
 * Reads from hunter-results.json
 */

const axios = require('axios');
const fs = require('fs');

const API_BASE = 'https://api.newcollab.co';
const HUNTER_API_KEY = process.env.HUNTER_API_KEY;
const ADMIN_TOKEN = 'pr-hunter-admin-2026';

if (!HUNTER_API_KEY) {
  console.error('HUNTER_API_KEY not set');
  process.exit(1);
}

// Read invalid emails from extracted list
const invalid = JSON.parse(fs.readFileSync('invalid-emails.json', 'utf8'));

console.log('Finding replacement emails for', invalid.length, 'brands with invalid emails...\n');

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
  // First fetch all brands to get their websites
  const { data } = await axios.get(`${API_BASE}/api/admin/brands?limit=10000`, {
    headers: { 'X-Admin-Token': ADMIN_TOKEN }
  });
  const brands = data.brands || [];

  for (const inv of invalid) {
    const brand = brands.find(b => b.slug === inv.slug);
    if (!brand || !brand.website) {
      console.log(`${inv.name}: No website, skipping`);
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
      console.log(`${inv.name}: Invalid website URL`);
      notFound++;
      continue;
    }

    try {
      const email = await findEmail(domain);
      if (email && email.value !== inv.email) {
        console.log(`✅ ${inv.name}: ${inv.email} -> ${email.value} (${email.confidence}%)`);
        await updateBrand(brand.id, email.value);
        replacements.push({ name: inv.name, old: inv.email, new: email.value });
        found++;
      } else if (email && email.value === inv.email) {
        console.log(`⚠️  ${inv.name}: Same email found, no replacement available`);
        notFound++;
      } else {
        console.log(`❌ ${inv.name}: No replacement found on ${domain}`);
        notFound++;
      }
      await sleep(150);
    } catch (e) {
      console.log(`❌ ${inv.name}: Error - ${e.message}`);
      notFound++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Replacements found & updated: ${found}`);
  console.log(`No replacement available: ${notFound}`);
  console.log(`Credits used: ${creditsUsed}`);

  if (replacements.length > 0) {
    console.log('\nReplacements made:');
    replacements.forEach(r => console.log(`  ${r.name}: ${r.old} -> ${r.new}`));
  }
}

main().catch(e => console.error(e));
