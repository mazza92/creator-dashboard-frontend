# Next.js Configuration Fixes

## Issues Fixed

### 1. ✅ Pages/App Directory Conflict
**Error**: `pages` and `app` directories should be under the same folder

**Solution**: Moved `app/` directory to `src/app/` since we're using the `src` directory structure.

### 2. ✅ Deprecated `images.domains`
**Warning**: `images.domains` is deprecated

**Solution**: Updated to use `images.remotePatterns` instead:
```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'picsum.photos' },
    { protocol: 'https', hostname: 'kyawgtojxoglvlhzsotm.supabase.co' },
    { protocol: 'https', hostname: 'images.unsplash.com' },
  ],
}
```

### 3. ✅ Invalid `swcMinify` Option
**Warning**: Unrecognized key `swcMinify`

**Solution**: Removed `swcMinify` (it's enabled by default in Next.js 16+)

### 4. ✅ Turbopack/Webpack Conflict
**Error**: Turbopack enabled but webpack config present

**Solution**: 
- Added `turbopack: {}` to next.config.js
- Updated dev script to use `--webpack` flag explicitly

## Updated File Structure

```
creator-dashboard/
├── src/
│   ├── app/              ← Next.js App Router (moved here)
│   │   ├── blog/
│   │   │   ├── page.js
│   │   │   ├── BlogPageClient.js
│   │   │   └── [slug]/
│   │   │       ├── page.js
│   │   │       ├── BlogPostClient.js
│   │   │       └── not-found.js
│   │   ├── components/
│   │   │   └── LandingPageLayoutNext.js
│   │   ├── layout.js
│   │   └── globals.css
│   ├── pages/            ← CRA pages (ignored by Next.js)
│   └── components/       ← Shared components
├── lib/
│   └── blog.js           ← Blog utilities
└── next.config.js
```

## Updated Import Paths

All imports have been updated to reflect the new structure:
- `@/lib/blog` → `../../../../lib/blog` (relative from src/app)
- `@/src/components` → `../../components` (relative from src/app)

## Next Steps

1. **Test the server**: `npm run dev:next`
2. **Visit**: http://localhost:3000/blog
3. **Verify**: All blog posts load correctly
4. **Check**: No console errors

## Commands

```bash
# Development (uses webpack)
npm run dev:next

# Production build
npm run build:next

# Production server
npm run start:next
```
