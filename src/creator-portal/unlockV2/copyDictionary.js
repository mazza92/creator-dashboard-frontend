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
  title: 'Your talent manager is on it',
  cards: [
    { key: 'inbox', pending: '⋯', done: '✓', text: 'Contact found' },
    { key: 'pitch', pending: '⋯', done: '✓', text: 'Pitch drafted' },
    { key: 'strategy', pending: '⋯', done: '✓', text: 'Brand strategy ready' },
    { key: 'ready', pending: '⋯', done: '✓', text: 'Profile checked' },
  ],
  fallbackText: 'Almost ready…',
  cyclingTexts: [
    'Reviewing your profile…',
    'Checking what this brand looks for…',
    'Writing a pitch that fits you…',
    'Finding the right contact…',
    'Building your plan to look collab-ready…',
    'Finishing your strategy…',
  ],
  cyclingIntervalMs: 2000,
  maxTimeMs: 4000,
  minCardGapMs: 200,
};

// ============================================
// COMPLETION FLASH
// ============================================
export const FLASH = {
  title: 'Strategy ready',
  subline: 'Your plan for this brand is loading…',
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
    pill: 'Pitch Today',
    pillColor: 'green',
  },
  almost: {
    confidence: 'good',
    confidenceLabel: 'Good Match',
    confidenceStars: 4,
    pill: 'Pitch Today',
    pillColor: 'green',
  },
  not_yet: {
    confidence: 'growth',
    confidenceLabel: 'Growth Match',
    confidenceStars: 3,
    pill: 'Worth Improving First',
    pillColor: 'amber',
  },
  poor_fit: {
    confidence: 'stretch',
    confidenceLabel: 'Stretch Match',
    confidenceStars: 2,
    pill: 'Lower Priority',
    pillColor: 'amber',
  },
  build_first: {
    confidence: 'low',
    confidenceLabel: 'Low Priority',
    confidenceStars: 1,
    pill: 'Better Matches Available',
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
    collapsedLabel: 'Contact, pitch, and timing ready',
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
  note: 'Your talent manager already did the hard part — stay consistent.',
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
  // Dynamic label with brand name - more action-oriented
  labelTemplate: (brandName) => `✉️ Pitch ${brandName}`,
  label: '✉️ Pitch Brand', // Fallback
};

// ============================================
// DESIGN TOKENS
// ============================================
export const TOKENS = {
  // Verdict pills
  verdictGreenBg: '#dcfce7',
  verdictGreenFg: '#0f7a44',
  verdictAmberBg: '#fef3c7',
  verdictAmberFg: '#92400e',
  verdictOrangeBg: '#ffedd5',
  verdictOrangeFg: '#c2410c',
  verdictRedBg: '#fee2e2',
  verdictRedFg: '#dc2626',
  verdictProBg: 'linear-gradient(90deg, #8b5cf6, #c026d3)',

  // Hero band
  heroEmSize: '44px',
  heroTitleSize: '19px',
  heroTitleWeight: 900,
  heroSublineSize: '11.5px',

  // Mentor section
  mentorBg: '#f9fafb',
  mentorBorder: '#e5e7eb',
  mentorTextPrimary: '#111827',
  mentorTextSecondary: '#6b7280',
  mentorCoachNote: '#374151',

  // Accordion rows
  accRowMinHeight: '56px',
  accRowPadding: '16px 20px',
  accRowBorder: '1px solid #f4f4f6',
  accRowExpandedBg: '#fafbfd',

  // Pro row
  proRowBg: 'linear-gradient(90deg, rgba(139,92,246,.04), rgba(192,38,211,.04))',
  proRowBorder: '1.5px solid #d8b4fe',

  // Completion flash
  flashBg: 'linear-gradient(160deg, #0b3d1e 0%, #0f7a44 100%)',

  // Loading
  lootBg: 'linear-gradient(180deg, #0f1015 0%, #2a1335 100%)',
  lootCardPopDuration: '400ms',
  lootCardPopEasing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};
