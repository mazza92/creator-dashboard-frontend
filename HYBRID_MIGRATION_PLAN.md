# 🔀 Hybrid Migration Plan: Public Pages Only

## ✅ Safe Migration Strategy

**Goal**: Migrate only public/SEO pages to Next.js while keeping all core app features (dashboards, auth, payments) in CRA.

## 🎯 Pages to Migrate to Next.js (Public Only)

### ✅ Already Migrated
- `/blog` - Blog listing
- `/blog/:slug` - Individual blog posts

### 📋 Next to Migrate (Public/SEO Pages)
1. `/` - Landing page (Founding50)
2. `/about` - About page
3. `/contact` - Contact page
4. `/brands/pr-packages` - Brand PR packages page
5. `/marketplace` - Marketplace (public view)
6. `/directory/skincare` - Skincare directory
7. `/directory/k-beauty` - K-Beauty directory
8. `/directory/australia` - Australia directory
9. `/brand/:slug` - Public brand page
10. `/c/:username` - Public creator profile
11. `/privacy-policy` - Privacy policy
12. `/terms-of-service` - Terms of service

### 🚫 Pages to KEEP in CRA (Core App)
- `/login` - Authentication
- `/register` - Registration
- `/register/brand` - Brand onboarding
- `/register/creator` - Creator onboarding
- `/forgot-password` - Password reset
- `/reset-password` - Password reset
- `/verify-email` - Email verification
- `/dashboard/*` - All dashboard routes
- `/creator/dashboard/*` - Creator dashboard
- `/brand/dashboard/*` - Brand dashboard
- `/payment` - Payment processing
- `/payment-success` - Payment success
- `/stripe/*` - Stripe integration
- All authenticated routes

## 🏗️ Architecture: How It Works

### Option A: Next.js Middleware Routing (Recommended)

Next.js will handle public routes, and fallback to CRA for everything else.

```
User Request → Next.js Server
  ├─ Public route? → Next.js handles it (SSR/SSG)
  └─ Dashboard/Auth route? → Rewrite to CRA app
```

### Option B: Subdomain Approach
- `newcollab.co` → Next.js (public pages)
- `app.newcollab.co` → CRA (dashboard)

### Option C: Path-based (Current Setup)
- Next.js runs on port 3000 (dev) or handles public routes (prod)
- CRA runs on port 3001 (dev) or handles dashboard routes (prod)

## 🔧 Implementation Steps

### Step 1: Configure Next.js Middleware

Create `src/middleware.js` to route appropriately:

```javascript
import { NextResponse } from 'next/server';

// Public routes handled by Next.js
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/blog',
  '/brands/pr-packages',
  '/marketplace',
  '/directory',
  '/privacy-policy',
  '/terms-of-service',
  '/brand',
  '/c',
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // If it's a dashboard/auth route, don't handle it (let CRA handle it)
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/login') ||
      pathname.startsWith('/register') ||
      pathname.startsWith('/creator/dashboard') ||
      pathname.startsWith('/brand/dashboard') ||
      pathname.startsWith('/payment')) {
    // Return 404 so CRA can handle it
    return NextResponse.next();
  }
  
  // Handle public routes with Next.js
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Default: let Next.js handle it (or return 404 for CRA)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### Step 2: Update Next.js Config

Add rewrites to proxy dashboard routes to CRA (in production):

```javascript
async rewrites() {
  return [
    // API calls
    {
      source: '/api/:path*',
      destination: 'https://api.newcollab.co/:path*',
    },
    // Dashboard routes → CRA (only in production)
    ...(process.env.NODE_ENV === 'production' ? [
      {
        source: '/dashboard/:path*',
        destination: 'https://app.newcollab.co/dashboard/:path*', // or your CRA URL
      },
      {
        source: '/login',
        destination: 'https://app.newcollab.co/login',
      },
      {
        source: '/register/:path*',
        destination: 'https://app.newcollab.co/register/:path*',
      },
    ] : []),
  ];
}
```

### Step 3: Update Vercel Configuration

For Vercel deployment, configure routing:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.newcollab.co/$1"
    },
    {
      "source": "/(dashboard|login|register|creator/dashboard|brand/dashboard|payment)(.*)",
      "destination": "https://app.newcollab.co/$1$2"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🛡️ Safety Guarantees

### ✅ What WON'T Be Affected

1. **Authentication System**
   - Login/logout flows
   - Session management
   - Token handling
   - All stays in CRA

2. **Dashboard Functionality**
   - Creator dashboard
   - Brand dashboard
   - All dashboard routes
   - All stays in CRA

3. **Payment Processing**
   - Stripe integration
   - Payment flows
   - All stays in CRA

4. **User Management**
   - Profile editing
   - Settings
   - All stays in CRA

5. **API Calls**
   - All API calls continue to work
   - Same endpoints
   - Same authentication

### ✅ What WILL Be Improved

1. **SEO for Public Pages**
   - Server-side rendering
   - Better indexing
   - Faster load times

2. **Public Page Performance**
   - Static generation
   - Better Core Web Vitals
   - Improved user experience

## 📝 Migration Checklist

### Phase 1: Setup (Current)
- [x] Next.js installed
- [x] Blog pages migrated
- [ ] Middleware configured
- [ ] Routing tested

### Phase 2: Landing Page
- [ ] Create `src/app/page.js`
- [ ] Migrate LandingPage/Founding50
- [ ] Test routing
- [ ] Verify SEO

### Phase 3: Marketing Pages
- [ ] `/about` page
- [ ] `/contact` page
- [ ] `/brands/pr-packages` page
- [ ] `/privacy-policy` page
- [ ] `/terms-of-service` page

### Phase 4: Directory Pages
- [ ] `/marketplace` page
- [ ] `/directory/skincare` page
- [ ] `/directory/k-beauty` page
- [ ] `/directory/australia` page

### Phase 5: Dynamic Public Pages
- [ ] `/brand/:slug` page
- [ ] `/c/:username` page

### Phase 6: Testing & Deployment
- [ ] Test all public routes
- [ ] Verify dashboard routes still work
- [ ] Test authentication flows
- [ ] Production deployment
- [ ] Monitor SEO improvements

## 🚀 Development Workflow

### Running Both Apps Locally

**Terminal 1 - Next.js (Public Pages)**
```bash
npm run dev:next
# Runs on http://localhost:3000
```

**Terminal 2 - CRA (Dashboard/Auth)**
```bash
PORT=3001 npm start
# Runs on http://localhost:3001
```

### Testing Strategy

1. **Public Routes** → Test on `localhost:3000`
2. **Dashboard Routes** → Test on `localhost:3001` or redirect
3. **Integration** → Test navigation between both

## 🔄 Deployment Strategy

### Option 1: Same Domain (Recommended)
- Next.js handles public routes
- CRA handles dashboard routes
- Use middleware/rewrites to route

### Option 2: Subdomain
- `newcollab.co` → Next.js
- `app.newcollab.co` → CRA

### Option 3: Path-based
- `/` → Next.js
- `/app/*` → CRA (requires CRA route changes)

## ⚠️ Important Notes

1. **Shared Components**: Can be copied to Next.js, but keep originals in CRA
2. **API Calls**: Both apps use same API, no changes needed
3. **Authentication**: CRA handles all auth, Next.js pages are public
4. **State Management**: No shared state between apps
5. **Styling**: Both can use same CSS/styled-components

## 🎯 Success Criteria

- ✅ All public pages render with Next.js
- ✅ All dashboard routes work in CRA
- ✅ Authentication flows unchanged
- ✅ No breaking changes to core app
- ✅ SEO improvements visible in GSC
- ✅ Performance improvements measured

## 📊 Expected Results

- **SEO**: 50-100% more indexed pages
- **Performance**: 30-50% faster public pages
- **User Experience**: Better Core Web Vitals
- **Core App**: Zero impact, fully functional

---

**Status**: Ready to proceed with safe, incremental migration! 🚀
