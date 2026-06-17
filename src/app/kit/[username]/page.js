import { notFound } from 'next/navigation';
import MediaKitClient from './MediaKitClient';

// Fetch media kit data from portfolio API
async function getMediaKit(username, refToken = null) {
  try {
    // Build URL with ref token if present (for kit view tracking with brand attribution)
    const url = refToken
      ? `https://api.newcollab.co/api/portfolio/public/${username}?ref=${refToken}`
      : `https://api.newcollab.co/api/portfolio/public/${username}`;

    const res = await fetch(url, {
      // Don't cache when ref token is present (tracking request)
      cache: refToken ? 'no-store' : undefined,
      next: refToken ? undefined : { revalidate: 3600 } // Cache for 1 hour only if no ref token
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    // Portfolio API returns data directly (not wrapped in success/media_kit)
    if (data.error) return null;

    // Transform portfolio API response to match expected structure
    return {
      success: true,
      media_kit: {
        display_name: data.first_name || data.username,
        username: data.username,
        tagline: data.tagline,
        profile_photo_url: data.avatar_url,
        location: null,
        niches: data.niches || [],
        total_followers: data.follower_count,
        engagement_rate: data.engagement_rate,
        accepts_gifted: data.rates_gifted,
        accepts_paid: !!(data.rates_reel || data.rates_tiktok || data.rates_photo),
        platforms: [],  // Will be derived from posts
        content_types: [],
        collaborations: (data.posts || []).filter(p => p.brand_name && p.collab_type !== 'own').map(p => ({
          brand: p.brand_name,
          type: p.collab_type,
          url: p.post_url
        })),
        rates: [
          ...(data.rates_reel ? [{ name: 'Instagram Reel', price: data.rates_reel }] : []),
          ...(data.rates_tiktok ? [{ name: 'TikTok Video', price: data.rates_tiktok }] : []),
          ...(data.rates_photo ? [{ name: 'Instagram Photo', price: data.rates_photo }] : []),
        ],
        posts: data.posts || [],
        is_pro: data.is_pro,
        kit_views: data.kit_views,
        socials: data.socials || {},
        regions: data.regions || [],
        primary_age_range: data.primary_age_range,
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
  const displayName = mediaKit.display_name || username;
  const tagline = mediaKit.tagline || `${displayName}'s Media Kit`;
  const profileImage = mediaKit.profile_photo_url || '/default-avatar.png';

  return {
    title: `${displayName} - Creator Media Kit | Newcollab`,
    description: tagline,
    keywords: mediaKit.niches?.join(', '),
    openGraph: {
      type: 'profile',
      title: `${displayName} - Creator Media Kit`,
      description: tagline,
      images: [profileImage],
      url: `https://newcollab.co/kit/${username}`,
      siteName: 'Newcollab',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayName} - Creator Media Kit`,
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

export default async function MediaKitPage({ params, searchParams }) {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;
  const refToken = resolvedSearchParams?.ref || null;
  const data = await getMediaKit(username, refToken);

  if (!data || !data.media_kit) {
    notFound();
  }

  const mediaKit = data.media_kit;
  const displayName = mediaKit.display_name || username;

  // Create structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": displayName,
      "description": mediaKit.tagline,
      "image": mediaKit.profile_photo_url,
      "url": `https://newcollab.co/kit/${username}`,
      ...(mediaKit.location && { "address": { "@type": "PostalAddress", "addressLocality": mediaKit.location } }),
      ...(mediaKit.niches && mediaKit.niches.length > 0 && { "knowsAbout": mediaKit.niches }),
      ...(mediaKit.platforms && mediaKit.platforms.length > 0 && {
        "sameAs": mediaKit.platforms.map(p => p.url).filter(Boolean)
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
        "name": displayName,
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
        {displayName} - Creator Media Kit
      </h1>
      <MediaKitClient mediaKit={mediaKit} username={username} />
    </>
  );
}
