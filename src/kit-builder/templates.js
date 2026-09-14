export const KIT_LAYOUTS = [
  {
    id: 'maison',
    name: 'Personal site',
    blurb: 'Photo hero, about, work, packages.',
  },
  {
    id: 'gallery',
    name: 'Gallery',
    blurb: 'Work first. Best when the footage is the sell.',
  },
  {
    id: 'ratecard',
    name: 'Packages',
    blurb: 'Offers up top, then the work.',
  },
];

export const DEFAULT_KIT_LAYOUT = 'maison';

const LAYOUT_ALIASES = {
  editorial: 'maison',
  studio: 'gallery',
  maison: 'maison',
  gallery: 'gallery',
  ratecard: 'ratecard',
};

export function normalizeKitLayout(raw) {
  const id = String(raw || '').toLowerCase().trim();
  return LAYOUT_ALIASES[id] || DEFAULT_KIT_LAYOUT;
}
