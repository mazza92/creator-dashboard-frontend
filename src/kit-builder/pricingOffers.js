/** Follower-based starting rates. Conservative on purpose — creators can raise. */
export function suggestRates(followers = 0) {
  const n = Number(followers) || 0;
  if (n >= 50000) return { reel: 450, tiktok: 400, photo: 180 };
  if (n >= 20000) return { reel: 280, tiktok: 250, photo: 120 };
  if (n >= 10000) return { reel: 180, tiktok: 160, photo: 80 };
  if (n >= 5000) return { reel: 120, tiktok: 110, photo: 55 };
  if (n >= 2000) return { reel: 80, tiktok: 75, photo: 40 };
  return { reel: 50, tiktok: 45, photo: 25 };
}

export const RATE_OFFERS = [
  {
    id: 'gifted',
    name: 'Gifted PR',
    blurb: 'Product + shipping. The default for first collabs.',
    apply: () => ({ reel: 0, tiktok: 0, photo: 0, gifted: true }),
  },
  {
    id: 'starter',
    name: 'Starter paid',
    blurb: 'Reel + TikTok from a modest floor. Photo optional.',
    apply: (followers) => {
      const s = suggestRates(followers);
      return { reel: s.reel, tiktok: s.tiktok, photo: s.photo, gifted: true };
    },
  },
  {
    id: 'bundle',
    name: 'Content bundle',
    blurb: 'One reel + one still. Brands like a clear package.',
    apply: (followers) => {
      const s = suggestRates(followers);
      return {
        reel: Math.round(s.reel * 1.35),
        tiktok: s.tiktok,
        photo: Math.round(s.photo * 0.85),
        gifted: true,
      };
    },
  },
];

export function formatRate(n) {
  const v = Number(n) || 0;
  if (!v) return 'Gifted';
  return `from $${v.toLocaleString()}`;
}

export function ratesFromDraft(draft = {}, followers = 0) {
  const n = Number(followers) || 0;
  if (draft.offerId === 'custom') {
    const custom = draft.customRates || {};
    return {
      reel: Number(String(custom.reel || '').replace(/[^\d]/g, '')) || 0,
      tiktok: Number(String(custom.tiktok || '').replace(/[^\d]/g, '')) || 0,
      photo: Number(String(custom.photo || '').replace(/[^\d]/g, '')) || 0,
      gifted: custom.gifted !== false,
    };
  }
  const offer = RATE_OFFERS.find((item) => item.id === draft.offerId) || RATE_OFFERS[0];
  return offer.apply(n);
}

export function matchOfferId(rates, followers = 0) {
  const src = rates || {};
  const reel = Number(src.rates_reel || 0);
  if (!reel) return 'gifted';
  const starter = RATE_OFFERS.find((item) => item.id === 'starter')?.apply(followers) || {};
  const bundle = RATE_OFFERS.find((item) => item.id === 'bundle')?.apply(followers) || {};
  if (reel === Number(bundle.reel || 0)) return 'bundle';
  if (reel === Number(starter.reel || 0)) return 'starter';
  return 'custom';
}

