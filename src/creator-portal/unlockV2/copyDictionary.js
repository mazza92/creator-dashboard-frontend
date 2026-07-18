/**
 * Unlock Modal V2 - Copy Dictionary
 *
 * Tone: personal talent manager for newbie creators chasing first gift / UGC.
 * Avoid: Package, Strong Match, Elevate/Unleash/Leverage, em dashes.
 */

// ============================================
// LOOT-BOX LOADING
// ============================================
export const LOADING = {
  title: 'Getting Brand PR',
  subline: 'Unlocking the PR email or form + a pitch you can send.',
  cards: [
    { key: 'inbox', pending: '⋯', done: '✓', text: 'PR contact found' },
    { key: 'pitch', pending: '⋯', done: '✓', text: 'Pitch drafted' },
    { key: 'strategy', pending: '⋯', done: '✓', text: 'Match tips ready' },
    { key: 'ready', pending: '⋯', done: '✓', text: 'Package ready' },
  ],
  fallbackText: 'Almost ready…',
  cyclingTexts: [
    'Finding verified PR contact…',
    'Checking if they use a signup form…',
    'Drafting a short pitch for micros…',
    'Matching your niche to this brand…',
    'Packing email + form prep…',
    'Almost done…',
  ],
  cyclingIntervalMs: 2000,
  maxTimeMs: 4000,
  minCardGapMs: 200,
};

// ============================================
// COMPLETION FLASH
// ============================================
export const FLASH = {
  title: 'Brand PR ready',
  subline: 'Your email or form package is loading…',
};

// Flash duration based on user's total unlocks
export function getFlashDuration(totalUnlocks) {
  if (totalUnlocks <= 5) return 800;   // full experience
  if (totalUnlocks <= 15) return 400;  // half-length
  if (totalUnlocks <= 30) return 200;  // barely there
  return 0;                             // skip entirely
}

// ============================================
// VERDICT TIERS (Legacy - kept for backwards compatibility)
// Updated to use prioritizer language (no "don't pitch" messaging)
// ============================================
export const VERDICT_TIERS = {
  high: {
    emoji: '🎯',
    headline: (brandName) => `You can pitch ${brandName} today.`,
    subline: 'Based on <b>your profile</b>.',
    verdictPill: 'Top Match',
    pillColor: 'green',
  },
  medium: {
    emoji: '✨',
    headline: (brandName) => `Good match with ${brandName}.`,
    subline: 'Based on <b>your profile</b>.',
    verdictPill: 'Good Match',
    pillColor: 'green',
  },
  low: {
    emoji: '📈',
    headline: (brandName) => `Growth opportunity with ${brandName}.`,
    subline: 'Based on <b>your profile</b>.',
    verdictPill: 'Growth Match',
    pillColor: 'amber',
  },
};

// ============================================
// MENTOR VERDICTS (Prioritizer system - not gatekeeper)
// Never say "don't pitch" - instead, help users prioritize their pipeline
// No red = no "stop" signals. Yellow = "improve". Green = "go".
// ============================================
export const MENTOR_VERDICTS = {
  ready: {
    confidence: 'top',
    confidenceLabel: 'Top Match',
    confidenceStars: 5,
    pill: 'Ready to unlock',
    pillColor: 'green',
  },
  almost: {
    confidence: 'good',
    confidenceLabel: 'Good Match',
    confidenceStars: 4,
    pill: 'Ready to unlock',
    pillColor: 'green',
  },
  not_yet: {
    confidence: 'growth',
    confidenceLabel: 'Growth Match',
    confidenceStars: 3,
    pill: 'Unlock + tips',
    pillColor: 'green',
  },
  poor_fit: {
    confidence: 'stretch',
    confidenceLabel: 'Stretch Match',
    confidenceStars: 2,
    pill: 'Optional — try stronger fits first',
    pillColor: 'amber',
  },
  build_first: {
    confidence: 'low',
    confidenceLabel: 'Low Priority',
    confidenceStars: 1,
    pill: 'Better matches available',
    pillColor: 'amber',
  },
};

// ============================================
// MENTOR SECTION LABELS
// Brand-centric language - users care what brands see, not what AI sees
// ============================================
export const MENTOR_SECTIONS = {
  whatBrandWillNotice: {
    // Dynamic: "What {BrandName} Will Notice"
    labelTemplate: (brandName) => `What ${brandName} Will Notice`,
    label: 'What They Will Notice', // Fallback
    icon: '👀',
  },
  lowerPriority: {
    // For stretch/low priority matches - softer than "not a match"
    label: 'Why this is lower priority',
    icon: '📊',
  },
  whatsMissing: {
    label: "What's missing",
    icon: '🔍',
  },
  increaseReplyChance: {
    // Reframes "your next move" around value prop
    label: 'Increase your reply chance',
    icon: '⭐',
  },
  outreachTools: {
    label: 'Ready to send',
    collapsedLabel: 'PR email, pitch, and timing ready',
    icon: '✉️',
  },
};

// ============================================
// POST-PITCH NEXT ACTIONS (silence workaround)
// Value continues even if the brand never replies
// ============================================
export const NEXT_ACTIONS = {
  title: 'Pitch opened',
  subline: 'Brands often take time to reply. Keep moving while you wait.',
  improveTitle: 'Improve for this brand first',
  improveBody: 'A few profile tweaks raise your odds before you pitch more brands.',
  improveCta: 'Review tips',
  opportunitiesTitle: 'Apply where brands are already hiring',
  opportunitiesBody: 'Open gigs mean no waiting on a cold reply.',
  opportunitiesCta: 'See open opportunities',
  anotherTitle: 'Unlock another brand',
  anotherBody: 'Build your next strategy while this one sits in their inbox.',
  anotherCta: 'Back to matches',
  pipelineCta: 'Track this pitch in pipeline',
  note: 'Your Brand PR package is ready — stay consistent and unlock the next fit.',
};

// ============================================
// HERO BAND (A/B TEST VARIANTS)
// ============================================
export const HERO_VARIANTS = {
  A: {
    // Control variant
    emoji: '🎉',
    headline: (brandName) => `Ready to pitch ${brandName}`,
    subline: null,
    verdictPill: 'Strong Match',
    pillColor: 'green',
  },
  B: {
    // Expected winner - uses VERDICT_TIERS.high
    ...null, // Use VERDICT_TIERS based on fit_tier
  },
};

// ============================================
// ACCORDION ROW LABELS
// ============================================
export const ACCORDION_ROWS = {
  row1: {
    icon: '✅',
    label: '3 Reasons You Fit',
    getStatus: () => 'Looks good',
  },
  row2: {
    icon: '📹',
    label: 'Do This First',
    subline: 'Boost your odds before you send',
    getStatus: (count) => `${count} fix${count !== 1 ? 'es' : ''}`,
  },
  row3: {
    icon: '✅',
    label: 'Contact Found',
    getStatus: (email) => email ? `${email.substring(0, 12)}...` : 'Verified',
  },
  row4: {
    icon: '✅',
    label: 'Pitch Written',
    getStatus: (tone) => `${tone.charAt(0).toUpperCase() + tone.slice(1)} tone`,
  },
  row5: {
    icon: '✅',
    label: 'Best Time Found',
    getStatus: (day, timeRange) => `${day} · ${timeRange} 🔥`,
  },
  row6: {
    icon: '⭐',
    label: 'Improve Your Odds',
    getStatus: () => 'Pro',
    isPro: true,
  },
};

// ============================================
// EXPANDED ROW CONTENT
// ============================================
export const EXPANDED_CONTENT = {
  row2: {
    gainPill: '🟢 Better chance of reply', // Free tier - no percentages
  },
  row6: {
    freePreview: '3 more improvements available',
    proUpsell: 'Unlock all with Pro',
    proPricing: '$19/mo',
  },
};

// ============================================
// SEND BUTTON
// ============================================
export const SEND_BUTTON = {
  labelTemplate: (brandName) => `Get Brand PR — ${brandName}`,
  label: 'Get Brand PR',
  formLabel: 'Open form prep →',
  emailLabel: 'Contact Brand',
};

// ============================================
// DESIGN TOKENS
// ============================================
export const TOKENS = {
  // Verdict pills (aligned with creatorTokens)
  verdictGreenBg: '#eef6f3',
  verdictGreenFg: '#095a46',
  verdictAmberBg: '#fef3c7',
  verdictAmberFg: '#92400e',
  verdictOrangeBg: '#ffedd5',
  verdictOrangeFg: '#c2410c',
  verdictRedBg: '#fee2e2',
  verdictRedFg: '#dc2626',
  verdictProBg: 'linear-gradient(90deg, #0d7a5f, #095a46)',

  // Hero band
  heroEmSize: '44px',
  heroTitleSize: '19px',
  heroTitleWeight: 900,
  heroSublineSize: '11.5px',

  // Mentor section
  mentorBg: '#f7f5f0',
  mentorBorder: '#e4e2dc',
  mentorTextPrimary: '#12141a',
  mentorTextSecondary: '#5c6470',
  mentorCoachNote: '#2a2e38',

  // Accordion rows
  accRowMinHeight: '56px',
  accRowPadding: '16px 20px',
  accRowBorder: '1px solid #e4e2dc',
  accRowExpandedBg: '#fffdf8',

  // Pro row
  proRowBg: 'linear-gradient(90deg, rgba(13,122,95,.06), rgba(9,90,70,.04))',
  proRowBorder: '1.5px solid #b8d5cb',

  // Completion flash
  flashBg: 'linear-gradient(160deg, #095a46 0%, #0d7a5f 100%)',

  // Loading (legacy key kept for any remaining refs)
  lootBg: '#f7f5f0',
  lootCardPopDuration: '400ms',
  lootCardPopEasing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

  // Shared rebuild surfaces
  paper: '#f7f5f0',
  ink: '#12141a',
  action: '#0f0f0f',
  accent: '#0d7a5f',
  accentDeep: '#095a46',
  fontSans: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  fontDisplay: "'Instrument Serif', Georgia, 'Times New Roman', serif",
};
