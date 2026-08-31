/**
 * PR Opportunity Email
 *
 * Gifted PR campaign invite for selected creators. Brand name + product
 * come from the brand record; first_name is filled per recipient at send time.
 */

import { generateGeneralAnnouncement } from './GeneralAnnouncement';

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export const productFromBrand = (brand = {}) => {
  if (brand.hero_product && String(brand.hero_product).trim()) {
    return String(brand.hero_product).trim();
  }
  const types = brand.product_types;
  if (Array.isArray(types) && types.length) {
    return types.filter(Boolean).join(', ');
  }
  if (typeof types === 'string' && types.trim()) {
    return types.trim();
  }
  return '';
};

export const websiteFromBrand = (brand = {}) =>
  normalizeWebsiteUrl(brand.website || brand.source_url || '');

export const normalizeWebsiteUrl = (raw = '') => {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (/^(javascript|data|vbscript):/i.test(value)) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  return `https://${value}`;
};

export const generatePROpportunitySubject = (brandName = '') =>
  `🎉 New PR Package: ${brandName || 'brand'}`;

export const DEFAULT_PR_EXCHANGE =
  '1 Reel or TikTok (ASMR or routine style, light brief provided) · 2 supporting Stories';

export const generatePROpportunity = ({
  firstName = '{{first_name}}',
  brandName = 'the brand',
  product = 'gifted product',
  exchange = DEFAULT_PR_EXCHANGE,
  website = '',
} = {}) => {
  const greeting = firstName || '{{first_name}}';
  const brand = escapeHtml(brandName || 'the brand');
  const productLine = escapeHtml(product || 'gifted product');
  const exchangeLine = escapeHtml(exchange || DEFAULT_PR_EXCHANGE);
  const href = normalizeWebsiteUrl(website);
  const brandMarkup = href
    ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" style="color: inherit; font-weight: 700; text-decoration: underline;">${brand}</a>`
    : `<strong>${brand}</strong>`;

  return generateGeneralAnnouncement({
    firstName: greeting,
    headerTitle: `New PR Package: ${brandMarkup}`,
    headerSubtitle: '',
    bodyText: `<p style="margin: 0 0 16px 0;">Hi ${greeting},</p>
<p style="margin: 0;">Quick match for you. ${brandMarkup} is running a gifted PR campaign and we picked you as a fit for their creator pool.</p>`,
    blocks: [
      {
        type: 'list',
        items: [
          { icon: '📦', title: "They'll send you", text: productLine },
          {
            icon: '🎬',
            title: 'In exchange',
            text: exchangeLine,
          },
        ],
      },
      {
        type: 'callout',
        icon: '✨',
        text: 'No fee, no revshare, just gifted product and creative freedom.',
        color: '#E11D48',
        bg: '#FFF1F3',
      },
      {
        type: 'html',
        content: `<p style="margin: 0 0 16px 0; font-size: 15px; color: #374151; line-height: 1.7;">If interested, please confirm by replying <strong>yes</strong> with your full shipping address.</p>
<p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7;">Best,</p>`,
      },
    ],
    primaryCta: null,
    preheader: `${brandName || 'A brand'} is running a gifted PR campaign and we picked you as a fit.`,
    subject: generatePROpportunitySubject(brandName),
    utmCampaign: 'pr_opportunity',
  });
};

export const samplePROpportunity = {
  firstName: 'Sarah',
  brandName: 'Glow Recipe',
  product: 'Watermelon Glow Niacinamide Dew Drops + mini kit',
  exchange: DEFAULT_PR_EXCHANGE,
  website: 'https://glowrecipe.com',
};
