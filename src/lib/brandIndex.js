const BRAND_INDEX_API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.newcollab.co'}/api/public/brand-index`;

export const BRAND_LETTERS = [...'abcdefghijklmnopqrstuvwxyz', '0-9'];

export function brandLetter(name) {
  const first = (name || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .charAt(0)
    .toLowerCase();
  return /[a-z]/.test(first) ? first : '0-9';
}

export function letterLabel(letter) {
  return letter === '0-9' ? '0–9' : letter.toUpperCase();
}

/**
 * Every indexable brand ({ slug, name, category, updatedAt }), using the same
 * rule as the brand page robots tag. Returns null when the API is unavailable.
 */
export async function fetchBrandIndex({ revalidate = 3600, timeoutMs = 12000 } = {}) {
  try {
    const res = await fetch(BRAND_INDEX_API, {
      headers: { Accept: 'application/json', Origin: 'https://newcollab.co' },
      next: { revalidate },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.brands) ? data.brands : null;
  } catch (err) {
    console.error('[brandIndex] fetch failed:', err);
    return null;
  }
}
