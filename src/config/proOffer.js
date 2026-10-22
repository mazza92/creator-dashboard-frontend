// Single source for how Pro is sold. Lead with the volume Polly pitches for you, never with "unlimited credits".
export const PRO_PRICE = '$19';
export const PRO_PRICE_MONTHLY = '$19/mo';
export const PRO_BRANDS_PER_MONTH = 60;

export const PRO_OFFER = {
  headline: '60 brands a month, pitched for you.',
  promise: 'Polly finds 60 brands a month that fit your niche, writes a pitch for each one and sends it from your Gmail, follow-ups included.',
  extra: "That's about 20 hours of outreach a month you get back for filming.",
  short: 'Polly pitches 60 brands a month for you',
  priceLine: '$19/mo · 60 brands pitched for you every month · cancel or pause anytime',
  cta: 'Put Polly to work',
  ctaShort: 'Put Polly to work',
  ctaPrice: 'Put Polly to work · $19/mo',
  ctaYearly: 'Put Polly to work · $152/yr',
  ctaTrial: 'Start my free week',
  trialSubline: 'Free for 7 days, then $19/mo',
  trialSublineYearly: 'Free for 7 days, then $152/yr',
  priceSubline: 'About 30¢ a pitch. Cancel or pause anytime.',
  outOfCredits: 'Out of free credits. On Pro, Polly pitches 60 brands a month for you from your Gmail, and applications are unlimited.',
};

// Free vs Pro rows for the paywall. `true` renders a check, `false` a lock, strings render as-is.
export const PRO_COMPARE = [
  { label: 'Brand matches from Polly', free: true, pro: true },
  { label: 'Brands pitched for you', free: false, pro: '60/mo' },
  { label: 'Sent from your Gmail', free: false, pro: true },
  { label: 'Automatic follow-ups', free: false, pro: true },
  { label: 'Gifting applications', free: '3/mo', pro: 'Unlimited' },
  { label: 'Paid UGC briefs', free: false, pro: true },
];
