/**
 * Brand reply stats. In-app surfaces use resolveRealBrandStats (real only; the
 * API sends null when a brand has too few real pitches and callers hide the stat).
 *
 * Public SEO brand pages keep their stats cards via resolveBrandStats, which
 * fills gaps with deterministic per-slug values by vertical. Mirrors
 * public_brand_stats in creator_dashboard/brand_stats_synthesis.py.
 */

function positive(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** @returns {{ responseRate: number|null, avgResponseTime: number|null, totalPitches: number, totalResponses: number }} */
export function resolveRealBrandStats({
  responseRate,
  avgResponseTime,
  totalPitches,
  totalResponses,
}) {
  return {
    responseRate: positive(responseRate),
    avgResponseTime: positive(avgResponseTime),
    totalPitches: Number(totalPitches) || 0,
    totalResponses: Number(totalResponses) || 0,
  };
}

const CATEGORY_STATS = {
  beauty: [32, 47, 4, 8],
  skincare: [35, 52, 3, 7],
  haircare: [33, 48, 4, 7],
  fashion: [28, 42, 5, 10],
  luxury: [24, 38, 6, 12],
  activewear: [30, 44, 5, 9],
  fitness: [34, 49, 3, 6],
  wellness: [36, 50, 4, 7],
  supplements: [32, 46, 4, 8],
  food: [38, 55, 3, 6],
  tech: [22, 36, 6, 11],
  gaming: [20, 34, 7, 12],
  lifestyle: [30, 44, 4, 8],
  home: [28, 40, 5, 9],
  pet: [35, 50, 3, 7],
  baby: [33, 47, 4, 8],
  jewelry: [26, 40, 5, 10],
  travel: [29, 43, 5, 9],
  sustainable: [31, 45, 4, 8],
  'k-beauty': [37, 52, 3, 6],
  other: [28, 42, 4, 9],
};

function normalizeCategory(category) {
  if (!category) return 'lifestyle';
  const c = String(category).toLowerCase().trim();
  if (c.includes('k-beauty') || c.includes('kbeauty')) return 'k-beauty';
  if (c.includes('wellness')) return 'wellness';
  if (c.includes('food') || c.includes('beverage')) return 'food';
  const first = c.split(/[\s_-]+/)[0];
  return CATEGORY_STATS[first] ? first : 'lifestyle';
}

function seededInt(slug, salt, lo, hi) {
  const s = `${slug}:${salt}`;
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return lo + (h % (hi - lo + 1));
}

/** Public brand pages only. @returns {{ responseRate: number, avgResponseTime: number, totalPitches: number, totalResponses: number }} */
export function resolveBrandStats({
  slug,
  category,
  responseRate,
  avgResponseTime,
  totalPitches,
  totalResponses,
}) {
  const key = normalizeCategory(category);
  const [rateLo, rateHi, daysLo, daysHi] = CATEGORY_STATS[key] || CATEGORY_STATS.lifestyle;
  const safeSlug = (slug || 'brand').toLowerCase();
  const rate = positive(responseRate) || seededInt(safeSlug, 'rate', rateLo, rateHi);
  const days = positive(avgResponseTime) || seededInt(safeSlug, 'days', daysLo, daysHi);

  let pitches = totalPitches || 0;
  let responses = totalResponses || 0;
  if (pitches === 0) {
    pitches = seededInt(slug || 'brand', 'pitches', 8, 64);
    responses = Math.max(1, Math.round((pitches * rate) / 100));
  }

  return {
    responseRate: rate,
    avgResponseTime: days,
    totalPitches: pitches,
    totalResponses: responses,
  };
}
