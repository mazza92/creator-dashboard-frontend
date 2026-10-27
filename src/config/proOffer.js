// Single source for how Pro is sold (backend twin: services/pro_offer.py). Sell the daily outreach Polly does,
// never an outcome: no "yes", no "collab", no deal promises. DAILY_PITCHES must match the autopilot default.
export const PRO_PRICE = '$19';
export const PRO_PRICE_MONTHLY = '$19/mo';
export const PRO_BRANDS_PER_MONTH = 60;
export const DAILY_PITCHES = 3;

export const PRO_OFFER = {
  headline: 'New brands pitched for you, every day.',
  promise: `Every weekday Polly picks ${DAILY_PITCHES} brands that fit you, writes each pitch, sends it from your Gmail and follows up. You see who opened your kit.`,
  extra: "Outreach you couldn't keep up by hand, done while you create.",
  short: `Polly pitches ${DAILY_PITCHES} brands for you every day`,
  priceLine: `$19/mo · ${DAILY_PITCHES} brands pitched every weekday · cancel or pause anytime`,
  cta: 'Put Polly to work',
  ctaShort: 'Put Polly to work',
  ctaPrice: 'Put Polly to work · $19/mo',
  ctaYearly: 'Put Polly to work · $152/yr',
  ctaTrial: 'Start my free week',
  trialSubline: 'Free for 7 days, then $19/mo',
  trialSublineYearly: 'Free for 7 days, then $152/yr',
  priceSubline: 'About 30¢ a pitch. Cancel or pause anytime.',
  outOfCredits: `You're out of free pitches. On Pro, Polly sends ${DAILY_PITCHES} a day from your Gmail, with follow-ups.`,
};

// Free vs Pro rows for the paywall. `true` renders a check, `false` a lock, strings render as-is.
export const PRO_COMPARE = [
  { label: 'New pool of brands daily', free: true, pro: true },
  { label: 'Automate your brand outreach', free: 'Manual send', pro: 'Up to 100 emails' },
  { label: 'Sent from your Gmail', free: false, pro: true },
  { label: 'Daily follow-ups', free: false, pro: true },
  { label: 'Who opened your kit', free: false, pro: true },
  { label: 'Gifting applications', free: '3/mo', pro: 'Unlimited' },
  { label: 'Paid UGC briefs', free: false, pro: true },
];
