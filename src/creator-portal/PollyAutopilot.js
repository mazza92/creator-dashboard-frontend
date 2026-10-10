import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

const Card = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 18px;
  padding: 14px 16px 16px;
  font-family: ${t.fontSans};
  color: ${t.ink};
  min-width: 0;
  .say { font-size: 15px; line-height: 1.6; margin: 0 0 12px; }
  .say:last-child { margin-bottom: 0; }
  .muted { font-size: 12.5px; color: ${t.muted}; line-height: 1.45; }
  .err { font-size: 13px; color: #B91C1C; margin: 0 0 10px; }
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: ${t.accent};
  }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: ${(p) => (p.$live ? '#16A34A' : t.line)}; }
  .tools { display: flex; gap: 2px; }
`;

const IconBtn = styled.button`
  border: none;
  background: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  color: ${t.muted};
  font-size: 16px;
  line-height: 1;
  &:hover { background: ${t.cream}; color: ${t.ink}; }
`;

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid ${(p) => (p.$primary ? t.ink : t.line)};
  background: ${(p) => (p.$primary ? t.ink : t.white)};
  color: ${(p) => (p.$primary ? t.white : t.ink)};
  &:disabled { opacity: 0.5; cursor: default; }
`;

const LinkBtn = styled.button`
  border: none;
  background: none;
  padding: 0;
  font-size: 12.5px;
  font-family: inherit;
  color: ${t.muted};
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
`;

const Steps = styled.ol`
  list-style: none;
  margin: 0 0 14px;
  padding: 0;
  display: grid;
  gap: 10px;
  li { display: grid; grid-template-columns: 26px 1fr; gap: 10px; align-items: start; }
  .n {
    width: 26px; height: 26px; border-radius: 50%;
    background: ${t.cream}; border: 1px solid ${t.line};
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700;
  }
  .t { font-size: 14px; font-weight: 600; }
  .d { font-size: 13px; color: ${t.inkSoft}; line-height: 1.45; }
`;

const Progress = styled.div`
  margin: 4px 0 2px;
  .label { display: flex; justify-content: space-between; font-size: 13px; color: ${t.inkSoft}; }
  .track { height: 6px; border-radius: 999px; background: ${t.line}; overflow: hidden; margin-top: 6px; }
  .fill { height: 100%; background: ${t.accent}; border-radius: 999px; transition: width 0.3s; }
`;

const List = styled.div`
  border: 1px solid ${t.line};
  border-radius: 14px;
  overflow: hidden;
`;

const Row = styled.div`
  padding: 10px 12px;
  font-size: 13.5px;
  & + & { border-top: 1px solid ${t.line}; }
  .top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .brand { font-weight: 600; }
  .sub { font-size: 12.5px; color: ${t.muted}; margin-top: 2px; overflow-wrap: anywhere; }
  .side { display: flex; gap: 12px; flex-shrink: 0; font-size: 12.5px; color: ${t.muted}; }
  input, textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid ${t.line};
    border-radius: 10px;
    padding: 8px 10px;
    font: inherit;
    font-size: 13.5px;
    margin-top: 8px;
  }
  textarea { min-height: 180px; resize: vertical; line-height: 1.5; }
`;

const Notice = styled.div`
  background: ${t.cream};
  border: 1px solid ${t.line};
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  line-height: 1.45;
  margin: 0 0 12px;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(17, 24, 39, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Sheet = styled.div`
  width: 100%;
  max-width: 460px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: ${t.white};
  border-radius: 20px;
  padding: 20px;
  font-family: ${t.fontSans};
  color: ${t.ink};
  h3 { font-family: ${t.fontDisplay}; font-size: 22px; margin: 0; }
  .muted { font-size: 12.5px; color: ${t.muted}; line-height: 1.45; }
`;

const Setting = styled.div`
  padding: 14px 0;
  & + & { border-top: 1px solid ${t.line}; }
  .label { font-size: 14px; font-weight: 600; }
  .hint { font-size: 12.5px; color: ${t.muted}; margin-top: 2px; line-height: 1.45; }
  .line { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
`;

const Switch = styled.button`
  width: 44px;
  height: 26px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: ${(p) => (p.$on ? '#16A34A' : t.line)};
  position: relative;
  flex-shrink: 0;
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${(p) => (p.$on ? '21px' : '3px')};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    transition: left 0.15s;
  }
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Segments = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols || 2}, 1fr);
  gap: 6px;
  margin-top: 10px;
`;

const Segment = styled.button`
  border: 1px solid ${(p) => (p.$on ? t.ink : t.line)};
  background: ${(p) => (p.$on ? t.ink : t.white)};
  color: ${(p) => (p.$on ? t.white : t.ink)};
  border-radius: 12px;
  padding: 9px 10px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  strong { display: block; font-size: 13.5px; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
`;

const Chip = styled.button`
  border: 1px solid ${(p) => (p.$on ? t.ink : t.line)};
  background: ${(p) => (p.$on ? t.ink : t.white)};
  color: ${(p) => (p.$on ? t.white : t.ink)};
  border-radius: 999px;
  padding: 6px 12px;
  font-family: inherit;
  font-size: 12.5px;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Funnel = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-top: 10px;
  div {
    background: ${t.cream};
    border-radius: 12px;
    padding: 8px 6px;
    text-align: center;
  }
  strong { display: block; font-size: 17px; }
  span { font-size: 11px; color: ${t.muted}; }
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  button {
    width: 34px; height: 34px; border-radius: 50%;
    border: 1px solid ${t.line}; background: ${t.white};
    font-size: 18px; line-height: 1; cursor: pointer; color: ${t.ink};
    &:disabled { opacity: 0.4; cursor: default; }
  }
  .value { font-size: 22px; font-weight: 700; min-width: 34px; text-align: center; }
`;

const ConsentMock = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 2px solid #16A34A;
  border-radius: 12px;
  padding: 10px 12px;
  margin: 0 0 12px;
  font-size: 13.5px;
  .box {
    width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
    background: #1A73E8; color: #fff; font-size: 13px; line-height: 18px; text-align: center;
  }
`;

const PickRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  font-size: 13.5px;
  cursor: ${(p) => (p.$disabled ? 'default' : 'pointer')};
  opacity: ${(p) => (p.$disabled ? 0.5 : 1)};
  & + & { border-top: 1px solid ${t.line}; }
  input { width: 16px; height: 16px; accent-color: ${t.ink}; flex-shrink: 0; }
  .brand { font-weight: 600; }
  .sub { font-size: 12.5px; color: ${t.muted}; }
`;

const FOCUS = [
  { id: 'auto', name: 'Let Polly pick', hint: 'From your goals' },
  { id: 'gifted', name: 'Gifted PR', hint: 'Product + shipping' },
  { id: 'paid', name: 'Paid deals', hint: 'Quotes your rate' },
];

const FOLLOWUPS = [
  { n: 0, name: 'Off', hint: 'Pitch only' },
  { n: 1, name: 'Once', hint: 'Day 4' },
  { n: 2, name: 'Twice', hint: 'Day 4 and day 10' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const CATEGORY_LABELS = {
  haircare: 'Hair care',
  pets: 'Pets',
  baby: 'Baby & parenting',
  home: 'Home',
};

function label(key) {
  return CATEGORY_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const ERRORS = {
  needs_location: 'I need your city before I can write these. Tell me in the chat (e.g. "Austin, United States") and tap Write again.',
  gmail_not_connected: 'Connect Gmail first.',
};

function when(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
}

function perWeek(target) {
  return Math.max(1, Math.ceil((target || 24) / 4));
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function useAutopilot(active) {
  const [state, setState] = useState(null);
  const reload = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/polly/autopilot/status');
      if (res.data?.success) setState(res.data);
      return res.data;
    } catch (_) {
      return null;
    }
  }, []);
  useEffect(() => {
    if (active) reload();
  }, [active, reload]);
  return { state, setState, reload };
}

/** Composer pill: one line that says what Autopilot needs, or null while loading. */
export function autopilotChip(state) {
  if (!state) return null;
  if (!state.is_pro) return { label: '⚡ Autopilot · Pro', attention: false };
  if (!state.available) return null;
  const items = state.items || [];
  const drafts = items.filter((i) => i.status === 'draft').length;
  if (!state.gmail?.connected) {
    return { label: state.gmail?.needs_reconnect ? '⚡ Reconnect Autopilot' : '⚡ Turn on Autopilot', attention: true };
  }
  if (drafts) return { label: `⚡ ${drafts} pitch${drafts > 1 ? 'es' : ''} to OK`, attention: true };
  if (!state.enabled) return { label: '⚡ Autopilot paused', attention: false };
  return { label: `⚡ Autopilot · ${state.month?.sent || 0}/${state.monthly_target || 24}`, attention: false };
}

export function AutopilotCard({ state, setState, reload, notice, returnReason, onUpgrade, onClose, onOpenSettings }) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [edits, setEdits] = useState({});
  const [showSchedule, setShowSchedule] = useState(false);

  const items = state?.items || [];
  const drafts = items.filter((i) => i.status === 'draft');
  const scheduled = items.filter((i) => i.status === 'approved');
  const sent = items.filter((i) => i.status === 'sent');
  const failed = items.filter((i) => i.status === 'failed');
  const month = state?.month || {};
  const target = state?.monthly_target || 24;
  const gmail = state?.gmail || {};
  const pct = Math.min(100, Math.round((100 * (month.sent || 0)) / target));

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (err) {
      setError(ERRORS[err.response?.data?.error] || 'Something went wrong. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  const connect = () => run(async () => {
    const res = await apiClient.get('/api/polly/autopilot/gmail/connect');
    if (res.data?.url) window.location.href = res.data.url;
  });

  const resume = () => run(async () => {
    const res = await apiClient.post('/api/polly/autopilot/settings', { enabled: true });
    setState(res.data);
  });

  const planWeek = () => run(async () => {
    const res = await apiClient.post('/api/polly/autopilot/plan');
    const brands = res.data?.brands || [];
    if (!brands.length) {
      setError(res.data?.reason === 'target_reached'
        ? `That's ${target} brands this month. I'll line up more on the 1st.`
        : "I couldn't find new matches with a working email today. Try again tomorrow.");
      return;
    }
    setPlan({
      options: [...brands, ...(res.data?.alternates || [])],
      size: res.data?.size || brands.length,
      selected: brands.map((b) => b.id),
    });
  });

  const writeWeek = () => run(async () => {
    const chosen = new Set(plan?.selected || []);
    const brands = (plan?.options || []).filter((b) => chosen.has(b.id));
    setPlan(null);
    for (const [i, brand] of brands.entries()) {
      setProgress({ done: i, total: brands.length, name: brand.name });
      try {
        // eslint-disable-next-line no-await-in-loop
        await apiClient.post('/api/polly/autopilot/draft', { brand_id: brand.id });
      } catch (err) {
        if (err.response?.data?.error === 'needs_location') {
          setProgress(null);
          throw err;
        }
      }
    }
    setProgress(null);
    await reload();
  });

  const skip = (item) => run(async () => {
    const res = await apiClient.post(`/api/polly/autopilot/items/${item.id}/skip`);
    setState(res.data);
  });

  const approveAll = () => run(async () => {
    for (const item of drafts) {
      const edit = edits[item.id];
      // eslint-disable-next-line no-await-in-loop
      if (edit) await apiClient.patch(`/api/polly/autopilot/items/${item.id}`, edit);
    }
    const res = await apiClient.post('/api/polly/autopilot/approve', { ids: drafts.map((d) => d.id) });
    setEdits({});
    setOpenId(null);
    setState(res.data);
  });

  const setEdit = (item, patch) => setEdits((prev) => ({
    ...prev,
    [item.id]: {
      subject: prev[item.id]?.subject ?? item.subject,
      body: prev[item.id]?.body ?? item.body,
      ...patch,
    },
  }));

  const steps = (
    <Steps>
      <li>
        <span className="n">1</span>
        <div>
          <div className="t">I pick the brands</div>
          <div className="d">{state?.per_week || perWeek(target)} matched brands a week, each with a real contact.</div>
        </div>
      </li>
      <li>
        <span className="n">2</span>
        <div>
          <div className="t">I write the pitches</div>
          <div className="d">You get the week&apos;s pitches in one go. Edit or skip any.</div>
        </div>
      </li>
      <li>
        <span className="n">3</span>
        <div>
          <div className="t">I send and follow up</div>
          <div className="d">
            From your own Gmail, so brands see you, not a platform. I keep following up until they reply.
          </div>
        </div>
      </li>
      <li>
        <span className="n">4</span>
        <div>
          <div className="t">I report back</div>
          <div className="d">Who I pitched, who replied, what&apos;s next. All in your timeline.</div>
        </div>
      </li>
    </Steps>
  );

  let body;
  if (!state) {
    body = <p className="say">One sec…</p>;
  } else if (!state.is_pro) {
    body = (
      <>
        <p className="say">On Pro I run your brand outreach for you. Here&apos;s how it works:</p>
        {steps}
        <Actions>
          <Btn $primary type="button" onClick={onUpgrade}>Put Polly to work · $19/mo</Btn>
          <LinkBtn type="button" onClick={onClose}>Not now</LinkBtn>
        </Actions>
      </>
    );
  } else if (!state.available) {
    body = <p className="say">I&apos;m getting Autopilot ready. I&apos;ll tell you right here when it&apos;s on.</p>;
  } else if (!gmail.connected && returnReason === 'gmail_scope') {
    body = (
      <>
        <p className="say">
          Almost there. Google didn&apos;t give me permission to send, so Gmail isn&apos;t connected yet.
          On the Google screen, tick this box before you tap <strong>Continue</strong>:
        </p>
        <ConsentMock aria-hidden="true">
          <span>Send email on your behalf</span>
          <span className="box">✓</span>
        </ConsentMock>
        <p className="muted">That&apos;s the only permission I ask for. I can&apos;t read your inbox.</p>
        <Actions>
          <Btn $primary type="button" onClick={connect} disabled={busy}>
            <GoogleMark /> Try again
          </Btn>
          <LinkBtn type="button" onClick={onClose}>Not now, I&apos;ll send them myself</LinkBtn>
        </Actions>
      </>
    );
  } else if (!gmail.connected) {
    body = (
      <>
        <p className="say">
          {gmail.needs_reconnect
            ? 'Google stopped letting me send from your Gmail. Reconnect and I pick up where I left off.'
            : "Let me run your brand outreach. Here's how it works:"}
        </p>
        {gmail.needs_reconnect ? null : steps}
        <p className="muted">Newcollab can only send emails you&apos;ve approved. It can&apos;t read your inbox.</p>
        <Actions>
          <Btn $primary type="button" onClick={connect} disabled={busy}>
            <GoogleMark /> {gmail.needs_reconnect ? 'Reconnect Gmail' : 'Connect Gmail'}
          </Btn>
          <LinkBtn type="button" onClick={onClose}>Not now, I&apos;ll send them myself</LinkBtn>
        </Actions>
        <p className="muted" style={{ marginTop: 10 }}>
          On Google&apos;s screen, tick <strong>Send email on your behalf</strong>.
        </p>
      </>
    );
  } else if (plan) {
    const chosen = plan.selected;
    const full = chosen.length >= plan.size;
    body = (
      <>
        <p className="say">
          Here are this week&apos;s picks. Untick any you don&apos;t want and choose others. I&apos;ll write up
          to <strong>{plan.size}</strong>.
        </p>
        <List>
          {plan.options.map((b) => {
            const on = chosen.includes(b.id);
            const disabled = !on && full;
            return (
              <PickRow key={b.id} $disabled={disabled}>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={disabled || busy}
                  onChange={() => setPlan((p) => ({ ...p, selected: toggle(p.selected, b.id) }))}
                />
                <span style={{ minWidth: 0 }}>
                  <span className="brand">{b.name || b.brand_name}</span>
                  {b.category ? <span className="sub"> · {b.category}</span> : null}
                </span>
              </PickRow>
            );
          })}
        </List>
        <Actions>
          <Btn $primary type="button" onClick={writeWeek} disabled={busy || !chosen.length}>
            Write {chosen.length} pitch{chosen.length === 1 ? '' : 'es'}
          </Btn>
          <LinkBtn type="button" onClick={() => setPlan(null)} disabled={busy}>Cancel</LinkBtn>
        </Actions>
      </>
    );
  } else if (progress) {
    body = (
      <>
        <p className="say">Writing <strong>{progress.name}</strong>…</p>
        <Progress>
          <div className="label"><span>Pitch {progress.done + 1} of {progress.total}</span></div>
          <div className="track"><div className="fill" style={{ width: `${(100 * progress.done) / progress.total}%` }} /></div>
        </Progress>
        <p className="muted" style={{ marginTop: 10 }}>Keep this open. It takes about 20 seconds a pitch.</p>
      </>
    );
  } else if (drafts.length) {
    body = (
      <>
        <p className="say">
          I wrote <strong>{drafts.length} pitch{drafts.length > 1 ? 'es' : ''}</strong> for this week.
          Give them a quick read, then I&apos;ll send them from {gmail.email} on your send days.
        </p>
        <List>
          {drafts.map((item) => {
            const edit = edits[item.id] || {};
            const open = openId === item.id;
            return (
              <Row key={item.id}>
                <div className="top">
                  <div style={{ minWidth: 0 }}>
                    <div className="brand">{item.brand_name}</div>
                    <div className="sub">{edit.subject ?? item.subject}</div>
                  </div>
                  <div className="side">
                    <LinkBtn type="button" onClick={() => setOpenId(open ? null : item.id)}>
                      {open ? 'Done' : 'Read'}
                    </LinkBtn>
                    <LinkBtn type="button" onClick={() => skip(item)} disabled={busy}>Skip</LinkBtn>
                  </div>
                </div>
                {open ? (
                  <>
                    <div className="sub" style={{ marginTop: 8 }}>To: {item.to_email}</div>
                    <input
                      aria-label="Subject"
                      value={edit.subject ?? item.subject}
                      onChange={(e) => setEdit(item, { subject: e.target.value })}
                    />
                    <textarea
                      aria-label="Pitch"
                      value={edit.body ?? item.body}
                      onChange={(e) => setEdit(item, { body: e.target.value })}
                    />
                  </>
                ) : null}
              </Row>
            );
          })}
        </List>
        <Actions>
          <Btn $primary type="button" onClick={approveAll} disabled={busy}>
            Looks good, send {drafts.length > 1 ? 'them' : 'it'}
          </Btn>
          <span className="muted">US morning, EU afternoon.</span>
        </Actions>
      </>
    );
  } else {
    const fresh = !sent.length && !scheduled.length;
    const next = scheduled[0];
    body = (
      <>
        {!state.enabled ? (
          <Notice>
            Autopilot is paused, so nothing will send.{' '}
            <LinkBtn type="button" onClick={resume} disabled={busy}>Resume</LinkBtn>
          </Notice>
        ) : null}
        {fresh ? (
          <p className="say">
            You&apos;re set up. I&apos;ll pick <strong>{state.next_batch || perWeek(target)} brands</strong> that match you
            and write their pitches. You choose which ones and read them before anything sends.
          </p>
        ) : (
          <p className="say">
            {next
              ? <>Next up: <strong>{next.brand_name}</strong>, {when(next.scheduled_for)}.</>
              : state.followups
                ? "This week's pitches are out. I'll follow up in the same thread if they're quiet."
                : "This week's pitches are out."}
          </p>
        )}
        {!fresh ? (
          <Progress>
            <div className="label">
              <span><strong>{month.sent || 0}</strong> of {target} brands pitched this month</span>
              {month.followups ? <span>{month.followups} follow-up{month.followups > 1 ? 's' : ''}</span> : null}
            </div>
            <div className="track"><div className="fill" style={{ width: `${pct}%` }} /></div>
          </Progress>
        ) : null}
        {failed.length ? (
          <p className="err" style={{ marginTop: 10 }}>
            {failed.map((f) => f.brand_name).join(', ')} didn&apos;t send.{' '}
            <LinkBtn type="button" onClick={() => failed.forEach((f) => skip(f))} disabled={busy}>Clear</LinkBtn>
          </p>
        ) : null}
        <Actions>
          {state.next_batch > 0 && scheduled.length < 2 ? (
            <Btn $primary={fresh} type="button" onClick={planWeek} disabled={busy}>
              {fresh ? "Write this week's pitches" : 'Line up next week'}
            </Btn>
          ) : null}
          {!state.next_batch && !scheduled.length ? (
            <span className="muted">That&apos;s this month&apos;s {target}. I&apos;ll line up more on the 1st.</span>
          ) : null}
          {scheduled.length || sent.length ? (
            <LinkBtn type="button" onClick={() => setShowSchedule((v) => !v)}>
              {showSchedule ? 'Hide schedule' : `See schedule (${scheduled.length + sent.length})`}
            </LinkBtn>
          ) : null}
        </Actions>
        {showSchedule ? (
          <List style={{ marginTop: 12 }}>
            {[...scheduled, ...sent].map((item) => (
              <Row key={item.id}>
                <div className="top">
                  <span className="brand">{item.brand_name}</span>
                  <span className="side">
                    {item.status === 'approved'
                      ? when(item.scheduled_for)
                      : item.followup_sent_at
                        ? 'Followed up'
                        : item.followup_status === 'cancelled'
                          ? 'Closed'
                          : `Sent · follow-up ${when(item.followup_due_at)}`}
                  </span>
                </div>
              </Row>
            ))}
          </List>
        ) : null}
      </>
    );
  }

  const live = Boolean(state?.is_pro && gmail.connected && state?.enabled);
  return (
    <Card>
      <Head $live={live}>
        <span className="kicker"><span className="dot" />Autopilot{live ? ' · on' : ''}</span>
        <span className="tools">
          {state?.is_pro && gmail.connected ? (
            <IconBtn type="button" onClick={onOpenSettings} aria-label="Autopilot settings" title="Settings">⚙</IconBtn>
          ) : null}
          <IconBtn type="button" onClick={onClose} aria-label="Close Autopilot">×</IconBtn>
        </span>
      </Head>
      {notice ? <Notice>{notice}</Notice> : null}
      {error ? <p className="err">{error}</p> : null}
      {body}
    </Card>
  );
}

export function AutopilotSettings({ isOpen, state, setState, onClose }) {
  const [busy, setBusy] = useState(false);
  if (!isOpen || !state) return null;

  const save = async (patch) => {
    setBusy(true);
    try {
      const res = await apiClient.post('/api/polly/autopilot/settings', patch);
      setState(res.data);
    } finally {
      setBusy(false);
    }
  };

  const month = state.month || {};
  const target = state.monthly_target || 24;
  const [min, max] = state.target_range || [8, 30];
  const days = state.send_days || [0, 1, 2, 3, 4];
  const targeting = state.targeting;
  const setTarget = (delta) => save({ monthly_target: Math.max(min, Math.min(max, target + delta)) });

  const disconnect = async () => {
    setBusy(true);
    try {
      const res = await apiClient.post('/api/polly/autopilot/gmail/disconnect');
      setState(res.data);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Sheet onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Autopilot settings">
        <Head as="div" style={{ marginBottom: 4 }}>
          <h3>Autopilot</h3>
          <IconBtn type="button" onClick={onClose} aria-label="Close">×</IconBtn>
        </Head>
        <Setting>
          <div className="line">
            <div>
              <div className="label">{state.enabled ? 'On' : 'Paused'}</div>
              <div className="hint">
                {state.enabled
                  ? 'Each week I write your pitches. Once you OK them, I send them from your Gmail on your send days and follow up for you.'
                  : 'Nothing sends and no follow-ups go out until you turn it back on.'}
              </div>
            </div>
            <Switch
              type="button"
              $on={state.enabled}
              aria-label={state.enabled ? 'Pause Autopilot' : 'Resume Autopilot'}
              onClick={() => save({ enabled: !state.enabled })}
              disabled={busy}
            />
          </div>
        </Setting>
        <Setting>
          <div className="label">Your pipeline this month</div>
          <Funnel>
            <div><strong>{month.drafts || 0}</strong><span>To OK</span></div>
            <div><strong>{month.scheduled || 0}</strong><span>Scheduled</span></div>
            <div><strong>{month.sent || 0}</strong><span>Pitched</span></div>
            <div><strong>{month.followups || 0}</strong><span>Followed up</span></div>
            <div><strong>{month.replied || 0}</strong><span>Replied</span></div>
          </Funnel>
          <Progress style={{ marginTop: 10 }}>
            <div className="label"><span>{month.sent || 0} of {target} brands pitched</span></div>
            <div className="track">
              <div className="fill" style={{ width: `${Math.min(100, (100 * (month.sent || 0)) / target)}%` }} />
            </div>
          </Progress>
        </Setting>
        <Setting>
          <div className="label">Monthly target</div>
          <div className="hint">How many new brands I pitch for you each month.</div>
          <Stepper>
            <button type="button" aria-label="Fewer brands" onClick={() => setTarget(-2)} disabled={busy || target <= min}>−</button>
            <span className="value">{target}</span>
            <button type="button" aria-label="More brands" onClick={() => setTarget(2)} disabled={busy || target >= max}>+</button>
            <span className="hint" style={{ margin: 0 }}>
              About {state.per_week} a week{state.per_day > 1 ? ', up to 2 per send day' : ''}
            </span>
          </Stepper>
        </Setting>
        <Setting>
          <div className="label">What to pitch for</div>
          <Segments $cols={3}>
            {FOCUS.map((f) => (
              <Segment
                key={f.id}
                type="button"
                $on={state.deal_focus === f.id}
                onClick={() => save({ deal_focus: f.id })}
                disabled={busy}
              >
                <strong>{f.name}</strong>
                {f.hint}
              </Segment>
            ))}
          </Segments>
        </Setting>
        {targeting ? (
          <Setting>
            <div className="label">Brands to target</div>
            <div className="hint">I pick brands in these categories. Leave all off and I match from your content.</div>
            <Chips>
              {targeting.niche_options.map((n) => (
                <Chip
                  key={n}
                  type="button"
                  $on={targeting.niches.includes(n)}
                  onClick={() => save({ niches: toggle(targeting.niches, n) })}
                  disabled={busy}
                >
                  {label(n)}
                </Chip>
              ))}
            </Chips>
            <div className="label" style={{ marginTop: 14 }}>Never pitch</div>
            <Chips>
              {targeting.avoid_options.map((c) => (
                <Chip
                  key={c}
                  type="button"
                  $on={targeting.avoid_categories.includes(c)}
                  onClick={() => save({ avoid_categories: toggle(targeting.avoid_categories, c) })}
                  disabled={busy}
                >
                  {label(c)}
                </Chip>
              ))}
            </Chips>
          </Setting>
        ) : null}
        <Setting>
          <div className="label">Send days</div>
          <div className="hint">Pitches go out in the US morning, EU afternoon.</div>
          <Chips>
            {DAYS.map((d, i) => {
              const on = days.includes(i);
              return (
                <Chip
                  key={d}
                  type="button"
                  $on={on}
                  aria-pressed={on}
                  onClick={() => save({ send_days: toggle(days, i).sort() })}
                  disabled={busy || (on && days.length === 1)}
                >
                  {d}
                </Chip>
              );
            })}
          </Chips>
        </Setting>
        <Setting>
          <div className="label">Follow-ups</div>
          <div className="hint">Sent in the same Gmail thread. I stop as soon as you tell me a brand replied.</div>
          <Segments $cols={3}>
            {FOLLOWUPS.map((f) => (
              <Segment
                key={f.n}
                type="button"
                $on={state.followups === f.n}
                onClick={() => save({ followups: f.n })}
                disabled={busy}
              >
                <strong>{f.name}</strong>
                {f.hint}
              </Segment>
            ))}
          </Segments>
        </Setting>
        <Setting>
          <div className="line">
            <div style={{ minWidth: 0 }}>
              <div className="label">Sending from</div>
              <div className="hint" style={{ overflowWrap: 'anywhere' }}>{state.gmail?.email}</div>
            </div>
            <LinkBtn type="button" onClick={disconnect} disabled={busy}>Disconnect</LinkBtn>
          </div>
        </Setting>
      </Sheet>
    </Overlay>
  );
}
