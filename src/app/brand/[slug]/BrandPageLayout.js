'use client';

import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';

export default function BrandPageLayout({ children, canonicalUrl }) {
  return (
    <LandingPageLayoutNext canonicalUrl={canonicalUrl}>
      {children}
    </LandingPageLayoutNext>
  );
}
