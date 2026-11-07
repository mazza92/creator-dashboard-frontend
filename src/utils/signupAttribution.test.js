import { captureAttribution, readAttribution, sendAttributionOnce } from './signupAttribution';

beforeEach(() => localStorage.clear());

test('captures utm and ttclid, first touch wins', () => {
  captureAttribution('?utm_source=tiktok&utm_id=123&ttclid=abc', '/land-your-first-pr-package');
  captureAttribution('?utm_source=google', '/');
  const t = readAttribution();
  expect(t.utm_source).toBe('tiktok');
  expect(t.ttclid).toBe('abc');
  expect(t.landing).toBe('/land-your-first-pr-package');
});

test('ignores visits without tracking params', () => {
  expect(captureAttribution('?search=glow', '/directory')).toBeNull();
  expect(readAttribution()).toBeNull();
});

test('sends once, only when logged in', async () => {
  captureAttribution('?utm_source=tiktok', '/');
  const post = jest.fn().mockResolvedValue({});
  expect(await sendAttributionOnce(post)).toBe(false);
  localStorage.setItem('userId', '9');
  expect(await sendAttributionOnce(post)).toBe(true);
  expect(await sendAttributionOnce(post)).toBe(false);
  expect(post).toHaveBeenCalledTimes(1);
  expect(post.mock.calls[0][1].utm_source).toBe('tiktok');
});
