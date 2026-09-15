'use client';

import React from 'react';
import styled from 'styled-components';
import useDashboardSession from '../hooks/useDashboardSession';
import { dashboardHomeHref, editProfileHref, loginHref, signupHref } from '../lib/dashboardLinks';
import { tokens } from '../theme/tokens';

export default function AuthNavButtons({ isSignupPage = false, variant = 'desktop', onNavigate }) {
  const session = useDashboardSession();
  const signedIn = session.status === 'in';
  const dashboard = dashboardHomeHref(session.role);
  const profile = editProfileHref(session.role);

  const handleClick = () => {
    if (onNavigate) onNavigate();
  };

  if (variant === 'mobile-cta') {
    return (
      <MobileCta
        href={signedIn ? dashboard : signupHref()}
        onClick={handleClick}
      >
        {signedIn ? 'Dashboard' : 'Sign up free'}
      </MobileCta>
    );
  }

  if (signedIn) {
    return (
      <Row $stack={variant === 'mobile-menu'}>
        <Ghost href={profile} $light={isSignupPage} onClick={handleClick}>Edit profile</Ghost>
        <Solid href={dashboard} onClick={handleClick}>Dashboard</Solid>
      </Row>
    );
  }

  return (
    <Row $stack={variant === 'mobile-menu'}>
      <Ghost href={loginHref()} $light={isSignupPage} onClick={handleClick}>Log in</Ghost>
      <Solid href={signupHref()} onClick={handleClick}>Sign up</Solid>
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  ${p => p.$stack ? `
    flex-direction: column;
    width: 100%;
    a { width: 100%; text-align: center; }
  ` : ''}
`;

const Ghost = styled.a`
  color: ${p => p.$light ? '#ffffff' : tokens.textPrimary};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: ${tokens.radiusBtn};
  transition: all 0.15s ease;
  border: 1px solid ${p => p.$light ? 'rgba(255, 255, 255, 0.3)' : tokens.border};
  background: transparent;
  white-space: nowrap;

  &:hover {
    border-color: ${p => p.$light ? 'rgba(255, 255, 255, 0.5)' : tokens.borderHover};
    color: ${p => p.$light ? '#ffffff' : tokens.textPrimary};
    background: ${p => p.$light ? 'rgba(255, 255, 255, 0.1)' : tokens.subtle};
  }
`;

const Solid = styled.a`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: ${tokens.radiusBtn};
  background: ${tokens.action};
  transition: all 0.15s ease;
  display: block;
  text-align: center;
  white-space: nowrap;

  &:hover {
    background: ${tokens.actionHover};
    color: #ffffff;
  }
`;

const MobileCta = styled.a`
  display: none;
  background: ${tokens.action};
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: ${tokens.radiusBtn};
  margin-right: 16px;
  white-space: nowrap;

  &:hover {
    background: ${tokens.actionHover};
    color: #ffffff;
  }

  @media (max-width: 768px) {
    display: block;
  }
`;
