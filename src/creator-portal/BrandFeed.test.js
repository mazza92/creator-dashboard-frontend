import { mixFeed } from './brandFeedMix';

describe('mixFeed', () => {
  it('slots a paid gig after every 4 feed items, then the rest at the end', () => {
    const items = Array.from({ length: 6 }, (_, i) => ({ type: 'post', key: `p${i}` }));
    const gigs = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const kinds = mixFeed(items, gigs).map((x) => x.type);
    expect(kinds).toEqual(['post', 'post', 'post', 'post', 'gig', 'post', 'post', 'gig', 'gig']);
  });

  it('works with no gigs', () => {
    expect(mixFeed([{ type: 'brand', key: 'b' }], [])).toHaveLength(1);
  });
});
