/**
 * Live PR campaigns email — weekly-roundup layout.
 *
 * Clean brand cards. One brand or several. No deliverable / exchange copy
 * (that lives on the apply modal).
 */

import {
  normalizeWebsiteUrl,
  productFromBrand,
  websiteFromBrand,
} from './PROpportunity';

const LOGO_URL = 'https://app.newcollab.co/newcollab-logo-dark.png';

const SAMPLE_BRANDS = [
  { brandName: 'WAU', product: 'LED mask 2.0', website: 'https://wauglobal.com', slug: 'wau', category: 'Beauty' },
  { brandName: 'Benji Mens', product: 'Age Defense+ set', website: 'https://benjimens.com', slug: 'benji-mens', category: 'Skincare' },
  { brandName: 'GLO', product: 'Glo910 PRO', website: 'https://us.glo910.com', slug: 'mixen-company-limited', category: 'Beauty' },
];

const CATEGORY_COLORS = {
  Beauty: { bg: '#fce7f3', text: '#be185d' },
  Fashion: { bg: '#ede9fe', text: '#7c3aed' },
  Fitness: { bg: '#dcfce7', text: '#16a34a' },
  'Food & Beverage': { bg: '#ffedd5', text: '#ea580c' },
  Tech: { bg: '#dbeafe', text: '#2563eb' },
  'Home & Living': { bg: '#fef3c7', text: '#d97706' },
  'Health & Wellness': { bg: '#d1fae5', text: '#059669' },
  Skincare: { bg: '#ffe4e6', text: '#e11d48' },
  Lifestyle: { bg: '#f3f4f6', text: '#374151' },
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const categoryColor = (category) => {
  const key = Object.keys(CATEGORY_COLORS).find(
    (name) => name.toLowerCase() === String(category || '').toLowerCase()
  );
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.Lifestyle;
};

export const applyUrlFromBrand = (brand = {}, override = '') => {
  const raw = String(override || '').trim();
  if (raw) return normalizeWebsiteUrl(raw);
  const slug = String(brand.slug || '').trim();
  if (slug) return `https://app.newcollab.co/creator/dashboard/for-you?brand=${encodeURIComponent(slug)}`;
  return 'https://app.newcollab.co/creator/dashboard/for-you';
};

export const normalizeRosterBrands = (config = {}) => {
  if (Array.isArray(config.brands) && config.brands.length) {
    return config.brands
      .map((brand) => ({
        brandName: brand.brandName || brand.name || brand.brand_name || '',
        product: brand.product || productFromBrand(brand) || '',
        website: brand.website || websiteFromBrand(brand) || '',
        slug: brand.slug || '',
        applyUrl: applyUrlFromBrand(brand, brand.applyUrl),
        logo: brand.logo || brand.logo_url || '',
        category: brand.category || '',
      }))
      .filter((brand) => brand.brandName);
  }
  if (config.brandName) {
    return [{
      brandName: config.brandName,
      product: config.product || '',
      website: config.website || '',
      slug: config.slug || '',
      applyUrl: applyUrlFromBrand(config, config.applyUrl),
      logo: config.logo || '',
      category: config.category || '',
    }];
  }
  return [];
};

const nameList = (names = []) => {
  const clean = names.filter(Boolean);
  if (!clean.length) return 'these brands';
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} & ${clean[1]}`;
  if (clean.length === 3) return `${clean[0]}, ${clean[1]} & ${clean[2]}`;
  return `${clean.slice(0, 2).join(', ')} +${clean.length - 2} more`;
};

export const generatePRRosterLiveSubject = (input = '') => {
  const brands = typeof input === 'string'
    ? (input ? [{ brandName: input }] : [])
    : normalizeRosterBrands(input);
  const variant = typeof input === 'object' && input ? input.variant : '';
  const names = brands.map((b) => b.brandName);
  if (variant === 'new_campaigns') {
    if (names.length === 1) return `New gifting campaign: ${names[0]} — apply now`;
    return 'New brand PR/gifting campaigns running — apply now';
  }
  if (names.length === 1) return `${names[0]} PR campaign is open`;
  if (names.length > 1) return `${nameList(names)} — PR campaigns are open`;
  return 'PR campaigns are open';
};

const avatarUrl = (brand) => {
  if (brand.logo) return brand.logo;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brandName || 'Brand')}&background=111827&color=fff&size=80&font-size=0.4&bold=true`;
};

const renderBrandCard = (brand) => {
  const name = escapeHtml(brand.brandName);
  const href = escapeHtml(applyUrlFromBrand(brand, brand.applyUrl));
  const colors = categoryColor(brand.category);
  const category = escapeHtml(brand.category || 'PR');
  return `
  <tr>
    <td style="padding: 0 0 14px 0;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
             style="background: #fff7f4; border-radius: 12px; border: 1px solid #f6d5cc;">
        <tr>
          <td style="padding: 16px 18px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td width="48" valign="top">
                  <img src="${escapeHtml(avatarUrl(brand))}" alt="${name}" width="48" height="48"
                       style="border-radius: 10px; display: block; object-fit: cover; border: 0;" />
                </td>
                <td style="padding-left: 12px;" valign="middle">
                  <p style="margin: 0 0 5px 0; font-size: 16px; font-weight: 700; color: #111827; line-height: 1.25;">
                    ${name}
                  </p>
                  <span style="display: inline-block; background: #FEE2E2; color: #B91C1C; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 999px; letter-spacing: 0.04em; text-transform: uppercase;">
                    ${escapeHtml(brand.badge || 'Applications open')}
                  </span>
                  ${brand.category ? `
                  <span style="display: inline-block; margin-left: 6px; background: ${colors.bg}; color: ${colors.text}; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 999px; letter-spacing: 0.03em; text-transform: uppercase;">
                    ${category}
                  </span>` : ''}
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px 0 12px 0;">
                  <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">
                    ${escapeHtml(brand.blurb || `Actively running a PR campaign. ${brand.product || 'Gifted PR package'}.`)}
                  </p>
                </td>
              </tr>
              <tr>
                <td colspan="2">
                  <a href="${href}"
                     style="display: inline-block; background: #E11D48; color: #ffffff; font-size: 13px; font-weight: 700; padding: 9px 16px; border-radius: 8px; text-decoration: none;">
                    Apply now &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
};

export const generatePRRosterLive = (config = {}) => {
  const variant = config.variant === 'new_campaigns' ? 'new_campaigns' : 'gift_list';
  const brands = normalizeRosterBrands(config).map((brand) => ({
    ...brand,
    badge: variant === 'new_campaigns' ? 'Needs creators' : 'Applications open',
    blurb: variant === 'new_campaigns'
      ? `New gifted roster waiting to be filled. ${brand.product || 'Gifted PR package'}.`
      : `Actively running a PR campaign. ${brand.product || 'Gifted PR package'}.`,
  }));
  const firstName = config.firstName || '{{first_name}}';
  const greeting = escapeHtml(firstName || '{{first_name}}');
  const previewBrands = brands.length ? brands : SAMPLE_BRANDS.map((brand) => ({
    ...brand,
    badge: variant === 'new_campaigns' ? 'Needs creators' : 'Applications open',
    blurb: variant === 'new_campaigns'
      ? `New gifted roster waiting to be filled. ${brand.product}.`
      : `Actively running a PR campaign. ${brand.product}.`,
  }));
  const names = previewBrands.map((b) => b.brandName);
  const count = previewBrands.length;
  const subject = generatePRRosterLiveSubject({ brands: previewBrands, variant });
  const preheader = variant === 'new_campaigns'
    ? (count === 1
      ? `${names[0]} just opened a gifting campaign. Apply now.`
      : `${count} new gifting campaigns need creators this week. Apply now.`)
    : (count === 1
      ? `${names[0]} is running a PR campaign. Applications are open.`
      : `${nameList(names)} are running PR campaigns. Applications are open.`);
  const intro = variant === 'new_campaigns'
    ? (count === 1
      ? `<strong>${escapeHtml(names[0])}</strong> just opened a gifted PR campaign and needs creators on the roster. Scan it and apply if you want in.`
      : `<strong>${count} new gifting campaigns</strong> are live. These rosters need creators this week — scan the list and apply.`)
    : (count === 1
      ? `<strong>${escapeHtml(names[0])}</strong> is actively running a PR campaign. Applications are open — apply if you want in.`
      : `<strong>${count} brands</strong> are actively running PR campaigns. Applications are open — scan the list and apply.`);
  const browseUrl = count === 1
    ? applyUrlFromBrand(previewBrands[0])
    : 'https://app.newcollab.co/creator/dashboard/for-you';
  const browseLabel = variant === 'new_campaigns'
    ? (count === 1 ? 'Apply now' : 'See new campaigns')
    : (count === 1 ? 'Open this campaign' : 'See all open campaigns');
  const cards = previewBrands.map(renderBrandCard).join('');
  const preheaderPadding = '\u200C\u00A0'.repeat(90);

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(subject)}</title>
  <style>
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .padding-mobile { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body id="body" style="margin: 0; padding: 0; background-color: #f3f4f6;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(preheader)}${preheaderPadding}</div>
  <div role="article" lang="en" style="font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td valign="top" style="padding: 32px 16px 24px 16px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="margin: auto;" class="email-container">
            <tr>
              <td style="padding: 0 0 24px 0; text-align: center;">
                <a href="https://app.newcollab.co?utm_source=email&utm_medium=pr_roster_live" style="text-decoration: none;">
                  <img src="${LOGO_URL}" alt="Newcollab" height="36" style="display: block; margin: 0 auto; height: 36px; width: auto; border: 0;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 32px 40px 8px 40px;" class="padding-mobile">
                      <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.5;">Hi ${greeting},</p>
                      <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.6;">${intro}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 22px 40px 8px 40px;" class="padding-mobile">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        ${cards}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 40px 36px 40px; text-align: center;" class="padding-mobile">
                      <a href="${escapeHtml(browseUrl)}"
                         style="display: inline-block; background: #111827; color: #ffffff; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                        ${browseLabel}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 28px 24px 32px 24px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280;">Newcollab helps creators land PR packages from brands they love.</p>
                <p style="margin: 0; font-size: 12px; color: #d1d5db;">&copy; 2026 Newcollab. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `.trim();
};

export const samplePRRosterLive = {
  firstName: 'Sarah',
  brands: SAMPLE_BRANDS,
};

export { productFromBrand, websiteFromBrand };
