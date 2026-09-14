import { useEffect } from 'react';

export const FONT_PAIRS = [
  {
    id: 'playfair',
    name: 'Editorial',
    sample: 'Playfair',
    headline: '"Playfair Display", Georgia, serif',
    body: 'Karla, ui-sans-serif, system-ui, sans-serif',
    headlineItalic: true,
    headlineWeight: 500,
    href: 'https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap',
  },
  {
    id: 'cormorant',
    name: 'Garamond',
    sample: 'Cormorant',
    headline: '"Cormorant Garamond", Palatino, serif',
    body: '"Nunito Sans", ui-sans-serif, system-ui, sans-serif',
    headlineItalic: true,
    headlineWeight: 600,
    href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Nunito+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap',
  },
  {
    id: 'fraunces',
    name: 'Warm',
    sample: 'Fraunces',
    headline: 'Fraunces, Georgia, serif',
    body: 'Outfit, ui-sans-serif, system-ui, sans-serif',
    headlineItalic: false,
    headlineWeight: 600,
    href: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Outfit:wght@400;500;600;700&display=swap',
  },
  {
    id: 'instrument',
    name: 'Ink',
    sample: 'Instrument',
    headline: '"Instrument Serif", Georgia, serif',
    body: 'Inter, ui-sans-serif, system-ui, sans-serif',
    headlineItalic: true,
    headlineWeight: 400,
    href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap',
  },
  {
    id: 'syne',
    name: 'Studio',
    sample: 'Syne',
    headline: 'Syne, ui-sans-serif, system-ui, sans-serif',
    body: 'Inter, ui-sans-serif, system-ui, sans-serif',
    headlineItalic: false,
    headlineWeight: 800,
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@500;600;700;800&display=swap',
  },
];

export const LOOKS = [
  {
    id: 'ivory',
    name: 'Ivory',
    bg: '#F3EEE6',
    surface: '#FFFBF6',
    ink: '#1A1612',
    muted: '#7C7368',
    line: '#E6DCCE',
    accent: '#C45C3A',
    overlay: 'linear-gradient(180deg, rgba(26,22,18,.12) 0%, rgba(26,22,18,.58) 100%)',
    radius: 20,
  },
  {
    id: 'blush',
    name: 'Blush',
    bg: '#F4EBE7',
    surface: '#FFF7F4',
    ink: '#2A1818',
    muted: '#8A6E6C',
    line: '#E7D6D1',
    accent: '#B85C62',
    overlay: 'linear-gradient(180deg, rgba(42,24,24,.10) 0%, rgba(42,24,24,.52) 100%)',
    radius: 24,
  },
  {
    id: 'ink',
    name: 'Noir',
    bg: '#0C0C0C',
    surface: '#161616',
    ink: '#F4EFE8',
    muted: '#9A9188',
    line: '#2A2A2A',
    accent: '#E8C9A8',
    overlay: 'linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,.66) 100%)',
    radius: 8,
  },
  {
    id: 'gallery',
    name: 'Chrome',
    bg: '#F4F4F2',
    surface: '#FFFFFF',
    ink: '#111111',
    muted: '#6A6A66',
    line: '#E6E6E2',
    accent: '#111111',
    overlay: 'linear-gradient(180deg, rgba(17,17,17,.08) 0%, rgba(17,17,17,.50) 100%)',
    radius: 4,
  },
  {
    id: 'sage',
    name: 'Moss',
    bg: '#ECE8DC',
    surface: '#F7F4EA',
    ink: '#1C2118',
    muted: '#6B7264',
    line: '#D9D4C6',
    accent: '#5C6B4A',
    overlay: 'linear-gradient(180deg, rgba(28,33,24,.12) 0%, rgba(28,33,24,.52) 100%)',
    radius: 16,
  },
];

export const ACCENTS = ['#C45C3A', '#B85C62', '#5C6B4A', '#1F3A5F', '#111111', '#B45309', '#6D28D9', '#BE185D'];

// Unsplash License (https://unsplash.com/license) — free to use.
// Objective aesthetic backgrounds only: textures, nature, abstracts. No portraits.
export const COVER_SAMPLES = [
  { id: 'plaster', label: 'Plaster', url: 'https://images.unsplash.com/photo-1604147706283-d7119b5b822c?auto=format&fit=crop&w=2000&q=80' },
  { id: 'wave', label: 'Silk', url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=2000&q=80' },
  { id: 'mesh', label: 'Mesh', url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=2000&q=80' },
  { id: 'bloom', label: 'Bloom', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2000&q=80' },
  { id: 'botanical', label: 'Leaves', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=2000&q=80' },
  { id: 'sand', label: 'Sand', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80' },
  { id: 'canopy', label: 'Canopy', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80' },
  { id: 'dusk', label: 'Dusk', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=80' },
];

export const EXAMPLE_SLOTS = 24;

export const NICHE_SERVICES = {
  beauty: [
    { title: 'UGC videos', body: 'Reels and TikToks that feel like a friend recommended the product.' },
    { title: 'Product stills', body: 'Clean photos for PDP, ads, and social — no studio required.' },
    { title: 'Unboxings', body: 'First-impression content brands can post the same week.' },
  ],
  skincare: [
    { title: 'Routine videos', body: 'Honest AM/PM routines with the product in real lighting.' },
    { title: 'Texture close-ups', body: 'Stills that show finish, wear, and skin — not just the bottle.' },
    { title: 'Testimonials', body: 'Talking-to-camera reviews brands can cut into ads.' },
  ],
  fashion: [
    { title: 'Try-on content', body: 'Outfit videos with movement, fit, and styling notes.' },
    { title: 'Lookbook stills', body: 'Editorial photos brands can use on site and social.' },
    { title: 'Styling videos', body: 'How to wear it three ways — the content that converts.' },
  ],
  food: [
    { title: 'Recipe videos', body: 'Simple, scroll-stopping clips of the product in a real kitchen.' },
    { title: 'Table stills', body: 'Appetising photos for menus, packs, and ads.' },
    { title: 'Taste tests', body: 'Honest first bites brands can run as UGC ads.' },
  ],
  fitness: [
    { title: 'Workout clips', body: 'Product-in-use videos that look like a real session.' },
    { title: 'Routine stills', body: 'Clean photos of kit, outfits, and recovery.' },
    { title: 'Reviews', body: 'What actually changed after two weeks of use.' },
  ],
  wellness: [
    { title: 'Day-in-life', body: 'Soft, real usage content — not a hard sell.' },
    { title: 'Product photos', body: 'Calm stills for site, Amazon, and social.' },
    { title: 'Ritual videos', body: 'How it fits into a morning or evening routine.' },
  ],
  lifestyle: [
    { title: 'UGC videos', body: 'Everyday usage that still looks considered.' },
    { title: 'Lifestyle photos', body: 'Home, desk, and out-the-door stills.' },
    { title: 'Brand stories', body: 'Short talking-to-camera pieces for ads and organic.' },
  ],
};

export const DEFAULT_THEME = {
  look: 'ivory',
  font: 'playfair',
  accent: '',
  cover_url: COVER_SAMPLES[0].url,
  display_name: '',
  headline: '',
  about: '',
  location: '',
  email: '',
  services: [],
  examples: [],
  brand_logos: [],
};

export const BRAND_LOGO_SLOTS = 8;

export function getLook(id) {
  return LOOKS.find((item) => item.id === id) || LOOKS[0];
}

export function getFont(id) {
  return FONT_PAIRS.find((item) => item.id === id) || FONT_PAIRS[0];
}

export function servicesForNiche(niche) {
  const key = String(niche || 'lifestyle').toLowerCase();
  return NICHE_SERVICES[key] || NICHE_SERVICES.lifestyle;
}

export function accentOnColor(hex) {
  const raw = String(hex || '').replace('#', '');
  if (raw.length !== 6) return '#fff';
  const n = parseInt(raw, 16);
  if (Number.isNaN(n)) return '#fff';
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return l > 0.62 ? '#14110E' : '#fff';
}

const EXAMPLE_HOSTS = [
  'instagram.com',
  'instagr.am',
  'tiktok.com',
  'youtube.com',
  'youtu.be',
  'youtube-nocookie.com',
];

export function sanitizeExampleUrl(raw) {
  let url = String(raw || '').trim().slice(0, 300);
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const parsed = new URL(url);
    if (!/^https?:$/i.test(parsed.protocol)) return '';
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    if (!EXAMPLE_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

export function exampleItemUrl(item) {
  if (typeof item === 'string') return sanitizeExampleUrl(item);
  if (item && typeof item === 'object') return sanitizeExampleUrl(item.url || item.post_url);
  return '';
}

function exampleDedupeKey(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase();
    const tiktokId = (path.match(/\/video\/(\d+)/) || [])[1];
    if (host.endsWith('tiktok.com') && tiktokId) return `tiktok:${tiktokId}`;
    const igCode = (path.match(/\/(?:p|reel|reels|tv)\/([^/]+)/) || [])[1];
    if ((host.endsWith('instagram.com') || host === 'instagr.am') && igCode) return `instagram:${igCode}`;
    const youtubeId = parsed.searchParams.get('v') || (path.match(/\/(?:embed|shorts|live)\/([^/]+)/) || [])[1]
      || (host === 'youtu.be' ? path.replace(/^\//, '').split('/')[0] : '');
    if ((host.endsWith('youtube.com') || host === 'youtu.be' || host.endsWith('youtube-nocookie.com')) && youtubeId) {
      return `youtube:${youtubeId}`;
    }
    return `${host}${path}`;
  } catch {
    return String(url || '').toLowerCase();
  }
}

export function normalizeExamplePosts(raw) {
  const rows = Array.isArray(raw) ? raw : [];
  const seen = new Map();
  rows.forEach((item) => {
    const url = exampleItemUrl(item);
    if (!url) return;
    const key = exampleDedupeKey(url);
    const src = item && typeof item === 'object' ? item : {};
    const next = {
      url,
      title: String(src.title || '').slice(0, 80),
      description: String(src.description || src.body || '').slice(0, 200),
    };
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, next);
      return;
    }
    if (!existing.title && next.title) existing.title = next.title;
    if (!existing.description && next.description) existing.description = next.description;
  });
  return Array.from(seen.values()).slice(0, EXAMPLE_SLOTS);
}

export function normalizeExamples(raw) {
  return normalizeExamplePosts(raw).map((row) => row.url);
}

export function sanitizeLogoUrl(raw) {
  let url = String(raw || '').trim().slice(0, 500);
  if (!url) return '';
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const parsed = new URL(url);
    if (!/^https?:$/i.test(parsed.protocol)) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

export function normalizeSocialProfiles(raw, fallback = {}) {
  const allowed = ['instagram', 'tiktok', 'youtube'];
  const seen = new Set();
  const out = [];
  (Array.isArray(raw) ? raw : []).forEach((item) => {
    const platform = String(item?.platform || '').toLowerCase();
    if (!allowed.includes(platform) || seen.has(platform)) return;
    const handle = String(item?.handle || '').replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 40);
    if (!handle) return;
    seen.add(platform);
    const followers = String(item?.followers ?? '').replace(/[^\d]/g, '').slice(0, 10);
    const url = platform === 'tiktok'
      ? `https://tiktok.com/@${handle}`
      : platform === 'youtube'
        ? `https://youtube.com/@${handle}`
        : `https://instagram.com/${handle}`;
    out.push({ platform, handle, followers, url });
  });
  if (!out.length) {
    const platform = allowed.includes(String(fallback.social_platform || '').toLowerCase())
      ? String(fallback.social_platform).toLowerCase()
      : '';
    const handle = String(fallback.social_handle || fallback.handle || '').replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 40);
    if (handle && platform) {
      const followers = String(fallback.followers || '').replace(/[^\d]/g, '').slice(0, 10);
      const url = platform === 'tiktok'
        ? `https://tiktok.com/@${handle}`
        : platform === 'youtube'
          ? `https://youtube.com/@${handle}`
          : `https://instagram.com/${handle}`;
      out.push({ platform, handle, followers, url });
    }
  }
  return out.slice(0, 3);
}

export function normalizeBrandLogos(raw) {
  const rows = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  const out = [];
  rows.forEach((item) => {
    const src = item && typeof item === 'object' ? item : { logo_url: item };
    const logo_url = sanitizeLogoUrl(src.logo_url || src.url);
    if (!logo_url || seen.has(logo_url)) return;
    seen.add(logo_url);
    out.push({
      name: String(src.name || '').slice(0, 40),
      logo_url,
    });
  });
  return out.slice(0, 12);
}

export function normalizeKitTheme(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const look = LOOKS.some((item) => item.id === src.look) ? src.look : DEFAULT_THEME.look;
  const font = FONT_PAIRS.some((item) => item.id === src.font) ? src.font : DEFAULT_THEME.font;
  const accent = /^#[0-9A-Fa-f]{6}$/.test(String(src.accent || '')) ? src.accent : '';
  const cover = String(src.cover_url || '').trim().slice(0, 500);
  const services = Array.isArray(src.services)
    ? src.services.slice(0, 12).map((row) => ({
      id: String(row?.id || '').slice(0, 32),
      title: String(row?.title || '').slice(0, 48),
      body: String(row?.body || '').slice(0, 160),
    })).filter((row) => row.title)
    : [];
  const email = String(src.email || '').trim().slice(0, 120);
  const examplePosts = normalizeExamplePosts([
    ...(Array.isArray(src.example_posts) ? src.example_posts : []),
    ...(Array.isArray(src.examples) ? src.examples : []),
  ]);
  const social_profiles = normalizeSocialProfiles(src.social_profiles, src);
  const social_handle = social_profiles[0]?.handle
    || String(src.social_handle || src.handle || '').replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 40);
  const social_platform = social_profiles[0]?.platform
    || (['instagram', 'tiktok', 'youtube'].includes(String(src.social_platform || '').toLowerCase())
      ? String(src.social_platform).toLowerCase()
      : '');
  return {
    look,
    font,
    accent,
    cover_url: cover,
    display_name: String(src.display_name || '').slice(0, 80),
    headline: String(src.headline || '').slice(0, 140),
    about: String(src.about || '').slice(0, 600),
    location: String(src.location || '').slice(0, 80),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '',
    social_platform,
    social_handle,
    social_profiles,
    services,
    examples: examplePosts.map((row) => row.url),
    example_posts: examplePosts,
    brand_logos: normalizeBrandLogos(src.brand_logos),
  };
}

export function resolveThemeTokens(theme) {
  const look = getLook(theme.look);
  const font = getFont(theme.font);
  const accent = theme.accent || look.accent;
  return {
    ...look,
    accent,
    accentInk: accentOnColor(accent),
    headlineFont: font.headline,
    bodyFont: font.body,
    headlineItalic: !!font.headlineItalic,
    headlineWeight: font.headlineWeight || 500,
    fontHref: font.href,
  };
}

function ensureFontLink(font) {
  if (typeof document === 'undefined') return;
  const id = `kit-font-${font.id}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = font.href;
  document.head.appendChild(link);
}

export function useKitFonts(fontId) {
  useEffect(() => {
    FONT_PAIRS.forEach(ensureFontLink);
    const font = getFont(fontId);
    ensureFontLink(font);
  }, [fontId]);
}
