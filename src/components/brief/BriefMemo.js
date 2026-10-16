import React from 'react';
import styled from 'styled-components';
import { creatorTokens as tokens } from '../../theme/creatorTokens';

export const BRIEF_SECTIONS = [
  { key: 'must_include', label: 'Must show or say' },
  { key: 'avoid', label: 'Please avoid' },
  { key: 'tags', label: 'Tag & hashtags' },
];

export function hasBrief(brief) {
  return Boolean(brief && (brief.message || brief.must_include || brief.avoid || brief.tags || brief.reference_url));
}

function updatedLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `Updated ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

export default function BriefMemo({ brief, brandName, compact = false }) {
  if (!hasBrief(brief)) return null;
  const sections = BRIEF_SECTIONS.filter((s) => brief[s.key]);
  return (
    <Memo $compact={compact}>
      <MemoHead>
        <span>Brief from {brandName}</span>
        {brief.updated_at && <em>{updatedLabel(brief.updated_at)}</em>}
      </MemoHead>
      {brief.message && <Message>{brief.message}</Message>}
      {sections.map((s) => (
        <Section key={s.key}>
          <dt>{s.label}</dt>
          <dd>{brief[s.key]}</dd>
        </Section>
      ))}
      {brief.reference_url && (
        <Ref href={brief.reference_url} target="_blank" rel="noopener noreferrer">
          See a reference video
        </Ref>
      )}
    </Memo>
  );
}

const Memo = styled.dl`
  margin: ${(p) => (p.$compact ? '0' : '12px 0 0')};
  padding: 16px 18px;
  background: ${tokens.cream};
  border: 1px solid ${tokens.line};
  border-left: 3px solid ${tokens.accent};
  border-radius: 12px;
  font-family: ${tokens.fontSans};
  color: ${tokens.ink};
`;

const MemoHead = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${tokens.muted};
  em { font-style: normal; font-weight: 500; letter-spacing: 0; text-transform: none; }
`;

const Message = styled.p`
  margin: 0 0 12px;
  font-family: ${tokens.fontDisplay};
  font-size: 21px;
  line-height: 1.3;
  white-space: pre-line;
`;

const Section = styled.div`
  & + & { margin-top: 10px; }
  dt {
    font-size: 12px;
    font-weight: 700;
    color: ${tokens.inkSoft};
    margin-bottom: 2px;
  }
  dd {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-line;
  }
`;

const Ref = styled.a`
  display: inline-block;
  margin-top: 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${tokens.accentDeep};
`;
