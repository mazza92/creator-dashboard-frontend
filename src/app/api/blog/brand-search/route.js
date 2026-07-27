import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * GET /api/blog/brand-search
 *
 * Query params:
 *   - q: search query (required)
 *   - source_page: blog post slug (optional)
 *   - mode: 'redirect' (default) or 'json' (for autocomplete)
 *   - limit: max results for autocomplete (default 5)
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const sourcePage = searchParams.get('source_page') || '';
  const mode = searchParams.get('mode') || 'redirect';
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  // Validate query
  if (!q || q.length < 2) {
    if (mode === 'json') {
      return NextResponse.json({ brands: [], query: q });
    }
    return NextResponse.redirect(new URL('/register/creator?ref=blog_widget', request.url));
  }

  const normalizedQuery = q.toLowerCase().replace(/[^\w\s-]/g, '').trim();

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search brands using multiple strategies
    let brands = [];

    // 1. Exact slug match
    const { data: slugMatch } = await supabase
      .from('pr_brands')
      .select('id, slug, brand_name, category, min_followers, response_rate, avg_product_value, collaboration_type, cover_image_url, website')
      .eq('status', 'published')
      .eq('slug', normalizedQuery.replace(/\s+/g, '-'))
      .limit(1);

    if (slugMatch?.length) {
      brands = slugMatch;
    } else {
      // 2. Name search (case-insensitive)
      const { data: nameMatches } = await supabase
        .from('pr_brands')
        .select('id, slug, brand_name, category, min_followers, response_rate, avg_product_value, collaboration_type, cover_image_url, website')
        .eq('status', 'published')
        .ilike('brand_name', `%${normalizedQuery}%`)
        .order('brand_name')
        .limit(limit);

      brands = nameMatches || [];
    }

    // For JSON mode (autocomplete), return brand list
    if (mode === 'json') {
      // Log search for analytics (fire and forget)
      logSearch(supabase, q, normalizedQuery, sourcePage, brands.length > 0 ? brands[0]?.slug : null);

      return NextResponse.json({
        query: q,
        brands: brands.map(b => ({
          slug: b.slug,
          name: b.brand_name,
          category: b.category,
          minFollowers: b.min_followers,
          responseRate: b.response_rate,
          avgValue: b.avg_product_value,
          collaborationType: b.collaboration_type,
          logo: getBrandLogo(b),
          logoLetter: b.brand_name?.charAt(0)?.toUpperCase() || '?',
        })),
      });
    }

    // For redirect mode (form submit)
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://newcollab.co';

    if (brands.length > 0) {
      const brand = brands[0];
      // Log hit
      logSearch(supabase, q, normalizedQuery, sourcePage, brand.slug);

      const redirectUrl = new URL('/register/creator', frontendUrl);
      redirectUrl.searchParams.set('ref', 'blog_widget');
      redirectUrl.searchParams.set('brand', brand.slug);
      redirectUrl.searchParams.set('intent', 'brand_specific');
      if (sourcePage) redirectUrl.searchParams.set('source_page', sourcePage);

      return NextResponse.redirect(redirectUrl);
    } else {
      // No match - log demand
      logSearch(supabase, q, normalizedQuery, sourcePage, null);

      const redirectUrl = new URL('/register/creator', frontendUrl);
      redirectUrl.searchParams.set('ref', 'blog_widget');
      redirectUrl.searchParams.set('brand_query', q);
      if (sourcePage) redirectUrl.searchParams.set('source_page', sourcePage);

      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('[brand-search] Error:', error);

    if (mode === 'json') {
      return NextResponse.json({ brands: [], query: q, error: 'Search failed' }, { status: 500 });
    }

    // Graceful fallback - redirect to signup
    return NextResponse.redirect(new URL('/register/creator?ref=blog_widget', request.url));
  }
}

/**
 * Log search to appropriate table
 */
async function logSearch(supabase, queryRaw, queryNormalized, sourcePage, matchedSlug) {
  try {
    if (matchedSlug) {
      // Brand found - log to brand_search_hits
      await supabase.from('brand_search_hits').insert({
        brand_slug: matchedSlug,
        source_page: sourcePage || 'unknown',
      });
    } else {
      // No match - log to brand_demand
      await supabase.from('brand_demand').insert({
        query_raw: queryRaw,
        query_normalized: queryNormalized,
        source_page: sourcePage || 'unknown',
      });
    }
  } catch (e) {
    console.error('[brand-search] Log error:', e);
  }
}

/**
 * Get brand logo URL
 */
function getBrandLogo(brand) {
  if (brand.cover_image_url) return brand.cover_image_url;
  if (brand.website) {
    try {
      const domain = new URL(brand.website).hostname.replace('www.', '');
      return `https://logo.clearbit.com/${domain}`;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * POST /api/blog/brand-search/notify
 * Email capture for brands we don't have
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, brandQuery, sourcePage } = body;

    if (!email || !brandQuery) {
      return NextResponse.json({ error: 'Email and brand query required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store notification request with email
    await supabase.from('brand_demand').insert({
      query_raw: brandQuery,
      query_normalized: brandQuery.toLowerCase().trim(),
      source_page: sourcePage || 'unknown',
      notify_email: email,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[brand-search/notify] Error:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
