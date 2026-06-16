/**
 * Weekly Brand Roundup Email Template
 *
 * Clean, minimal email for showcasing new brands available for PR packages.
 * Matches the brand template style: logo → white card → content → CTA → footer.
 */

const LOGO_URL = 'https://app.newcollab.co/newcollab-logo-dark.png';

// Category color mapping
const getCategoryColor = (category) => {
  const colors = {
    'Beauty':            { bg: '#fce7f3', text: '#be185d' },
    'Fashion':           { bg: '#ede9fe', text: '#7c3aed' },
    'Fitness':           { bg: '#dcfce7', text: '#16a34a' },
    'Food & Beverage':   { bg: '#ffedd5', text: '#ea580c' },
    'Tech':              { bg: '#dbeafe', text: '#2563eb' },
    'Home & Living':     { bg: '#fef3c7', text: '#d97706' },
    'Health & Wellness': { bg: '#d1fae5', text: '#059669' },
    'Pet':               { bg: '#fed7aa', text: '#c2410c' },
    'Travel':            { bg: '#e0e7ff', text: '#4f46e5' },
    'Jewelry':           { bg: '#fdf4ff', text: '#a855f7' },
    'Skincare':          { bg: '#ffe4e6', text: '#e11d48' },
    'Lifestyle':         { bg: '#f3f4f6', text: '#374151' },
  };
  return colors[category] || colors['Lifestyle'];
};

// Brand card component
const renderBrandCard = (brand) => `
  <tr>
    <td style="padding: 0 0 16px 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
        <tr>
          <td style="padding: 18px 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <!-- Logo & Name Row -->
              <tr>
                <td style="padding-bottom: 10px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="48" valign="top">
                        <img
                          src="${brand.logo || brand.cover_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=111827&color=fff&size=48&font-size=0.4&bold=true`}"
                          alt="${brand.name}"
                          width="48"
                          height="48"
                          style="border-radius: 8px; display: block; object-fit: cover;"
                        />
                      </td>
                      <td style="padding-left: 12px;" valign="middle">
                        <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #111827; line-height: 1.3;">
                          ${brand.name}
                        </p>
                        <span style="display: inline-block; background: ${getCategoryColor(brand.category).bg}; color: ${getCategoryColor(brand.category).text}; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.3px;">
                          ${brand.category || 'Lifestyle'}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Description -->
              <tr>
                <td style="padding-bottom: 14px;">
                  <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                    ${brand.description || 'This brand is looking to collaborate with creators like you.'}
                  </p>
                </td>
              </tr>
              <!-- CTA -->
              <tr>
                <td>
                  <a href="https://app.newcollab.co/dashboard?utm_source=email&utm_medium=weekly_roundup&utm_content=${brand.slug || brand.id}"
                     style="display: inline-block; background: #111827; color: #ffffff; font-size: 13px; font-weight: 600; padding: 9px 18px; border-radius: 7px; text-decoration: none;">
                    Contact for PR &rarr;
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

// Generate dynamic subject line based on brands
export const generateSubjectLine = (brands = []) => {
  if (brands.length === 0) return 'New brands for PR packages are live';
  if (brands.length === 1) return `${brands[0].name} PR is open`;
  const rest = brands.length - 1;
  return `${brands[0].name} PR is open + ${rest} more new brand${rest > 1 ? 's' : ''}`;
};

// Main template generator
export const generateWeeklyBrandRoundup = ({
  firstName = 'Creator',
  brands = [],
  weekDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  totalNewBrands = 0,
  preheader = '',
}) => {
  const brandCards = brands.map((brand) => renderBrandCard(brand)).join('');
  const brandCount = brands.length;
  const preheaderText = preheader || `${brandCount} new brand${brandCount !== 1 ? 's' : ''} with open PR packages — apply before spots fill up.`;
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
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings xmlns:o="urn:schemas-microsoft-com:office:office">
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
  </style>
  <![endif]-->
  <title>New brands for PR packages - Newcollab</title>
  <style>
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    u + #body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    #MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .fluid { width: 100% !important; max-width: 100% !important; height: auto !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
      .center-on-narrow { text-align: center !important; display: block !important; margin: 0 auto !important; float: none !important; }
      .padding-mobile { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body id="body" style="margin: 0; padding: 0; word-spacing: normal; background-color: #f3f4f6;">

  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheaderText}${preheaderPadding}</div>

  <div role="article" aria-roledescription="email" aria-label="New brands for PR packages" lang="en"
       style="font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
      <tr>
        <td valign="top" style="padding: 32px 16px 24px 16px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="margin: auto;" class="email-container">

            <!-- Logo -->
            <tr>
              <td style="padding: 0 0 28px 0; text-align: center;">
                <a href="https://app.newcollab.co?utm_source=email&utm_medium=weekly_roundup" style="text-decoration: none; display: inline-block;">
                  <img src="${LOGO_URL}" alt="Newcollab" height="36"
                       style="display: block; height: 36px; width: auto; border: 0;" />
                </a>
              </td>
            </tr>

            <!-- Main Content Card -->
            <tr>
              <td style="background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">

                <!-- Greeting & Intro -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 36px 40px 8px 40px;" class="padding-mobile">
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #111827; line-height: 1.5;">
                        Hi ${firstName},
                      </p>
                      <p style="margin: 0 0 8px 0; font-size: 15px; color: #374151; line-height: 1.6;">
                        <strong>${brandCount} new brand${brandCount !== 1 ? 's' : ''}</strong> with open PR packages were added this week (${weekDate}). Apply directly before spots fill up.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Brand Cards -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 24px 40px 8px 40px;" class="padding-mobile">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        ${brandCards}
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 16px 40px 40px 40px; text-align: center;" class="padding-mobile">
                      <a href="https://newcollab.co/directory?utm_source=email&utm_medium=weekly_roundup"
                         style="display: inline-block; background: #111827; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 8px; text-decoration: none;">
                        Browse all PR brands
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 28px 24px 32px 24px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                  Newcollab helps creators land PR packages from brands they love.
                </p>
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #9ca3af;">
                  <a href="https://instagram.com/newcollab.co" style="color: #9ca3af; text-decoration: none;">Instagram</a>
                  &nbsp;&middot;&nbsp;
                  <a href="https://app.newcollab.co/login" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
                </p>
                <p style="margin: 0; font-size: 12px; color: #d1d5db;">
                  &copy; 2026 Newcollab. All rights reserved.
                </p>
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

// Preview data for testing
export const sampleBrands = [
  {
    id: '1',
    slug: 'glossier',
    name: 'Glossier',
    category: 'Beauty',
    logo: 'https://logo.clearbit.com/glossier.com',
    description: 'Skincare and makeup brand seeking micro-influencers for product reviews and tutorials. Open to gifting PR packages.'
  },
  {
    id: '2',
    slug: 'gymshark',
    name: 'Gymshark',
    category: 'Fitness',
    logo: 'https://logo.clearbit.com/gymshark.com',
    description: 'Athletic apparel brand looking for fitness creators to showcase workout content. Monthly ambassador opportunities available.'
  },
  {
    id: '3',
    slug: 'mejuri',
    name: 'Mejuri',
    category: 'Jewelry',
    logo: 'https://logo.clearbit.com/mejuri.com',
    description: 'Fine jewelry brand seeking lifestyle creators for everyday wear content. Offering commission and gifting programs.'
  }
];

export const getPreviewHTML = () => generateWeeklyBrandRoundup({
  firstName: 'Sarah',
  brands: sampleBrands,
  weekDate: 'June 16, 2026',
  totalNewBrands: sampleBrands.length
});

export default generateWeeklyBrandRoundup;
