import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import UnifiedBrandDirectory from './UnifiedBrandDirectory';

/**
 * Australia Collection Page
 * Pre-filtered brand directory for Australian brands
 * Targets GSC keywords:
 * - "pr packages australia" (179 impressions, Position 6.5)
 * - "how to get pr packages in australia" (281 impressions, Position 7.0)
 */
const AustraliaDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Set country filter to "Australia" on mount if not already set
    if (!searchParams.get('country')) {
      setSearchParams({ country: 'Australia' });
    }
  }, [searchParams, setSearchParams]);

  return (
    <>
      <Helmet>
        <title>Australian Brand PR Application Forms - How to Get PR Packages in Australia (2026) | NewCollab</title>
        <meta
          name="description"
          content="Direct PR application forms for Australian brands. Find PR packages Australia, requirements, and how to get PR as an Australian influencer. Local and international brands shipping to AU."
        />
        <meta
          name="keywords"
          content="pr packages australia, how to get pr packages in australia, australian brand pr, australia influencer pr, pr list australia, australian beauty pr, brands that send pr to australia"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Australian Brand PR Application Forms - How to Get PR in Australia" />
        <meta property="og:description" content="Access PR application forms for brands sending PR packages to Australia. Requirements, contact info, and Australian influencer resources." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://newcollab.co/directory/australia" />
        <meta property="og:image" content="https://newcollab.co/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Australian Brand PR Application Forms - PR Packages Australia" />
        <meta name="twitter:description" content="Direct PR application forms for Australian influencers. Find brands sending PR to Australia." />
        <meta name="twitter:image" content="https://newcollab.co/og-image.png" />

        <link rel="canonical" href="https://newcollab.co/directory/australia" />
      </Helmet>

      <UnifiedBrandDirectory
        collectionMode="australia"
        collectionTitle="Australian Brand PR Application Forms"
        collectionDescription="Access direct PR application forms for brands sending PR packages to Australia. Find requirements, contact information, and both local Australian brands and international brands shipping to AU."
      />
    </>
  );
};

export default AustraliaDirectory;
