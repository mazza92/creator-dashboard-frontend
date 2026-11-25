import React, { useState } from 'react';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { publishOffer } from './WaitingRoom';

/**
 * After a pitch left Polly. Send email (`logged`): the backend already counted it as sent, so this shows
 * "Logged as sent" with Undo — creators rarely came back to confirm (Nov 2026). A copy: "Did it send?" Yes logs
 * the send (follow-ups on day 4 and 10); Not yet / Undo keeps it a draft, so Polly reminds them instead of
 * asking the brand about a reply.
 */
export default function SentCheck({ brandId, brandName, method, onAnswered, compact = false, logged = false }) {
  const [state, setState] = useState(logged ? 'sent' : 'ask'); // ask | saving | sent | not_sent
  const name = brandName || 'the brand';

  const answer = async (sent) => {
    if (state === 'saving') return;
    setState('saving');
    try {
      const res = await apiClient.post('/api/polly/pitch/sent-check', {
        brand_id: brandId, brand_name: brandName || null, sent, method: method || '',
      });
      publishOffer(res && res.data);
    } catch (_) {
      // The answer still shows; the day-4 check-in asks again if this didn't save.
    }
    setState(sent ? 'sent' : 'not_sent');
    if (onAnswered) onAnswered(sent);
    if (sent) { try { window.dispatchEvent(new Event('nc-tracker-changed')); } catch (_) { /* ignore */ } }
  };

  if (state === 'sent') {
    return (
      <Done $compact={compact} role="status">
        ✓ Logged as sent on Timeline. I&apos;ll check on day 4 whether {name} replied.
        {' '}<Undo type="button" onClick={() => answer(false)}>Undo</Undo>
      </Done>
    );
  }
  if (state === 'not_sent') {
    return (
      <Done $compact={compact} $muted role="status">
        No problem, it&apos;s saved here as a draft. Tap Send email when you&apos;re ready.
      </Done>
    );
  }
  return (
    <Ask $compact={compact}>
      <span>Did it send?</span>
      <Btn type="button" className="yes" onClick={() => answer(true)} disabled={state === 'saving'}>Yes, sent</Btn>
      <Btn type="button" onClick={() => answer(false)} disabled={state === 'saving'}>Not yet</Btn>
    </Ask>
  );
}

const Ask = styled.div`
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  margin-top: ${(p) => (p.$compact ? '8px' : '12px')};
  padding: ${(p) => (p.$compact ? '8px 10px' : '10px 12px')};
  background: #f6f8fb; border: 1px solid #e5e9f0; border-radius: 12px;
  span { font-size: 13.5px; font-weight: 600; color: #1f2937; margin-right: 4px; }
`;
const Btn = styled.button`
  border: 1px solid #d6dbe3; background: #fff; color: #1f2937; font-size: 13px; font-weight: 600;
  padding: 6px 12px; border-radius: 999px; cursor: pointer; font-family: inherit;
  &.yes { background: #111827; border-color: #111827; color: #fff; }
  &:disabled { opacity: 0.6; cursor: default; }
`;
const Undo = styled.button`
  border: 0; background: none; padding: 0; font: inherit; font-weight: 600; color: #4b5563;
  text-decoration: underline; cursor: pointer;
`;
const Done = styled.div`
  margin-top: ${(p) => (p.$compact ? '8px' : '12px')};
  font-size: 13px; line-height: 1.4;
  color: ${(p) => (p.$muted ? '#4b5563' : '#1f7a4d')};
`;
