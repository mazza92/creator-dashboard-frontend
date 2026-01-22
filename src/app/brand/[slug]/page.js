import { notFound } from 'next/navigation';
import BrandPublicClient from './BrandPublicClient';

// Server-side API base - always use production URL for SSR
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.newcollab.co';

export const revalidate = 3600;

async function fetchBrand(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/public/brands/${slug}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const brand = await fetchBrand(slug);

  if (!brand) {
    return { title: 'Brand Not Found | Newcollab' };
  }

  const title = brand?.seo?.title || `${brand.name} PR List Application | Newcollab`;
  const description =
    brand?.seo?.description || `Apply for ${brand.name} PR packages and collaborations.`;

  return {
    title,
    description,
    alternates: { canonical: `https://newcollab.co/brand/${brand.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `https://newcollab.co/brand/${brand.slug}`,
      images: brand.image ? [brand.image] : brand.logo ? [brand.logo] : [],
      siteName: 'Newcollab',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: brand.image ? [brand.image] : brand.logo ? [brand.logo] : [],
      creator: '@newcollab',
    },
  };
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const brand = await fetchBrand(slug);

  if (!brand) notFound();

  return <BrandPublicClient brand={brand} />;
}

