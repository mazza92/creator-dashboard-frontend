import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import api from '../config/api';

/**
 * Shown on every dashboard page while a Pro payment has failed (like Spotify/Netflix):
 * - grace period: Pro still on, until a date, with one button to pay with another card;
 * - locked: Pro is off until they pay; their Pro settings and pipeline are kept.
 */
const fmt = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

export default function PaymentIssueBanner() {
  const [billing, setBilling] = useState(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    let alive = true;
    api.get('/api/subscription/status')
      .then((res) => { if (alive) setBilling(res.data?.billing || null); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!billing?.payment_issue) return null;

  const pay = async () => {
    if (billing.pay_url) {
      window.location.href = billing.pay_url;
      return;
    }
    setOpening(true);
    try {
      const res = await api.post('/api/subscription/portal', {});
      const url = res.data?.portal_url || res.data?.url;
      if (url) window.location.href = url;
    } catch (e) {
      window.location.href = '/creator/dashboard/settings';
    } finally {
      setOpening(false);
    }
  };

  const text = billing.locked
    ? 'Your Pro payment didn’t go through, so Pro is paused: Polly has stopped sending. Pay now and everything restarts where it left off.'
    : `Your Pro payment didn’t go through. Update your card before ${billing.grace_ends_at ? fmt(billing.grace_ends_at) : 'it pauses'} to keep Polly sending.`;

  return (
    <Bar role="alert" $locked={billing.locked}>
      <Text>{text}</Text>
      <Btn type="button" onClick={pay} disabled={opening}>
        {opening ? 'Opening…' : billing.locked ? 'Pay and restart Pro' : 'Update card'}
      </Btn>
    </Bar>
  );
}

const Bar = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  margin: 0 0 12px; padding: 12px 16px; border-radius: 12px;
  background: ${(p) => (p.$locked ? '#FEE2E2' : '#FEF3C7')};
  border: 1px solid ${(p) => (p.$locked ? '#FCA5A5' : '#FCD34D')};
`;
const Text = styled.p` margin: 0; flex: 1 1 260px; font-size: 14px; line-height: 1.45; color: #111827; `;
const Btn = styled.button`
  flex: 0 0 auto; padding: 9px 14px; border: none; border-radius: 10px; background: #111827; color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer;
  &:disabled { opacity: 0.6; cursor: wait; }
`;
