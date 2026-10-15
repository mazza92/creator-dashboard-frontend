'use client';

import PrivacyPolicy from '../../cra-pages/PrivacyPolicy';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import LandingFooter from '../components/LandingFooter';

export default function PrivacyPolicyClient() {
  return (
    <LandingPageLayoutNext hideFooter>
      <PrivacyPolicy />
      <LandingFooter />
    </LandingPageLayoutNext>
  );
}
