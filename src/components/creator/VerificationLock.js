import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import api from '../../config/api';
import { creatorTokens as t } from '../../theme/creatorTokens';
import { WAITLIST_PATH } from '../../utils/creatorApproval';

/**
 * Verification is separate from activation (Nov 2026). Creators whose profile is still being verified explore their
 * brands and pitches right away; sending waits until they're verified, or until they skip the wait with Pro. The
 * server enforces it: their pitches come back with `locked: 'verification'` and no inbox, and send/copy/"I sent it"
 * return 403 `verification_required`.
 */

export const LOCK_TITLE = 'Sending unlocks once your profile is verified';

export function isVerificationLocked(x) {
  if (!x) return false;
  return x.locked === 'verification' || x.verification_required === true
    || x.response?.data?.verification_required === true;
}

// No free week while unverified (checkout_trial_eligible on the server): skipping the review is Pro, $19/mo.
export const SKIP_LABEL = 'Skip the wait · $19/mo';

/** In place of Send / Copy on a pitch. */
export default function VerificationLock({ onSkip, busy = false, note = '' }) {
  return (
    <Box role="note">
      <div className="hd">
        <span className="ic" aria-hidden="true"><Lock size={15} strokeWidth={2.5} /></span>
        <b>{LOCK_TITLE}</b>
      </div>
      <p>{note || 'Your pitch is saved. Skip the wait with Pro and Polly starts sending today, or keep exploring your brands while we check your profile.'}</p>
      <div className="row">
        {onSkip ? (
          <Skip type="button" onClick={onSkip} disabled={busy}>{busy ? 'Opening…' : SKIP_LABEL}</Skip>
        ) : null}
        <Status to={WAITLIST_PATH}>What we check</Status>
      </div>
    </Box>
  );
}

/** Top of every dashboard page while the profile is being verified. */
export function VerificationBanner({ onSkip }) {
  const [state, setState] = useState(null);
  useEffect(() => {
    let live = true;
    api.get('/api/creator/verification')
      .then((res) => { if (live) setState(res.data || null); })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  if (!state || !state.status || state.status === 'verified') return null;
  const ready = state.status === 'not_ready';
  return (
    <Bar role="status">
      <span className="ic" aria-hidden="true"><ShieldCheck size={18} /></span>
      <span className="tx">
        <b>{ready ? 'Your profile isn’t ready for outreach yet' : 'We’re checking your profile'}</b>
        <span>Explore your brands and pitches now. Sending unlocks once you’re verified.</span>
      </span>
      <span className="act">
        <Status to={WAITLIST_PATH}>{ready ? 'See what to fix' : 'See status'}</Status>
        {onSkip ? <Skip type="button" $small onClick={onSkip}>{SKIP_LABEL}</Skip> : null}
      </span>
    </Bar>
  );
}

const Box = styled.div`
  margin-top: 12px; padding: 14px; border-radius: 14px; border: 1px solid ${t.line}; background: ${t.subtle};
  font-family: ${t.fontSans};
  .hd { display: flex; align-items: center; gap: 8px; }
  .hd b { font-size: 15px; line-height: 1.3; color: ${t.ink}; }
  .ic {
    flex: none; width: 26px; height: 26px; border-radius: 50%; background: ${t.ink}; color: #fff;
    display: inline-flex; align-items: center; justify-content: center;
  }
  p { margin: 8px 0 12px; font-size: 14px; line-height: 1.45; color: ${t.muted}; }
  .row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
`;

const Skip = styled.button`
  border: 0; border-radius: 12px; cursor: pointer; font-family: inherit; font-weight: 700;
  background: ${t.accent}; color: #fff;
  padding: ${(p) => (p.$small ? '8px 12px' : '12px 16px')}; font-size: ${(p) => (p.$small ? '13.5px' : '15px')};
  white-space: nowrap;
  &:hover { background: ${t.accentDeep}; }
  &:disabled { opacity: 0.6; cursor: wait; }
`;

const Status = styled(Link)`
  font-size: 14px; font-weight: 650; color: ${t.accentDeep}; text-decoration: underline; text-underline-offset: 3px;
  white-space: nowrap;
`;

const Bar = styled.div`
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  margin: 0 0 12px; padding: 12px 14px; border-radius: 14px;
  background: ${t.accentSoft}; border: 1px solid ${t.accentBorder || '#cfe5dc'}; font-family: ${t.fontSans};
  .ic { flex: none; color: ${t.accentDeep}; display: inline-flex; }
  .tx { flex: 1 1 240px; display: grid; gap: 2px; min-width: 0; }
  .tx b { font-size: 14.5px; color: ${t.ink}; }
  .tx span { font-size: 13.5px; line-height: 1.4; color: ${t.muted}; }
  .act { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  @media (max-width: 480px) { .act { width: 100%; justify-content: space-between; } }
`;
