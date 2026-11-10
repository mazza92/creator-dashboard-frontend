'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { tokens } from '../../../theme/tokens';
import useDashboardSession from '../../../hooks/useDashboardSession';
import { seoSignupHref, signedInHref, trackCtaClick } from '../../../lib/seoConversion';
import { LiftScrollTop } from '../../components/seo/StickyCtaBar';

/**
 * Above-the-fold primary CTA on /brand/[slug]: "Pitch {Brand} with Polly — free", plus a
 * secondary link to similar brands. On mobile a copy of the primary CTA sticks to the bottom
 * once the header button has scrolled out of view (fixed + transform: no layout shift).
 */
export default function BrandPitchCta({ slug, brandName, similarCount, similarHref, categoryLabel }) {
  const signedIn = useDashboardSession().status === 'in';
  const [stuck, setStuck] = useState(false);
  const anchorRef = useRef(null);
  const page = `/brand/${slug}`;

  useEffect(() => {
    const el = anchorRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nc-bottom-cta-on', stuck);
    return () => document.body.classList.remove('nc-bottom-cta-on');
  }, [stuck]);

  const href = signedIn
    ? signedInHref(slug)
    : seoSignupHref({ ref: 'brand_page', brand: slug, slug: page, intent: 'brand_specific', location: 'brand_hero' });
  const label = signedIn ? `Pitch ${brandName} with Polly` : `Pitch ${brandName} with Polly — free`;
  const onPrimary = (location) => () => trackCtaClick({ location, page, brand: slug });

  const similarLabel = similarCount > 1
    ? `See ${similarCount.toLocaleString('en-US')} similar brands that send PR`
    : `See similar ${categoryLabel ? `${categoryLabel.toLowerCase()} ` : ''}brands that send PR`;

  return (
    <Wrap>
      <LiftScrollTop />
      <Primary ref={anchorRef} href={href} onClick={onPrimary('brand_hero')}>
        <Spark />
        {label}
      </Primary>
      {similarHref && (
        <Secondary href={similarHref} prefetch={false} onClick={() => trackCtaClick({ location: 'brand_similar', page, brand: slug })}>
          {similarLabel} →
        </Secondary>
      )}
      <MobileBar $shown={stuck} aria-hidden={!stuck}>
        <MobileText>
          <strong>{brandName}</strong>
          <span>{signedIn ? 'Polly drafts the pitch' : 'Free · Polly writes the pitch'}</span>
        </MobileText>
        <MobileCta href={href} tabIndex={stuck ? 0 : -1} onClick={onPrimary('brand_sticky_mobile')}>
          Pitch with Polly
        </MobileCta>
      </MobileBar>
    </Wrap>
  );
}

function Spark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 3l1.9 5.6L19.5 10.5 13.9 12.4 12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />
    </svg>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;

  @media (max-width: 640px) {
    align-items: stretch;
    width: 100%;
  }
`;

const Primary = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 20px;
  border-radius: ${tokens.radiusBtn};
  background: ${tokens.primary};
  color: #fff;
  font-family: ${tokens.fontFamily};
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(225, 29, 72, 0.22);
  transition: background 0.15s ease;

  &:hover { background: ${tokens.primaryHover}; color: #fff; }
  &:focus-visible { outline: 3px solid ${tokens.primaryBorder}; outline-offset: 2px; }

  @media (max-width: 640px) {
    white-space: normal;
    text-align: center;
  }
`;

const Secondary = styled(Link)`
  font-family: ${tokens.fontFamily};
  font-size: 13px;
  font-weight: 600;
  color: ${tokens.textSecondary};
  text-decoration: none;

  &:hover { color: ${tokens.primary}; text-decoration: underline; text-underline-offset: 2px; }
  &:focus-visible { outline: 3px solid ${tokens.primaryBorder}; outline-offset: 2px; border-radius: 4px; }

  @media (max-width: 640px) {
    text-align: center;
  }
`;

const MobileBar = styled.div`
  display: none;

  @media (max-width: 860px) {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1001;
    align-items: center;
    gap: 12px;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(10px);
    border-top: 1px solid ${tokens.border};
    box-shadow: 0 -4px 20px rgba(15, 15, 15, 0.08);
    transform: translateY(${(p) => (p.$shown ? '0' : '110%')});
    transition: transform 0.25s ease;
    pointer-events: ${(p) => (p.$shown ? 'auto' : 'none')};
  }
`;

const MobileText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  font-family: ${tokens.fontFamily};
  line-height: 1.3;

  strong {
    font-size: 15px;
    color: ${tokens.textPrimary};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  span {
    font-size: 12px;
    color: ${tokens.textMuted};
  }
`;

const MobileCta = styled(Primary)`
  min-height: 44px;
  padding: 0 16px;
  font-size: 14px;
  box-shadow: none;
  flex-shrink: 0;

  @media (max-width: 640px) {
    white-space: nowrap;
  }
`;
