/**
 * Canonical brand categories — keep in sync with creator_dashboard/brand_categories.py
 */
export const CANONICAL_CATEGORIES = [
  'skincare',
  'beauty',
  'fashion',
  'wellness',
  'fitness',
  'food',
  'travel',
  'tech',
  'gaming',
  'lifestyle',
  'home',
  'pet',
  'baby',
  'jewelry',
  'haircare',
  'sustainable',
  'luxury',
  'activewear',
  'supplements',
  'other',
];

export const CATEGORY_ALIASES = {
  pets: 'pet',
  'pet products': 'pet',
  'food-beverage': 'food',
  'food & beverage': 'food',
  'food and beverage': 'food',
  accessories: 'fashion',
  'k-beauty': 'skincare',
  kbeauty: 'skincare',
  'k beauty': 'skincare',
  makeup: 'beauty',
  health: 'wellness',
  'health & wellness': 'wellness',
  'home & living': 'home',
  sportswear: 'activewear',
  sports: 'fitness',
  nutrition: 'supplements',
  jewellery: 'jewelry',
};

export const CATEGORY_LABELS = {
  skincare: 'Skincare',
  beauty: 'Beauty',
  fashion: 'Fashion',
  wellness: 'Wellness',
  fitness: 'Fitness',
  food: 'Food & Beverage',
  travel: 'Travel',
  tech: 'Tech',
  gaming: 'Gaming',
  lifestyle: 'Lifestyle',
  home: 'Home & Living',
  pet: 'Pet',
  baby: 'Baby & Parenting',
  jewelry: 'Jewelry',
  haircare: 'Haircare',
  sustainable: 'Sustainable',
  luxury: 'Luxury',
  activewear: 'Activewear',
  supplements: 'Supplements',
  other: 'Other',
};

/** Niche picker options — keep in sync with CreatorOnboarding.js */
export const NICHE_OPTIONS = [
  { id: 'beauty', label: '💄 Beauty' },
  { id: 'skincare', label: '🧴 Skincare' },
  { id: 'haircare', label: '💇 Haircare' },
  { id: 'fashion', label: '👗 Fashion' },
  { id: 'jewelry', label: '💍 Jewelry' },
  { id: 'activewear', label: '🏃 Activewear' },
  { id: 'fitness', label: '💪 Fitness' },
  { id: 'wellness', label: '🌿 Wellness' },
  { id: 'supplements', label: '💊 Supplements' },
  { id: 'food', label: '🍽️ Food & Beverage' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'lifestyle', label: '🏠 Lifestyle' },
  { id: 'home', label: '🏡 Home & Living' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'gaming', label: '🎮 Gaming' },
  { id: 'pet', label: '🐾 Pet' },
  { id: 'baby', label: '🍼 Baby & Parenting' },
  { id: 'sustainable', label: '♻️ Sustainable' },
  { id: 'luxury', label: '✨ Luxury' },
];

function slugKey(raw) {
  if (raw == null) return '';
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\s*&\s*/g, ' & ');
}

export function normalizeCategory(raw) {
  const key = slugKey(raw);
  if (!key) return null;
  if (CANONICAL_CATEGORIES.includes(key)) return key;
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key];
  const keyHyp = key.replace(/ /g, '-');
  if (CANONICAL_CATEGORIES.includes(keyHyp)) return keyHyp;
  if (CATEGORY_ALIASES[keyHyp]) return CATEGORY_ALIASES[keyHyp];
  return 'other';
}

export function categoryLabel(slug) {
  const canon = normalizeCategory(slug) || slug;
  return CATEGORY_LABELS[canon] || canon.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const CATEGORY_OPTIONS = CANONICAL_CATEGORIES.map((value) => ({
  value,
  label: categoryLabel(value),
}));
