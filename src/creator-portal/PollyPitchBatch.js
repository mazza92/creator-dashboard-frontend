import React, { useState } from 'react';
import HotTag from './HotTag';
import styled, { keyframes } from 'styled-components';
import { ExternalLink, Loader2 } from 'lucide-react';
import { creatorTokens as t } from '../theme/creatorTokens';
import { openInGmail } from './openInGmail';

// The pitches Polly wrote, ready to go. One tap sends them all from the creator's Gmail (replies land in their own
// inbox, Polly follows up). Not on Gmail? "Send them myself" opens each one in their mail app, as before.

const PLACEHOLDER_RE = /\[CITY,\s*COUNTRY\]/i;

export function batchItemReady(item) {
  return Boolean(item?.email) && !item.needs_location && !PLACEHOLDER_RE.test(item?.body || '');
}

function isSent(item) {
  return item?.status === 'sent' || item?.status === 'already_sent';
}

const STATUS_NOTE = {
  no_inbox: 'No PR inbox on file, so this one can’t be sent from here.',
  needs_location: 'Tell Polly your city and country first.',
  failed: 'Didn’t go through. Tap send to retry.',
};

function itemNote(item) {
  if (isSent(item)) return '';
  if (STATUS_NOTE[item.status]) return STATUS_NOTE[item.status];
  if (batchItemReady(item)) return '';
  return item.email ? STATUS_NOTE.needs_location : STATUS_NOTE.no_inbox;
}

function timeLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Check() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
  );
}

export default function PitchBatchCard({
  batch, available, gmailConnected, sending, disabled, onSend, onConnect, onOpenMail, onCopy, free = false,
  defaultManual = false,
}) {
  const [open, setOpen] = useState(null);
  // "I'll pitch brands myself" (first run) opens straight on Open email / Copy pitch.
  const [manual, setManual] = useState(Boolean(defaultManual));
  const [handSent, setHandSent] = useState(() => new Set());
  const [copied, setCopied] = useState(null);
  const items = batch?.items || [];
  if (!items.length) return null;

  const sentHere = (item) => isSent(item) || handSent.has(String(item.brand_id));
  const waiting = items.filter((i) => !sentHere(i) && batchItemReady(i));
  const sentCount = items.filter(sentHere).length;
  const n = waiting.length;
  const byHand = manual || !available;

  let label = n > 1 ? `Send all ${n} from my Gmail` : 'Send it from my Gmail';
  if (!gmailConnected) label = n > 1 ? `Connect Gmail & send all ${n}` : 'Connect Gmail & send';
  if (sending) label = 'Sending…';

  const openMail = async (item) => {
    if (!onOpenMail) return;
    const logged = await onOpenMail(item);
    if (logged) setHandSent((prev) => new Set(prev).add(String(item.brand_id)));
  };
  const copy = async (item, idx) => {
    if (onCopy) await onCopy(item);
    setCopied(idx);
    setTimeout(() => setCopied((c) => (c === idx ? null : c)), 1600);
  };

  const kicker = free ? `Your ${items.length} free pitch${items.length > 1 ? 'es' : ''}` : `${items.length} pitches, written for you`;

  return (
    <Card>
      <Kicker>{kicker}</Kicker>
      <List>
        {items.map((item, idx) => {
          const done = sentHere(item);
          return (
            <Row key={item.brand_id || idx}>
              <RowHead type="button" onClick={() => setOpen(open === idx ? null : idx)} aria-expanded={open === idx}>
                <span className="name">{item.meta_ads ? <HotTag /> : null}{item.brand_name || 'Brand'}</span>
                <span className="subject">{item.subject}</span>
                <span className={`state ${done ? 'sent' : ''}`}>
                  {done ? <><Check /> Sent</>
                    : sending && batchItemReady(item) && !byHand ? <><Spin size={14} aria-hidden="true" /> Sending…</>
                      : open === idx ? 'Hide' : 'Read'}
                </span>
              </RowHead>
              {isSent(item) && item.sent_at ? (
                <Receipt style={{ animationDelay: `${idx * 0.35}s` }}>
                  <Check />
                  <span>
                    Delivered {timeLabel(item.sent_at)}{item.to ? ` to ${item.to}` : ''}
                    {item.gmail_url ? (
                      <> · <a href={item.gmail_url} target="_blank" rel="noopener noreferrer" onClick={(e) => openInGmail(e, item.gmail_url)}>
                        View in Gmail <ExternalLink size={12} aria-hidden="true" />
                      </a></>
                    ) : null}
                  </span>
                </Receipt>
              ) : null}
              {open === idx ? (
                <>
                  {item.email ? <To>To: {item.email}</To> : null}
                  <Body>{String(item.body || '').replace(/\s+(?:to|in|from|out of)\s+\[\s*city\s*,\s*country\s*\]/gi, '').replace(/\[\s*city\s*,\s*country\s*\]/gi, '')}</Body>
                </>
              ) : null}
              {itemNote(item) ? <Note>{itemNote(item)}</Note> : null}
              {byHand && !done && item.mailto && batchItemReady(item) ? (
                <RowActions>
                  <RowBtn type="button" className="primary" onClick={() => openMail(item)}>Open email</RowBtn>
                  <RowBtn type="button" onClick={() => copy(item, idx)}>{copied === idx ? 'Copied' : 'Copy pitch'}</RowBtn>
                </RowActions>
              ) : null}
            </Row>
          );
        })}
      </List>

      {n > 0 && !byHand ? (
        <>
          <SendBtn type="button" onClick={gmailConnected ? onSend : onConnect} disabled={disabled || sending}>
            {label}
          </SendBtn>
          <Steps>
            <li><Check /> Sent from your own email address</li>
            <li><Check /> Replies land straight in your inbox</li>
            <li><Check /> No answer? I follow up on day 4 and day 10</li>
          </Steps>
          {!gmailConnected ? <Hint>Send-only access: I can’t read your emails.</Hint> : null}
          <SwitchLink type="button" onClick={() => setManual(true)}>Not using Gmail? Send them myself</SwitchLink>
        </>
      ) : null}

      {n > 0 && byHand ? (
        <>
          <Hint>
            Each one opens in your mail app, ready to send. I&apos;ll log it and remind you to follow up on day 4.
          </Hint>
          {available ? (
            <SwitchLink type="button" onClick={() => setManual(false)}>Back to one-tap sending from Gmail</SwitchLink>
          ) : null}
        </>
      ) : null}

      {n === 0 && sentCount ? (
        <Done>
          <Check />
          <span>
            {handSent.size && !items.some(isSent)
              ? 'All sent. Replies land in your inbox. I’ll remind you on day 4 if a brand hasn’t answered.'
              : 'All sent. Replies land in your inbox, and I follow up on day 4 and day 10 if a brand is quiet.'}
          </span>
        </Done>
      ) : null}
    </Card>
  );
}

const Card = styled.div`
  box-sizing: border-box;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 14px;
  margin-top: 12px;
  min-width: 0;
  width: 100%;
  @media (max-width: 480px) { padding: 12px; }
`;

const Kicker = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${t.accent};
  margin-bottom: 8px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const Row = styled.div`
  border: 1px solid ${t.line};
  border-radius: 12px;
  padding: 10px 12px;
  min-width: 0;
`;

const RowHead = styled.button`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-areas: 'name state' 'subject state';
  gap: 2px 10px;
  width: 100%;
  min-height: 44px;
  background: none;
  border: 0;
  padding: 0;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  .name { grid-area: name; font-weight: 700; font-size: 14px; color: ${t.ink}; }
  .name { overflow-wrap: anywhere; }
  .subject {
    grid-area: subject; font-size: 13px; color: ${t.muted}; min-width: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .state {
    grid-area: state; align-self: center; display: inline-flex; align-items: center; gap: 4px;
    font-size: 12.5px; font-weight: 600; color: ${t.accent};
  }
  .state.sent { color: #1f7a4d; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; border-radius: 8px; }
`;

const To = styled.div`
  font-size: 12.5px;
  color: ${t.muted};
  margin-top: 6px;
  word-break: break-all;
`;

const Body = styled.pre`
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  max-width: 100%;
  font-family: inherit;
  font-size: 13.5px;
  line-height: 1.5;
  color: ${t.inkSoft};
  margin: 8px 0 0;
`;

const Note = styled.div`
  font-size: 12.5px;
  color: #9b1c1c;
  margin-top: 6px;
`;

const RowActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const RowBtn = styled.button`
  flex: 1 1 120px;
  min-height: 40px;
  border-radius: ${t.radiusBtn};
  border: 1px solid ${t.line};
  background: ${t.white};
  color: ${t.ink};
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  &.primary { background: ${t.ink}; border-color: ${t.ink}; color: #fff; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
`;

const SendBtn = styled.button`
  width: 100%;
  min-height: 48px;
  background: ${t.action};
  color: #fff;
  border: 0;
  border-radius: ${t.radiusBtn};
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  &:disabled { opacity: 0.6; cursor: default; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
`;

const Steps = styled.ul`
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: grid;
  gap: 6px;
  li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13.5px;
    color: ${t.inkSoft};
  }
  svg { color: #1f7a4d; flex-shrink: 0; }
`;

const Hint = styled.div`
  font-size: 12.5px;
  color: ${t.muted};
  margin-top: 8px;
  line-height: 1.45;
`;

const SwitchLink = styled.button`
  display: block;
  margin: 10px auto 0;
  min-height: 40px;
  padding: 0 8px;
  background: none;
  border: 0;
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: ${t.accent};
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; border-radius: 6px; }
`;

const spin = keyframes`to { transform: rotate(360deg); }`;
const rise = keyframes`from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; }`;

const Spin = styled(Loader2)`
  animation: ${spin} 0.9s linear infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Receipt = styled.div`
  display: flex;
  gap: 6px;
  align-items: flex-start;
  margin-top: 6px;
  font-size: 12.5px;
  line-height: 1.45;
  color: #165c3f;
  word-break: break-word;
  opacity: 0;
  animation: ${rise} 0.35s ease forwards;
  svg { flex-shrink: 0; margin-top: 2px; }
  a { color: ${t.accent}; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 3px; }
  a:hover { text-decoration: underline; }
  @media (prefers-reduced-motion: reduce) { animation: none; opacity: 1; }
`;

const Done = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 12px;
  border-radius: 12px;
  background: #e7f3ee;
  color: #165c3f;
  font-size: 13.5px;
  line-height: 1.45;
  svg { flex-shrink: 0; margin-top: 2px; }
`;
