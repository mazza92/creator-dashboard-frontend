export const FREE_PORTFOLIO_BANNER_HREF = '/media-kit';

export const FREE_PORTFOLIO_BANNER_BLOG_SLUGS = new Set([
  'list-of-companies-that-send-pr-packages-2026',
  'ultimate-2026-directory-brands-with-open-pr-application-forms',
  'brands-accepting-creators-with-no-followers-2026',
  'gaming-tech-brands-that-sponsor-small-streamers-2026',
  'how-to-get-paid-partnership-on-tiktok-2025',
  'us-brands-send-pr-micro-influencers-2026-list',
  'brands-that-pay-for-ugc-content-2026',
  'k-beauty-korean-skincare-brands-pr-list-small-creators-2026',
]);

function normalizePathname(pathname) {
  const raw = String(pathname || '/').split('?')[0].split('#')[0];
  return raw.replace(/\/+$/, '') || '/';
}

export function shouldShowFreePortfolioBanner(pathname) {
  const path = normalizePathname(pathname);
  if (path === '/media-kit') return false;
  if (path === '/') return true;
  if (path === '/directory' || path.startsWith('/directory/')) return true;
  if (/^\/brand\/[a-z0-9][a-z0-9-]*$/i.test(path)) return true;
  if (path.startsWith('/blog/')) {
    return FREE_PORTFOLIO_BANNER_BLOG_SLUGS.has(path.slice('/blog/'.length));
  }
  return false;
}
