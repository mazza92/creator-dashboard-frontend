// "<category> brands looking for UGC creators": one page per category with 10+ brands that show a real UGC signal
// (backend GET /api/public/ugc-brands). Tips are general advice for the category, never claims about a brand.

export const HUB_BASE = '/brands-looking-for-ugc-creators';
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.newcollab.co';
export const MIN_BRANDS = 10;

export const HUBS = [
  { slug: 'beauty', label: 'Beauty', directory: '/directory/beauty',
    tip: 'Beauty brands buy before-and-after and get-ready-with-me videos. Show the product on your skin in natural light and keep the first two seconds on the result.' },
  { slug: 'skincare', label: 'Skincare', directory: '/directory/skincare',
    tip: 'Skincare brands want texture shots, a first-use reaction and an honest routine. Avoid medical claims; describe what you saw and felt.' },
  { slug: 'supplements', label: 'Supplements', directory: '/directory',
    tip: 'Supplement brands run a lot of routine and “day in my life” ads. Show where it fits in your day; never promise health results.' },
  { slug: 'fashion', label: 'Fashion', directory: '/directory/fashion',
    tip: 'Fashion brands buy try-ons, styling three ways and fit-and-fabric close-ups. Mention your size and height so viewers can judge the fit.' },
  { slug: 'wellness', label: 'Wellness', directory: '/directory/wellness',
    tip: 'Wellness brands want calm, believable routines. Film the ritual, not a transformation, and keep claims to your own experience.' },
  { slug: 'food', label: 'Food & drink', directory: '/directory',
    tip: 'Food and drink brands buy taste-test reactions, quick recipes and unboxing. Get a close-up of the first bite or sip in the first three seconds.' },
  { slug: 'haircare', label: 'Haircare', directory: '/directory',
    tip: 'Haircare brands want wash-day routines and before-and-after styling. Film both sides in the same light so the result is credible.' },
  { slug: 'home', label: 'Home', directory: '/directory',
    tip: 'Home brands buy setup, organisation and “room refresh” videos. Show the space before, the product in use, then the finished room.' },
  { slug: 'jewelry', label: 'Jewelry', directory: '/directory',
    tip: 'Jewelry brands want close-up, well-lit detail shots and stacking ideas. Natural window light and a steady hand matter more than the camera.' },
];

export function getHub(slug) {
  return HUBS.find((h) => h.slug === slug) || null;
}

export async function fetchHub(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/public/ugc-brands?category=${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchHubIndex() {
  try {
    const res = await fetch(`${API_BASE}/api/public/ugc-brands`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
