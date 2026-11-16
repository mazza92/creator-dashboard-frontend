import { NextResponse } from 'next/server';

// CRA app routes — redirect to app.newcollab.co (CRA deployment)
const CRA_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-email-pending',
  '/resend-verification',
  '/payment',
  '/payment-success',
  '/payment-failed',
  '/stripe',
  '/dashboard',
  '/creator/dashboard',
  '/brand/dashboard',
  '/marketplace',
  '/settings',
  '/onboarding',
  '/supply',
  '/admin',
  '/r',
];

function matchesCraRoute(pathname) {
  return CRA_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
}

// Next strips its own RSC headers and `_rsc` before middleware sees the request (outside edge rendering), so
// also use the browser's Sec-Fetch-Dest: a page load is "document", a router fetch or prefetch is "empty".
function isRscRequest(request) {
  const h = request.headers;
  if (h.get('rsc') === '1' || h.has('next-router-prefetch') || request.nextUrl.searchParams.has('_rsc')) return true;
  const dest = h.get('sec-fetch-dest');
  return dest === 'empty';
}

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // Only intercept CRA routes
  if (!matchesCraRoute(pathname)) {
    return NextResponse.next();
  }

  // Marketing host → CRA app. Never redirect when already on the CRA host
  // or /r/TOKEN bounces: app → newcollab.co → app → crash.
  const craOrigin =
    process.env.CRA_ORIGIN ||
    (process.env.VERCEL_ENV ? 'https://app.newcollab.co' : '');
  if (craOrigin) {
    try {
      const dest = new URL(craOrigin);
      const here = request.nextUrl;
      if (here.hostname === dest.hostname) {
        return NextResponse.next();
      }
    } catch {
      // fall through to redirect
    }
    // Client-side navigations and prefetches fetch an RSC payload. A cross-origin redirect makes that fetch
    // fail on CORS (console error, and a wasted round trip before the click works). Answer with a non-RSC
    // response instead: Next ignores it for prefetches and falls back to a full page load on click, which
    // then gets the normal redirect below.
    if (isRscRequest(request)) {
      return new NextResponse(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.redirect(`${craOrigin}${pathname}${search}`);
  }

  // No CRA_ORIGIN configured — let Next.js handle (will show CraOnlyNotice fallback)
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|api|.*\\..*).*)',
  ],
};
