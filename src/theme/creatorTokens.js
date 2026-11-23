/**
 * Creator dashboard design tokens (rebuild).
 * Scoped to logged-in creator UI — does not replace marketing `tokens.js`.
 * Logo stays /newcollab-logo-dark.png via Logo.jsx.
 */
export const creatorTokens = {
  ink: '#12141a',
  inkSoft: '#2a2e38',
  muted: '#5c6470',
  line: '#e4e2dc',
  paper: '#fafafa',
  cream: '#ffffff',
  white: '#ffffff',

  // Action / primary CTA (near-black — matches existing action buttons)
  action: '#0f0f0f',
  actionHover: '#1c1c1c',

  // Brand accent (rebuild green)
  accent: '#0d7a5f',
  accentDeep: '#095a46',
  accentSoft: '#eef6f3',
  accentLight: '#eef6f3',
  accentBorder: '#b8d5cb',

  // Pro: the landing page's green, so upgrade buttons stand out from the black everyday actions (Nov 2026 revamp;
  // replaced the pink #e8395f).
  pro: '#0d7a5f',
  proHover: '#095a46',
  proShadow: 'rgba(13, 122, 95, 0.28)',

  // Warm highlight (gift value, send-time)
  hot: '#e85d3b',

  // Semantic (keep working with existing success/pro patterns)
  success: '#059669',
  successLight: '#ecfdf5',
  successBorder: '#a7f3d0',
  primary: '#0d7a5f', // eyebrow / accent alias for For You migration
  primaryLight: '#eef6f3',
  primaryHover: '#095a46',
  primaryBorder: '#b8d5cb',
  accentViolet: '#7c3aed', // Pool NEW badge only
  proGradient: 'linear-gradient(135deg, #0d7a5f, #095a46)',

  bg: '#fafafa',
  surface: '#ffffff',
  border: '#e4e2dc',
  borderHover: '#cfc9bc',
  textPrimary: '#12141a',
  textSecondary: '#2a2e38',
  textMuted: '#5c6470',
  subtle: '#f3f2ef',

  radiusCard: '14px',
  radiusBtn: '10px',
  radiusPill: '100px',
  radiusInput: '12px',

  shadowCard: '0 1px 3px rgba(18,20,26,0.04), 0 8px 28px rgba(18,20,26,0.06)',
  shadowHover: '0 10px 32px rgba(18,20,26,0.1)',

  fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  // Nov 2026 revamp: the dashboard matches newcollab.co (Inter, bold and tight, no serif). Headings set
  // font-weight 800 and letter-spacing -0.025em next to this.
  fontDisplay: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

  // CTA copy — single source of truth
  ctaGetBrandPr: 'Get Brand PR',
  ctaViewBrandPr: 'View Brand PR',
  ctaOpened: 'Opened',
  ctaContacted: 'Contacted',
};

export default creatorTokens;
