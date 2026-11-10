import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { message } from 'antd';
import api from '../config/api';

/**
 * Account deletion in steps, like the subscription apps people know (Spotify, Notion, Canva):
 * 1. a paying Pro member cancels Pro first through the cancel flow (reason + offers);
 * 2. why are you leaving (required, short list adapted to Pro or free) + optional note;
 * 3. what will be erased, then type DELETE and the account email.
 * GDPR erasure stays self-serve: no email to support, no waiting period.
 */

const TIPS = {
  too_many_emails: 'You can stop marketing emails with the unsubscribe link at the bottom of any of our emails and keep your account.',
  not_approved: 'Profiles are reviewed by hand. Adding a TikTok or Instagram with recent posts in Settings usually gets you approved.',
  no_brands_for_me: 'New brands join every week. Updating your niches in Settings changes who we match you with.',
  no_replies: 'Your pitches, replies and brand history are deleted too, so you would start from zero if you come back.',
  too_expensive: 'Your free plan keeps working after Pro ends: you can keep your account and stay on Free.',
};

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null);

export default function DeleteAccountFlow({ accountEmail, onClose, onNeedCancel }) {
  const [pre, setPre] = useState(null);
  const [step, setStep] = useState('loading');
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [phrase, setPhrase] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api.get('/api/account/delete/preflight')
      .then((res) => {
        if (!alive) return;
        setPre(res.data);
        setStep(res.data?.must_cancel_first ? 'cancel_first' : 'reason');
      })
      .catch(() => alive && setStep('reason'));
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !busy) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const reasons = pre?.reasons || [
    { id: 'not_useful', label: "I didn't find it useful" },
    { id: 'privacy', label: "Privacy: I don't want my data here" },
    { id: 'other', label: 'Something else' },
  ];
  const loses = pre?.loses || {};
  const isPro = pre?.plan === 'pro';
  const canDelete = phrase.trim().toUpperCase() === 'DELETE'
    && Boolean(accountEmail) && email.trim().toLowerCase() === accountEmail.trim().toLowerCase();

  const submit = async () => {
    if (!canDelete || busy) return;
    setBusy(true);
    try {
      await api.post('/api/account/delete', { confirmation: 'DELETE', email: email.trim(), reason, feedback: feedback.trim() });
      ['userRole', 'userId', 'userData', 'authToken'].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) { /* storage blocked */ }
      });
      window.location.href = '/login?deleted=1';
    } catch (error) {
      if (error.response?.data?.code === 'cancel_first') {
        setStep('cancel_first');
      } else {
        message.error(error.response?.data?.error || 'Could not delete your account. Please try again.');
      }
      setBusy(false);
    }
  };

  const loseItems = [
    loses.pitches_sent ? `${loses.pitches_sent} pitches sent and their follow-ups` : null,
    loses.brand_replies ? `${loses.brand_replies} brand replies tracked` : null,
    loses.kit_views ? `${loses.kit_views} times brands opened your media kit` : null,
    loses.brands_tracked ? `${loses.brands_tracked} brands in your pipeline` : null,
  ].filter(Boolean);

  return (
    <Overlay role="dialog" aria-modal="true" aria-labelledby="del-title" onClick={() => !busy && onClose()}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Steps aria-hidden="true">
          {['reason', 'confirm'].map((s, i) => (
            <Dot key={s} $on={step === s || (step === 'confirm' && i === 0)} />
          ))}
        </Steps>

        {step === 'loading' && <Copy>Loading…</Copy>}

        {step === 'cancel_first' && (
          <>
            <Title id="del-title">Cancel Pro before deleting</Title>
            <Copy>
              You&apos;re on Pro, so your subscription has to be cancelled first. It takes a minute, and you keep
              Pro until the end of the period you already paid for.
            </Copy>
            <Primary type="button" onClick={() => { onClose(); onNeedCancel?.(); }}>Cancel my Pro plan</Primary>
            <Secondary type="button" onClick={onClose}>Keep my account</Secondary>
          </>
        )}

        {step === 'reason' && (
          <>
            <Title id="del-title">Why are you leaving?</Title>
            <Copy>One tap. It tells us what to fix{isPro ? '' : ' for creators like you'}.</Copy>
            <Reasons role="radiogroup" aria-label="Reason for leaving">
              {reasons.map((r) => (
                <Reason key={r.id} $on={reason === r.id}>
                  <input type="radio" name="del-reason" value={r.id} checked={reason === r.id}
                         onChange={() => setReason(r.id)} />
                  <span>{r.label}</span>
                </Reason>
              ))}
            </Reasons>
            {reason && TIPS[reason] && <Tip>{TIPS[reason]}</Tip>}
            <Label htmlFor="del-feedback">Anything we should know? (optional)</Label>
            <Area id="del-feedback" rows={3} maxLength={1000} value={feedback}
                  onChange={(e) => setFeedback(e.target.value)} placeholder="What would have made you stay?" />
            <Primary type="button" disabled={!reason} onClick={() => setStep('confirm')}>Continue</Primary>
            <Secondary type="button" onClick={onClose}>Keep my account</Secondary>
          </>
        )}

        {step === 'confirm' && (
          <>
            <Title id="del-title">Delete your account permanently?</Title>
            <Copy>This erases your profile and personal data from Newcollab. It can&apos;t be undone.</Copy>
            <List>
              {loseItems.map((t) => <li key={t}>{t}</li>)}
              <li>Your profile, media kit, pitches and social connections</li>
              {pre?.cancel_scheduled && (
                <li>
                  Pro ends today instead of {fmtDate(pre?.pro_ends_at) || 'the end of your paid period'}, with no
                  refund for the remaining days
                </li>
              )}
            </List>
            <Label htmlFor="del-phrase">Type DELETE</Label>
            <Input id="del-phrase" value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="DELETE"
                   autoComplete="off" disabled={busy} />
            <Label htmlFor="del-email">Type your account email{accountEmail ? ` (${accountEmail})` : ''}</Label>
            <Input id="del-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                   placeholder="you@email.com" autoComplete="off" disabled={busy} />
            <Danger type="button" disabled={!canDelete || busy} onClick={submit}>
              {busy ? 'Deleting…' : 'Permanently delete my account'}
            </Danger>
            <Secondary type="button" onClick={() => setStep('reason')} disabled={busy}>Back</Secondary>
            <Small>Encrypted backups expire within 30 days. Payment processors keep invoices they are legally required to store.</Small>
          </>
        )}
      </Modal>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed; inset: 0; background: rgba(17, 24, 39, 0.55); display: flex; align-items: center;
  justify-content: center; z-index: 80; padding: 16px;
`;
const Modal = styled.div`
  width: 100%; max-width: 460px; max-height: calc(100vh - 32px); overflow-y: auto; background: #fff;
  border-radius: 16px; padding: 24px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2); box-sizing: border-box;
`;
const Steps = styled.div` display: flex; gap: 6px; margin-bottom: 14px; `;
const Dot = styled.span`
  height: 4px; flex: 1; border-radius: 4px; background: ${(p) => (p.$on ? '#DC2626' : '#E5E7EB')};
`;
const Title = styled.h3` margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #111827; `;
const Copy = styled.p` margin: 0 0 14px; font-size: 14px; line-height: 1.5; color: #4B5563; `;
const Reasons = styled.div` display: grid; gap: 8px; margin-bottom: 12px; `;
const Reason = styled.label`
  display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: 10px; cursor: pointer;
  font-size: 14px; color: #111827; border: 1px solid ${(p) => (p.$on ? '#111827' : '#E5E7EB')};
  background: ${(p) => (p.$on ? '#F9FAFB' : '#fff')};
  input { accent-color: #111827; margin: 0; }
  &:focus-within { box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.12); }
`;
const Tip = styled.div`
  font-size: 13px; line-height: 1.45; color: #1F2937; background: #FEF3C7; border-radius: 10px;
  padding: 10px 12px; margin-bottom: 12px;
`;
const Label = styled.label` display: block; font-size: 13px; font-weight: 600; color: #374151; margin: 4px 0 6px; `;
const fieldCss = `
  width: 100%; box-sizing: border-box; border: 1px solid #E5E7EB; border-radius: 10px; padding: 10px 12px;
  font-size: 16px; margin-bottom: 12px; font-family: inherit;
  &:focus { outline: none; border-color: #111827; box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.12); }
`;
const Input = styled.input`${fieldCss}`;
const Area = styled.textarea`${fieldCss} resize: vertical;`;
const List = styled.ul` margin: 0 0 14px; padding-left: 18px; font-size: 13px; line-height: 1.6; color: #374151; `;
const btn = `
  width: 100%; padding: 12px 16px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600;
  cursor: pointer; margin-top: 8px;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const Primary = styled.button`${btn} background: #111827; color: #fff;`;
const Danger = styled.button`${btn} background: #DC2626; color: #fff; &:hover:not(:disabled) { background: #B91C1C; }`;
const Secondary = styled.button`${btn} background: #F3F4F6; color: #111827; &:hover:not(:disabled) { background: #E5E7EB; }`;
const Small = styled.p` margin: 12px 0 0; font-size: 12px; color: #6B7280; line-height: 1.45; `;
