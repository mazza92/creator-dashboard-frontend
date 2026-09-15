'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import useDashboardSession from '../hooks/useDashboardSession';
import {
  dashboardHomeHref,
  editKitHref,
  editProfileHref,
  isGuestKitOwner,
} from '../lib/dashboardLinks';

export default function KitOwnerBar({ username }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const session = useDashboardSession();
  const slug = String(username || '').replace(/^@/, '').trim();
  const guestOwner = isGuestKitOwner(slug);
  const signedIn = session.status === 'in';
  const isOwner = signedIn && slug && session.username
    && String(session.username).replace(/^@/, '').trim().toLowerCase() === slug.toLowerCase();

  if (!signedIn && !guestOwner) return null;

  const dashboard = dashboardHomeHref(session.role);
  const profile = editProfileHref(session.role);
  const kit = editKitHref();

  const bar = (
    <Bar role="navigation" aria-label="Account">
      <Brand href="https://newcollab.co">newcollab</Brand>
      <Copy>
        {isOwner || guestOwner
          ? 'This is your public profile.'
          : 'Signed in.'}
      </Copy>
      <Actions>
        {guestOwner && !signedIn ? (
          <Ghost href="/media-kit">Edit this portfolio</Ghost>
        ) : (
          <>
            <Ghost href={isOwner ? kit : profile}>Edit profile</Ghost>
            <Solid href={dashboard}>Dashboard</Solid>
          </>
        )}
      </Actions>
    </Bar>
  );

  return (
    <>
      <Spacer aria-hidden="true" />
      {mounted ? createPortal(bar, document.body) : null}
    </>
  );
}

const BAR_HEIGHT = '52px';

const Spacer = styled.div`
  height: calc(${BAR_HEIGHT} + env(safe-area-inset-top, 0px));
  flex-shrink: 0;
`;

const Bar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 400;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: ${BAR_HEIGHT};
  padding: calc(10px + env(safe-area-inset-top, 0px)) 18px 10px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid #ececec;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #111;
`;

const Brand = styled.a`
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -.02em;
  color: #111;
  text-decoration: none;
  flex-shrink: 0;
`;

const Copy = styled.span`
  font-size: 13px;
  color: #6b6b6b;
  flex: 1;
  min-width: 0;
  @media (max-width: 640px) {
    display: none;
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const Ghost = styled.a`
  font-size: 13px;
  font-weight: 600;
  color: #111;
  text-decoration: none;
  padding: 7px 12px;
  border-radius: 9px;
  border: 1px solid #e5e5e5;
  white-space: nowrap;
  &:hover { background: #f6f6f6; }
`;

const Solid = styled.a`
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  padding: 7px 12px;
  border-radius: 9px;
  background: #111;
  white-space: nowrap;
  &:hover { background: #222; color: #fff; }
`;
