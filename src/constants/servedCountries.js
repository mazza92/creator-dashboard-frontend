/** Countries Newcollab serves — keep in sync with ALLOWED_COUNTRY_NAMES in social_verification_routes.py. */
export const SERVED_COUNTRY_GROUPS = [
  {
    label: 'Most common',
    countries: [
      'United States',
      'United Kingdom',
      'Canada',
      'Australia',
      'New Zealand',
      'Ireland',
    ],
  },
  {
    label: 'Europe',
    countries: [
      'Albania',
      'Andorra',
      'Austria',
      'Belgium',
      'Bosnia and Herzegovina',
      'Bulgaria',
      'Croatia',
      'Cyprus',
      'Czechia',
      'Denmark',
      'Estonia',
      'Finland',
      'France',
      'Germany',
      'Gibraltar',
      'Greece',
      'Guernsey',
      'Hungary',
      'Iceland',
      'Isle of Man',
      'Italy',
      'Jersey',
      'Kosovo',
      'Latvia',
      'Liechtenstein',
      'Lithuania',
      'Luxembourg',
      'Malta',
      'Moldova',
      'Monaco',
      'Montenegro',
      'Netherlands',
      'North Macedonia',
      'Norway',
      'Poland',
      'Portugal',
      'Romania',
      'San Marino',
      'Serbia',
      'Slovakia',
      'Slovenia',
      'Spain',
      'Sweden',
      'Switzerland',
      'Ukraine',
      'Vatican City',
    ],
  },
];

export const SERVED_COUNTRIES = SERVED_COUNTRY_GROUPS.flatMap((g) => g.countries);

const COUNTRY_ALIASES = {
  usa: 'United States',
  us: 'United States',
  america: 'United States',
  uk: 'United Kingdom',
  gb: 'United Kingdom',
  'great britain': 'United Kingdom',
  england: 'United Kingdom',
  au: 'Australia',
  ca: 'Canada',
  nz: 'New Zealand',
  ie: 'Ireland',
  nl: 'Netherlands',
  holland: 'Netherlands',
  'the netherlands': 'Netherlands',
  'czech republic': 'Czechia',
  cz: 'Czechia',
};

export function normalizeServedCountry(raw) {
  const value = String(raw || '').trim();
  if (!value) return 'United States';
  if (SERVED_COUNTRIES.includes(value)) return value;
  const aliased = COUNTRY_ALIASES[value.toLowerCase()];
  if (aliased) return aliased;
  const match = SERVED_COUNTRIES.find((c) => c.toLowerCase() === value.toLowerCase());
  return match || 'United States';
}
