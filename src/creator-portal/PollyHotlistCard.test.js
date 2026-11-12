import { whenLine } from './PollyHotlistCard';

test('hotlist card: the line under the pills adds only the date', () => {
  expect(whenLine({ ads: 9, reason: 'Running 9 creator-style ads since Oct 28 · Gifted 3 creators your size' })).toBe('Live since Oct 28');
  expect(whenLine({ ads: 0, reason: 'Running Meta ads (spotted Nov 6)' })).toBe('Spotted Nov 6');
  expect(whenLine({ ads: 0, reason: 'Fresh skincare pick · verified inbox' })).toBe('Fresh skincare pick · verified inbox');
  expect(whenLine({ ads: 2, reason: 'Running 2 ads' })).toBe('');
});
