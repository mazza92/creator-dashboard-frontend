# 🧪 Landing Page Testing Guide

## ✅ What's Been Fixed

1. **AnalyticsContext** - Created Next.js-compatible version (`AnalyticsProviderNext`)
2. **Routing** - Converted all `useNavigate` → `useRouter`, `Link` components updated
3. **Metadata** - Moved to Next.js metadata API in `page.js`
4. **Layout** - Updated to use `LandingPageLayoutNext`
5. **Imports** - Fixed all import paths for Next.js structure

## 🚀 How to Test

### 1. Start Next.js Dev Server
```bash
npm run dev:next
```

### 2. Visit the Landing Page
Open your browser and go to:
```
http://localhost:3000
```

### 3. What to Check

#### ✅ Visual/Functional Tests
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] All buttons are clickable
- [ ] Navigation links work (blog, register, etc.)
- [ ] Featured blog posts section loads
- [ ] Forms work (username claim form)
- [ ] Animations/transitions work
- [ ] Mobile responsive design

#### ✅ SEO Tests
- [ ] View page source - check for metadata in `<head>`
- [ ] Check structured data (JSON-LD) is present
- [ ] Verify canonical URL is correct
- [ ] Check Open Graph tags
- [ ] Verify Twitter card tags

#### ✅ Console Tests
- [ ] No JavaScript errors in browser console
- [ ] No 404 errors for assets
- [ ] Analytics tracking works (check Network tab for gtag calls)

#### ✅ Performance Tests
- [ ] Page loads quickly
- [ ] Images load properly
- [ ] No layout shifts

## 🔍 Common Issues & Fixes

### Issue: "Cannot find module" errors
**Fix**: Check import paths - they should be relative to `src/app/`

### Issue: Analytics not working
**Fix**: Verify `AnalyticsProviderNext` is in `layout.js`

### Issue: Blog posts not loading
**Fix**: Check that blog post JSON files exist in `src/content/posts/`

### Issue: Styled-components errors
**Fix**: Verify `StyledComponentsRegistry` is in `layout.js`

## 📝 Files to Check

- `src/app/page.js` - Server component with metadata
- `src/app/Founding50Client.js` - Client component (main content)
- `src/app/layout.js` - Root layout with providers
- `src/app/components/LandingPageLayoutNext.js` - Layout wrapper
- `src/app/components/AnalyticsProviderNext.js` - Analytics provider

## 🎯 Expected Behavior

1. **Page loads** with full HTML content (SSR)
2. **All interactive elements** work (buttons, forms, links)
3. **Blog posts** load in featured section
4. **Navigation** works to other pages
5. **SEO metadata** is in the HTML source
6. **No console errors**

## 🐛 If You See Errors

1. **Check terminal output** - Next.js shows compilation errors there
2. **Check browser console** - Runtime errors appear here
3. **Check Network tab** - Missing assets or API calls
4. **Verify file paths** - All imports should be correct

## ✅ Success Criteria

- ✅ Page renders without errors
- ✅ All functionality works
- ✅ SEO metadata is present
- ✅ Performance is good
- ✅ Mobile responsive

---

**Status**: Ready for testing! 🚀
