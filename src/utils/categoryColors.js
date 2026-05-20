/**
 * Category badge colors for brand directory cards.
 * Keys are normalized lowercase slugs; title-case aliases included.
 */
const CATEGORY_COLORS = {
  skincare: { bg: '#FFE4E6', text: '#E11D48', border: '#FECDD3' },
  beauty: { bg: '#FCE7F3', text: '#BE185D', border: '#FBCFE8' },
  fashion: { bg: '#EDE9FE', text: '#7C3AED', border: '#DDD6FE' },
  wellness: { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' },
  fitness: { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' },
  food: { bg: '#FFEDD5', text: '#EA580C', border: '#FED7AA' },
  'food & beverage': { bg: '#FFEDD5', text: '#EA580C', border: '#FED7AA' },
  travel: { bg: '#E0E7FF', text: '#4F46E5', border: '#C7D2FE' },
  tech: { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' },
  gaming: { bg: '#E0E7FF', text: '#4338CA', border: '#C7D2FE' },
  lifestyle: { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' },
  home: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  'home & living': { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
  pet: { bg: '#FED7AA', text: '#C2410C', border: '#FDBA74' },
  baby: { bg: '#FCE7F3', text: '#DB2777', border: '#FBCFE8' },
  jewelry: { bg: '#FDF4FF', text: '#A855F7', border: '#E9D5FF' },
  haircare: { bg: '#FFE4E6', text: '#BE123C', border: '#FECDD3' },
  sustainable: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  luxury: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  activewear: { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' },
  supplements: { bg: '#D1FAE5', text: '#047857', border: '#A7F3D0' },
  'health & wellness': { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' },
  'k-beauty': { bg: '#FFE4E6', text: '#E11D48', border: '#FECDD3' },
  other: { bg: '#F4F4F4', text: '#525252', border: '#E5E5E5' },
};

const DEFAULT_COLORS = CATEGORY_COLORS.lifestyle;

import { normalizeCategory } from '../constants/brandCategories';

function normalizeCategoryKey(category) {
  return normalizeCategory(category) || '';
}

/** @returns {{ bg: string, text: string, border: string, label: string }} */
export function getCategoryColors(category) {
  const key = normalizeCategoryKey(category);
  const colors = CATEGORY_COLORS[key] || DEFAULT_COLORS;
  return { ...colors, label: category || '' };
}

/** Styled-components props helper */
export function categoryTagProps(category) {
  const { bg, text, border } = getCategoryColors(category);
  return { $bg: bg, $color: text, $border: border };
}
