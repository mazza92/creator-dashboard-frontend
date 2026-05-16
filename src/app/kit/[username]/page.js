import { notFound } from 'next/navigation';
import MediaKitClient from './MediaKitClient';

// Fetch media kit data
async function getMediaKit(username) {
  try {
    const res = await fetch(`https://api.newcollab.co/api/media-kit/public/${username}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('Error fetching media kit:', error);
    return null;
  }
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

// ISR - Revalidate every hour
export const revalidate = 3600;

export default async function MediaKitPage({ params }) {
  const { username } = await params;
  const data = await getMediaKit(username);

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
