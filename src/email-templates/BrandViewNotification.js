/**
 * Brand View Notification Email Template
 *
 * Triggered when a brand reviews a creator on a gifted PR roster
 * (or opens a tracked media kit link).
 *
 * Free users: See brand category (e.g. "A skincare brand") + upgrade CTA
 * Pro users: See brand name
 *
 * Usage:
 *   generateBrandViewNotification({
 *     firstName: 'Sarah',
 *     brandName: 'Glossier', // only shown for Pro users
 *     brandCategory: 'skincare', // shown for free users as "A skincare brand"
 *     isPro: false,
 *     viewedAt: '2026-06-25T14:30:00Z',
 *   })
 */

const LOGO_URL = 'https://app.newcollab.co/newcollab-logo-dark.png';

const formatViewedTime = (dateString) => {
  if (!dateString) return 'just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const generateBrandViewNotification = ({
  firstName = 'Creator',
  brandName = null,
  brandCategory = null,
  isPro = false,
  viewedAt = null,
  utmCampaign = 'brand_view_notification',
} = {}) => {

  const timeAgo = formatViewedTime(viewedAt);

  // Format brand category for display (e.g. "skincare" -> "A skincare brand")
  let categoryDisplay = 'A brand';
  if (brandCategory) {
    const catLower = brandCategory.toLowerCase().trim();
    if (catLower && !['other', 'unknown', 'n/a'].includes(catLower)) {
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const article = vowels.includes(catLower[0]) ? 'An' : 'A';
      categoryDisplay = `${article} ${catLower} brand`;
    }
  }

  const headline = isPro
    ? `${brandName} reviewed your application`
    : `${categoryDisplay} reviewed your application`;

  const preheaderText = isPro
    ? `They opened your profile ${timeAgo}.`
    : `See which brand is reviewing you.`;

  const subtitle = isPro
    ? `They opened your profile on their gifted PR list ${timeAgo}.`
    : `They opened your profile ${timeAgo}. Upgrade to see which brand.`;

  const bodyHtml = isPro ? `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151; line-height: 1.7;">
      Hey ${firstName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151; line-height: 1.7;">
      <strong>${brandName}</strong> is reviewing creators for gifted PR and opened your profile ${timeAgo}.
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151; line-height: 1.7;">
      Keep your kit and shipping details up to date so you are ready if they add you to the gift list.
    </p>
  ` : `
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #374151; line-height: 1.7;">
      Hey ${firstName},
    </p>
    <p style="margin: 0 0 24px 0; font-size: 15px; color: #374151; line-height: 1.7;">
      ${categoryDisplay} is reviewing gifted PR applications and opened your profile ${timeAgo}.
    </p>
  `;

  // Urgency callout for free users
  const urgencyBox = !isPro ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 0 0 24px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
                 style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border: 1px solid #fbbf24;">
            <tr>
              <td style="padding: 20px 24px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-size: 24px;">🔥</p>
                <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #92400e;">
                  Brands are reviewing now
                </p>
                <p style="margin: 0; font-size: 14px; color: #a16207; line-height: 1.5;">
                  See which brand opened your profile, and apply to more gifted PR lists.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  ` : '';

  // Pro benefits list for free users
  const proFeatures = !isPro ? `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 0 0 24px 0;">
          <p style="margin: 0 0 14px 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
            With Pro you can:
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 0 0 10px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td width="24" valign="top" style="font-size: 14px;">&#128065;</td>
                    <td valign="top" style="padding-left: 8px; font-size: 14px; color: #374151;">
                      <strong>See exactly which brand</strong> reviewed you
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 10px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td width="24" valign="top" style="font-size: 14px;">&#128231;</td>
                    <td valign="top" style="padding-left: 8px; font-size: 14px; color: #374151;">
                      <strong>Apply to more gifted PR lists</strong> on For You
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 10px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td width="24" valign="top" style="font-size: 14px;">&#128230;</td>
                    <td valign="top" style="padding-left: 8px; font-size: 14px; color: #374151;">
                      <strong>Priority placement</strong> when brands are picking
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  ` : '';

  // CTA button - links to for-you page with upgrade param to trigger upgrade modal -> Stripe checkout
  const ctaLabel = isPro ? "See who's reviewing you" : 'See which brand — $19/mo';
  const ctaUrl = isPro
    ? 'https://app.newcollab.co/creator/dashboard/for-you?utm_source=email&utm_medium=brand_view'
    : 'https://app.newcollab.co/creator/dashboard/for-you?upgrade=kit_views&utm_source=email&utm_medium=brand_view';

  const ctaHtml = `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 8px 0 0 0; text-align: center;">
          <a href="${ctaUrl}"
             style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #E11D48); color: #ffffff; font-size: 16px; font-weight: 700; padding: 16px 40px; border-radius: 10px; text-decoration: none;">
            ${ctaLabel}
          </a>
          ${!isPro ? `
          <p style="margin: 14px 0 0 0; font-size: 12px; color: #9ca3af;">
            Cancel anytime. One gifted PR collab pays for a year of Pro.
          </p>
          ` : ''}
        </td>
      </tr>
    </table>
  `;

  // Preheader padding to prevent email client from pulling body text
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
  <title>${headline}</title>
  <style>
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    u + #body a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    #MessageViewBody a { color: inherit; text-decoration: none; font-size: inherit; font-family: inherit; font-weight: inherit; line-height: inherit; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .padding-mobile { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body id="body" style="margin: 0; padding: 0; word-spacing: normal; background-color: #f3f4f6;">

  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheaderText}${preheaderPadding}</div>

  <div role="article" aria-roledescription="email" aria-label="${headline}" lang="en"
       style="font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
      <tr>
        <td valign="top" style="padding: 32px 16px 24px 16px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="margin: auto;" class="email-container">

            <!-- Logo -->
            <tr>
              <td style="padding: 0 0 28px 0; text-align: center;">
                <a href="https://app.newcollab.co?utm_source=email&utm_medium=${utmCampaign}" style="text-decoration: none; display: inline-block;">
                  <img src="${LOGO_URL}" alt="Newcollab" height="36"
                       style="display: block; height: 36px; width: auto; border: 0;" />
                </a>
              </td>
            </tr>

            <!-- Main Content Card -->
            <tr>
              <td style="background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 36px 40px 36px 40px;" class="padding-mobile">

                      <!-- Hero headline (no emoji) -->
                      <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 800; color: #111827; line-height: 1.2;">
                          ${headline}
                        </h1>
                        <p style="margin: 0; font-size: 15px; color: #6b7280;">
                          ${subtitle}
                        </p>
                      </div>

                      <!-- Body text -->
                      ${bodyHtml}

                      <!-- Urgency box (free users only) -->
                      ${urgencyBox}

                      <!-- Pro features list (free users only) -->
                      ${proFeatures}

                      <!-- CTA -->
                      ${ctaHtml}

                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 28px 24px 32px 24px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #6b7280; line-height: 1.5;">
                  You are receiving this because a brand reviewed your gifted PR application.
                </p>
                <p style="margin: 0 0 10px 0; font-size: 13px; color: #9ca3af;">
                  <a href="https://app.newcollab.co/creator/dashboard/settings" style="color: #9ca3af; text-decoration: underline;">Email settings</a>
                  &nbsp;&middot;&nbsp;
                  <a href="https://app.newcollab.co/login" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
                </p>
                <p style="margin: 0; font-size: 12px; color: #d1d5db;">
                  2026 Newcollab. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>

  </div>
</body>
</html>`.trim();
};

// Sample data for preview
export const sampleBrandViewFree = {
  firstName: 'Sarah',
  brandName: 'Glossier',
  brandCategory: 'skincare',
  isPro: false,
  viewedAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
};

export const sampleBrandViewPro = {
  firstName: 'Sarah',
  brandName: 'Glossier',
  brandCategory: 'skincare',
  isPro: true,
  viewedAt: new Date(Date.now() - 15 * 60000).toISOString(),
};

export const getBrandViewFreePreview = () => generateBrandViewNotification(sampleBrandViewFree);
export const getBrandViewProPreview = () => generateBrandViewNotification(sampleBrandViewPro);

export default generateBrandViewNotification;
