'use client';

import TermsOfService from '../../cra-pages/TermsOfService';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import LandingFooter from '../components/LandingFooter';

export default function TermsClient() {
  return (
    <LandingPageLayoutNext hideFooter>
      <TermsOfService />
      <LandingFooter />
    </LandingPageLayoutNext>
  );
}
