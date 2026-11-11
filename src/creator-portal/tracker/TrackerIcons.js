import React from 'react';
import styled from 'styled-components';
import { creatorTokens as t } from '../../theme/creatorTokens';

// Small line icons for calendar events (kinds from the API: sched, sent, fu, due, ship, post, pay, hot).
const PATHS = {
  sched: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  sent: (<><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></>),
  fu: (<><path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>),
  ship: (<><path d="M21 8 12 3 3 8v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5" /><path d="M12 13v8" /></>),
  due: (<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>),
  post: (<><rect x="2" y="6" width="14" height="12" rx="2" /><path d="m22 8-6 4 6 4V8z" /></>),
  pay: (<><path d="M12 2v20" /><path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>),
  lock: (<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  eye: (<><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></>),
};

const FLAME_PATH = 'M12 2c1 3.5-1.5 5-1.5 7.5 0 1.4 1 2.5 2.3 2.5 1.6 0 2.4-1.4 2.2-3.2C17.6 10.6 19 13 19 15.5A7 7 0 0 1 5 15.5c0-3.7 2.6-6 4.2-8C10.5 5.8 11.6 4 12 2z';

export const KIND_LABEL = {
  hot: 'Hot brand',
  sched: 'Scheduled',
  sent: 'Sent',
  fu: 'Follow-up',
  due: 'Draft due',
  ship: 'Box arrives',
  post: 'Post',
  pay: 'Payment due',
};

export const HOT_COLOR = '#e8590c';

export const KIND_TONE = {
  sched: { bg: '#e8effc', fg: '#2357c6' },
  sent: { bg: t.subtle, fg: t.muted },
  fu: { bg: t.subtle, fg: t.muted },
  due: { bg: '#fbe7ee', fg: '#c2255c' },
  post: { bg: '#f1e9fb', fg: '#7c3aed' },
  ship: { bg: '#fdf1dc', fg: '#9a5b00' },
  pay: { bg: t.accentSoft, fg: t.accentDeep },
  hot: { bg: '#fff1e6', fg: HOT_COLOR },
};

export function Flame({ size = 14, title = 'Hot brand today' }) {
  return (
    <FlameSvg viewBox="0 0 24 24" width={size} height={size} role="img" aria-label={title}>
      <title>{title}</title>
      <path d={FLAME_PATH} />
    </FlameSvg>
  );
}

export function LineIcon({ name, size = 13 }) {
  if (name === 'hot') {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor" stroke="none">
        <path d={FLAME_PATH} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {PATHS[name] || PATHS.sched}
    </svg>
  );
}

export function KindIcon({ kind, small = false }) {
  const tone = KIND_TONE[kind] || KIND_TONE.sched;
  return (
    <IconBox $bg={tone.bg} $fg={tone.fg} $small={small} aria-hidden="true">
      <LineIcon name={kind} size={small ? 11 : 13} />
    </IconBox>
  );
}

const FlameSvg = styled.svg`
  flex-shrink: 0;
  fill: ${HOT_COLOR};
  vertical-align: -2px;
`;

const IconBox = styled.span`
  width: ${(p) => (p.$small ? '18px' : '22px')};
  height: ${(p) => (p.$small ? '18px' : '22px')};
  border-radius: ${(p) => (p.$small ? '6px' : '7px')};
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  background: ${(p) => p.$bg};
  color: ${(p) => p.$fg};
`;
