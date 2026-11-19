// Single source for how Pro is sold (backend twin: services/pro_offer.py). Sell the daily outreach Polly does,
// never an outcome: no "yes", no "collab", no deal promises. DAILY_PITCHES must match the autopilot default;
// MAX_DAILY_PITCHES is the 20-a-day plan (backend MAX_SENDS_PER_DAY, monthly target 400).
export const PRO_PRICE = '$19';
export const PRO_PRICE_MONTHLY = '$19/mo';
export const PRO_BRANDS_PER_MONTH = 60;
export const DAILY_PITCHES = 3;
export const MAX_DAILY_PITCHES = 20;

export const PRO_OFFER = {
  headline: 'New brands pitched for you, every day.',
  promise: `Up to ${MAX_DAILY_PITCHES} brand pitches daily (you choose how many): Polly picks brands that fit you, writes each pitch, sends it from your Gmail and follows up. You see who opened your kit.`,
  extra: 'Pitching 20 brands a day by hand is a full-time job. Polly does it while you create.',
  short: `Up to ${MAX_DAILY_PITCHES} brand pitches daily, sent from your Gmail`,
  priceLine: `$19/mo · up to ${MAX_DAILY_PITCHES} brand pitches daily · cancel or pause anytime`,
  cta: 'Put Polly to work',
  ctaShort: 'Put Polly to work',
  ctaPrice: 'Put Polly to work · $19/mo',
  ctaYearly: 'Put Polly to work · $152/yr',
  ctaTrial: 'Start my free week',
  trialSubline: 'Free for 7 days, then $19/mo',
  trialSublineYearly: 'Free for 7 days, then $152/yr',
  priceSubline: 'About 30¢ a pitch. Cancel or pause anytime.',
  outOfCredits: `You're out of free pitches. On Pro, Polly sends up to ${MAX_DAILY_PITCHES} brand pitches daily from your Gmail, with follow-ups.`,
};

// Free vs Pro rows for the paywall. `true` renders a check, `false` a lock, strings render as-is.
export const PRO_COMPARE = [
  { label: 'New pool of brands daily', free: true, pro: true },
  { label: 'Brand pitches sent for you', free: 'Manual send', pro: 'Up to 20 daily' },
  { label: 'Sent from your Gmail', free: false, pro: true },
  { label: 'Daily follow-ups', free: false, pro: true },
  { label: 'Who opened your kit', free: false, pro: true },
  { label: 'Gifting applications', free: '3/mo', pro: 'Unlimited' },
  { label: 'Paid UGC briefs', free: false, pro: true },
];
