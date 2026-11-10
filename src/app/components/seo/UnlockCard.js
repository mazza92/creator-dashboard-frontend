'use client';

import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { tokens } from '../../../theme/tokens';
import { trackCtaView } from '../../../lib/seoConversion';
import SignupButtons from './SignupButtons';

/**
 * Inline "content unlock" card shown after the free part of a brand list.
 * The fade above it hints that the rest of the list continues (and is partly locked).
 */
export default function UnlockCard({ ctx, locked, location = 'unlock_gate', title, body, fade = true }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        trackCtaView({ location, page: ctx.page });
        io.disconnect();
      }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [location, ctx.page]);

  return (
    <Card ref={ref} className="nc-unlock-card" $fade={fade} aria-labelledby={`${location}-title`}>
      <Kicker>
        <LockIcon />
        {locked > 0 ? `${locked} more brands with locked contacts` : 'Verified PR contacts'}
      </Kicker>
      <Title id={`${location}-title`}>{title || 'Unlock the full list with verified PR contacts — free'}</Title>
      <Body>
        {body ||
          'Create a free account to see the PR email or application link for every brand below, save the ones you like and let Polly draft your pitch.'}
      </Body>
      <SignupButtons ctx={ctx} location={location} />
      <Trust>
        <li>Free plan</li>
        <li>No follower minimum</li>
        <li>2,000+ brands</li>
      </Trust>
    </Card>
  );
}

export function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

const Card = styled.section`
  position: relative;
  margin: 40px 0 36px;
  padding: 24px 24px 20px;
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusCard};
  box-shadow: 0 1px 3px rgba(15, 15, 15, 0.04), 0 12px 32px rgba(15, 15, 15, 0.06);
  font-family: ${tokens.fontFamily};
  text-align: left;

  ${(p) =>
    p.$fade
      ? `&::before {
    content: '';
    position: absolute;
    left: -1px;
    right: -1px;
    bottom: 100%;
    height: 72px;
    margin-bottom: 1px;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.95));
    pointer-events: none;
  }`
      : ''}

  @media (max-width: 560px) {
    padding: 20px 16px 16px;
    border-radius: 16px;
  }
`;

const Kicker = styled.p`
  && {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 10px;
    padding: 4px 10px;
    border-radius: ${tokens.radiusPill};
    background: ${tokens.primaryLight};
    border: 1px solid ${tokens.primaryBorder};
    color: ${tokens.primary};
    font-size: 12px;
    font-weight: 700;
    line-height: 1.4;
    letter-spacing: 0.01em;
  }
`;

const Title = styled.p`
  && {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.25;
    color: ${tokens.textPrimary};
  }
  @media (max-width: 560px) {
    && { font-size: 19px; }
  }
`;

const Body = styled.p`
  && {
    margin: 0;
    font-size: 15px;
    line-height: 1.55;
    color: ${tokens.textSecondary};
    max-width: 42rem;
  }
`;

const Trust = styled.ul`
  && {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin: 14px 0 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
    color: ${tokens.textMuted};
  }
  && li {
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  && li::before {
    content: '✓';
    color: ${tokens.success};
    font-weight: 700;
  }
`;
