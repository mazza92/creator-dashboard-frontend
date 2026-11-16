import React from 'react';
import styled from 'styled-components';
import { BadgeCheck } from 'lucide-react';
import { OFFICIAL_LISTINGS } from '../config/officialListings';

/**
 * "Listed in ChatGPT" / "Listed in Claude" badges linking to Newcollab's official directory listings.
 * Text and a neutral check only, no vendor logos. Works in both the Next site and the CRA app.
 */
const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: ${(p) => (p.$center ? 'center' : 'flex-start')};
`;

const Badge = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 9px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$dark ? 'rgba(255,255,255,0.16)' : '#e4e2dc')};
  background: ${(p) => (p.$dark ? '#12141a' : '#fff')};
  color: ${(p) => (p.$dark ? '#fff' : '#12141a')};
  text-decoration: none;
  box-shadow: ${(p) => (p.$dark ? 'none' : '0 1px 2px rgba(18,20,26,0.05)')};
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  &:hover {
    transform: translateY(-1px);
    border-color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.32)' : '#c9c6bd')};
    box-shadow: 0 6px 16px rgba(18,20,26,0.08);
  }
  &:focus-visible { outline: 2px solid #0d7a5f; outline-offset: 2px; }
  .ic {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: ${(p) => (p.$dark ? 'rgba(124,224,184,0.16)' : '#eef6f3')};
    color: ${(p) => (p.$dark ? '#7ce0b8' : '#0d7a5f')};
    flex: none;
  }
  .txt { display: flex; flex-direction: column; line-height: 1.15; text-align: left; }
  .lbl {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${(p) => (p.$dark ? 'rgba(255,255,255,0.62)' : '#5c6470')};
  }
  .name { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
`;

function track(campaign, slug) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'listing_badge_click', { event_category: 'trust', event_label: slug, campaign });
}

export default function ListedInBadges({ dark = false, center = false, campaign = 'site', className, style }) {
  return (
    <Row $center={center} className={className} style={style} aria-label="Official AI platform listings">
      {OFFICIAL_LISTINGS.map((l) => (
        <Badge key={l.slug} $dark={dark} href={l.url} target="_blank" rel="noopener noreferrer"
          title={`Newcollab in the official ${l.directoryName}`} onClick={() => track(campaign, l.slug)}>
          <span className="ic" aria-hidden="true"><BadgeCheck size={17} strokeWidth={2.2} /></span>
          <span className="txt">
            <span className="lbl">Listed in</span>
            <span className="name">{l.name}</span>
          </span>
        </Badge>
      ))}
    </Row>
  );
}
