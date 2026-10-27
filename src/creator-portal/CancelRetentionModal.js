import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import api from '../config/api';
import { message } from 'antd';

const REASONS = [
  {
    id: 'no_replies',
    label: 'Brands have not replied',
    hint: 'Pitches went out, no replies yet',
  },
  {
    id: 'too_expensive',
    label: 'Too expensive',
    hint: '$19 a month is more than you want to pay',
  },
  {
    id: 'unused',
    label: 'I am not using it',
    hint: 'You rarely open Newcollab',
  },
  {
    id: 'other',
    label: 'Something else',
    hint: 'A different reason',
  },
];

// Save offers, built server-side from the creator's own 30-day numbers. None of them is a credit or free days.
const OFFERS = {
  connect_gmail: { label: 'Connect Gmail now', note: 'One tap. Your first pitches go out within the hour.' },
  outreach_review: { label: 'Have a person review my outreach', note: 'Your kit, pitch facts and brand list, this week.' },
  price_hold: { label: 'Switch me to $12 / month', note: 'The next 3 invoices are $12, then $19.' },
  autopilot_on: { label: 'Turn Autopilot on', note: 'Polly sends every weekday from your Gmail.' },
  pause: { label: 'Pause for a month instead', note: 'Starts when this period ends. No charge, and Polly stops, until it comes back.' },
};

const STATS = [
  ['pitches_sent_30d', 'pitches sent'],
  ['followups_30d', 'follow-ups'],
  ['kit_opens_30d', 'kit opens'],
  ['replies_30d', 'replies'],
];

const CancelRetentionModal = ({ isOpen, onClose, onChanged, endsAt }) => {
  const [step, setStep] = useState('reason');
  const [reason, setReason] = useState(null);
  const [screen, setScreen] = useState(null);
  const [busy, setBusy] = useState(false);

  const resetAndClose = () => {
    setStep('reason');
    setReason(null);
    setScreen(null);
    onClose();
  };

  const pickReason = async (id) => {
    setBusy(true);
    try {
      const res = await api.post('/api/subscription/cancel-flow/reason', { reason: id });
      setReason(id);
      setScreen(res.data || null);
      setStep(res.data?.headline ? 'offer' : 'confirm');
    } catch (error) {
      message.error(error.response?.data?.error || 'Could not start cancel flow');
    } finally {
      setBusy(false);
    }
  };

  const acceptOffer = async (offer) => {
    setBusy(true);
    try {
      const res = await api.post('/api/subscription/cancel-flow/accept', { reason, offer });
      if (res.data?.redirect) {
        window.location.href = res.data.redirect;
        return;
      }
      message.success(res.data?.message || 'You are staying on Pro');
      onChanged?.();
      resetAndClose();
    } catch (error) {
      message.error(error.response?.data?.error || 'Could not apply that offer');
    } finally {
      setBusy(false);
    }
  };

  const confirmCancel = async () => {
    setBusy(true);
    try {
      const res = await api.post('/api/subscription/cancel-flow/confirm', { reason: reason || 'other' });
      message.success(res.data?.message || 'Cancellation scheduled');
      onChanged?.();
      resetAndClose();
    } catch (error) {
      message.error(error.response?.data?.error || 'Could not cancel');
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  const periodLabel = endsAt
    ? new Date(endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'the end of this billing period';

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !busy && resetAndClose()}
      >
        <Sheet
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseBtn type="button" onClick={resetAndClose} disabled={busy} aria-label="Close">
            <FiX size={18} />
          </CloseBtn>

          {step === 'reason' && (
            <>
              <Eyebrow>Before you cancel</Eyebrow>
              <Title>What is not working?</Title>
              <Body>
                Tell us why. We can often fix it without you losing the month you already paid for.
              </Body>
              <ReasonList>
                {REASONS.map((item) => (
                  <ReasonBtn
                    key={item.id}
                    type="button"
                    disabled={busy}
                    onClick={() => pickReason(item.id)}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.hint}</span>
                  </ReasonBtn>
                ))}
              </ReasonList>
            </>
          )}

          {step === 'offer' && screen && (
            <>
              <Eyebrow>Your last 30 days on Pro</Eyebrow>
              <Title>{screen.headline}</Title>
              {screen.context ? (
                <Stats>
                  {STATS.map(([key, label]) => (
                    <div key={key}>
                      <b>{screen.context[key] ?? 0}</b>
                      <span>{label}</span>
                    </div>
                  ))}
                </Stats>
              ) : null}
              <Body>{screen.body}</Body>
              {(screen.offers || []).map((id, i) => {
                const item = OFFERS[id];
                if (!item) return null;
                const Btn = i === 0 ? Primary : Secondary;
                return (
                  <OfferWrap key={id}>
                    <Btn type="button" disabled={busy} onClick={() => acceptOffer(id)}>
                      {busy ? 'One moment…' : item.label}
                    </Btn>
                    <OfferNote>{item.note}</OfferNote>
                  </OfferWrap>
                );
              })}
              <Ghost type="button" disabled={busy} onClick={() => setStep('confirm')}>
                No thanks, cancel anyway
              </Ghost>
            </>
          )}

          {step === 'confirm' && (
            <>
              <Eyebrow>Cancel Pro</Eyebrow>
              <Title>You keep access until {periodLabel}</Title>
              <Body>
                No extra charge. After that date Polly stops pitching for you
                and you go back to the free plan (3 credits a month).
                You can still change your mind in Settings before then.
              </Body>
              <Danger type="button" disabled={busy} onClick={confirmCancel}>
                {busy ? 'Scheduling…' : 'Cancel at period end'}
              </Danger>
              <Ghost type="button" disabled={busy} onClick={resetAndClose}>
                Keep Pro
              </Ghost>
            </>
          )}
        </Sheet>
      </Overlay>
    </AnimatePresence>
  );
};

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Sheet = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 20px;
  padding: 28px 24px 24px;
  max-height: 90vh;
  overflow: auto;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  border: none;
  background: #f3f4f6;
  color: #374151;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
  }
`;

const Eyebrow = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #ec4899;
  margin-bottom: 8px;
`;

const Title = styled.h2`
  font-size: 22px;
  line-height: 1.25;
  color: #111827;
  margin: 0 0 10px;
`;

const Body = styled.p`
  font-size: 14px;
  line-height: 1.55;
  color: #4b5563;
  margin: 0 0 20px;
`;

const ReasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ReasonBtn = styled.button`
  text-align: left;
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 14px;
    color: #111827;
  }

  span {
    font-size: 12px;
    color: #6b7280;
  }

  &:hover:not(:disabled) {
    border-color: #93c5fd;
    background: #eff6ff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Primary = styled.button`
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 13px 16px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background: #3b82f6;
  cursor: pointer;
  margin-bottom: 8px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Secondary = styled(Primary)`
  background: #fff;
  color: #111827;
  border: 1px solid #d1d5db;
`;

const OfferWrap = styled.div`
  margin-bottom: 10px;
  button { margin-bottom: 4px; }
`;

const OfferNote = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-align: center;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 4px 0 14px;

  div {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px 6px;
    text-align: center;
  }
  b { display: block; font-size: 20px; color: #111827; }
  span { font-size: 11px; color: #6b7280; }
`;

const Danger = styled(Primary)`
  background: #dc2626;
`;

const Ghost = styled.button`
  width: 100%;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  padding: 10px;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
  }
`;

export default CancelRetentionModal;
