'use client';

import React from 'react';

// Simplified registry - styled-components 6.x works with Next.js App Router
// The compiler option in next.config.js handles most of the SSR
export default function StyledComponentsRegistry({ children }) {
  return <>{children}</>;
}
