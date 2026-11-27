import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import api from '../../config/api';
import { creatorTokens as t } from '../../theme/creatorTokens';
import { UserContext } from '../../contexts/UserContext';
import { isBeingVerified, WAITLIST_PATH } from '../../utils/creatorApproval';

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

/** Outreach is locked for this creator: profile still being verified and not on Pro (paying sets pro_approved). */
export function useOutreachLocked() {
  const ctx = useContext(UserContext);
  const user = ctx?.user;
  return Boolean(user) && isBeingVerified(user.approval_status) && user.subscription_tier !== 'pro';
}

/** In place of Send / Copy / Apply. */
export default function VerificationLock({ onSkip, busy = false, note = '', title = LOCK_TITLE }) {
  return (
    <Box role="note">
      <div className="hd">
        <span className="ic" aria-hidden="true"><Lock size={15} strokeWidth={2.5} /></span>
        <b>{title}</b>
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
      <span className="ic" aria-hidden="true"><ShieldCheck size={16} /></span>
      <span className="tx">
        <b>{ready ? 'Profile not ready yet.' : 'Checking your profile.'}</b>{' '}
        Sending unlocks once verified. <Status to={WAITLIST_PATH}>{ready ? 'What to fix' : 'Status'}</Status>
      </span>
      {onSkip ? <Skip type="button" $small onClick={onSkip}>Skip · $19/mo</Skip> : null}
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

// A slim strip. && beats the Polly page's container rule (every child stretches to fill the screen).
const Bar = styled.div`
  && {
    flex: none; display: flex; flex-direction: row; align-items: center; gap: 10px;
    min-height: 0; margin: 8px 12px 4px; padding: 8px 8px 8px 12px; border-radius: 12px;
    background: ${t.accentSoft}; border: 1px solid ${t.accentBorder || '#cfe5dc'}; font-family: ${t.fontSans};
    box-sizing: border-box;
  }
  .ic { flex: none; color: ${t.accentDeep}; display: inline-flex; }
  .tx { flex: 1 1 auto; min-width: 0; font-size: 13px; line-height: 1.35; color: ${t.muted}; }
  .tx b { color: ${t.ink}; font-weight: 700; }
  .tx a { font-size: 13px; }
  button { flex: none; }
  @media (min-width: 1025px) { && { width: calc(100% - 32px); max-width: 760px; margin: 12px auto 4px; } }
`;
