'use client';

import { useEffect } from 'react';
import { captureAttribution } from '../../utils/signupAttribution';

// Remembers the first ad / UTM touch on any marketing page (homepage included) so signup on
// app.newcollab.co can credit the right campaign. Renders nothing.
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution(window.location.search, window.location.pathname);
  }, []);
  return null;
}
