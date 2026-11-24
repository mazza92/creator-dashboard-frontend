// Copy for the on-site checkout page (CheckoutPage): kept apart so it can be tested without Stripe.

export function formatDay(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
}

// plan: { interval: 'monthly' | 'yearly', offer: '' | 'winback' } (what the upgrade modal sold).
export function planPrice(plan = {}) {
  if (plan.offer === 'winback') return { tick: '$12/month for 3 invoices, then $19', unit: 'month', amount: '$12' };
  if (plan.interval === 'yearly') return { tick: '$152/year, no contract', unit: 'year', amount: '$152' };
  return { tick: '$19/month, no contract', unit: 'month', amount: '$19' };
}

export function checkoutFaq(trialDays, trialEndsOn, plan = {}) {
  const day = formatDay(trialEndsOn);
  const price = planPrice(plan);
  const charged = plan.offer === 'winback'
    ? 'Yes, $12 today. You pay $12 a month for 3 invoices, then $19 a month. Cancel anytime and Pro stays on '
      + 'until the end of the month you paid for.'
    : `Yes, ${price.amount} today and then every ${price.unit}. Cancel anytime and Pro stays on until the end `
      + `of the ${price.unit} you paid for.`;
  return [
    {
      q: 'Am I charged today?',
      a: trialDays
        ? `No. You pay $0 today and ${price.amount} on ${day || 'the day your free week ends'}, unless you cancel before then.`
        : charged,
    },
    {
      q: 'How do I cancel?',
      a: 'From Settings, in one tap. No email to write, no call. You can also pause Pro for a month instead.',
    },
    {
      q: 'Do I need Gmail?',
      a: 'No. Connect Gmail and pitches go out from your own address. Without it, Polly sends them for you through '
        + 'Newcollab, and brand replies still land in your inbox.',
    },
    {
      q: "What if brands don't reply?",
      a: 'Polly follows up on day 4 and day 10, and moves you toward brands that are replying to creators like you. '
        + 'Most replies take 2 to 4 weeks.',
    },
  ];
}

export function trustTicks(trialDays, plan = {}) {
  return [
    trialDays ? `$0 today, ${trialDays} days free` : planPrice(plan).tick,
    'Cancel anytime from Settings',
    'Polly starts on your pitches right away',
  ];
}


function shortDate(iso) {
  const d = iso ? new Date(`${iso}T12:00:00Z`) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// The trial week, day by day, beside the card form (start choice test, Nov 2026).
export function trialTimeline(trialDays, trialEndsOn) {
  const ends = shortDate(trialEndsOn);
  return [
    ['Every day', 'Polly scans brands running UGC ads and new gigs, and pitches up to 20 that fit you'],
    ['Day 3–5', 'Follow-ups go out, and most brand replies arrive'],
    [`Day ${Math.max(1, trialDays - 2)}`, 'A recap email of what Polly did, so you decide with real results'],
    [`Day ${trialDays}`, `$19/mo starts${ends ? ` on ${ends}` : ''}, unless you cancel from your settings`],
  ];
}
