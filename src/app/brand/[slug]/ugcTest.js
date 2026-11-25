// PR → UGC framing test (Nov 24 2026). 83% of brand-PR search clicks came from India and Pakistan, while our buyers
// are beauty/skincare UGC creators in the US, CA and AU. These 60 brand pages (most pitched by US/CA/AU creators in
// the last 90 days) are framed for UGC creators: title, description, heading, the answer box, FAQ and labels.
// Every other brand page is unchanged and serves as the control. To revert, empty UGC_TEST_SLUGS.
// Check in Search Console ~Dec 22: US/CA/AU clicks and impressions on these pages vs the control.

export const UGC_TEST_SLUGS = new Set([
  'anua', 'elf-cosmetics', 'rhode-skin', 'sephora', 'mac-cosmetics', 'clinique', 'sol-de-janeiro', 'skin1004',
  'good-molecules', 'e-l-f-beauty', 'rare-beauty-by-selena-gomez', 'summer-fridays', 'charlotte-tilbury',
  'glow-recipe', 'milani-cosmetics', 'activeskin', 'belif', 'kylie-cosmetics', 'merit-beauty', 'tarte-cosmetics',
  'gucci', 'youth-to-the-people', 'peach-lily', 'nail-pop', 'morphe', 'huda-beauty', 'nyx-professional-makeup',
  'tower-28', 'pure-cosmetics', 'caudalie', 'ilia-beauty', 'colourpop', 'cosrx-official', 'naturium', 'rms-beauty',
  'drunk-elephant-skincare', 'gisou-eu', 'dove', 'pacifica-beauty', 'terra-beauty-bars', 'cerave-skincare',
  'drunk-elephant', 'trees-hugs', 'milk-makeup', 'peta-jane-beauty', 'bare-minerals', 'tilt-beauty', 'etude',
  'bubble-skincare', 'lancome', 'bybi-beauty', 'nuda', 'aniise', 'nopalera', 'p-louise-cosmetics', 'torriden',
  'l-oreal', 'fenty-beauty', 'love-lashes-london', 'supergoop',
  // Added Nov 25 2026 (outside the original 60): the page drew mostly India/Pakistan PR-search traffic.
  'nivea',
]);

export function isUgcTest(slug) {
  return UGC_TEST_SLUGS.has(String(slug || ''));
}

const NAME_FIX = {
  'e-l-f-beauty': 'e.l.f. Beauty', 'cosrx-official': 'COSRX', 'gisou-eu': 'Gisou', 'cerave-skincare': 'CeraVe',
  'drunk-elephant-skincare': 'Drunk Elephant', 'rare-beauty-by-selena-gomez': 'Rare Beauty', 'nuda': 'NUDA',
};

// The name searchers type: no market suffixes like "(US)" or "EU".
export function searchName(brand) {
  if (NAME_FIX[brand.slug]) return NAME_FIX[brand.slug];
  return String(brand.name || '').replace(/\s*\((US|UK|EU|AU|CA)\)\s*$/i, '').replace(/\s+(EU|UK|US)$/, '').trim();
}

export function ugcTitle(brand) {
  const n = searchName(brand);
  const options = [
    `${n} UGC Creator Collabs: How to Pitch ${n}`,
    `${n} UGC Creator Collabs (2026)`,
    `${n} UGC Collabs`,
  ];
  return options.find((t) => t.length <= 60) || options[options.length - 1];
}

export function ugcDescription(brand) {
  const n = searchName(brand);
  return `How UGC creators land ${n} collabs in 2026: what ${n} looks for, who to contact, and a pitch `
    + 'Polly writes for you. Free to start.';
}

const SWAPS = [
  [/\bopen PR applications\b/g, 'open creator programmes'],
  [/\bPR packages\b/g, 'gifted packages'],
  [/\bPR package\b/g, 'gifted package'],
  [/\bPR list\b/g, 'creator list'],
  [/\bPR team\b/g, 'creator partnerships team'],
  [/\bPR form\b/g, 'creator application form'],
  [/\bPR Contact Email\b/g, 'Creator Contact Email'],
  [/\bAccepting PR\b/g, 'Working with creators'],
];

// Reframes PR wording for UGC creators on test pages; identity everywhere else.
export function ugcWording(text, on) {
  if (!on || typeof text !== 'string') return text;
  return SWAPS.reduce((s, [re, to]) => s.replace(re, to), text);
}
