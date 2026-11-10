// Countries creators can join from. Keep in sync with the backend's services/creator_country.py
// (SERVED_COUNTRIES): US, CA, GB, IE, AU, NZ, the 27 EU member states, Norway and Switzerland.
export const OTHER_COUNTRY = 'OTHER';
export const PINNED_COUNTRIES = ['US', 'GB', 'CA', 'AU'];

const NAMES = {
  US: 'United States', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia', NZ: 'New Zealand',
  IE: 'Ireland', NO: 'Norway', CH: 'Switzerland', AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria',
  HR: 'Croatia', CY: 'Cyprus', CZ: 'Czechia', DK: 'Denmark', EE: 'Estonia', FI: 'Finland',
  FR: 'France', DE: 'Germany', GR: 'Greece', HU: 'Hungary', IT: 'Italy', LV: 'Latvia',
  LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'Netherlands', PL: 'Poland', PT: 'Portugal',
  RO: 'Romania', SK: 'Slovakia', SI: 'Slovenia', ES: 'Spain', SE: 'Sweden',
};

// Extra words people type for a country ("uk", "england", "holland").
const ALIASES = {
  US: ['usa', 'america', 'united states of america'],
  GB: ['uk', 'great britain', 'britain', 'england', 'scotland', 'wales', 'northern ireland'],
  NL: ['holland', 'the netherlands'],
  CZ: ['czech republic'],
  DE: ['deutschland'],
  ES: ['espana', 'españa'],
  CH: ['schweiz', 'suisse'],
  AT: ['osterreich', 'österreich'],
};

export const flagFor = (code) => {
  const c = String(code || '').toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return '';
  return String.fromCodePoint(...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));
};

const toEntry = (code) => ({ code, name: NAMES[code], flag: flagFor(code), aliases: ALIASES[code] || [] });

// Pinned first, then alphabetical by name.
export const SERVED_COUNTRIES = [
  ...PINNED_COUNTRIES.map(toEntry),
  ...Object.keys(NAMES)
    .filter((c) => !PINNED_COUNTRIES.includes(c))
    .sort((a, b) => NAMES[a].localeCompare(NAMES[b]))
    .map(toEntry),
];

export const isServedCountry = (code) => Boolean(NAMES[String(code || '').toUpperCase()]);
export const countryName = (code) => NAMES[String(code || '').toUpperCase()] || '';

const fold = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

// Typeahead: name prefix first, then word prefix / alias / code, then substring.
export function searchCountries(query, list = SERVED_COUNTRIES) {
  const q = fold(query);
  if (!q) return list;
  const scored = [];
  list.forEach((c, i) => {
    const name = fold(c.name);
    const words = name.split(/\s+/);
    const aliases = c.aliases.map(fold);
    let score = -1;
    if (name.startsWith(q)) score = 0;
    else if (c.code.toLowerCase() === q || aliases.some((a) => a.startsWith(q))) score = 1;
    else if (words.some((w) => w.startsWith(q))) score = 2;
    else if (name.includes(q) || aliases.some((a) => a.includes(q))) score = 3;
    if (score >= 0) scored.push([score, i, c]);
  });
  return scored.sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((s) => s[2]);
}

// Time zones that pin down a country we serve (navigator.language alone says en-US for half the world).
const TZ_COUNTRY = {
  'Europe/London': 'GB', 'Europe/Belfast': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE', 'Europe/Busingen': 'DE', 'Europe/Madrid': 'ES', 'Atlantic/Canary': 'ES',
  'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT',
  'Europe/Zurich': 'CH', 'Europe/Oslo': 'NO', 'Europe/Stockholm': 'SE', 'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI', 'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO', 'Europe/Sofia': 'BG', 'Europe/Athens': 'GR', 'Europe/Zagreb': 'HR',
  'Europe/Bratislava': 'SK', 'Europe/Ljubljana': 'SI', 'Europe/Vilnius': 'LT', 'Europe/Riga': 'LV',
  'Europe/Tallinn': 'EE', 'Europe/Luxembourg': 'LU', 'Europe/Malta': 'MT', 'Asia/Nicosia': 'CY',
  'Europe/Nicosia': 'CY', 'Europe/Lisbon': 'PT', 'Atlantic/Madeira': 'PT', 'Atlantic/Azores': 'PT',
  'Pacific/Auckland': 'NZ', 'Pacific/Chatham': 'NZ',
};

// Guess the visitor's country from the browser only (no geo lookup). Returns a served code or ''.
export function detectCountry(nav = typeof navigator !== 'undefined' ? navigator : null, timeZone) {
  let tz = timeZone;
  if (tz === undefined) {
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { tz = ''; }
  }
  const langs = [];
  if (nav) {
    (nav.languages || []).forEach((l) => langs.push(l));
    if (nav.language) langs.push(nav.language);
  }
  const regionOf = (tag) => {
    const parts = String(tag || '').split(/[-_]/);
    const r = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
    return /^[A-Z]{2}$/.test(r) ? r : '';
  };
  const langRegion = langs.map(regionOf).find(Boolean) || '';

  if (TZ_COUNTRY[tz]) return TZ_COUNTRY[tz];
  if (tz.startsWith('Australia/')) return 'AU';
  if (tz.startsWith('America/')) {
    // Same zones span the US and Canada: let en-CA / fr-CA decide, otherwise the US.
    if (langRegion === 'CA') return 'CA';
    const canadian = ['Toronto', 'Vancouver', 'Edmonton', 'Winnipeg', 'Halifax', 'St_Johns', 'Regina', 'Montreal', 'Moncton', 'Whitehorse'];
    if (canadian.some((city) => tz.endsWith(city))) return 'CA';
    if (langRegion === 'US' || /^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Indiana|Kentucky|North_Dakota|Adak|Juneau|Sitka|Nome|Menominee)/.test(tz)) return 'US';
    return '';
  }
  if (tz === 'Pacific/Honolulu') return 'US';
  if (!tz && isServedCountry(langRegion)) return langRegion;
  // A time zone outside our countries: don't guess from the language.
  return '';
}

/** Admin/brand display of a creator's picked country from API fields (country_code, country_name, country_flag,
 * country_other). '' when they haven't picked one. */
export const countryLabel = (row) => {
  if (!row || !row.country_code) return '';
  if (row.country_code === OTHER_COUNTRY) return `🌐 Not listed${row.country_other ? `: ${row.country_other}` : ''}`;
  return `${row.country_flag || flagFor(row.country_code) || ''} ${row.country_name || countryName(row.country_code) || row.country_code}`.trim();
};
