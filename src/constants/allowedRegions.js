// Keep in sync with ALLOWED_REGIONS in creator_dashboard/social_verification_routes.py
// Serve zone: US, UK, CA, AU, NZ, and Europe (not RU/BY/TR).
export const ALLOWED_REGION_CODES = [
  'US', 'GB', 'CA', 'AU', 'NZ',
  // EU-27
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
  'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EFTA + microstates + UK crown dependencies
  'IS', 'LI', 'NO', 'CH', 'AD', 'MC', 'SM', 'VA', 'IM', 'JE', 'GG', 'GI', 'AX', 'FO',
  // Rest of Europe (not RU/BY/TR)
  'AL', 'BA', 'MK', 'ME', 'RS', 'XK', 'UA', 'MD',
];

export const PRIORITY_REGION_CODES = ['US', 'GB', 'FR', 'DE', 'CA', 'AU', 'IT', 'ES', 'NL', 'NZ', 'IE'];
