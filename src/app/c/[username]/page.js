import PublicCreatorProfileClient from './PublicCreatorProfileClient';

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }) {
  const { username } = await params;

  try {
    // Fetch creator data for metadata
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.newcollab.co';
    const res = await fetch(`${apiBase}/c/${username}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      return {
        title: 'Creator Not Found | Newcollab',
        description: 'This creator profile could not be found.',
      };
    }

    const profile = await res.json();

    const title = `@${profile.username} | Creator Profile on Newcollab`;
    const description = profile.bio || `Discover @${profile.username} on Newcollab - Connect with this creator for PR packages and brand partnerships.`;
    const image = profile.image_profile || 'https://newcollab.co/og-image.png';
    const url = `https://newcollab.co/c/${profile.username}`;

    return {
      title,
      description,
      keywords: `${profile.username}, creator, influencer, PR packages, brand partnerships, sponsorships, Newcollab`,
      openGraph: {
        title,
        description,
        type: 'profile',
        url,
        images: [
          {
            url: image,
            width: 400,
            height: 400,
            alt: `@${profile.username} profile picture`,
          },
        ],
        siteName: 'Newcollab',
      },
      twitter: {
        card: 'summary',
        title,
        description,
        images: [image],
        creator: '@newcollab',
      },
      alternates: {
        canonical: url,
      },
    };
  } catch (error) {
    console.error('Error fetching creator metadata:', error);
    return {
      title: 'Creator Profile | Newcollab',
      description: 'Discover creators on Newcollab for PR packages and brand partnerships.',
    };
  }
}

export default async function CreatorProfilePage({ params }) {
  const { username } = await params;

  return <PublicCreatorProfileClient username={username} />;
}
