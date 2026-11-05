// Paid UGC gigs slotted into the Brands feed: one after every few posts/brands, the rest at the end.
export const GIG_EVERY = 4;

export function mixFeed(items, gigs, every = GIG_EVERY) {
  const out = [];
  let g = 0;
  (items || []).forEach((item, i) => {
    out.push(item);
    if ((i + 1) % every === 0 && g < (gigs || []).length) {
      out.push({ type: 'gig', key: `gig-${gigs[g].id}`, gig: gigs[g] });
      g += 1;
    }
  });
  (gigs || []).slice(g).forEach((gig) => out.push({ type: 'gig', key: `gig-${gig.id}`, gig }));
  return out;
}

