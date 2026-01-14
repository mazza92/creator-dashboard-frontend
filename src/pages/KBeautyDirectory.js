import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import UnifiedBrandDirectory from './UnifiedBrandDirectory';

/**
 * K-Beauty Collection Page
 * Pre-filtered brand directory for K-beauty brands
 * Targets GSC keyword: "k-beauty pr application forms" (64 impressions, Position 12.6)
 */
const KBeautyDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Set search filter to "K-beauty" on mount if not already set
    // Since we may not have a specific K-beauty category, use search
    if (!searchParams.get('search')) {
      setSearchParams({ search: 'K-beauty' });
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <Helmet>
        <title>K-Beauty PR Application Forms - Korean Beauty Brands (2026) | NewCollab</title>
        <meta
          name="description"
          content="Direct K-beauty PR application forms. Find Korean beauty brand PR lists, requirements, and application links. Brands sending PR to micro-influencers."
        />
        <meta
          name="keywords"
          content="k-beauty pr application forms, k-beauty pr list, korean beauty pr, k-beauty influencer pr, korean skincare pr, k-beauty pr packages, cosrx pr list, laneige pr application"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="K-Beauty PR Application Forms - Korean Beauty Brands" />
        <meta property="og:description" content="Access direct PR application forms for K-beauty and Korean skincare brands. Requirements and micro-influencer friendly options." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://newcollab.co/directory/k-beauty" />
        <meta property="og:image" content="https://newcollab.co/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="K-Beauty PR Application Forms - Korean Beauty Brands" />
        <meta name="twitter:description" content="Direct K-beauty PR application forms with requirements and contact info." />
        <meta name="twitter:image" content="https://newcollab.co/og-image.png" />

        <link rel="canonical" href="https://newcollab.co/directory/k-beauty" />
      </Helmet>

      <UnifiedBrandDirectory
        collectionMode="k-beauty"
        collectionTitle="K-Beauty PR Application Forms"
        collectionDescription="Access direct PR application forms for Korean beauty and K-beauty brands. Find requirements, contact information, and brands that send PR to micro-influencers."
      />
    </>
  );
};

export default KBeautyDirectory;
