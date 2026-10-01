import React from 'react';
import styled from 'styled-components';

export function replyTier(brand) {
  const sig = brand?.reply_signal || brand?.replySignal;
  return sig && sig.tier ? sig.tier : null;
}

export function ReplySignalChip({ signal, compact = false }) {
  if (!signal || !signal.tier) return null;
  const cold = signal.tier === 'cold';
  return (
    <Chip $cold={cold} title={signal.detail || ''}>
      <span aria-hidden="true">{cold ? '🧊' : '💬'}</span>
      {compact ? (cold ? 'Rarely replies' : 'Replies') : signal.label}
    </Chip>
  );
}

export function ColdBrandNote({ brandName, signal, remaining, alternatives = [], onPick, pickLabel = 'See' }) {
  if (!signal) return null;
  const pitched = Number(signal.pitched) || 0;
  const replied = Number(signal.replied) || 0;
  const left = Number(remaining);
  return (
    <Note role="note">
      <strong>Heads-up: {brandName || 'this brand'} rarely replies to creators</strong>
      <p>
        {pitched} creators pitched them on Newcollab and {replied ? `only ${replied}` : 'none'} heard back.
        {Number.isFinite(left) && left > 0
          ? ` You have ${left} free credit${left === 1 ? '' : 's'} left — spend it where a reply is likely.`
          : ''}
      </p>
      {alternatives.length > 0 && (
        <>
          <em>Brands that actually reply</em>
          <Alts>
            {alternatives.map((alt) => (
              <AltBtn key={alt.id} type="button" onClick={() => onPick && onPick(alt)}>
                {alt.logo ? <img src={alt.logo} alt="" /> : null}
                <span>{alt.name}</span>
                <small>{pickLabel}</small>
              </AltBtn>
            ))}
          </Alts>
        </>
      )}
    </Note>
  );
}

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.3;
  white-space: nowrap;
  background: ${(p) => (p.$cold ? '#EEF2F7' : '#E7F6EC')};
  color: ${(p) => (p.$cold ? '#475569' : '#166534')};
  border: 1px solid ${(p) => (p.$cold ? '#D7DEE8' : '#BFE5CB')};
`;

const Note = styled.div`
  background: #fff8ec;
  border: 1px solid #f0d9b0;
  color: #5b3d0c;
  border-radius: 12px;
  padding: 12px 14px;
  margin: 0 0 14px;
  font-size: 13.5px;
  line-height: 1.45;

  strong { display: block; font-size: 14px; margin-bottom: 4px; }
  p { margin: 0 0 8px; }
  em { display: block; font-style: normal; font-weight: 600; font-size: 12px; margin: 4px 0 6px; }
`;

const Alts = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const AltBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e5d3b0;
  background: #fff;
  color: #2a1d06;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  img { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; }
  small { font-weight: 500; color: #8a6a32; }
  &:hover { border-color: #c9a35f; }
`;
