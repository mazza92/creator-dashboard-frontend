'use client';

import LandingPageLayoutNext from '../components/LandingPageLayoutNext';

// Client wrapper so the guide itself stays a server component.
export default function GuideShell({ children }) {
  return (
    <LandingPageLayoutNext canonicalUrl="https://newcollab.co/ugc-starter-guide">
      {children}
    </LandingPageLayoutNext>
  );
}
