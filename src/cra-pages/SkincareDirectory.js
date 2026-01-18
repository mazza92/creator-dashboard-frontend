import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import UnifiedBrandDirectory from './UnifiedBrandDirectory';

/**
 * Skincare Collection Page
 * Pre-filtered brand directory for skincare brands
 * Targets GSC keyword: "skincare pr list" (154 impressions, Position 30.8)
 */
const SkincareDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Set category filter to "Skincare" on mount if not already set
    if (!searchParams.get('category')) {
      setSearchParams({ category: 'Skincare' });
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <Helmet>
        <title>Skincare Brand PR Application Forms - 75+ Beauty Brands (2026) | NewCollab</title>
        <meta
          name="description"
          content="Direct skincare brand PR application forms. Find skincare PR list requirements, application links, and brands sending PR to micro-influencers. Filter by follower count."
        />
        <meta
          name="keywords"
          content="skincare pr list, skincare pr application form, skincare brands pr, beauty pr list, skincare influencer pr, skincare pr packages, how to get skincare pr, skincare pr requirements"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Skincare Brand PR Application Forms - 75+ Beauty Brands" />
        <meta property="og:description" content="Access direct PR application forms for 75+ skincare brands. Requirements, contact info, and micro-influencer friendly options." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://newcollab.co/directory/skincare" />
        <meta property="og:image" content="https://newcollab.co/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Skincare Brand PR Application Forms - 75+ Beauty Brands" />
        <meta name="twitter:description" content="Direct skincare PR application forms with requirements and contact info." />
        <meta name="twitter:image" content="https://newcollab.co/og-image.png" />

        <link rel="canonical" href="https://newcollab.co/directory/skincare" />
      </Helmet>

      <UnifiedBrandDirectory
        collectionMode="skincare"
        collectionTitle="Skincare Brand PR Application Forms"
        collectionDescription="Access direct PR application forms for 75+ skincare and beauty brands. Find requirements, contact information, and brands that send PR to micro-influencers."
      />
    </>
  );
};

export default SkincareDirectory;
