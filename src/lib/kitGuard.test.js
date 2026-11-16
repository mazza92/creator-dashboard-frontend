import { blockedKitAgent, isKitPath, overKitLimit, resetKitLimits, KIT_LIMIT, KIT_WINDOW_MS } from './kitGuard';

const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

test('kit paths', () => {
  expect(isKitPath('/kit/jane')).toBe(true);
  expect(isKitPath('/kit')).toBe(true);
  expect(isKitPath('/media-kit')).toBe(false);
  expect(isKitPath('/kitchen')).toBe(false);
});

test('browsers, search engines and link previews pass; scrapers do not', () => {
  expect(blockedKitAgent(CHROME)).toBe(false);
  expect(blockedKitAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')).toBe(false);
  expect(blockedKitAgent('facebookexternalhit/1.1')).toBe(false);
  expect(blockedKitAgent('WhatsApp/2.23.20.0')).toBe(false);
  expect(blockedKitAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0 Safari/537.36')).toBe(true);
  expect(blockedKitAgent('python-requests/2.31.0')).toBe(true);
  expect(blockedKitAgent('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)')).toBe(true);
  expect(blockedKitAgent('Mozilla/5.0 (compatible; AhrefsBot/7.0)')).toBe(true);
  expect(blockedKitAgent('')).toBe(true);
  expect(blockedKitAgent(undefined)).toBe(true);
});

test('per-IP cap', () => {
  resetKitLimits();
  const t = 1_000_000;
  for (let i = 0; i < KIT_LIMIT; i += 1) expect(overKitLimit('1.2.3.4', t + i)).toBe(false);
  expect(overKitLimit('1.2.3.4', t + KIT_LIMIT)).toBe(true);
  expect(overKitLimit('5.6.7.8', t)).toBe(false);
  expect(overKitLimit('1.2.3.4', t + KIT_WINDOW_MS + KIT_LIMIT + 1)).toBe(false);
  expect(overKitLimit('', t)).toBe(false);
});
