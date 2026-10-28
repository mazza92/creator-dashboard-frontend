import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ArrowUp, ShieldCheck, X } from 'lucide-react';
import api from '../../config/api';

// One conversation between a brand and a picked creator (roster). Patterned on the messaging people already
// know (iMessage / WhatsApp / Airbnb): their bubbles left in grey, yours right in colour, day dividers, a time
// under each run of messages, "Seen" under your last one, a composer that grows, Enter to send on desktop,
// quick replies when the box is empty, and sends that show instantly and can be retried.

const POLL_MS = 8000;
const GROUP_GAP_MS = 5 * 60 * 1000;

const canHover = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover)').matches;

function dayLabel(d) {
  const today = new Date();
  const y = new Date(); y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

const timeLabel = (d) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

let tempSeq = 0;

export default function RosterChat({
  open, onClose, title, subtitle, avatarUrl, loadUrl, sendUrl, extraBody, quickReplies = [], emptyHint, onRead,
}) {
  const [messages, setMessages] = useState([]);
  const [isOpenThread, setIsOpenThread] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const stick = useRef(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(loadUrl);
      if (!data?.success) throw new Error(data?.error || 'Could not load messages');
      setIsOpenThread(data.open !== false);
      setMessages((prev) => [...(data.messages || []), ...prev.filter((m) => m.pending || m.failed)]);
      setError('');
      if (onRead) onRead();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not load messages');
    } finally {
      setLoading(false);
    }
  }, [loadUrl, onRead]);

  useEffect(() => {
    if (!open) return undefined;
    setLoading(true);
    setMessages([]);
    load();
    const t = setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setTimeout(() => inputRef.current && canHover() && inputRef.current.focus(), 50);
    return () => { clearInterval(t); window.removeEventListener('keydown', onKey); document.body.style.overflow = prevOverflow; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loadUrl]);

  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [draft]);

  const send = async (text, retryId) => {
    const body = String(text || '').trim();
    if (!body) return;
    const tempId = retryId || `t${++tempSeq}`;
    const temp = { id: tempId, mine: true, body, pending: true, created_at: new Date().toISOString() };
    stick.current = true;
    setMessages((prev) => (retryId ? prev.map((m) => (m.id === retryId ? temp : m)) : [...prev, temp]));
    if (!retryId) setDraft('');
    try {
      const { data } = await api.post(sendUrl, { ...(extraBody || {}), body });
      if (!data?.success) throw new Error(data?.error || 'Not sent');
      // A poll may already have fetched the saved message: keep one copy.
      setMessages((prev) => prev.filter((m) => m.id !== data.message.id).map((m) => (m.id === tempId ? data.message : m)));
    } catch (err) {
      const why = err.response?.data?.error || err.message || 'Not sent';
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: why } : m)));
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && canHover()) {
      e.preventDefault();
      send(draft);
    }
  };

  if (!open) return null;

  const lastMine = [...messages].reverse().find((m) => m.mine && !m.pending && !m.failed);
  const anyMasked = messages.some((m) => m.masked);
  let lastDay = '';
  const rows = messages.map((m, i) => {
    const d = new Date(m.created_at || Date.now());
    const next = messages[i + 1];
    const prev = messages[i - 1];
    const day = dayLabel(d);
    const divider = day !== lastDay ? day : '';
    lastDay = day;
    const sameAsPrev = prev && prev.mine === m.mine && d - new Date(prev.created_at) < GROUP_GAP_MS && !divider;
    const endsGroup = !next || next.mine !== m.mine || new Date(next.created_at) - d >= GROUP_GAP_MS
      || dayLabel(new Date(next.created_at)) !== day;
    return (
      <React.Fragment key={m.id}>
        {divider && <Day><span>{divider}</span></Day>}
        <Row $mine={m.mine} $tight={sameAsPrev}>
          <Bubble $mine={m.mine} $failed={Boolean(m.failed)} $pending={m.pending}>{m.body}</Bubble>
        </Row>
        {m.failed ? (
          <Meta $mine>
            Not sent · <button type="button" onClick={() => send(m.body, m.id)}>Retry</button>
          </Meta>
        ) : endsGroup && (
          <Meta $mine={m.mine}>
            {m.pending ? 'Sending…' : timeLabel(d)}
            {lastMine && m.id === lastMine.id && m.seen ? ' · Seen' : ''}
          </Meta>
        )}
      </React.Fragment>
    );
  });

  return (
    <Overlay onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <Panel role="dialog" aria-label={`Messages with ${title}`}>
        <Head>
          <Avatar>{avatarUrl ? <img src={avatarUrl} alt="" /> : String(title || '?').slice(0, 1).toUpperCase()}</Avatar>
          <div className="who">
            <b>{title}</b>
            {subtitle && <span>{subtitle}</span>}
          </div>
          <Close type="button" onClick={onClose} aria-label="Close messages"><X size={18} /></Close>
        </Head>

        <List ref={listRef} onScroll={(e) => {
          const el = e.currentTarget;
          stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
        }}>
          {loading ? <Hint>Loading…</Hint> : null}
          {!loading && !messages.length && !error && (
            <Empty>
              <b>Start the conversation</b>
              <span>{emptyHint}</span>
            </Empty>
          )}
          {rows}
          {error && !loading && <Hint $error>{error}</Hint>}
        </List>

        {isOpenThread ? (
          <Foot>
            {!draft.trim() && quickReplies.length > 0 && (
              <Quick>
                {quickReplies.map((q) => (
                  <button key={q} type="button" onClick={() => send(q)}>{q}</button>
                ))}
              </Quick>
            )}
            <Composer onSubmit={(e) => { e.preventDefault(); send(draft); }}>
              <textarea ref={inputRef} rows={1} value={draft} maxLength={1000} placeholder="Message"
                aria-label="Message" onChange={(e) => setDraft(e.target.value)} onKeyDown={onKeyDown} />
              <SendBtn type="submit" disabled={!draft.trim()} aria-label="Send"><ArrowUp size={18} strokeWidth={2.5} /></SendBtn>
            </Composer>
            <Privacy>
              <ShieldCheck size={12} />
              {anyMasked
                ? 'Emails and phone numbers are hidden to keep this collab on Newcollab.'
                : 'Messages stay on Newcollab. We email them when you write.'}
            </Privacy>
          </Foot>
        ) : (
          <Closed>Messaging opens once the brand has locked its picks.</Closed>
        )}
      </Panel>
    </Overlay>
  );
}

/** "Message" button with an unread badge, like an inbox count. */
export function MessageButton({ unread = 0, onClick, label = 'Message', className }) {
  return (
    <MsgBtn type="button" onClick={onClick} className={className} aria-label={unread ? `${label} (${unread} unread)` : label}>
      {label}
      {unread > 0 && <i>{unread > 9 ? '9+' : unread}</i>}
    </MsgBtn>
  );
}

const MINE = '#e8395f';
const THEIRS = '#f0f0f3';
const INK = '#16171b';
const MUTED = '#6b6f78';
const LINE = '#e7e7ea';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1300;
  background: rgba(15, 16, 20, 0.32);
  display: flex;
  justify-content: flex-end;
`;

const Panel = styled.div`
  width: 420px;
  max-width: 100%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -12px 0 40px rgba(15, 16, 20, 0.16);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: ${INK};

  @media (max-width: 560px) {
    width: 100%;
    box-shadow: none;
  }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid ${LINE};
  padding-top: max(12px, env(safe-area-inset-top));

  .who { min-width: 0; flex: 1; display: grid; }
  .who b { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .who span { font-size: 12.5px; color: ${MUTED}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

const Avatar = styled.span`
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border-radius: 50%;
  background: #f4d7de;
  color: ${MINE};
  font-weight: 700;
  display: grid;
  place-items: center;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const Close = styled.button`
  border: 0;
  background: #f3f3f5;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: ${INK};
`;

const List = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px 8px;
  -webkit-overflow-scrolling: touch;
`;

const Day = styled.div`
  text-align: center;
  margin: 10px 0 12px;

  span {
    font-size: 11.5px;
    font-weight: 600;
    color: ${MUTED};
    background: #f6f6f8;
    padding: 3px 10px;
    border-radius: 999px;
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: ${(p) => (p.$mine ? 'flex-end' : 'flex-start')};
  margin-top: ${(p) => (p.$tight ? '2px' : '8px')};
`;

const Bubble = styled.div`
  max-width: 78%;
  padding: 8px 12px;
  border-radius: 18px;
  border-${(p) => (p.$mine ? 'bottom-right' : 'bottom-left')}-radius: 6px;
  background: ${(p) => (p.$mine ? MINE : THEIRS)};
  color: ${(p) => (p.$mine ? '#fff' : INK)};
  font-size: 15px;
  line-height: 1.4;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  opacity: ${(p) => (p.$pending ? 0.7 : 1)};
  outline: ${(p) => (p.$failed ? '2px solid #f59e0b' : 'none')};
`;

const Meta = styled.div`
  text-align: ${(p) => (p.$mine ? 'right' : 'left')};
  font-size: 11.5px;
  color: ${MUTED};
  margin: 3px 4px 0;

  button {
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    font-weight: 600;
    color: ${MINE};
    cursor: pointer;
  }
`;

const Empty = styled.div`
  display: grid;
  gap: 4px;
  text-align: center;
  margin: 40px 18px;

  b { font-size: 15px; }
  span { font-size: 13.5px; color: ${MUTED}; line-height: 1.5; }
`;

const Hint = styled.p`
  text-align: center;
  font-size: 13px;
  color: ${(p) => (p.$error ? '#b42318' : MUTED)};
`;

const Foot = styled.div`
  border-top: 1px solid ${LINE};
  padding: 8px 12px max(10px, env(safe-area-inset-bottom));
`;

const Quick = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 2px 0 8px;
  scrollbar-width: none;

  &::-webkit-scrollbar { display: none; }

  button {
    flex: 0 0 auto;
    border: 1px solid ${LINE};
    background: #fff;
    border-radius: 999px;
    padding: 6px 12px;
    font: inherit;
    font-size: 13px;
    color: ${INK};
    cursor: pointer;
    white-space: nowrap;
  }

  button:hover { border-color: ${INK}; }
`;

const Composer = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: #f6f6f8;
  border-radius: 22px;
  padding: 6px 6px 6px 14px;

  textarea {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    resize: none;
    font: inherit;
    font-size: 15px;
    line-height: 1.4;
    padding: 6px 0;
    color: ${INK};
  }
`;

const SendBtn = styled.button`
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  border-radius: 50%;
  border: 0;
  background: ${MINE};
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:disabled { background: #d9d9de; cursor: default; }
`;

const Privacy = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  justify-content: center;
  font-size: 11.5px;
  color: ${MUTED};
  margin-top: 6px;
`;

const Closed = styled.div`
  border-top: 1px solid ${LINE};
  padding: 14px;
  text-align: center;
  font-size: 13px;
  color: ${MUTED};
`;

const MsgBtn = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid ${LINE};
  background: #fff;
  color: ${INK};
  border-radius: 999px;
  padding: 6px 12px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover { border-color: ${INK}; }

  i {
    font-style: normal;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: ${MINE};
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: inline-grid;
    place-items: center;
  }
`;
