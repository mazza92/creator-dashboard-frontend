import React, { useState } from 'react';
import styled from 'styled-components';
import { HOT_TIP } from './hotTip';

// 🔥 on a hot brand (running ads with UGC creators right now). Hover, focus or tap shows why (below the tag, so
// cards with overflow: hidden don't clip it).
//   <HotTag />               inline 🔥 before a brand name
//   <HotTag variant="chip" /> "🔥 Hot" pill for card chip rows
export default function HotTag({ variant = 'icon', label = 'Hot' }) {
  const [open, setOpen] = useState(false);
  const chip = variant === 'chip';
  return (
    <Wrap
      $chip={chip}
      tabIndex={0}
      role="note"
      aria-label={HOT_TIP}
      onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
      onMouseLeave={() => setOpen(false)}
      onBlur={() => setOpen(false)}
      data-open={open ? 'true' : undefined}
    >
      <span aria-hidden="true">🔥</span>
      {chip ? <b>{label}</b> : null}
      <Tip role="tooltip" aria-hidden="true">{HOT_TIP}</Tip>
    </Wrap>
  );
}

const Tip = styled.span`
  position: absolute;
  left: -6px;
  top: calc(100% + 8px);
  transform: translateY(-4px);
  width: max-content;
  max-width: 220px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #15161a;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0;
  text-align: left;
  white-space: normal;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  opacity: 0;
  pointer-events: none;
  transition: opacity .15s ease, transform .15s ease;
  z-index: 50;

  &::after {
    content: "";
    position: absolute;
    bottom: 100%;
    left: 12px;
    border: 5px solid transparent;
    border-bottom-color: #15161a;
  }
`;

const Wrap = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: help;
  outline: none;
  vertical-align: baseline;
  margin-right: ${(p) => (p.$chip ? 0 : '4px')};
  font-size: ${(p) => (p.$chip ? '12px' : '0.95em')};
  ${(p) => p.$chip && `
    font-weight: 700;
    white-space: nowrap;
    border-radius: 999px;
    padding: 5px 10px 5px 8px;
    background: #FDE8E2;
    color: #9A3412;
    border: 1px solid rgba(232, 93, 59, 0.28);
    box-shadow: 0 1px 2px rgba(17, 17, 17, 0.06);
    b { font-weight: 700; }
  `}

  &:hover ${Tip}, &:focus-visible ${Tip}, &[data-open='true'] ${Tip} {
    opacity: 1;
    transform: translateY(0);
  }
  &:focus-visible { box-shadow: 0 0 0 2px rgba(232, 93, 59, 0.45); border-radius: 999px; }
`;
