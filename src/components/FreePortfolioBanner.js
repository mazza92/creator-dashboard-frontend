import React from 'react';
import styled from 'styled-components';
import { tokens } from '../theme/tokens';
import { FREE_PORTFOLIO_BANNER_HREF } from '../lib/freePortfolioBanner';

const BannerLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 36px;
  padding: 8px 20px;
  background: ${tokens.primaryLight};
  border-bottom: 1px solid ${tokens.primaryBorder};
  color: ${tokens.textPrimary};
  text-decoration: none;
  flex-shrink: 0;
  box-sizing: border-box;

  &:hover {
    background: #ffe4e8;
  }

  &:hover .fpb-cta {
    gap: 8px;
  }

  @media (max-width: 768px) {
    min-height: 34px;
    padding: 7px 14px;
    gap: 8px;
  }
`;

const Label = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: ${tokens.radiusPill};
  background: #ffffff;
  border: 1px solid ${tokens.primaryBorder};
  color: ${tokens.primary};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1.3;
  white-space: nowrap;
`;

const Copy = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${tokens.textSecondary};
  line-height: 1.35;
  letter-spacing: -0.01em;

  @media (max-width: 640px) {
    display: none;
  }
`;

const MobileCopy = styled.span`
  display: none;
  font-size: 13px;
  font-weight: 500;
  color: ${tokens.textSecondary};
  line-height: 1.35;

  @media (max-width: 640px) {
    display: inline;
  }
`;

const Cta = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: ${tokens.primary};
  white-space: nowrap;
  transition: gap 0.15s ease;
`;

export default function FreePortfolioBanner() {
  return (
    <BannerLink
      href={FREE_PORTFOLIO_BANNER_HREF}
      aria-label="Build your free UGC portfolio"
    >
      <Label>Free</Label>
      <Copy>Build a UGC portfolio brands can hire from — no followers required.</Copy>
      <MobileCopy>Build a free UGC portfolio</MobileCopy>
      <Cta className="fpb-cta">Start free <span aria-hidden="true">→</span></Cta>
    </BannerLink>
  );
}
