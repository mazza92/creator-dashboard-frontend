import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import VerificationLock, { isVerificationLocked } from './VerificationLock';
import { creatorTokens as t } from '../../theme/creatorTokens';

/**
 * Brands flow, last step for a brand without a live roster: Polly writes the pitch here, the creator reads it,
 * tweaks it and sends it, without leaving Brands. Looks and moves like the pitch card in the Polly chat: typing
 * dots and a status line that moves on while it writes, the pitch streamed in, then one clear send button.
 */

export function writingSteps(brandName) {
  const brand = brandName || 'the brand';
  return [
    `Reading ${brand}…`,
    'Looking at your 3 posts…',
    `Matching your content to what ${brand} sells…`,
    'Writing your pitch…',
    'Checking their inbox is live…',
    'Polishing the last lines…',
  ];
}

export function PitchWriting({ brandName }) {
  const steps = writingSteps(brandName);
  const [step, setStep] = useState(0);
  useEffect(() => {
    setStep(0);
    const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 1700);
    return () => clearInterval(id);
  }, [brandName, steps.length]);
  return (
    <div role="status" aria-live="polite">
      <PollyRow>
        <Avatar aria-hidden="true">P</Avatar>
        <div>
          <Who>Polly</Who>
          <Dots aria-label="Polly is writing"><span /><span /><span /></Dots>
          <Status key={step}>{steps[step]}</Status>
        </div>
      </PollyRow>
      <Card aria-hidden="true">
        <SkelLine style={{ width: 110, height: 10 }} />
        <SkelLine style={{ width: '58%' }} />
        <SkelLine style={{ width: '74%', marginBottom: 14 }} />
        <SkelLine style={{ width: '94%' }} />
        <SkelLine style={{ width: '86%' }} />
        <SkelLine style={{ width: '90%' }} />
        <SkelLine style={{ width: '48%' }} />
      </Card>
    </div>
  );
}

function AutoText({ value, onChange, disabled, id }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return <BodyEdit id={id} ref={ref} value={value} onChange={onChange} disabled={disabled} rows={6} />;
}

export function BrandMini({ name, logo, handle }) {
  const [broken, setBroken] = useState(false);
  return (
    <Mini>
      {logo && !broken ? (
        <img src={logo} alt="" onError={() => setBroken(true)} />
      ) : (
        <span className="mark" aria-hidden="true">{String(name || '?').slice(0, 1).toUpperCase()}</span>
      )}
      <div>
        <strong>{name}</strong>
        {handle ? <span>@{String(handle).replace(/^@/, '')}</span> : null}
      </div>
    </Mini>
  );
}

/**
 * draft: { status: 'writing' | 'ready' | 'cold' | 'note' | 'error' | 'paywall', pitch, message, alternatives, gmail }
 */
export default function DirectPitch({
  brandName, draft, subject, body, onSubject, onBody, streaming = false, sending = false, error = '',
  mailtoHref = '', isFree = false, onSendEmail, onSendGmail, onRetry, onWriteAnyway, onPickAnother, onUpgrade,
  onSkipReview,
}) {
  const [editing, setEditing] = useState(false);
  useEffect(() => { if (draft?.status !== 'ready') setEditing(false); }, [draft?.status]);

  if (!draft || draft.status === 'writing') return <PitchWriting brandName={brandName} />;

  if (draft.status !== 'ready') {
    const message = String(draft.message || '').replace(/\*\*/g, '');
    const alts = (draft.alternatives || []).map((b) => b.name).filter(Boolean);
    return (
      <Reveal>
        <PollyRow>
          <Avatar aria-hidden="true">P</Avatar>
          <div>
            <Who>Polly</Who>
            <Said>{message || 'I couldn’t write this one. Try again.'}</Said>
            {draft.status === 'cold' && alts.length > 0 && <Said $muted>Better bets right now: {alts.join(', ')}.</Said>}
          </div>
        </PollyRow>
        <Actions>
          {draft.status === 'cold' && (
            <>
              <Btn type="button" onClick={onWriteAnyway}>Write it anyway</Btn>
              <Btn type="button" $ghost onClick={onPickAnother}>Pick another brand</Btn>
            </>
          )}
          {draft.status === 'paywall' && <Btn type="button" $pro onClick={onUpgrade}>Unlock with Pro</Btn>}
          {(draft.status === 'note' || draft.status === 'error') && <Btn type="button" onClick={onRetry}>Try again</Btn>}
        </Actions>
      </Reveal>
    );
  }

  const pitch = draft.pitch || {};
  const locked = isVerificationLocked(pitch);
  const canSend = Boolean(pitch.email) && Boolean(String(body || '').trim()) && !streaming;
  return (
    <Reveal>
      <PollyRow>
        <Avatar aria-hidden="true">P</Avatar>
        <div>
          <Who>Polly</Who>
          <Said>
            {streaming
              ? `Writing your pitch to ${brandName}…`
              : locked
                ? `Here’s your pitch to ${brandName}. Tweak anything you like: it’s ready to go once your profile is verified.`
                : `Here’s your pitch to ${brandName}. Read it, tweak anything, then send it from your own email.`}
          </Said>
        </div>
      </PollyRow>

      <Card>
        <CardHead>
          <Label>Pitch for {brandName}</Label>
          {!streaming && (
            <EditToggle type="button" onClick={() => setEditing((v) => !v)} aria-pressed={editing}>
              {editing ? 'Done' : 'Edit'}
            </EditToggle>
          )}
        </CardHead>
        <ToRow>
          <span>To</span>
          <b>{locked ? `${brandName}’s inbox, once you’re verified` : (pitch.email || 'No inbox on file for this brand yet')}</b>
        </ToRow>
        {editing ? (
          <>
            <FieldLabel htmlFor="dp-subject">Subject</FieldLabel>
            <SubjectEdit id="dp-subject" value={subject} onChange={(e) => onSubject(e.target.value)} />
            <FieldLabel htmlFor="dp-body">Message</FieldLabel>
            <AutoText id="dp-body" value={body} onChange={(e) => onBody(e.target.value)} />
          </>
        ) : (
          <>
            <Subject>{subject}</Subject>
            <Body aria-busy={streaming}>{body}{streaming ? <Caret aria-hidden="true" /> : null}</Body>
          </>
        )}
      </Card>

      {locked ? <VerificationLock onSkip={onSkipReview || onUpgrade} /> : (
      <>
      <Actions>
        {draft.gmail ? (
          <>
            <Btn type="button" disabled={!canSend || sending} onClick={onSendGmail}>
              {sending ? 'Sending…' : 'Send from my Gmail'}
            </Btn>
            <Btn as="a" $ghost href={canSend ? mailtoHref : undefined} aria-disabled={!canSend}
              onClick={(e) => { if (!canSend) { e.preventDefault(); return; } onSendEmail(); }}>
              Send from my email app
            </Btn>
          </>
        ) : (
          <Btn as="a" href={canSend ? mailtoHref : undefined} aria-disabled={!canSend}
            onClick={(e) => { if (!canSend) { e.preventDefault(); return; } onSendEmail(); }}>
            Send email
          </Btn>
        )}
        {isFree && (
          <Btn type="button" $ghost onClick={onUpgrade}>Let Autopilot send pitches like this</Btn>
        )}
      </Actions>
      {error ? <Hint $error role="alert">{error}</Hint> : null}
      <Hint>
        {draft.gmail
          ? 'Goes out from your Gmail. Polly follows up on day 4 and 10 if they don’t reply.'
          : 'Opens your email app with everything filled in. It’s logged on your Tracker, and Polly checks back on day 4.'}
      </Hint>
      </>
      )}
    </Reveal>
  );
}

const bounce = keyframes`
  0%, 80%, 100% { opacity: .35; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-3px); }
`;
const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;
const blink = keyframes`
  50% { opacity: 0; }
`;

const Reveal = styled.div`
  animation: ${fadeUp} .3s ease both;
`;
const PollyRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 2px 0 14px;
  min-width: 0;
`;
const Avatar = styled.div`
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 50%;
  background: ${t.accent};
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
`;
const Who = styled.div`
  font-size: 13px;
  font-weight: 650;
  color: ${t.ink};
`;
const Said = styled.p`
  margin: 3px 0 0;
  font-size: 14px;
  line-height: 1.45;
  color: ${(p) => (p.$muted ? t.muted : t.inkSoft)};
`;
const Dots = styled.div`
  display: flex;
  gap: 5px;
  padding: 6px 2px 2px;
  span {
    width: 6px; height: 6px; border-radius: 50%;
    background: ${t.muted};
    animation: ${bounce} 1.1s infinite;
  }
  span:nth-child(2) { animation-delay: .15s; }
  span:nth-child(3) { animation-delay: .3s; }
`;
const Status = styled.div`
  font-size: 13px;
  color: ${t.muted};
  margin-top: 4px;
  animation: ${fadeUp} .25s ease;
`;
const skel = css`
  background: linear-gradient(90deg, ${t.subtle} 0px, #fff 80px, ${t.subtle} 160px);
  background-size: 400px 100%;
  animation: ${shimmer} 1.2s linear infinite;
`;
const SkelLine = styled.div`
  height: 13px;
  border-radius: 7px;
  margin: 8px 0;
  ${skel}
`;
const Card = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 14px;
  min-width: 0;
`;
const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`;
const Label = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${t.accent};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const EditToggle = styled.button`
  flex-shrink: 0;
  border: 1px solid ${t.line};
  background: ${t.white};
  color: ${t.ink};
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  &:hover { background: ${t.subtle}; }
`;
const ToRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: baseline;
  font-size: 13px;
  color: ${t.muted};
  padding: 8px 0;
  border-top: 1px solid ${t.line};
  border-bottom: 1px solid ${t.line};
  margin-bottom: 10px;
  min-width: 0;
  b {
    color: ${t.ink};
    font-weight: 600;
    overflow-wrap: anywhere;
    min-width: 0;
  }
`;
const Subject = styled.div`
  font-weight: 650;
  font-size: 14.5px;
  color: ${t.ink};
  margin-bottom: 8px;
  overflow-wrap: anywhere;
`;
const Body = styled.div`
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-size: 14px;
  line-height: 1.55;
  color: ${t.inkSoft};
`;
const Caret = styled.span`
  display: inline-block;
  width: 7px;
  height: 15px;
  margin-left: 2px;
  vertical-align: text-bottom;
  background: ${t.ink};
  animation: ${blink} 1s step-end infinite;
`;
const FieldLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 650;
  color: ${t.muted};
  margin: 8px 0 6px;
`;
const editBox = css`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${t.line};
  border-radius: 10px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 16px;
  color: ${t.ink};
  background: #fff;
  &:focus { outline: 2px solid ${t.accentBorder}; border-color: ${t.accent}; }
`;
const SubjectEdit = styled.input`
  ${editBox}
`;
const BodyEdit = styled.textarea`
  ${editBox}
  line-height: 1.55;
  resize: none;
  overflow: hidden;
  min-height: 160px;
`;
const Actions = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 14px;
`;
const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  min-height: 48px;
  padding: 12px 14px;
  border-radius: 12px;
  border: ${(p) => (p.$ghost ? `1px solid ${t.line}` : '0')};
  background: ${(p) => (p.$ghost ? t.white : p.$pro ? t.pro : t.action)};
  color: ${(p) => (p.$ghost ? t.ink : '#fff')};
  font-family: inherit;
  font-size: 15px;
  font-weight: 650;
  text-decoration: none;
  cursor: pointer;
  &:hover { background: ${(p) => (p.$ghost ? t.subtle : p.$pro ? t.accentDeep : t.actionHover)}; }
  &:disabled, &[aria-disabled='true'] { background: #e5e5e5; color: #888; border-color: #e5e5e5; cursor: default; }
`;
const Hint = styled.p`
  margin: 10px 2px 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: ${(p) => (p.$error ? '#E11D48' : t.muted)};
  text-align: center;
`;
const Mini = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  img, .mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid ${t.line};
  }
  .mark {
    display: grid;
    place-items: center;
    background: ${t.subtle};
    font-weight: 700;
    color: ${t.ink};
  }
  div { display: flex; flex-direction: column; min-width: 0; }
  strong { font-size: 15px; color: ${t.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  span { font-size: 12.5px; color: ${t.muted}; }
`;
