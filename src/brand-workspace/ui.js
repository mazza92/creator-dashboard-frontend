// Shared look for the brand workspace views (scan, campaigns, roster, billing).
import styled from 'styled-components';
import { scan as t } from '../app/brands/scan/theme';

export const Pane = styled.div`
  max-width: ${(p) => (p.$wide ? '1100px' : '780px')};
  margin: 0 auto;
  padding: 32px 20px 180px;

  @media (max-width: 900px) {
    padding: 20px 16px 180px;
  }
`;

export const Banner = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  border: 1px solid ${(p) => ({ warn: '#fde2b3', ok: '#c9ecd6' }[p.$tone] || '#fbd5de')};
  background: ${(p) => ({ warn: '#fff8eb', ok: t.greenSoft }[p.$tone] || t.accentSoft)};
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 14px;
  line-height: 1.5;
  color: ${t.ink2};
  margin-bottom: 24px;

  svg { flex: 0 0 auto; margin-top: 2px; color: ${(p) => ({ warn: '#d97706', ok: t.green }[p.$tone] || t.accent)}; }
`;

export const H1 = styled.h1`
  font-size: clamp(24px, 3.4vw, 32px);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-align: ${(p) => (p.$left ? 'left' : 'center')};
  margin: ${(p) => (p.$left ? '0 0 6px' : '12vh 0 24px')};

  @media (max-width: 560px) {
    margin: ${(p) => (p.$left ? '0 0 6px' : '32px 0 20px')};
  }
`;

export const Sub = styled.p`
  font-size: 15px;
  color: ${t.muted};
  margin: 0 0 24px;
`;

export const Empty = styled.div`
  border: 1px dashed ${t.line};
  border-radius: 18px;
  padding: 32px 24px;
  text-align: center;
  color: ${t.muted};
  font-size: 15px;
  line-height: 1.6;

  svg { color: ${t.muted2}; margin-bottom: 8px; }
  b { display: block; color: ${t.ink}; font-size: 17px; margin-bottom: 6px; }
`;

export const Primary = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  background: ${t.accent};
  color: #fff !important;
  font-size: 15px;
  font-weight: 600;
  padding: 12px 18px;
  border-radius: 12px;
  text-decoration: none;
  border: 0;
  cursor: pointer;

  &:hover { background: ${t.accentHover}; }
  &[aria-disabled='true'] { opacity: 0.6; pointer-events: none; }
`;

export const Plan = styled.div`
  border: 1px solid ${t.line};
  border-radius: 18px;
  padding: 22px;
  margin-bottom: 16px;

  h3 { font-size: 16px; margin: 0 0 4px; }
  p { color: ${t.muted}; font-size: 14px; line-height: 1.6; margin: 0; }
  .price { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; margin: 12px 0 4px; }
  .price span { font-size: 14px; font-weight: 500; color: ${t.muted}; }
  ul { margin: 12px 0 0; padding-left: 18px; color: ${t.ink2}; font-size: 14px; line-height: 1.8; }
`;

export const PlainLink = styled.button`
  border: 0;
  background: none;
  padding: 0;
  color: ${t.ink};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: underline;
  text-underline-offset: 3px;
`;
