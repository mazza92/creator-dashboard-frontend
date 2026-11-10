'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createGlobalStyle } from 'styled-components';
import { tokens } from '../../../theme/tokens';
import { applyContentGate } from '../../../lib/contentUnlock';
import { seoSignupHref, signedInHref, trackCtaClick } from '../../../lib/seoConversion';
import UnlockCard from './UnlockCard';

/**
 * Wires the conversion layer onto a rendered blog post body:
 *  - soft content gate on brand lists (see lib/contentUnlock.js), skipped for signed-in creators,
 *  - GA4 `cta_click` for every signup link inside the article (new inline CTAs and the post's own),
 *  - signed-in creators clicking a signup link go to their dashboard instead.
 */
export default function BlogConversion({ contentRef, slug, signedIn }) {
  const [gate, setGate] = useState(null);
  const page = `/blog/${slug}`;

  useEffect(() => {
    const root = contentRef.current;
    if (!root || signedIn) return undefined;
    const applied = applyContentGate(root, {
      onLockedClick: ({ brand }) => {
        trackCtaClick({ location: 'locked_contact', page, brand });
        window.location.href = seoSignupHref({ ref: 'blog', slug, brand, location: 'locked_contact' });
      },
    });
    if (!applied) return undefined;
    root.classList.add('nc-gated');
    setGate(applied);
    return () => {
      root.classList.remove('nc-gated');
      applied.revert();
      setGate(null);
    };
  }, [contentRef, slug, signedIn, page]);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return undefined;
    const onClick = (e) => {
      const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || !root.contains(a)) return;
      const cta = a.getAttribute('data-nc-cta');
      if (!cta && !/\/register\/creator/.test(a.getAttribute('href') || '')) return;
      trackCtaClick({ location: cta || 'post_cta', page });
      if (signedIn) {
        e.preventDefault();
        window.location.href = signedInHref();
      }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [contentRef, signedIn, page]);

  return (
    <>
      <BlogSeoStyles />
      {gate &&
        createPortal(
          <UnlockCard ctx={{ ref: 'blog', slug, page }} locked={gate.locked} location="unlock_gate" />,
          gate.slot
        )}
    </>
  );
}

const BlogSeoStyles = createGlobalStyle`
  /* Locked contact details: text stays in the DOM, only drawn blurred. */
  .nc-gated .nc-locked {
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    color: transparent !important;
    text-shadow: 0 0 7px rgba(15, 15, 15, 0.55);
    text-decoration: none !important;
  }
  .nc-gated .nc-locked * {
    color: transparent !important;
    text-shadow: 0 0 7px rgba(15, 15, 15, 0.55);
    text-decoration: none !important;
  }
  .nc-gated .nc-locked-cell {
    position: relative;
  }
  .nc-gated .nc-locked-cell::after {
    content: 'Unlock free';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 100px;
    background: #fff;
    border: 1px solid ${tokens.primaryBorder};
    color: ${tokens.primary};
    text-shadow: none;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.4;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(15, 15, 15, 0.08);
  }
  .nc-gated .nc-locked-cell:hover::after {
    background: ${tokens.primaryLight};
  }
  .nc-gated .nc-chip {
    display: inline-flex;
    align-items: center;
    vertical-align: middle;
    margin: 0 0 0 8px;
    padding: 2px 10px;
    min-height: 26px;
    border-radius: 100px;
    border: 1px solid ${tokens.primaryBorder};
    background: ${tokens.primaryLight};
    color: ${tokens.primary};
    font: 700 12px/1.4 ${tokens.fontFamily};
    letter-spacing: 0;
    cursor: pointer;
  }
  .nc-gated .nc-chip::before {
    content: '\\1F512\\00a0 PR contact';
  }
  .nc-gated .nc-chip:hover {
    background: #FFE4E9;
  }
  .nc-gated .nc-chip:focus-visible,
  .nc-gated .nc-locked:focus-visible {
    outline: 3px solid ${tokens.primaryBorder};
    outline-offset: 2px;
  }

  /* Inline contextual CTAs injected server-side by lib/blogContent.js */
  .nc-inline-cta {
    margin: 2.5rem 0;
    padding: 22px 24px 20px;
    background: #fff;
    border: 1px solid ${tokens.border};
    border-left: 4px solid ${tokens.primary};
    border-radius: 16px;
    box-shadow: ${tokens.shadowCard};
    font-family: ${tokens.fontFamily};
  }
  .nc-inline-cta p { margin: 0; }
  .nc-inline-cta .nc-inline-cta__kicker {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${tokens.primary};
    margin-bottom: 6px;
  }
  .nc-inline-cta .nc-inline-cta__title {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.25;
    color: ${tokens.textPrimary};
    margin-bottom: 6px;
  }
  .nc-inline-cta .nc-inline-cta__body {
    font-size: 15px;
    line-height: 1.55;
    color: ${tokens.textSecondary};
  }
  .nc-inline-cta .nc-inline-cta__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 14px;
    margin-top: 14px;
  }
  .nc-inline-cta a.nc-inline-cta__btn {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 18px;
    border-radius: ${tokens.radiusBtn};
    background: ${tokens.action};
    color: #fff;
    font-size: 15px;
    font-weight: 700;
    text-decoration: none;
  }
  .nc-inline-cta a.nc-inline-cta__btn:hover { background: ${tokens.actionHover}; color: #fff; }
  .nc-inline-cta a.nc-inline-cta__btn:focus-visible {
    outline: 3px solid ${tokens.primaryBorder};
    outline-offset: 2px;
  }
  .nc-inline-cta .nc-inline-cta__meta { font-size: 13px; color: ${tokens.textMuted}; }
  @media (max-width: 560px) {
    .nc-inline-cta { padding: 18px 16px 16px; }
    .nc-inline-cta .nc-inline-cta__title { font-size: 18px; }
    .nc-inline-cta a.nc-inline-cta__btn { width: 100%; justify-content: center; }
  }
`;
