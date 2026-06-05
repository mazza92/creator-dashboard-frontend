import { Suspense } from 'react';
import DirectoryClient from '../directory/DirectoryClient';

/**
 * /pr-list SEO landing page
 *
 * Targets "pr list" keyword cluster separately from /directory's "pr forms" focus.
 * Same content (DirectoryClient), unique metadata for broader keyword coverage.
 */
export const metadata = {
  title: 'PR List 2026: 500+ Brands Accepting Influencer Applications | Newcollab',
  description:
    'The ultimate PR list for influencers — 500+ brands accepting PR applications in 2026. Find beauty, skincare, K-beauty & fashion brands with micro-influencer friendly programs. Free to browse.',
  keywords:
    'pr list, pr list for influencers, influencer pr list, brand pr list, pr packages list, brands that send pr to micro influencers, beauty pr list, skincare pr list 2026',
  alternates: {
    canonical: 'https://newcollab.co/pr-list',
  },
  openGraph: {
    title: 'PR List 2026: 500+ Brands Accepting Applications',
    description:
      'Browse the ultimate PR list — 500+ brands accepting influencer applications. Beauty, skincare, K-beauty & fashion. Micro-influencer friendly.',
    type: 'website',
    url: 'https://newcollab.co/pr-list',
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PR List for Influencers — 500+ Brands',
    description:
      'The complete PR list for creators. Browse brands accepting PR applications and start applying today.',
    creator: '@newcollab',
  },
};

// Revalidate every hour — same as /directory
export const revalidate = 3600;

const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export default async function PrListPage() {
  // Fetch first page of brands server-side for crawler visibility
  let initialBrands = [];
  let initialTotal = 0;
  try {
    const res = await fetch(
      'https://api.newcollab.co/api/public/brands?page=1&limit=48',
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      initialBrands = Array.isArray(data.brands) ? data.brands : [];
      initialTotal = data?.pagination?.total || 0;
    }
  } catch (_) {
    // fall back to client-side fetching
  }

  return (
    <>
      <h1 style={srOnly}>PR List 2026: 500+ Brands Accepting Influencer Applications</h1>
      <Suspense fallback={null}>
        <DirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>
    </>
  );
}
