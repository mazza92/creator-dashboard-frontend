'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { dashboardHomeHref, editProfileHref } from '../lib/dashboardLinks';
const STUDIO_FONT = "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

export function portfolioShareUrl(slug) {
  const clean = String(slug || '').replace(/^@/, '').replace(/^\/+|\/+$/g, '');
  return clean ? `https://newcollab.co/kit/${clean}` : '';
}

export function portfolioShareHost(slug) {
  return portfolioShareUrl(slug).replace(/^https?:\/\//, '');
}

export default function PortfolioLiveModal({
  open,
  slug,
  updated = false,
  loggedIn = false,
  onClose,
  onView,
}) {
  const [copied, setCopied] = useState(false);
  const url = portfolioShareUrl(slug);
  const host = portfolioShareHost(slug);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      return undefined;
    }
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <Scrim role="presentation" onClick={onClose}>
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-live-title"
        onClick={(event) => event.stopPropagation()}
      >
        <Kicker>{updated ? 'Portfolio updated' : 'Portfolio published'}</Kicker>
        <Title id="portfolio-live-title">
          {updated ? 'Your portfolio is up to date' : 'Your portfolio is live'}
        </Title>
        <Copy>
          Paste this link in your Instagram bio, TikTok profile, and Linktree or Beacon.
          When a brand taps it, we record the view.
        </Copy>
        <Places>
          <Place>Instagram bio</Place>
          <Place>TikTok bio</Place>
          <Place>Linktree</Place>
          <Place>Beacon</Place>
        </Places>
        <LinkRow>
          <LinkText title={url}>{host || 'Publish to get your URL'}</LinkText>
          <CopyBtn type="button" onClick={copy} disabled={!url}>
            {copied ? 'Copied' : 'Copy link'}
          </CopyBtn>
        </LinkRow>
        <Actions>
          {onView ? (
            <Ghost type="button" onClick={onView}>View portfolio</Ghost>
          ) : null}
          {loggedIn ? (
            <Ghost as="a" href={editProfileHref('creator')}>Edit profile</Ghost>
          ) : null}
          {loggedIn ? (
            <Done as="a" href={dashboardHomeHref('creator')}>Dashboard</Done>
          ) : (
            <Done type="button" onClick={onClose}>Done</Done>
          )}
        </Actions>
      </Card>
    </Scrim>,
    document.body,
  );
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 120;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, .46);
  backdrop-filter: blur(8px);
`;
const Card = styled.div`
  width: min(440px, 100%);
  background: #fff;
  border-radius: 24px;
  padding: 28px 24px 22px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, .22);
  font-family: ${STUDIO_FONT};
  color: #0f172a;
`;
const Kicker = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #db2777;
`;
const Title = styled.h2`
  margin: 8px 0 10px;
  font-size: 26px;
  line-height: 1.15;
  letter-spacing: -.03em;
  font-weight: 800;
`;
const Copy = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: #475569;
`;
const Places = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 16px 0 18px;
`;
const Place = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 5px 10px;
`;
const LinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 8px 8px 8px 14px;
`;
const LinkText = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const CopyBtn = styled.button`
  flex-shrink: 0;
  min-height: 40px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  background: #0f172a;
  color: #fff;
  font: 700 13px/1 ${STUDIO_FONT};
  cursor: pointer;
  &:disabled { opacity: .5; cursor: default; }
`;
const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
  button, a { flex: 1; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box; }
`;
const Ghost = styled.button`
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #0f172a;
  font: 700 13px/1 ${STUDIO_FONT};
  cursor: pointer;
`;
const Done = styled.button`
  min-height: 44px;
  border-radius: 12px;
  border: 0;
  background: #0f172a;
  color: #fff;
  font: 700 13px/1 ${STUDIO_FONT};
  cursor: pointer;
`;
