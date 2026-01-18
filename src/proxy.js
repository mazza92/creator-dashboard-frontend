import { NextResponse } from 'next/server';

// Next.js public/SEO routes (handled by Next)
const NEXT_PUBLIC_PREFIXES = [
  '/',
  '/blog',
  '/directory',
  '/brand',
  '/brands/pr-packages',
  '/brands/send-pr-packages',
];

// Routes that should stay in CRA (core app/auth/dashboards + non-migrated marketing)
const CRA_PREFIXES = [
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
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/c',
];

function startsWithAny(pathname, prefixes) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isPublicFile(pathname) {
  // Let Next serve public assets from /public (favicon, robots, images, etc.)
  if (
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json'
  )
    return true;

  // any "/something.ext"
  const last = pathname.split('/').pop() || '';
  return last.includes('.') && !last.endsWith('.html');
}

function safeParseUrl(value) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // Let Next handle its internals + API
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || isPublicFile(pathname)) {
    return NextResponse.next();
  }

  // Everything else falls back to CRA (ONLY when CRA_ORIGIN is configured).
  // This avoids noisy ECONNREFUSED logs when you run Next-only on :3000.
  const origin = process.env.CRA_ORIGIN || null;

  // If we don't know where CRA lives, let Next handle (may 404)
  if (!origin) return NextResponse.next();

  // Safety: never rewrite to ourselves (causes infinite redirects)
  const originUrl = safeParseUrl(origin);
  if (originUrl) {
    const requestHost = request.nextUrl.host;
    const originHost = originUrl.host;
    if (requestHost && originHost && requestHost.toLowerCase() === originHost.toLowerCase()) {
      return NextResponse.next();
    }
  }

  // When CRA_ORIGIN is configured, prefer CRA for known core routes first.
  // This avoids accidentally capturing dashboard routes when we migrate public prefixes like "/brand".
  if (startsWithAny(pathname, CRA_PREFIXES)) {
    const url = new URL(`${origin}${pathname}${search}`);
    return NextResponse.rewrite(url);
  }

  // Keep Next handling public SEO routes that are already migrated
  if (startsWithAny(pathname, NEXT_PUBLIC_PREFIXES)) {
    return NextResponse.next();
  }

  // Everything else: fall back to CRA
  const url = new URL(`${origin}${pathname}${search}`);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next).*)'],
};

