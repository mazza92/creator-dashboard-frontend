/**
 * Weekly Brand Roundup Email Template
 *
 * Clean, modern email for showcasing new brands available for PR packages
 */

// Brand card component
const renderBrandCard = (brand, index) => `
  <tr>
    <td style="padding: 0 0 16px 0;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden;">
        <tr>
          <td style="padding: 20px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <!-- Logo & Category Row -->
              <tr>
                <td style="padding-bottom: 12px;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td width="56" valign="top">
                        <img
                          src="${brand.logo || brand.cover_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=667eea&color=fff&size=56&font-size=0.4&bold=true`}"
                          alt="${brand.name}"
                          width="56"
                          height="56"
                          style="border-radius: 10px; display: block; object-fit: cover;"
                        />
                      </td>
                      <td style="padding-left: 14px;" valign="middle">
                        <p style="margin: 0 0 4px 0; font-size: 17px; font-weight: 600; color: #111827; line-height: 1.3;">
                          ${brand.name}
                        </p>
                        <span style="display: inline-block; background: ${getCategoryColor(brand.category).bg}; color: ${getCategoryColor(brand.category).text}; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.3px;">
                          ${brand.category || 'Lifestyle'}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- Description -->
              <tr>
                <td style="padding-bottom: 16px;">
                  <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">
                    ${brand.description || 'This brand is looking to collaborate with creators like you.'}
                  </p>
                </td>
              </tr>
              <!-- CTA Button -->
              <tr>
                <td>
                  <a href="https://app.newcollab.co/brand/${brand.slug || brand.id}"
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
                    View PR Package &rarr;
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

// Category color mapping
const getCategoryColor = (category) => {
  const colors = {
    'Beauty': { bg: '#fce7f3', text: '#be185d' },
    'Fashion': { bg: '#ede9fe', text: '#7c3aed' },
    'Fitness': { bg: '#dcfce7', text: '#16a34a' },
    'Food & Beverage': { bg: '#ffedd5', text: '#ea580c' },
    'Tech': { bg: '#dbeafe', text: '#2563eb' },
    'Home & Living': { bg: '#fef3c7', text: '#d97706' },
    'Health & Wellness': { bg: '#d1fae5', text: '#059669' },
    'Pet': { bg: '#fed7aa', text: '#c2410c' },
    'Travel': { bg: '#e0e7ff', text: '#4f46e5' },
    'Jewelry': { bg: '#fdf4ff', text: '#a855f7' },
    'Skincare': { bg: '#ffe4e6', text: '#e11d48' },
    'Lifestyle': { bg: '#f3f4f6', text: '#374151' }
  };
  return colors[category] || colors['Lifestyle'];
};

// Generate dynamic subject line based on brands
export const generateSubjectLine = (brands = []) => {
  if (brands.length === 0) return 'New brands for PR packages are live 👀';
  if (brands.length === 1) return `${brands[0].name} PR is open 👀`;
  const rest = brands.length - 1;
  return `${brands[0].name} PR is open + ${rest} more new brand${rest > 1 ? 's' : ''} 👀`;
};

// Main template generator
export const generateWeeklyBrandRoundup = ({
  firstName = 'Creator',
  brands = [],
  weekDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  totalNewBrands = 0,
  preheader = ''
}) => {
  const brandCards = brands.map((brand, index) => renderBrandCard(brand, index)).join('');
  const brandCount = brands.length;

  // Clean preheader with padding to prevent extra content leaking into preview
  const preheaderText = preheader || 'Direct PR forms, verified emails, and the tools to secure your next package.';
  // Zero-width non-joiners to fill remaining preview space and block body text from showing
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
      .padding-mobile { padding-left: 16px !important; padding-right: 16px !important; }
    }
  </style>
</head>
<body id="body" style="margin: 0; padding: 0; word-spacing: normal; background-color: #f3f4f6;">

  <!-- Preheader: clean single-line preview text -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheaderText}${preheaderPadding}</div>

  <div role="article" aria-roledescription="email" aria-label="New brands for PR packages" lang="en" style="font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
      <tr>
        <td valign="top" style="padding: 24px 16px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: auto;" class="email-container">

            <!-- Logo Header -->
            <tr>
              <td style="padding: 0 0 24px 0; text-align: center;">
                <a href="https://app.newcollab.co?utm_source=email&utm_medium=weekly_roundup" style="text-decoration: none; display: inline-block;">
                  <table cellpadding="0" cellspacing="0" border="0" style="margin: auto;">
                    <tr>
                      <td>
                        <img src="https://newcollab.co/logo192.png" alt="Newcollab" width="36" height="36" style="display: inline-block; vertical-align: middle; border-radius: 8px;">
                      </td>
                      <td style="padding-left: 8px; vertical-align: middle;">
                        <span style="font-size: 18px; font-weight: 700; color: #111827; letter-spacing: -0.3px;">Newcollab</span>
                      </td>
                    </tr>
                  </table>
                </a>
              </td>
            </tr>

            <!-- Main Content Card -->
            <tr>
              <td style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); overflow: hidden;">

                <!-- Hero Section -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center;">
                      <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                        New brands for PR packages
                      </h1>
                      <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9); line-height: 1.4;">
                        ${weekDate}
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Greeting -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 32px 32px 24px 32px;" class="padding-mobile">
                      <p style="margin: 0 0 16px 0; font-size: 16px; color: #111827; line-height: 1.5;">
                        Hey ${firstName}!
                      </p>
                      <p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.6;">
                        We've added <strong style="color: #667eea;">${brandCount} new brand${brandCount !== 1 ? 's' : ''}</strong> open for PR packages this week.
                        Apply directly before spots fill up!
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Stats Banner -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 0 32px 24px 32px;" class="padding-mobile">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f9fafb; border-radius: 10px;">
                        <tr>
                          <td width="33%" style="padding: 16px 8px; text-align: center; border-right: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 2px 0; font-size: 22px; font-weight: 700; color: #667eea;">${brandCount}</p>
                            <p style="margin: 0; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">New Brands</p>
                          </td>
                          <td width="34%" style="padding: 16px 8px; text-align: center; border-right: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 2px 0; font-size: 22px; font-weight: 700; color: #10b981;">&#10003;</p>
                            <p style="margin: 0; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Verified Contacts</p>
                          </td>
                          <td width="33%" style="padding: 16px 8px; text-align: center;">
                            <p style="margin: 0 0 2px 0; font-size: 22px; font-weight: 700; color: #f59e0b;">&#9654;</p>
                            <p style="margin: 0; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Direct PR Forms</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Brand Cards -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 0 32px;" class="padding-mobile">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        ${brandCards}
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- View All CTA -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 8px 32px 40px 32px; text-align: center;" class="padding-mobile">
                      <a href="https://newcollab.co/directory"
                         style="display: inline-block; background: #111827; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; text-decoration: none;">
                        Browse All PR Brands &rarr;
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 32px 24px; text-align: center;">
                <!-- Social Links (text-based for reliability) -->
                <p style="margin: 0 0 16px 0; font-size: 13px; color: #9ca3af;">
                  <a href="https://instagram.com/newcollab.co" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Instagram</a>
                  &bull;
                  <a href="https://tiktok.com/@newcollabco" style="color: #6b7280; text-decoration: none; margin: 0 8px;">TikTok</a>
                  &bull;
                  <a href="https://twitter.com/newcollabco" style="color: #6b7280; text-decoration: none; margin: 0 8px;">Twitter</a>
                </p>

                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #6b7280; line-height: 1.5;">
                  Newcollab &mdash; Connecting Creators with Brands
                </p>
                <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                  You're receiving this because you signed up for Newcollab.
                </p>
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  <a href="https://app.newcollab.co/login" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
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
  weekDate: 'April 14, 2026',
  totalNewBrands: sampleBrands.length
});

export default generateWeeklyBrandRoundup;
