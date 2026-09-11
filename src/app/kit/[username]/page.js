import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import MediaKitClient from './MediaKitClient';
import KitViewTracker from './KitViewTracker';
import { kitApiOrigin, mergeKitWithPublicProfile } from '../../../lib/kitBrandCta';

function portfolioApiBase() {
  // Prefer explicit env; in local Next.js hit the local Flask API so kit
  // changes are visible without deploying api.newcollab.co.
  const fromEnv =
    process.env.NEXT_PUBLIC_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    process.env.REACT_APP_API_BASE;
  if (fromEnv) return fromEnv.replace(/\/$/, '').replace(/\/api$/, '');
  if (process.env.NODE_ENV !== 'production') return 'http://localhost:5000';
  return 'https://api.newcollab.co';
}

// Fetch media kit data from portfolio API (without ref token - tracking done client-side)
async function getMediaKit(username) {
  try {
    const apiBase = portfolioApiBase();
    const res = await fetch(`${apiBase}/api/portfolio/public/${username}`, {
      // Dev: no cache so kit changes are visible immediately
      next: { revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0 },
      cache: process.env.NODE_ENV === 'production' ? 'force-cache' : 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    // Portfolio API returns data directly (not wrapped in success/media_kit)
    if (data.error) return null;

    let profile = null;
    const origin = kitApiOrigin(apiBase);
    const profileUrls = [`${origin}/c/${encodeURIComponent(username)}`];
    if (!origin.includes('api.newcollab.co')) {
      profileUrls.push(`https://api.newcollab.co/c/${encodeURIComponent(username)}`);
    }
    for (const profileUrl of profileUrls) {
      try {
        const profileRes = await fetch(profileUrl, {
          next: { revalidate: process.env.NODE_ENV === 'production' ? 3600 : 0 },
          cache: process.env.NODE_ENV === 'production' ? 'force-cache' : 'no-store',
        });
        if (profileRes.ok) {
          const body = await profileRes.json();
          if (body && !body.error) {
            profile = body;
            if (Array.isArray(body.social_links) && body.social_links.length) break;
          }
        }
      } catch {
        // public profile may be unpublished; kit still renders
      }
    }
    const merged = mergeKitWithPublicProfile(data, profile);

    // Transform portfolio API response to match expected structure
    return {
      success: true,
      media_kit: {
        display_name: merged.display_name || merged.first_name || merged.username,
        username: merged.username,
        tagline: merged.tagline,
        profile_photo_url: merged.avatar_url,
        location: null,
        niches: merged.niches || [],
        total_followers: merged.follower_count,
        engagement_rate: merged.engagement_rate,
        accepts_gifted: merged.rates_gifted,
        accepts_paid: !!(merged.rates_reel || merged.rates_tiktok || merged.rates_photo),
        platforms: [],  // Will be derived from posts
        content_types: [],
        collaborations: (merged.posts || []).filter(p => p.brand_name && p.collab_type !== 'own').map(p => ({
          brand: p.brand_name,
          type: p.collab_type,
          url: p.post_url
        })),
        rates: [
          ...(merged.rates_reel ? [{ name: 'Instagram Reel', price: merged.rates_reel }] : []),
          ...(merged.rates_tiktok ? [{ name: 'TikTok Video', price: merged.rates_tiktok }] : []),
          ...(merged.rates_photo ? [{ name: 'Instagram Photo', price: merged.rates_photo }] : []),
        ],
        posts: merged.posts || [],
        posts_source: merged.posts_source || (merged.posts?.length ? 'portfolio' : null),
        is_pro: merged.is_pro,
        kit_views: merged.kit_views,
        socials: merged.socials || {},
        social_profiles: merged.social_profiles || [],
        social_links: merged.social_links || [],
        regions: merged.regions || [],
        primary_age_range: merged.primary_age_range,
        bio: merged.bio || null,
      }
    };
  } catch (error) {
    console.error('Error fetching media kit:', error);
    return null;
  }
}

// Generate static params for common media kits at build time (SSG)
export async function generateStaticParams() {
  // Return empty array - all usernames will be generated on-demand
  // This enables ISR while avoiding build-time API calls
  return [];
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { username } = await params;
  const data = await getMediaKit(username);

  if (!data || !data.media_kit) {
    return {
      title: 'Media Kit Not Found | Newcollab',
    };
  }

  const mediaKit = data.media_kit;
  const handle = `@${String(username || '').replace(/^@/, '')}`;
  const tagline = mediaKit.tagline || mediaKit.bio || `${handle} media kit`;
  const profileImage = mediaKit.profile_photo_url || '/default-avatar.png';

  return {
    title: `${handle} - Creator Media Kit | Newcollab`,
    description: tagline,
    keywords: mediaKit.niches?.join(', '),
    openGraph: {
      type: 'profile',
      title: `${handle} - Creator Media Kit`,
      description: tagline,
      images: [profileImage],
      url: `https://newcollab.co/kit/${username}`,
      siteName: 'Newcollab',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${handle} - Creator Media Kit`,
      description: tagline,
      images: [profileImage],
      creator: '@newcollab',
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
    alternates: {
      canonical: `https://newcollab.co/kit/${username}`,
    },
  };
}

// This page uses Static Site Generation (SSG) with Incremental Static Regeneration (ISR)
// Pages are pre-rendered at build time and can be regenerated on-demand
export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function MediaKitPage({ params }) {
  const { username } = await params;
  const data = await getMediaKit(username);

  if (!data || !data.media_kit) {
    notFound();
  }

  const mediaKit = data.media_kit;
  const handle = `@${String(username || '').replace(/^@/, '')}`;

  // Create structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": handle,
      "description": mediaKit.tagline,
      "image": mediaKit.profile_photo_url,
      "url": `https://newcollab.co/kit/${username}`,
      ...(mediaKit.location && { "address": { "@type": "PostalAddress", "addressLocality": mediaKit.location } }),
      ...(mediaKit.niches && mediaKit.niches.length > 0 && { "knowsAbout": mediaKit.niches }),
      ...((mediaKit.socials && Object.keys(mediaKit.socials).length > 0) && {
        "sameAs": Object.values(mediaKit.socials).filter(Boolean)
      }),
    }
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://newcollab.co/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Media Kits",
        "item": "https://newcollab.co/kit"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": handle,
        "item": `https://newcollab.co/kit/${username}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        {handle} - Creator Media Kit
      </h1>
      <Suspense fallback={null}>
        <KitViewTracker username={username} />
      </Suspense>
      <MediaKitClient mediaKit={mediaKit} username={username} />
    </>
  );
}
