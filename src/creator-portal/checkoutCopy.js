// Copy for the on-site checkout page (CheckoutPage): kept apart so it can be tested without Stripe.

export function formatDay(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export function checkoutFaq(trialDays, trialEndsOn) {
  const day = formatDay(trialEndsOn);
  return [
    {
      q: 'Am I charged today?',
      a: trialDays
        ? `No. You pay $0 today and $19 on ${day || 'the day your free week ends'}, unless you cancel before then.`
        : 'Yes, $19 today and then every month. Cancel anytime and Pro stays on until the end of the month you paid for.',
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

export function trustTicks(trialDays) {
  return [
    trialDays ? `$0 today, ${trialDays} days free` : '$19/month, no contract',
    'Cancel anytime from Settings',
    'Polly starts on your pitches right away',
  ];
}
