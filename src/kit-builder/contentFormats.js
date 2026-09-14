export const CONTENT_FORMATS = [
  { id: 'ugc-videos', title: 'UGC videos', body: 'Reels and TikToks that feel like a friend recommended the product.' },
  { id: 'product-stills', title: 'Product stills', body: 'Clean photos for PDP, ads, and social — no studio required.' },
  { id: 'unboxings', title: 'Unboxings', body: 'First-impression content brands can post the same week.' },
  { id: 'voiceovers', title: 'Voiceovers', body: 'Talking-to-camera or VO ads brands can cut into paid.' },
  { id: 'ootd', title: 'OOTD / try-on', body: 'Outfit videos with movement, fit, and styling notes.' },
  { id: 'grwm', title: 'GRWM', body: 'Get-ready-with-me routines that put the product in real use.' },
  { id: 'vlog', title: 'Vlog / day-in-life', body: 'Soft, real usage content — not a hard sell.' },
  { id: 'tutorials', title: 'Tutorials', body: 'How-to clips brands can run as organic or ads.' },
  { id: 'reviews', title: 'Reviews', body: 'Honest talking-to-camera reviews after real wear.' },
  { id: 'testimonials', title: 'Testimonials', body: 'Short brand-story pieces for ads and social proof.' },
  { id: 'haul', title: 'Hauls', body: 'Multi-product clips that still feel like a friend sharing finds.' },
  { id: 'routine', title: 'Routines', body: 'AM/PM or workout routines with the product in real lighting.' },
  { id: 'lookbook', title: 'Lookbook stills', body: 'Editorial photos brands can use on site and social.' },
  { id: 'talking-head', title: 'Talking-head', body: 'Direct-to-camera pieces for ads, PDP, and organic.' },
];

export const DEFAULT_FORMAT_IDS = ['ugc-videos', 'product-stills', 'unboxings'];

export function servicesFromFormatIds(ids) {
  const wanted = new Set((ids || []).filter(Boolean));
  return CONTENT_FORMATS
    .filter((item) => wanted.has(item.id))
    .map((item) => ({ id: item.id, title: item.title, body: item.body }));
}

export function formatIdsFromServices(services) {
  const rows = Array.isArray(services) ? services : [];
  const fromId = rows.map((row) => row?.id).filter(Boolean);
  if (fromId.length) return fromId.filter((id) => CONTENT_FORMATS.some((item) => item.id === id));
  const titles = new Set(rows.map((row) => String(row?.title || '').toLowerCase()));
  const matched = CONTENT_FORMATS.filter((item) => titles.has(item.title.toLowerCase())).map((item) => item.id);
  return matched.length ? matched : [...DEFAULT_FORMAT_IDS];
}
