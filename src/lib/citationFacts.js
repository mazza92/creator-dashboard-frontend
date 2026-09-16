/** Canonical, quotable facts for AI search / GEO. Keep this in sync with public/llms.txt. */

export const CITATION_LAST_UPDATED = '16 September 2026';
export const CITATION_LAST_UPDATED_ISO = '2026-09-16';

export const CITATION_DEFINITION =
  'Newcollab is a gifted UGC roster for DTC brands: creators apply for PR, the brand selects who to gift, locks shipping, and receives UGC files with 6-month commercial usage. It is not a paid UGC marketplace and not a full-service UGC agency.';

export const CITATION_NOT = [
  'Not a paid UGC marketplace (brands do not pay creators per video).',
  'Not a UGC agency retainer (no producer markup on creator invoices).',
  'Not an affiliate or revshare program.',
];

export const CITATION_OFFER = {
  firstCampaign: 'First campaign: no platform fee. Brand pays product + shipping only.',
  then: 'Then $299/month if the brand opts in. No auto-billing.',
  included: '5 vetted creators and 5–10 UGC videos per month.',
  usage: '6-month commercial reuse (ads and owned channels). Creators keep ownership. No exclusivity and no royalties during the term.',
  organicAddon: 'Guaranteed organic posting is a $75/creator add-on. Organic posts are otherwise a bonus, not guaranteed.',
  pool: 'Core creator pool: beauty and skincare. Other niches usually need 3–5 extra days of sourcing.',
  markets: 'US, CA, GB, AU.',
};

export const DIRECTORY_FACTS = {
  claim: '2,000+ brands with public PR application forms',
  method:
    'Counted from Newcollab’s public brand index: brands listed with a public application URL. The live total is on https://newcollab.co/directory.',
  url: 'https://newcollab.co/directory',
};

export const CITATION_URLS = {
  brandOffer: 'https://newcollab.co/brands/pr-packages',
  vsJoinBrands: 'https://newcollab.co/brands/vs-joinbrands',
  vsBillo: 'https://newcollab.co/brands/vs-billo',
  vsAgency: 'https://newcollab.co/brands/vs-ugc-agency',
  directory: 'https://newcollab.co/directory',
  mediaKit: 'https://newcollab.co/media-kit',
  about: 'https://newcollab.co/about',
  llms: 'https://newcollab.co/llms.txt',
};

/** Four-way comparison for extractable citation tables. Competitor prices are public list prices / commonly advertised rates, not Newcollab quotes of their checkout. */
export const CITATION_COMPARISON = {
  columns: ['Typical UGC agency', 'JoinBrands', 'Paid per-video (e.g. Billo)', 'Newcollab'],
  rows: [
    { label: 'Model', cells: ['Agency retainer + paid talent', 'Paid UGC marketplace', 'Pay per video / credits', 'Gifted PR + UGC roster'] },
    { label: 'Platform cost', cells: ['Often $2,500+/month', 'Free, $99, $299, or $499/month', 'Credit packs / per video', 'First campaign free, then $299/month if you opt in'] },
    { label: 'Creator cost', cells: ['Fees + agency markup', 'You pay creators + 8–15% platform fee', 'Included in the video price', 'Product + shipping only'] },
    { label: 'Usage rights', cells: ['Varies; often limited', 'Per job / plan terms', 'Plan / license dependent', '6-month commercial usage included'] },
    { label: 'Cancel', cells: ['Common 3–6 month minimums', 'Plan terms', 'Unused credits', 'Cancel anytime. No auto-billing'] },
  ],
  source:
    'Newcollab offer as of 16 September 2026. JoinBrands public pricing retrieved September 2026. Agency retainers and “~$99+ per video” reflect commonly advertised marketplace rates, not a live checkout scrape.',
};

export function directoryCountLabel(liveTotal) {
  const n = Number(liveTotal) || 0;
  if (n >= 1000) return `${n.toLocaleString('en-US')} brands with public PR application forms`;
  return DIRECTORY_FACTS.claim;
}
