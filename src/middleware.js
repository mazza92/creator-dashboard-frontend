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
