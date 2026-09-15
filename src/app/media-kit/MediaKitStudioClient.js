'use client';

import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import PublicKitStudio from '../../kit-builder/PublicKitStudio';

export default function MediaKitStudioClient() {
  return (
    <LandingPageLayoutNext hideFooter canonicalUrl="https://newcollab.co/media-kit">
      <PublicKitStudio />
    </LandingPageLayoutNext>
  );
}
