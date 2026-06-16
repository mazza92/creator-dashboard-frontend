/**
 * General Announcement Email Template
 *
 * Flexible, composable email for announcements, insights, feature updates,
 * tips, or any custom content. Shares branding with WeeklyBrandRoundup.
 *
 * Usage:
 *   generateGeneralAnnouncement({
 *     firstName: 'Sarah',
 *     headerTitle: 'Your weekly insights are here',
 *     headerSubtitle: 'Week of June 15, 2026',
 *     gradient: 'teal',            // 'teal' | 'purple' | 'green' | 'dark' | 'amber'
 *     bodyText: '<p>Hey {{first_name}},</p><p>...</p>',
 *     blocks: [
 *       { type: 'stat',     items: [{ value: '23', label: 'New Brands' }, ...] },
 *       { type: 'callout',  text: 'Pro tip: ...', icon: '💡' },
 *       { type: 'list',     items: [{ icon: '✅', title: 'Step 1', text: 'Do X' }, ...] },
 *       { type: 'divider' },
 *       { type: 'html',     content: '<p>Custom raw HTML</p>' },
 *     ],
 *     primaryCta:   { label: 'Go to Dashboard', url: 'https://app.newcollab.co' },
 *     secondaryCta: { label: 'Browse Brands', url: 'https://newcollab.co/directory' },
 *     preheader: 'Check out what is new this week on Newcollab.',
 *   })
 */

// Gradient map
const GRADIENTS = {
  teal:   'linear-gradient(135deg, #26A69A 0%, #00897B 100%)',
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  green:  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  dark:   'linear-gradient(135deg, #1a1a2e 0%, #374151 100%)',
  amber:  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
};

// Render a stat bar block (2-4 items)
const renderStatBlock = (items = []) => {
  const cellWidth = Math.floor(100 / items.length);
  const cells = items.map((item, i) => `
    <td width="${cellWidth}%" style="padding: 16px 8px; text-align: center;${i < items.length - 1 ? ' border-right: 1px solid #e5e7eb;' : ''}">
      <p style="margin: 0 0 2px 0; font-size: 22px; font-weight: 700; color: #667eea;">${item.value}</p>
      <p style="margin: 0; font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">${item.label}</p>
    </td>
  `).join('');

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 0 32px 24px 32px;" class="padding-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f9fafb; border-radius: 10px;">
          <tr>${cells}</tr>
        </table>
      </td>
    </tr>
  </table>`;
};

// Render a callout / tip box
const renderCalloutBlock = ({ text, icon = '💡', color = '#667eea', bg = '#f0f4ff' } = {}) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 0 32px 24px 32px;" class="padding-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%"
          style="background: ${bg}; border-left: 4px solid ${color}; border-radius: 0 8px 8px 0;">
          <tr>
            <td style="padding: 16px 20px;">
              <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.6;">
                <span style="margin-right: 8px;">${icon}</span>${text}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

// Render a feature / bullet list
const renderListBlock = (items = []) => {
  const rows = items.map(item => `
    <tr>
      <td style="padding: 0 0 16px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td width="32" valign="top" style="padding-top: 2px;">
              <span style="font-size: 18px;">${item.icon || '•'}</span>
            </td>
            <td valign="top" style="padding-left: 12px;">
              ${item.title ? `<p style="margin: 0 0 2px 0; font-size: 15px; font-weight: 600; color: #111827;">${item.title}</p>` : ''}
              ${item.text ? `<p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">${item.text}</p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>`).join('');

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 0 32px 24px 32px;" class="padding-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          ${rows}
        </table>
      </td>
    </tr>
  </table>`;
};

// Render a visual divider
const renderDivider = () => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 0 32px 24px 32px;" class="padding-mobile">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="border-top: 1px solid #e5e7eb; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

// Render raw HTML block
const renderHtmlBlock = (content = '') => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 0 32px 24px 32px;" class="padding-mobile">
        ${content}
      </td>
    </tr>
  </table>`;

// Dispatch block types
const renderBlock = (block) => {
  switch (block.type) {
    case 'stat':     return renderStatBlock(block.items);
    case 'callout':  return renderCalloutBlock(block);
    case 'list':     return renderListBlock(block.items);
    case 'divider':  return renderDivider();
    case 'html':     return renderHtmlBlock(block.content);
    default:         return '';
  }
};

// Main template generator
export const generateGeneralAnnouncement = ({
  firstName = 'Creator',
  headerTitle = 'An update from Newcollab',
  headerSubtitle = '',
  gradient = 'teal',
  bodyText = '',
  blocks = [],
  primaryCta = null,
  secondaryCta = null,
  preheader = '',
  utmCampaign = 'general_announcement',
} = {}) => {

  const gradientCSS = GRADIENTS[gradient] || GRADIENTS.teal;
  const preheaderText = preheader || headerTitle;
  const preheaderPadding = '\u200C\u00A0'.repeat(90);
  const renderedBlocks = blocks.map(renderBlock).join('');

  const primaryCtaHtml = primaryCta ? `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 0 32px 32px 32px; text-align: center;" class="padding-mobile">
        <a href="${primaryCta.url}"
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 10px; text-decoration: none;">
          ${primaryCta.label} &rarr;
        </a>
        ${secondaryCta ? `
        <div style="margin-top: 16px;">
          <a href="${secondaryCta.url}"
             style="font-size: 14px; color: #667eea; text-decoration: underline;">
            ${secondaryCta.label}
          </a>
        </div>` : ''}
      </td>
    </tr>
  </table>` : '';

  const bodyHtml = bodyText ? `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td style="padding: 32px 32px 24px 32px;" class="padding-mobile">
        <div style="font-size: 15px; color: #4b5563; line-height: 1.7;">
          ${bodyText}
        </div>
      </td>
    </tr>
  </table>` : '';

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
  <title>${headerTitle} - Newcollab</title>
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

  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${preheaderText}${preheaderPadding}</div>

  <div role="article" aria-roledescription="email" aria-label="${headerTitle}" lang="en"
       style="font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
      <tr>
        <td valign="top" style="padding: 24px 16px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: auto;" class="email-container">

            <!-- Logo Header -->
            <tr>
              <td style="padding: 0 0 24px 0; text-align: center;">
                <a href="https://app.newcollab.co?utm_source=email&utm_medium=${utmCampaign}" style="text-decoration: none; display: inline-block;">
                  <table cellpadding="0" cellspacing="0" border="0" style="margin: auto;">
                    <tr>
                      <td>
                        <img src="https://app.newcollab.co/logo.png" alt="Newcollab" width="36" height="36"
                             style="display: inline-block; vertical-align: middle; border-radius: 8px;">
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

                <!-- Hero / Header -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="background: ${gradientCSS}; padding: 40px 32px; text-align: center;">
                      <h1 style="margin: 0 0 ${headerSubtitle ? '8px' : '0'} 0; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                        ${headerTitle}
                      </h1>
                      ${headerSubtitle ? `
                      <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.85); line-height: 1.4;">
                        ${headerSubtitle}
                      </p>` : ''}
                    </td>
                  </tr>
                </table>

                <!-- Body Text -->
                ${bodyHtml}

                <!-- Dynamic Blocks -->
                ${renderedBlocks}

                <!-- Primary CTA -->
                ${primaryCtaHtml}

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 32px 24px; text-align: center;">
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
</html>`.trim();
};

// Default preview data
export const sampleAnnouncementInsights = {
  headerTitle: 'Your creator insights are here',
  headerSubtitle: 'Week of June 15, 2026',
  gradient: 'teal',
  bodyText: `<p style="margin: 0 0 16px 0; font-size: 16px; color: #111827;">Hey {{first_name}}!</p>
<p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.6;">Here is a quick look at how things are moving on Newcollab this week, plus some tips to help you land your next PR package.</p>`,
  blocks: [
    {
      type: 'stat',
      items: [
        { value: '23', label: 'New Brands This Week' },
        { value: '68%', label: 'Avg Response Rate' },
        { value: '4.2s', label: 'Avg Pitch Time' },
      ]
    },
    {
      type: 'callout',
      icon: '💡',
      text: 'Creators who personalise their pitch with a specific product name get 3x more replies than those who send generic outreach.',
      color: '#26A69A',
      bg: '#f0faf9',
    },
    {
      type: 'list',
      items: [
        { icon: '📦', title: 'New brands added', text: 'Beauty of Joseon, Anua, Frank Body and 20 more added this week with open PR forms.' },
        { icon: '🎯', title: 'Tip: time your pitch', text: 'Brands respond fastest Tuesday-Thursday between 9am-11am in their timezone.' },
        { icon: '🚀', title: 'Upgrade to Pro', text: 'Pro creators unlock unlimited pitches and get access to exclusive brand deals not visible to free users.' },
      ]
    },
  ],
  primaryCta: { label: 'Browse New Brands', url: 'https://app.newcollab.co/dashboard?utm_source=email&utm_medium=announcement' },
  secondaryCta: { label: 'View All PR Brands', url: 'https://newcollab.co/directory' },
  preheader: 'New brands added this week, a quick tip, and your platform insights.',
};

export const sampleAnnouncementGeneral = {
  headerTitle: 'Something new is live on Newcollab',
  headerSubtitle: '',
  gradient: 'purple',
  bodyText: `<p style="margin: 0 0 16px 0; font-size: 16px; color: #111827;">Hey {{first_name}}!</p>
<p style="margin: 0; font-size: 15px; color: #4b5563; line-height: 1.6;">We have been building something you asked for, and it is ready. Here is what is new.</p>`,
  blocks: [
    {
      type: 'callout',
      icon: '🎉',
      text: 'Your announcement content goes here. Keep it to one or two punchy sentences that explain the value clearly.',
      color: '#667eea',
      bg: '#f0f4ff',
    },
    { type: 'divider' },
    {
      type: 'list',
      items: [
        { icon: '✅', title: 'Feature one', text: 'Short description of what this means for you.' },
        { icon: '✅', title: 'Feature two', text: 'Short description of what this means for you.' },
        { icon: '✅', title: 'Feature three', text: 'Short description of what this means for you.' },
      ]
    },
  ],
  primaryCta: { label: 'Try It Now', url: 'https://app.newcollab.co' },
  preheader: 'Something new is live. Here is what changed and why it matters.',
};

export const getAnnouncementInsightsPreview = () => generateGeneralAnnouncement({
  firstName: 'Sarah',
  ...sampleAnnouncementInsights,
});

export const getAnnouncementGeneralPreview = () => generateGeneralAnnouncement({
  firstName: 'Sarah',
  ...sampleAnnouncementGeneral,
});

export default generateGeneralAnnouncement;
