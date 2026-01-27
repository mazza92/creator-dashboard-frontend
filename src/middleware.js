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

  // Redirect to CRA deployment
  const craOrigin = process.env.CRA_ORIGIN;
  if (craOrigin) {
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
