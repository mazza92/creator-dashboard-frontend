// Keeps scrapers off creator portfolios (/kit/<username>). Search engines and link previews (so a creator's
// shared link still unfurls) pass; headless browsers, HTTP libraries, AI training crawlers and SEO scrapers get
// a 403. A per-IP cap catches crawlers that pose as a normal browser. The cap is per server instance, so it is
// a speed bump, not a guarantee: the Vercel firewall rate-limit rule is the hard limit.

const BLOCKED_UA = new RegExp([
  'headlesschrome', 'phantomjs', 'puppeteer', 'playwright', 'selenium', 'webdriver', 'electron/',
  'python-requests', 'python-urllib', 'python/', 'aiohttp', 'httpx', 'scrapy', 'curl/', 'wget/', 'go-http-client',
  'java/', 'okhttp', 'node-fetch', 'axios/', 'undici', 'libwww', 'httrack', 'colly', 'crawler4j', 'apify',
  'gptbot', 'ccbot', 'bytespider', 'amazonbot', 'anthropic-ai', 'claudebot', 'claude-searchbot', 'google-extended',
  'applebot-extended', 'perplexitybot', 'meta-externalagent', 'meta-externalfetcher', 'diffbot', 'omgili',
  'imagesiftbot', 'timpibot', 'cohere-ai', 'youbot', 'img2dataset', 'friendlycrawler',
  'dataforseobot', 'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'petalbot', 'barkrowler', 'blexbot',
  'serpstatbot', 'zoominfobot', 'seekportbot',
].map((s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')).join('|'), 'i');

// Always allowed, even if they also match a pattern above.
const ALLOWED_UA = /(googlebot|bingbot|duckduckbot|applebot\/|yandexbot|slurp|facebookexternalhit|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|pinterestbot|redditbot|skypeuripreview|embedly|iframely)/i;

export const KIT_LIMIT = 40; // kit page loads per IP...
export const KIT_WINDOW_MS = 10 * 60 * 1000; // ...per 10 minutes

const hits = new Map();

export function isKitPath(pathname) {
  return pathname === '/kit' || pathname.startsWith('/kit/');
}

export function blockedKitAgent(ua) {
  const s = (ua || '').trim();
  if (!s) return true;
  if (ALLOWED_UA.test(s)) return false;
  return BLOCKED_UA.test(s);
}

export function overKitLimit(ip, now = Date.now()) {
  if (!ip) return false;
  const recent = (hits.get(ip) || []).filter((t) => now - t < KIT_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, list] of hits) {
      if (!list.length || now - list[list.length - 1] > KIT_WINDOW_MS) hits.delete(key);
      if (hits.size <= 4000) break;
    }
  }
  return recent.length > KIT_LIMIT;
}

export function resetKitLimits() {
  hits.clear();
}
