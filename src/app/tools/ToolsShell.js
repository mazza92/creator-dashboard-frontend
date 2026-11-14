'use client';

import LandingPageLayoutNext from '../components/LandingPageLayoutNext';

export default function ToolsShell({ canonicalUrl, children }) {
  return <LandingPageLayoutNext canonicalUrl={canonicalUrl}>{children}</LandingPageLayoutNext>;
}
