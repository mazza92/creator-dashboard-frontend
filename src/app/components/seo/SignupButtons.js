'use client';

import styled from 'styled-components';
import { tokens } from '../../../theme/tokens';
import { seoSignupHref, signedInHref, trackCtaClick } from '../../../lib/seoConversion';

/**
 * "Continue with Google" first, then email: both open creator signup with the page context.
 * Signed-in creators get one button to their dashboard instead.
 */
export default function SignupButtons({ ctx, location, signedIn, emailLabel = 'Sign up with email', compact }) {
  const go = (method) => () => trackCtaClick({ location, page: ctx.page, brand: ctx.brand, method });
  if (signedIn) {
    return (
      <Row $compact={compact}>
        <Primary href={signedInHref(ctx.brand)} onClick={go('dashboard')}>Open my brand matches</Primary>
      </Row>
    );
  }
  return (
    <Row $compact={compact}>
      <Google href={seoSignupHref({ ...ctx, location, method: 'google' })} onClick={go('google')}>
        <GoogleIcon />
        Continue with Google
      </Google>
      <Secondary href={seoSignupHref({ ...ctx, location, method: 'email' })} onClick={go('email')}>
        {emailLabel}
      </Secondary>
    </Row>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: ${(p) => (p.$compact ? '12px' : '18px')};

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const base = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 18px;
  border-radius: ${tokens.radiusBtn};
  font-family: ${tokens.fontFamily};
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
  text-decoration: none !important;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease;

  &:focus-visible {
    outline: 3px solid ${tokens.primaryBorder};
    outline-offset: 2px;
  }

  @media (max-width: 560px) {
    width: 100%;
  }
`;

const Google = styled.a`
  ${base}
  && {
    background: ${tokens.action};
    color: #fff;
  }
  &&:hover {
    background: ${tokens.actionHover};
    color: #fff;
  }
  svg {
    background: #fff;
    border-radius: 50%;
    padding: 2px;
    width: 22px;
    height: 22px;
  }
`;

const Primary = styled(Google)``;

const Secondary = styled.a`
  ${base}
  && {
    background: #fff;
    color: ${tokens.textPrimary};
    border: 1px solid ${tokens.border};
  }
  &&:hover {
    border-color: ${tokens.borderHover};
    background: ${tokens.subtle};
    color: ${tokens.textPrimary};
  }
`;
