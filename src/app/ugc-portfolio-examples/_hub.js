// Shared data + copy for /ugc-portfolio-examples and /ugc-portfolio-examples/[hub].
// Creators come from the backend quality pool (approved in the last 30 days,
// posts on their kit, 500-50K followers): GET /api/public/ugc-portfolios.

export const SITE = 'https://newcollab.co';
const API = 'https://api.newcollab.co/api/public/ugc-portfolios';

// A hub page is indexed only with enough real portfolios to be useful.
export const MIN_INDEXABLE = 6;

export const HUB_COPY = {
  'beauty-skincare': {
    label: 'Beauty & skincare',
    intro: 'Beauty and skincare UGC sells on texture, application and honest first impressions. These portfolios show close-up product shots, routines and talking-head reviews brands can run as ads.',
  },
  fashion: {
    label: 'Fashion & accessories',
    intro: 'Fashion UGC is about fit, styling and movement: try-ons, outfit transitions and detail shots. These portfolios show how each creator styles a piece on camera.',
  },
  'fitness-wellness': {
    label: 'Fitness & wellness',
    intro: 'Fitness and wellness brands buy UGC that shows the product inside a real routine: workouts, supplements, sleep and self-care. These portfolios show that in practice.',
  },
  'food-drink': {
    label: 'Food & drink',
    intro: 'Food and drink UGC lives on the first bite or sip: unboxing, cooking, taste reactions and recipe ideas. These portfolios show creators who film food well.',
  },
  'home-lifestyle': {
    label: 'Home & lifestyle',
    intro: 'Home and lifestyle UGC shows the product in a believable home: before and after, cleaning, organising and everyday routines.',
  },
  'family-parenting': {
    label: 'Family & parenting',
    intro: 'Family and parenting brands want UGC that feels like a real day with kids: routines, problem/solution demos and honest reviews from parents.',
  },
  pets: {
    label: 'Pets',
    intro: 'Pet UGC works when the animal is the star: first reactions, daily routines and before/after results that pet owners trust.',
  },
  'tech-gaming': {
    label: 'Tech & gaming',
    intro: 'Tech and gaming UGC needs clear demos: setup, features in use and honest comparisons, filmed so the product is easy to see on a phone screen.',
  },
};

export async function fetchHub(hub) {
  try {
    const url = hub ? `${API}?hub=${encodeURIComponent(hub)}` : API;
    const res = await fetch(url, {
      headers: { Accept: 'application/json', Origin: SITE },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { hubs: [], creators: [], total: 0 };
    return await res.json();
  } catch {
    return { hubs: [], creators: [], total: 0 };
  }
}

export function itemListSchema(name, url, creators) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: creators.length,
      itemListElement: creators.slice(0, 50).map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: c.url,
        name: `@${c.handle} UGC portfolio`,
      })),
    },
  };
}
