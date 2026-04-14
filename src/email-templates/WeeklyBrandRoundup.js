/**
 * Weekly Brand Roundup Email Template
 *
 * A clean, modern email template for showcasing new brands
 * Inspired by Product Hunt, Notion, and Linear email designs
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
                          src="${brand.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=667eea&color=fff&size=56&font-size=0.4`}"
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
                  <a href="https://app.newcollab.co/dashboard?brand=${brand.id || brand.slug}&utm_source=email&utm_medium=weekly_roundup&utm_campaign=brand_${index}"
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 8px; text-decoration: none; transition: opacity 0.2s;">
                    Contact Brand &rarr;
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

// Main template generator
export const generateWeeklyBrandRoundup = ({
  firstName = 'Creator',
  brands = [],
  weekDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
  totalNewBrands = 0,
  preheader = ''
}) => {
  const brandCards = brands.map((brand, index) => renderBrandCard(brand, index)).join('');

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
  <title>New Brands This Week - NewCollab</title>
  <style>
    /* Reset */
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

    /* iOS blue links */
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }

    /* Gmail blue links */
    u + #body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }

    /* Samsung blue links */
    #MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }

    /* Responsive */
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
  <!-- Preheader (hidden preview text) -->
  <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all;">
    ${preheader || `${brands.length} new brands added this week - ready for your pitch!`}
    ${'&nbsp;&zwnj;'.repeat(30)}
  </div>

  <div role="article" aria-roledescription="email" aria-label="Weekly Brand Roundup" lang="en" style="font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
      <!-- Email Container -->
      <tr>
        <td valign="top" style="padding: 24px 16px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: auto;" class="email-container">

            <!-- Header -->
            <tr>
              <td style="padding: 0 0 24px 0; text-align: center;">
                <a href="https://app.newcollab.co?utm_source=email&utm_medium=weekly_roundup" style="text-decoration: none;">
                  <img src="https://app.newcollab.co/logo-full.png" alt="NewCollab" width="140" style="display: inline-block; height: auto;">
                </a>
              </td>
            </tr>

            <!-- Main Content Card -->
            <tr>
              <td style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); overflow: hidden;">

                <!-- Hero Section -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center;">
                      <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                        Fresh Brands This Week
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
                        We've added <strong style="color: #667eea;">${totalNewBrands || brands.length} new brands</strong> looking to work with creators like you.
                        Check them out and send your pitch before everyone else does!
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
                          <td width="33%" style="padding: 16px; text-align: center; border-right: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 2px 0; font-size: 24px; font-weight: 700; color: #667eea;">${brands.length}</p>
                            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">New Brands</p>
                          </td>
                          <td width="34%" style="padding: 16px; text-align: center; border-right: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 2px 0; font-size: 24px; font-weight: 700; color: #10b981;">${[...new Set(brands.map(b => b.category))].length}</p>
                            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Categories</p>
                          </td>
                          <td width="33%" style="padding: 16px; text-align: center;">
                            <p style="margin: 0 0 2px 0; font-size: 24px; font-weight: 700; color: #f59e0b;">Free</p>
                            <p style="margin: 0; font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">To Pitch</p>
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
                      <a href="https://app.newcollab.co/dashboard?utm_source=email&utm_medium=weekly_roundup&utm_campaign=view_all"
                         style="display: inline-block; background: #111827; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; text-decoration: none;">
                        View All ${totalNewBrands || '500+'} Brands &rarr;
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 32px 24px; text-align: center;">
                <!-- Social Links -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 20px auto;">
                  <tr>
                    <td style="padding: 0 8px;">
                      <a href="https://instagram.com/newcollab.co" style="text-decoration: none;">
                        <img src="https://app.newcollab.co/icons/instagram.png" alt="Instagram" width="24" height="24" style="display: block;">
                      </a>
                    </td>
                    <td style="padding: 0 8px;">
                      <a href="https://tiktok.com/@newcollab.co" style="text-decoration: none;">
                        <img src="https://app.newcollab.co/icons/tiktok.png" alt="TikTok" width="24" height="24" style="display: block;">
                      </a>
                    </td>
                    <td style="padding: 0 8px;">
                      <a href="https://twitter.com/newcollabco" style="text-decoration: none;">
                        <img src="https://app.newcollab.co/icons/twitter.png" alt="Twitter" width="24" height="24" style="display: block;">
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                  NewCollab - Connecting Creators with Brands
                </p>
                <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                  You're receiving this because you signed up for NewCollab.
                </p>
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  <a href="https://app.newcollab.co/settings?utm_source=email" style="color: #6b7280; text-decoration: underline;">Manage preferences</a>
                  &nbsp;&bull;&nbsp;
                  <a href="{{unsubscribe_url}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
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
    name: 'Glossier',
    category: 'Beauty',
    logo: 'https://logo.clearbit.com/glossier.com',
    description: 'Skincare and makeup brand seeking micro-influencers for product reviews and tutorials. Open to gifting PR packages.'
  },
  {
    id: '2',
    name: 'Gymshark',
    category: 'Fitness',
    logo: 'https://logo.clearbit.com/gymshark.com',
    description: 'Athletic apparel brand looking for fitness creators to showcase workout content. Monthly ambassador opportunities available.'
  },
  {
    id: '3',
    name: 'Mejuri',
    category: 'Jewelry',
    logo: 'https://logo.clearbit.com/mejuri.com',
    description: 'Fine jewelry brand seeking lifestyle creators for everyday wear content. Offering commission and gifting programs.'
  },
  {
    id: '4',
    name: 'Olipop',
    category: 'Food & Beverage',
    logo: 'https://logo.clearbit.com/drinkolipop.com',
    description: 'Healthy soda brand actively seeking content creators for taste tests and lifestyle integration. PR packages available.'
  },
  {
    id: '5',
    name: 'Ritual',
    category: 'Health & Wellness',
    logo: 'https://logo.clearbit.com/ritual.com',
    description: 'Premium vitamin brand looking for wellness creators to share their health journey. Long-term partnerships available.'
  }
];

// Export a preview function for testing
export const getPreviewHTML = () => {
  return generateWeeklyBrandRoundup({
    firstName: 'Sarah',
    brands: sampleBrands,
    weekDate: 'April 14, 2026',
    totalNewBrands: 23
  });
};

export default generateWeeklyBrandRoundup;
