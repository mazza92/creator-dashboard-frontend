import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { apiClient } from '../../config/api';
import { creatorTokens as t } from '../../theme/creatorTokens';
import { Flame, LineIcon, HOT_COLOR } from './TrackerIcons';
import {
  ACTION_DONE, REPLY_CHOICES, centsFromInput, money, needsReplyFlow, pollyChipHref, shortDate, stageActions, typeLabel,
} from './trackerModel';

// One brand: its history (GET /api/tracker/brand/<id>), "Brand replied" (gifted / paid offer, question, not now)
// and the next stage buttons (POST /api/tracker/deal). Side panel on desktop, bottom sheet on phones.

const CLOSE_REASONS = ['Not a fit right now', 'No budget', 'They went with someone else', 'Other'];

const PATHS = {
  paid: [['pitched', 'Pitched'], ['replied', 'Replied'], ['negotiating', 'Negotiating'], ['booked', 'Booked'], ['done', 'Paid']],
  gifted: [['pitched', 'Pitched'], ['replied', 'Replied'], ['booked', 'Box on its way'], ['done', 'Posted']],
};
const COLUMN_RANK = { lined_up: 0, pitched: 1, followed_up: 1, replied: 2, negotiating: 3, booked: 4, done: 5, closed: -1 };

function progressSteps(card) {
  const paid = card?.type === 'paid' || card?.type === 'gig';
  const path = paid ? PATHS.paid : PATHS.gifted;
  const rank = COLUMN_RANK[card?.column] ?? 0;
  return path.map(([id, label]) => {
    const r = COLUMN_RANK[id];
    const state = r < rank ? 'on' : r === rank ? 'now' : '';
    return { id, label, state };
  });
}

function eventDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function Field({ kind, value, onChange, idPrefix }) {
  const id = `${idPrefix}-${kind}`;
  if (kind === 'amount') {
    return (
      <Inline>
        <label htmlFor={id}>Amount $</label>
        <input id={id} type="text" inputMode="decimal" placeholder="250" value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, '').slice(0, 9))} />
      </Inline>
    );
  }
  if (kind === 'deliverables') {
    return (
      <Inline>
        <label htmlFor={id}>For</label>
        <input id={id} type="text" className="wide" placeholder="1 video + 30-day ads" maxLength={120} value={value}
          onChange={(e) => onChange(e.target.value)} />
      </Inline>
    );
  }
  const label = kind === 'due_date' ? 'Draft due' : 'Payment due';
  return (
    <Inline>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} />
    </Inline>
  );
}

export default function DealDrawer({ brandId, card: boardCard, startStep, onClose, onChanged, onPaywall }) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [choice, setChoice] = useState(null);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ amount: '', due_date: '', payment_due: '', deliverables: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const stepApplied = useRef(false);
  const panelRef = useRef(null);

  const load = useCallback(() => {
    let live = true;
    apiClient.get(`/api/tracker/brand/${brandId}`)
      .then(({ data }) => { if (live) setDetail(data || null); })
      .catch(() => { if (live) setDetail(null); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [brandId]);

  useEffect(() => {
    setLoading(true);
    setChoice(null);
    setActive(null);
    setError('');
    stepApplied.current = false;
    return load();
  }, [load]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const deal = detail?.deal || null;
  const brand = detail?.brand || {};
  const card = {
    brand_id: Number(brandId),
    brand_name: boardCard?.brand_name || brand.name || deal?.brand_name || 'Brand',
    logo: boardCard?.logo || brand.logo,
    category: boardCard?.category || brand.category,
    type: deal?.deal_type || boardCard?.type || 'gifted',
    value_cents: deal?.value_cents ?? boardCard?.value_cents,
    column: boardCard?.column || (deal ? undefined : 'pitched'),
    stage: deal?.stage || boardCard?.stage,
    next: deal?.next || boardCard?.next || {},
    hot: boardCard?.hot,
    hot_reason: boardCard?.hot_reason,
    kit_views: boardCard?.kit_views,
    locked: boardCard?.locked,
  };
  const replyFlow = card.column !== 'lined_up' && needsReplyFlow(card, deal);
  const actions = replyFlow ? [] : stageActions(card, deal).map((a) => (
    a.action === 'paid_offer' && a.fields?.includes('amount') && !card.value_cents ? { ...a, label: 'Add the amount' } : a
  ));

  // ?step=amount (Polly's "Add the amount" chip): open straight on the paid amount.
  useEffect(() => {
    if (stepApplied.current || loading || startStep !== 'amount') return;
    stepApplied.current = true;
    const amountAction = actions.find((a) => a.fields?.includes('amount'));
    if (!replyFlow && amountAction) setActive(amountAction.action);
    else setChoice('paid_offer');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, startStep]);

  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const submit = async (action, fields = []) => {
    if (fields.includes('amount') && action === 'paid_offer' && centsFromInput(form.amount) == null) {
      setError('Add the amount they offered.');
      return;
    }
    setSaving(true);
    setError('');
    const body = { brand_id: Number(brandId), brand_name: card.brand_name, action };
    if (form.amount && (fields.includes('amount') || action === 'gifted_offer')) body.amount = form.amount;
    if (form.due_date && fields.includes('due_date')) body.due_date = form.due_date;
    if (form.payment_due && fields.includes('payment_due')) body.payment_due = form.payment_due;
    if (form.deliverables && fields.includes('deliverables')) body.deliverables = form.deliverables.trim();
    if (action === 'closed' && form.reason) body.reason = form.reason;
    try {
      const { data } = await apiClient.post('/api/tracker/deal', body);
      if (data?.success === false) throw new Error(data.error);
      message.success(ACTION_DONE[action] || 'Saved');
      setChoice(null);
      setActive(null);
      setForm({ amount: '', due_date: '', payment_due: '', deliverables: '', reason: '' });
      if (data?.deal) setDetail((d) => ({ ...(d || {}), deal: { ...data.deal, next: undefined } }));
      load();
      if (onChanged) onChanged();
    } catch (err) {
      setError('That didn’t save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const events = (detail?.events || []).slice().reverse();
  const steps = card.column === 'closed' ? [] : progressSteps(card);
  const paidType = card.type === 'paid' || card.type === 'gig';

  const sheet = (
    <Backdrop onClick={onClose}>
      <Panel
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${card.brand_name} deal`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <Handle aria-hidden="true" />
        <Head>
          <Logo>{card.logo ? <img src={card.logo} alt="" /> : (card.brand_name || '?').slice(0, 1)}</Logo>
          <div className="who">
            <h2>{card.hot ? <><Flame size={16} />{' '}</> : null}{card.brand_name}</h2>
            <div className="meta">
              <TypePill $paid={paidType}>{typeLabel(card.type)}</TypePill>
              {card.value_cents ? <span>{money(card.value_cents)}</span> : null}
              {card.category ? <span className="cat">{card.category}</span> : null}
            </div>
          </div>
          <CloseBtn type="button" onClick={onClose} aria-label="Close">×</CloseBtn>
        </Head>

        <Body>
          {card.hot && card.hot_reason ? (
            <HotNote><Flame size={14} /> <span><b>Hot today:</b> {card.hot_reason}</span></HotNote>
          ) : null}

          {card.next?.label ? (
            <Next $move={Boolean(card.next.your_move)}>
              <span className="k">{card.next.your_move ? 'Your move' : 'Next'}</span>
              <span className="v">{card.next.label}</span>
            </Next>
          ) : null}

          {card.kit_views ? (
            <Signal><LineIcon name="eye" size={13} /> Opened your kit {card.kit_views}×</Signal>
          ) : null}

          {card.locked ? (
            <Locked>
              <div><LineIcon name="lock" size={14} /> <b>Sends on Pro</b></div>
              <p>The pitch is written. You&apos;ve used this month&apos;s free pitches, so Pro sends it from your Gmail and follows up.</p>
              <button type="button" className="primary" onClick={onPaywall}>See Pro</button>
            </Locked>
          ) : null}

          {card.column === 'lined_up' && !card.locked ? (
            <Box>
              <span className="q">Pitch ready</span>
              <p className="hint">Polly wrote it for this brand. Review it and send it from Polly.</p>
              <div className="row">
                <button type="button" className="btn primary" onClick={() => navigate(pollyChipHref('pitch_brand', card))}>Open the pitch</button>
              </div>
            </Box>
          ) : null}

          {replyFlow && !loading ? (
            <Box>
              <span className="q">{card.stage === 'replied' ? 'Any news? What did they say?' : 'Brand replied? What did they say?'}</span>
              <div className="row" role="group" aria-label="What did they say">
                {REPLY_CHOICES.map((c) => (
                  <Choice key={c.id} type="button" aria-pressed={choice === c.id} $on={choice === c.id}
                    onClick={() => { setChoice(choice === c.id ? null : c.id); setError(''); }}>
                    {c.label}
                  </Choice>
                ))}
              </div>
              {choice === 'gifted_offer' && (
                <Step>
                  <Inline>
                    <label htmlFor="deal-gift-value">Product value $</label>
                    <input id="deal-gift-value" type="text" inputMode="decimal" placeholder="40" value={form.amount}
                      onChange={(e) => set('amount')(e.target.value.replace(/[^\d.,]/g, '').slice(0, 9))} />
                  </Inline>
                  <p className="hint">Retail value counts toward your goal when the box arrives. Leave it blank and Polly estimates.</p>
                  <div className="row"><button type="button" className="btn primary" disabled={saving} onClick={() => submit('gifted_offer')}>Save gifted offer</button></div>
                </Step>
              )}
              {choice === 'paid_offer' && (
                <Step>
                  <Field kind="amount" value={form.amount} onChange={set('amount')} idPrefix="deal-paid" />
                  <Field kind="deliverables" value={form.deliverables} onChange={set('deliverables')} idPrefix="deal-paid" />
                  <p className="hint">The card moves to Negotiating. Polly drafts your answer with your rate.</p>
                  <div className="row"><button type="button" className="btn primary" disabled={saving} onClick={() => submit('paid_offer', ['amount', 'deliverables'])}>Save paid offer</button></div>
                </Step>
              )}
              {choice === 'question' && (
                <Step>
                  <p className="hint">Polly drafts the answer for you.</p>
                  <div className="row">
                    <button type="button" className="btn primary" disabled={saving} onClick={() => submit('question')}>Save</button>
                    <button type="button" className="btn" onClick={() => navigate(pollyChipHref('help_reply', card))}>Help me answer</button>
                  </div>
                </Step>
              )}
              {choice === 'closed' && (
                <Step>
                  <Inline>
                    <label htmlFor="deal-reason">Why</label>
                    <select id="deal-reason" value={form.reason} onChange={(e) => set('reason')(e.target.value)}>
                      <option value="">Pick one (optional)</option>
                      {CLOSE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </Inline>
                  <div className="row"><button type="button" className="btn primary" disabled={saving} onClick={() => submit('closed')}>Move to Closed</button></div>
                </Step>
              )}
              <p className="free">Answering a brand is free on every plan.</p>
            </Box>
          ) : null}

          {!replyFlow && actions.length ? (
            <Box>
              <span className="q">Update this deal</span>
              <div className="row">
                {actions.map((a) => (
                  <Choice key={a.action + a.label} type="button" $primary={active ? active === a.action : a.primary} $ghost={a.ghost}
                    aria-expanded={a.fields?.length ? active === a.action : undefined}
                    disabled={saving}
                    onClick={() => {
                      if (a.fields?.length) setActive(active === a.action ? null : a.action);
                      else submit(a.action);
                    }}>
                    {a.label}
                  </Choice>
                ))}
              </div>
              {actions.filter((a) => a.fields?.length && active === a.action).map((a) => (
                <Step key={`f-${a.action}`}>
                  {a.fields.map((f) => <Field key={f} kind={f} value={form[f]} onChange={set(f)} idPrefix={`deal-${a.action}`} />)}
                  <div className="row">
                    <button type="button" className="btn primary" disabled={saving} onClick={() => submit(a.action, a.fields)}>Save</button>
                  </div>
                </Step>
              ))}
              {card.stage === 'negotiating' || card.stage === 'replied' ? (
                <button type="button" className="link" onClick={() => navigate(pollyChipHref('paid_reply', card))}>Write my reply with Polly</button>
              ) : null}
              {card.stage === 'posted' && !paidType ? (
                <button type="button" className="link" onClick={() => navigate(pollyChipHref('ad_usage', card))}>Ask them to run it as an ad</button>
              ) : null}
            </Box>
          ) : null}

          {error ? <Err role="alert">{error}</Err> : null}

          {steps.length ? (
            <Section>
              <h3>Progress</h3>
              <Steps>
                {steps.map((s) => (
                  <li key={s.id}><span className={`d ${s.state}`} /><span className={s.state ? 'on' : ''}>{s.label}</span></li>
                ))}
              </Steps>
            </Section>
          ) : null}

          <Section>
            <h3>History</h3>
            {loading ? <Muted>Loading…</Muted> : null}
            {!loading && !events.length ? <Muted>Nothing logged yet. Pitches, follow-ups and kit views show up here.</Muted> : null}
            <History>
              {events.map((ev) => (
                <li key={ev.id}>
                  <span className="dot" />
                  <div>
                    <b>{ev.event_label}</b>
                    <span className="when">{eventDate(ev.occurred_at)}</span>
                    {ev.polly_notes ? <p>{ev.polly_notes}</p> : null}
                  </div>
                </li>
              ))}
            </History>
            {deal?.due_date || deal?.payment_due ? (
              <Muted>
                {deal.due_date ? `Draft due ${shortDate(deal.due_date)}. ` : ''}
                {deal.payment_due ? `Payment due ${shortDate(deal.payment_due)}.` : ''}
              </Muted>
            ) : null}
          </Section>
        </Body>
      </Panel>
    </Backdrop>
  );

  return createPortal(sheet, document.body);
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(18, 20, 26, 0.32);
  display: flex;
  justify-content: flex-end;
`;

const Panel = styled.aside`
  width: min(460px, 100vw);
  height: 100%;
  background: ${t.white};
  box-shadow: -12px 0 40px rgba(18, 20, 26, 0.16);
  display: flex;
  flex-direction: column;
  outline: none;
  font-family: ${t.fontSans};
  color: ${t.ink};
  box-sizing: border-box;

  @media (max-width: 640px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: auto;
    max-height: 90vh;
    max-height: 90dvh;
    border-radius: 18px 18px 0 0;
    box-shadow: 0 -12px 40px rgba(18, 20, 26, 0.18);
  }
`;

const Handle = styled.div`
  display: none;
  @media (max-width: 640px) {
    display: block;
    width: 40px;
    height: 4px;
    border-radius: 4px;
    background: ${t.line};
    margin: 8px auto 0;
    flex-shrink: 0;
  }
`;

const Head = styled.div`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 36px;
  gap: 12px;
  align-items: center;
  padding: 18px 20px 14px;
  border-bottom: 1px solid ${t.line};
  flex-shrink: 0;

  h2 { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.25; overflow-wrap: anywhere; }
  .meta { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 13px; color: ${t.muted}; margin-top: 3px; }
  .cat { text-transform: capitalize; }

  @media (max-width: 640px) { padding: 10px 16px 12px; }
`;

const Logo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: ${t.subtle};
  display: grid;
  place-items: center;
  font-weight: 700;
  color: ${t.muted};
  overflow: hidden;
  img { width: 100%; height: 100%; object-fit: contain; background: ${t.white}; }
`;

const CloseBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 0;
  background: ${t.subtle};
  font-size: 22px;
  line-height: 1;
  color: ${t.inkSoft};
  cursor: pointer;
`;

const Body = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px 20px calc(24px + env(safe-area-inset-bottom));
  display: grid;
  gap: 14px;
  align-content: start;

  @media (max-width: 640px) { padding: 14px 16px calc(20px + env(safe-area-inset-bottom)); }
`;

export const TypePill = styled.span`
  display: inline-block;
  font-size: 11.5px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  background: ${(p) => (p.$paid ? t.accentSoft : '#fdf1dc')};
  color: ${(p) => (p.$paid ? t.accentDeep : '#9a5b00')};
`;

const HotNote = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 13px;
  background: #fff6ef;
  border: 1px solid #f5c09c;
  border-radius: 10px;
  padding: 10px 12px;
  b { color: ${HOT_COLOR}; }
`;

const Next = styled.div`
  display: grid;
  gap: 2px;
  border-radius: 12px;
  padding: 12px 14px;
  background: ${(p) => (p.$move ? '#fff4f1' : t.subtle)};
  border: 1px solid ${(p) => (p.$move ? '#f6c7b8' : 'transparent')};
  .k { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${(p) => (p.$move ? t.hot : t.muted)}; }
  .v { font-size: 15px; font-weight: 600; }
`;

const Signal = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${t.inkSoft};
`;

const Box = styled.div`
  background: ${t.paper};
  border: 1px solid ${t.line};
  border-radius: 14px;
  padding: 14px;
  display: grid;
  gap: 10px;
  min-width: 0;

  .q { font-weight: 700; font-size: 14px; }
  .row { display: flex; flex-wrap: wrap; gap: 8px; }
  .hint { margin: 0; font-size: 12.5px; color: ${t.muted}; line-height: 1.45; }
  .free { margin: 0; font-size: 12px; color: ${t.accentDeep}; }
  .row > .btn {
    border-radius: 999px;
    padding: 8px 14px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    border: 1px solid ${t.line};
    background: ${t.white};
    color: ${t.ink};
    cursor: pointer;
  }
  .row > .btn.primary { background: ${t.action}; border-color: ${t.action}; color: ${t.white}; }
  .row > .btn:disabled { opacity: .6; }
  .link {
    justify-self: start;
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    color: ${t.accentDeep};
    text-decoration: underline;
    cursor: pointer;
  }
`;

const Choice = styled.button`
  border-radius: 999px;
  padding: 8px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${(p) => (p.$on || p.$primary ? t.action : t.line)};
  background: ${(p) => (p.$on || p.$primary ? t.action : t.white)};
  color: ${(p) => (p.$on || p.$primary ? t.white : p.$ghost ? t.muted : t.ink)};
  &:disabled { opacity: .6; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }
`;

const Step = styled.div`
  display: grid;
  gap: 10px;
  border-top: 1px dashed ${t.line};
  padding-top: 10px;
`;

const Inline = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;

  label { color: ${t.inkSoft}; font-weight: 600; min-width: 84px; }
  input, select {
    font: inherit;
    font-size: 15px;
    padding: 7px 10px;
    border-radius: 8px;
    border: 1px solid ${t.line};
    background: ${t.white};
    color: ${t.ink};
    width: 120px;
    max-width: 100%;
    box-sizing: border-box;
  }
  input.wide, select { width: 220px; }
  input[type='date'] { width: 170px; }
`;

const Locked = styled.div`
  border: 1px dashed ${t.borderHover};
  border-radius: 14px;
  padding: 14px;
  display: grid;
  gap: 8px;
  div { display: flex; align-items: center; gap: 6px; font-size: 14px; }
  p { margin: 0; font-size: 13px; color: ${t.muted}; line-height: 1.45; }
  .primary {
    justify-self: start;
    border: 0;
    border-radius: 999px;
    padding: 8px 16px;
    font: inherit;
    font-weight: 700;
    font-size: 13px;
    background: #e8395f;
    color: #fff;
    cursor: pointer;
  }
`;

const Section = styled.section`
  display: grid;
  gap: 10px;
  h3 { margin: 0; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${t.muted}; }
`;

const Steps = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  font-size: 13px;
  color: ${t.muted};

  li { display: flex; align-items: center; gap: 6px; }
  .on { color: ${t.ink}; font-weight: 600; }
  .d { width: 9px; height: 9px; border-radius: 50%; background: ${t.line}; }
  .d.on { background: ${t.accent}; }
  .d.now { background: ${t.hot}; box-shadow: 0 0 0 3px #fde3da; }
`;

const History = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;

  li { display: grid; grid-template-columns: 12px minmax(0, 1fr); gap: 10px; font-size: 13px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: ${t.borderHover}; margin-top: 6px; }
  b { font-weight: 600; margin-right: 6px; }
  .when { color: ${t.muted}; font-size: 12px; }
  p { margin: 3px 0 0; color: ${t.inkSoft}; }
`;

const Muted = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${t.muted};
`;

const Err = styled.div`
  color: #b42318;
  font-size: 13px;
`;
