import React, { useState } from 'react';
import styled from 'styled-components';
import { creatorTokens as t } from '../theme/creatorTokens';

const PLACEHOLDER_RE = /\[CITY,\s*COUNTRY\]/i;

export function batchItemReady(item) {
  return Boolean(item?.email) && !item.needs_location && !PLACEHOLDER_RE.test(item?.body || '');
}

function isSent(item) {
  return item?.status === 'sent' || item?.status === 'already_sent';
}

const STATUS_NOTE = {
  no_inbox: 'No PR inbox on file, so this one can’t go from Gmail.',
  needs_location: 'Tell Polly your city and country first.',
  failed: 'Didn’t go through. Tap send to retry.',
};

function itemNote(item) {
  if (isSent(item)) return '';
  if (STATUS_NOTE[item.status]) return STATUS_NOTE[item.status];
  if (batchItemReady(item)) return '';
  return item.email ? STATUS_NOTE.needs_location : STATUS_NOTE.no_inbox;
}

export default function PitchBatchCard({ batch, available, gmailConnected, sending, disabled, onSend, onConnect }) {
  const [open, setOpen] = useState(null);
  const items = batch?.items || [];
  if (!items.length) return null;
  const waiting = items.filter((i) => !isSent(i) && batchItemReady(i));
  const sentCount = items.filter(isSent).length;
  const n = waiting.length;
  let label = n > 1 ? `Send all ${n} from my Gmail` : 'Send it from my Gmail';
  if (!gmailConnected) label = n > 1 ? `Connect Gmail & send all ${n}` : 'Connect Gmail & send';
  if (sending) label = 'Sending…';

  return (
    <Card>
      <Kicker>{items.length} pitches, written for you</Kicker>
      <List>
        {items.map((item, idx) => (
          <Row key={item.brand_id || idx}>
            <RowHead type="button" onClick={() => setOpen(open === idx ? null : idx)} aria-expanded={open === idx}>
              <span className="name">{item.brand_name || 'Brand'}</span>
              <span className="subject">{item.subject}</span>
              <span className={`state ${isSent(item) ? 'sent' : ''}`}>
                {isSent(item) ? 'Sent' : open === idx ? 'Hide' : 'Read'}
              </span>
            </RowHead>
            {item.email ? <To>To: {item.email}</To> : null}
            {open === idx ? <Body>{item.body}</Body> : null}
            {itemNote(item) ? <Note>{itemNote(item)}</Note> : null}
            {!available && item.mailto && batchItemReady(item) ? (
              <MailLink href={item.mailto}>Open email</MailLink>
            ) : null}
          </Row>
        ))}
      </List>
      {!available ? null : n > 0 ? (
        <>
          <SendBtn type="button" onClick={gmailConnected ? onSend : onConnect} disabled={disabled || sending}>
            {label}
          </SendBtn>
          <Hint>
            {gmailConnected
              ? 'They go out from your own Gmail, one email per brand.'
              : 'Send-only access: Polly can’t read your inbox.'}
          </Hint>
        </>
      ) : sentCount ? (
        <Hint>All sent from your Gmail. I&apos;ll check in on day 4.</Hint>
      ) : null}
    </Card>
  );
}

const Card = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: 14px;
  margin-top: 12px;
  min-width: 0;
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
  background: none;
  border: 0;
  padding: 0;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  .name { grid-area: name; font-weight: 700; font-size: 14px; color: ${t.ink}; }
  .subject {
    grid-area: subject; font-size: 13px; color: ${t.muted};
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .state { grid-area: state; align-self: center; font-size: 12.5px; font-weight: 600; color: ${t.accent}; }
  .state.sent { color: #1f7a4d; }
`;

const To = styled.div`
  font-size: 12.5px;
  color: ${t.muted};
  margin-top: 4px;
  word-break: break-all;
`;

const Body = styled.pre`
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 13.5px;
  line-height: 1.5;
  color: ${t.inkSoft};
  margin: 10px 0 0;
`;

const Note = styled.div`
  font-size: 12.5px;
  color: #9b1c1c;
  margin-top: 6px;
`;

const MailLink = styled.a`
  display: inline-block;
  margin-top: 8px;
  font-size: 13px;
  font-weight: 600;
  color: ${t.accent};
`;

const SendBtn = styled.button`
  background: ${t.action};
  color: #fff;
  border: 0;
  border-radius: ${t.radiusBtn};
  padding: 11px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  &:disabled { opacity: 0.6; cursor: default; }
`;

const Hint = styled.div`
  font-size: 12.5px;
  color: ${t.muted};
  margin-top: 8px;
`;
