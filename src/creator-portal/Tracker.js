import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import UpgradeModal from './UpgradeModal';
import DealDrawer, { TypePill } from './tracker/DealDrawer';
import GoalSetup from './tracker/GoalSetup';
import { Flame, KindIcon, KIND_LABEL, LineIcon, HOT_COLOR } from './tracker/TrackerIcons';
import {
  TRACKER_PATH, agendaDays, allCards, calendarWeeks, cardMatches, dayLabel, findCard, localIso, money, monthName,
  paywallGoal, pct, sortCards, typeLabel,
} from './tracker/trackerModel';

// Tracker (replaces Timeline): the monthly goal, every brand on one board, the dates that matter.
// GET /api/tracker; one brand opens in the deal drawer (/tracker/:brandId or ?brand=ID&step=amount).

const VIEWS = [
  { id: 'board', label: 'Board' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'list', label: 'List' },
];
const VIEW_KEY = 'nc_tracker_view';
const LEGEND = ['hot', 'sched', 'sent', 'fu', 'due', 'ship', 'post', 'pay'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LIST_COLS = [
  { id: 'brand', label: 'Brand' },
  { id: 'type', label: 'Type' },
  { id: 'stage', label: 'Stage' },
  { id: 'value', label: 'Value' },
  { id: 'next', label: 'Next step' },
];

function readView() {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    return VIEWS.some((x) => x.id === v) ? v : 'board';
  } catch (_) {
    return 'board';
  }
}

function useTracker() {
  const [state, setState] = useState({ data: null, loading: true, error: false });
  const load = useCallback(() => {
    let live = true;
    apiClient.get('/api/tracker')
      .then(({ data }) => {
        if (!live) return;
        const ok = data && Array.isArray(data.columns);
        setState({ data: ok ? data : null, loading: false, error: !ok });
        if (ok) {
          try {
            window.dispatchEvent(new CustomEvent('nc-tracker-count', { detail: Number(data.your_move_count) || 0 }));
          } catch (_) { /* ignore */ }
        }
      })
      .catch(() => { if (live) setState((s) => ({ ...s, loading: false, error: !s.data })); });
    return () => { live = false; };
  }, []);
  useEffect(() => load(), [load]);
  useEffect(() => {
    const onChange = () => load();
    window.addEventListener('nc-tracker-changed', onChange);
    return () => window.removeEventListener('nc-tracker-changed', onChange);
  }, [load]);
  return { ...state, reload: load };
}

export function GoalHeader({ tracker, onEditGoal }) {
  const goal = tracker.goal || {};
  const amount = Number(goal.amount_cents) || 0;
  const paid = Number(goal.paid_cents) || 0;
  const gifted = Number(goal.gifted_cents) || 0;
  const total = Number(goal.total_cents) || paid + gifted;
  const m = goal.math || {};
  const paidW = amount ? Math.min(100, (paid / amount) * 100) : 0;
  const giftW = amount ? Math.min(100 - paidW, (gifted / amount) * 100) : 0;
  const month = monthName(tracker.month);
  return (
    <GoalRow>
      <div className="top">
        <div className="h">
          <span className="lbl">{goal.set ? `${month} goal` : `Suggested ${month} goal`}</span>
          <span className="big">{money(total)} <small>of {money(amount)}</small></span>
        </div>
        <div className="side">
          <Legend>
            <span><i style={{ background: t.accent }} />{money(paid)} paid</span>
            <span><i style={{ background: '#e0a84a' }} />{money(gifted)} in products</span>
            <span>{tracker.days_left} day{tracker.days_left === 1 ? '' : 's'} left</span>
          </Legend>
          <EditGoal type="button" onClick={onEditGoal}>{goal.set ? 'Edit goal' : 'Set my goal'}</EditGoal>
        </div>
      </div>
      <Bar role="img" aria-label={`${money(total)} of ${money(amount)}: ${money(paid)} paid, ${money(gifted)} in products`}>
        <span className="paid" style={{ width: `${paidW}%` }} />
        <span className="gift" style={{ width: `${giftW}%` }} />
      </Bar>
      {m.pitches ? (
        <MathLine>
          <b>~{m.pitches} pitches → ~{m.deals} deal{m.deals === 1 ? '' : 's'}</b> at ~{money(m.avg_deal_cents)} each
          <span className="src"> · {m.rates_source === 'yours' ? 'your rates' : 'starting rates'}: {pct(m.reply_rate)} reply, {pct(m.deal_rate)} of replies become a deal</span>
        </MathLine>
      ) : null}
    </GoalRow>
  );
}

function FunnelStrip({ funnel }) {
  const f = funnel || {};
  const replyRate = f.pitched ? Math.round((f.replied / f.pitched) * 100) : null;
  return (
    <Funnel>
      <div className="s"><span className="v">{f.pitched || 0}{f.pitches_needed ? <small> / {f.pitches_needed}</small> : null}</span><span className="k">brands pitched</span></div>
      <div className="s"><span className="v">{f.replied || 0}</span><span className="k">replied{replyRate != null ? <b> ({replyRate}%)</b> : null}</span></div>
      <div className="s"><span className="v">{f.negotiating || 0}</span><span className="k">in negotiation{f.negotiating_cents ? <>, <b>{money(f.negotiating_cents)}</b></> : null}</span></div>
      <div className="s"><span className="v">{f.booked_or_paid || 0}</span><span className="k">booked or paid</span></div>
    </Funnel>
  );
}

function TrackerCard({ card, selected, onOpen }) {
  const paid = card.type === 'paid' || card.type === 'gig';
  return (
    <CardBtn type="button" $hot={card.hot} $locked={card.locked} $sel={selected} onClick={() => onOpen(card)}
      aria-label={`${card.brand_name}${card.hot ? ', hot today' : ''}${card.locked ? ', sends on Pro' : ''}: ${card.next?.label || ''}`}>
      <span className="bn">
        {card.hot ? <Flame size={14} /> : null}
        <span className="name">{card.brand_name}</span>
      </span>
      <span className="meta">
        <TypePill $paid={paid}>{typeLabel(card.type)}</TypePill>
        {card.value_cents ? <span className="val">{money(card.value_cents)}</span> : null}
      </span>
      {card.next?.label ? <span className={card.next.your_move ? 'when move' : 'when'}>{card.next.your_move ? 'Your move: ' : ''}{card.next.label}</span> : null}
      {card.hot && card.hot_reason ? <span className="hotr">{card.hot_reason}</span> : null}
      {card.kit_views ? <span className="views"><LineIcon name="eye" size={12} /> Opened your kit {card.kit_views}×</span> : null}
      {card.locked ? <span className="lock"><LineIcon name="lock" size={12} /> Sends on Pro</span> : null}
    </CardBtn>
  );
}

function BoardView({ columns, selectedId, onOpen }) {
  const scrollRef = useRef(null);
  const jump = (id) => {
    const el = scrollRef.current?.querySelector(`[data-col="${id}"]`);
    if (el && scrollRef.current) scrollRef.current.scrollTo({ left: el.offsetLeft - 16, behavior: 'smooth' });
  };
  return (
    <>
      <ColJump aria-label="Jump to stage">
        {columns.map((c) => (
          <button key={c.id} type="button" onClick={() => jump(c.id)}>{c.label} <b>{c.cards.length}</b></button>
        ))}
      </ColJump>
      <BoardScroll ref={scrollRef} tabIndex={0} aria-label="Board, scroll sideways for every stage">
        <Board $n={columns.length}>
          {columns.map((col) => (
            <Column key={col.id} data-col={col.id} aria-label={`${col.label}, ${col.cards.length}`}>
              <div className="h"><span>{col.label}</span><span>{col.cards.length}</span></div>
              {col.cards.map((c) => (
                <TrackerCard key={c.brand_id} card={c} selected={String(selectedId) === String(c.brand_id)} onOpen={onOpen} />
              ))}
              {!col.cards.length ? <span className="empty">Nothing here yet</span> : null}
            </Column>
          ))}
        </Board>
      </BoardScroll>
    </>
  );
}

function EventChip({ ev, onOpen }) {
  const clickable = Number(ev.brand_id) > 0;
  return (
    <Ev type="button" $hot={ev.hot || ev.kind === 'hot'} disabled={!clickable}
      onClick={() => clickable && onOpen({ brand_id: ev.brand_id })} title={`${ev.brand_name}: ${ev.label}`}>
      <KindIcon kind={ev.hot && ev.kind === 'sched' ? 'hot' : ev.kind} small />
      <span className="txt"><b>{ev.brand_name}</b><span>{ev.label}</span></span>
    </Ev>
  );
}

function CalendarView({ events, onOpen }) {
  const today = localIso();
  const weeks = useMemo(() => calendarWeeks(events, today), [events, today]);
  const days = useMemo(() => agendaDays(events), [events]);
  const [showPast, setShowPast] = useState(false);
  const upcoming = days.filter((d) => d.iso >= today);
  const past = days.filter((d) => d.iso < today);
  const [open, setOpen] = useState({});
  return (
    <>
      <MonthGrid aria-label="Calendar">
        {WEEKDAYS.map((d) => <div key={d} className="wd">{d}</div>)}
        {weeks.flat().map((cell) => {
          const extra = cell.events.length - 3;
          const shown = open[cell.iso] ? cell.events : cell.events.slice(0, 3);
          return (
            <Cell key={cell.iso} $today={cell.iso === today} $past={cell.iso < today}>
              <div className="dh">
                <span>{cell.day === 1 ? new Date(cell.iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : cell.day}</span>
                {cell.iso === today ? <span className="today">Today</span> : null}
              </div>
              {shown.map((ev, i) => <EventChip key={`${ev.kind}-${ev.brand_id}-${i}`} ev={ev} onOpen={onOpen} />)}
              {extra > 0 && !open[cell.iso] ? (
                <button type="button" className="more" onClick={() => setOpen((o) => ({ ...o, [cell.iso]: true }))}>+{extra} more</button>
              ) : null}
            </Cell>
          );
        })}
      </MonthGrid>
      <Agenda aria-label="Agenda">
        {past.length ? (
          <button type="button" className="past" onClick={() => setShowPast((v) => !v)}>
            {showPast ? 'Hide earlier days' : `Show the last ${past.length} day${past.length === 1 ? '' : 's'}`}
          </button>
        ) : null}
        {[...(showPast ? past : []), ...upcoming].map((d) => (
          <AgendaDay key={d.iso} $today={d.iso === today}>
            <div className="dh">{dayLabel(d.iso, today)}{d.iso === today || dayLabel(d.iso, today) === 'Tomorrow' ? <span>{new Date(d.iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span> : null}</div>
            {d.events.map((ev, i) => <EventChip key={`${ev.kind}-${ev.brand_id}-${i}`} ev={ev} onOpen={onOpen} />)}
          </AgendaDay>
        ))}
        {!upcoming.length ? <p className="none">Nothing scheduled yet. Lined-up pitches, follow-ups and deadlines land here.</p> : null}
      </Agenda>
      <CalLegend>
        {LEGEND.map((k) => <span key={k}><KindIcon kind={k} small />{KIND_LABEL[k]}</span>)}
      </CalLegend>
    </>
  );
}

function ListView({ cards, onOpen }) {
  const [sort, setSort] = useState({ key: 'stage', dir: 'asc' });
  const rows = useMemo(() => sortCards(cards, sort.key, sort.dir), [cards, sort]);
  const by = (key) => setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  const stageLabel = (c) => c.column === 'closed' ? 'Closed' : (c.column_label || c.column || '').replace(/_/g, ' ');
  return (
    <>
      <MobileSort>
        <label htmlFor="tracker-sort">Sort by</label>
        <select id="tracker-sort" value={`${sort.key}:${sort.dir}`} onChange={(e) => { const [key, dir] = e.target.value.split(':'); setSort({ key, dir }); }}>
          <option value="stage:asc">Stage</option>
          <option value="next:asc">Next date</option>
          <option value="value:desc">Value, highest first</option>
          <option value="brand:asc">Brand, A to Z</option>
          <option value="type:asc">Type</option>
        </select>
      </MobileSort>
      <Rows role="table" aria-label="Brands">
        <div className="head" role="row">
          {LIST_COLS.map((c) => (
            <button key={c.id} type="button" role="columnheader" aria-sort={sort.key === c.id ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} onClick={() => by(c.id)}>
              {c.label}{sort.key === c.id ? <span aria-hidden="true">{sort.dir === 'asc' ? ' ↑' : ' ↓'}</span> : null}
            </button>
          ))}
        </div>
        {rows.map((c) => (
          <button key={c.brand_id} type="button" role="row" className="r" onClick={() => onOpen(c)} data-locked={c.locked ? '1' : undefined}>
            <span className="b" role="cell">{c.hot ? <Flame size={13} /> : null}<b>{c.brand_name}</b>{c.locked ? <LineIcon name="lock" size={12} /> : null}</span>
            <span className="ty" role="cell"><TypePill $paid={c.type !== 'gifted'}>{typeLabel(c.type)}</TypePill></span>
            <span className="st" role="cell">{stageLabel(c)}</span>
            <span className="va" role="cell">{c.value_cents ? money(c.value_cents) : '—'}</span>
            <span className={c.next?.your_move ? 'nx move' : 'nx'} role="cell">{c.locked ? 'Sends on Pro' : c.next?.label || '—'}</span>
          </button>
        ))}
        {!rows.length ? <p className="none">No brands match this filter.</p> : null}
      </Rows>
    </>
  );
}

function GoalModal({ onClose, onSaved }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <ModalBack onClick={onClose}>
      <ModalCard role="dialog" aria-modal="true" aria-labelledby="goal-modal-title" onClick={(e) => e.stopPropagation()}>
        <div className="mh">
          <h2 id="goal-modal-title">Your monthly collab goal</h2>
          <button type="button" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <GoalSetup variant="modal" onSaved={onSaved} onSkip={onClose} skipLabel="Cancel" saveLabel="Save goal"
          onUnavailable={onClose} />
      </ModalCard>
    </ModalBack>,
    document.body,
  );
}

export default function Tracker() {
  const navigate = useNavigate();
  const { brandId: routeBrandId } = useParams();
  const [searchParams] = useSearchParams();
  const { data, loading, error, reload } = useTracker();
  const [view, setViewState] = useState(readView);
  const [filter, setFilter] = useState('all');
  const [goalOpen, setGoalOpen] = useState(false);
  const [paywall, setPaywall] = useState(false);

  const drawerId = routeBrandId || searchParams.get('brand');
  const startStep = searchParams.get('step');

  const setView = (v) => {
    setViewState(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch (_) { /* ignore */ }
  };

  const openCard = useCallback((card) => {
    const full = data ? findCard(data, card.brand_id) : null;
    if ((full || card).locked) {
      setPaywall(true);
      return;
    }
    navigate(`${TRACKER_PATH}/${card.brand_id}`);
  }, [data, navigate]);

  const closeDrawer = useCallback(() => navigate(TRACKER_PATH), [navigate]);

  const cards = useMemo(() => (data ? allCards(data) : []), [data]);
  const filtered = useMemo(() => cards.filter((c) => cardMatches(c, filter)), [cards, filter]);
  const columns = useMemo(() => {
    if (!data) return [];
    if (filter === 'closed') return [{ id: 'closed', label: 'Closed', cards: filtered }];
    return (data.columns || []).map((col) => ({
      id: col.id,
      label: col.label,
      cards: (col.cards || []).filter((c) => cardMatches({ ...c, column: col.id }, filter)),
    }));
  }, [data, filter, filtered]);
  const listCards = useMemo(() => {
    const labels = Object.fromEntries((data?.columns || []).map((c) => [c.id, c.label]));
    return filtered.map((c) => ({ ...c, column_label: labels[c.column] }));
  }, [data, filtered]);
  const events = useMemo(() => {
    const ev = data?.calendar || [];
    if (filter === 'all') return ev;
    const keep = new Set(filtered.map((c) => String(c.brand_id)));
    return ev.filter((e) => keep.has(String(e.brand_id)));
  }, [data, filter, filtered]);

  if (loading && !data) {
    return (
      <Shell>
        <Skeleton><div /><div /><div /></Skeleton>
      </Shell>
    );
  }

  if (!data) {
    return (
      <Shell>
        <Title>Tracker</Title>
        <EmptyBox>
          <h2>{error ? 'Your Tracker didn’t load' : 'No Tracker yet'}</h2>
          <p>Every brand you pitch, every reply and every deal lands here with its next step.</p>
          <button type="button" onClick={reload}>Try again</button>
        </EmptyBox>
      </Shell>
    );
  }

  const free = data.free;
  const moveCount = Number(data.your_move_count) || 0;
  const closedCount = (data.closed || []).length;
  const drawerCard = drawerId ? findCard(data, drawerId) : null;
  const totalCards = cards.filter((c) => c.column !== 'closed').length;
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'your_move', label: `Your move${moveCount ? ` (${moveCount})` : ''}` },
    { id: 'paid', label: 'Paid' },
    { id: 'gifted', label: 'Gifted' },
    ...(closedCount ? [{ id: 'closed', label: `Closed (${closedCount})` }] : []),
  ];

  return (
    <Shell>
      <TitleRow>
        <Title>Tracker</Title>
        {data.hot ? (
          <HotChip type="button" onClick={() => openCard({ brand_id: data.hot.brand_id })}>
            <Flame size={14} /> <span><b>Hot today:</b> {data.hot.brand_name}{data.hot.reason ? <span className="r"> · {data.hot.reason}</span> : null}</span>
          </HotChip>
        ) : null}
      </TitleRow>

      <App>
        <Top>
          <GoalHeader tracker={data} onEditGoal={() => setGoalOpen(true)} />
          <FunnelStrip funnel={data.funnel} />
          {free ? (
            <FreeStrip>
              <span>
                <b>{free.pitches_left} of {free.limit}</b> free pitches left in {monthName(data.month)}. Replies to brands are always free.
              </span>
              {free.locked ? (
                <button type="button" onClick={() => setPaywall(true)}>
                  <LineIcon name="lock" size={12} /> {free.locked} brand{free.locked === 1 ? '' : 's'} waiting · Keep pitching
                </button>
              ) : null}
            </FreeStrip>
          ) : null}
        </Top>

        <Toolbar>
          <Seg role="group" aria-label="View">
            {VIEWS.map((v) => (
              <button key={v.id} type="button" aria-pressed={view === v.id} onClick={() => setView(v.id)}>{v.label}</button>
            ))}
          </Seg>
          <Filters role="group" aria-label="Filter">
            {filters.map((f) => (
              <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.label}</button>
            ))}
          </Filters>
        </Toolbar>

        <View>
          {!totalCards && filter === 'all' ? (
            <EmptyBox $inline>
              <h2>Polly lines up brands here</h2>
              <p>Pick brands in Polly and they show up as Lined up, then Pitched, Replied, Booked and Paid.</p>
              <button type="button" onClick={() => navigate('/creator/dashboard/for-you')}>Find brands with Polly</button>
            </EmptyBox>
          ) : view === 'calendar' ? (
            <CalendarView events={events} onOpen={openCard} />
          ) : view === 'list' ? (
            <ListView cards={listCards} onOpen={openCard} />
          ) : (
            <BoardView columns={columns} selectedId={drawerId} onOpen={openCard} />
          )}
        </View>
      </App>

      {drawerId ? (
        <DealDrawer
          key={drawerId}
          brandId={drawerId}
          card={drawerCard}
          startStep={startStep}
          onClose={closeDrawer}
          onChanged={reload}
          onPaywall={() => setPaywall(true)}
        />
      ) : null}

      {goalOpen ? (
        <GoalModal onClose={() => setGoalOpen(false)} onSaved={() => { setGoalOpen(false); reload(); }} />
      ) : null}

      <UpgradeModal
        isOpen={paywall}
        onClose={() => setPaywall(false)}
        limit={free?.limit || 3}
        currentCount={free ? (free.limit - free.pitches_left) : 0}
        unlockRemaining={free ? free.pitches_left : 0}
        feature="limit_reached"
        goal={paywallGoal(data)}
        source="tracker"
      />
    </Shell>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const Shell = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 20px 24px 72px;
  box-sizing: border-box;
  font-family: ${t.fontSans};
  color: ${t.ink};
  min-width: 0;

  @media (max-width: 640px) { padding: 12px 12px 72px; }
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  min-width: 0;
`;

const Title = styled.h1`
  font-family: ${t.fontDisplay};
  font-size: 32px;
  font-weight: 400;
  margin: 0;
  color: ${t.ink};
  @media (max-width: 640px) { font-size: 28px; }
`;

const HotChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  border: 1px solid #f5c09c;
  background: #fff6ef;
  color: ${t.ink};
  border-radius: 999px;
  padding: 6px 12px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  b { color: ${HOT_COLOR}; font-weight: 700; }
  > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .r { color: ${t.muted}; }
`;

const App = styled.div`
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  box-shadow: ${t.shadowCard};
  overflow: hidden;
  min-width: 0;
`;

const Top = styled.div`
  padding: 18px 20px;
  display: grid;
  gap: 14px;
  border-bottom: 1px solid ${t.line};
  @media (max-width: 640px) { padding: 14px; }
`;

const GoalRow = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;

  .top { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px 16px; align-items: end; }
  .h { display: grid; gap: 2px; min-width: 0; }
  .lbl { font-size: 12px; font-weight: 700; color: ${t.muted}; text-transform: uppercase; letter-spacing: .06em; }
  .big { font-size: 30px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1.1; }
  .big small { font-size: 16px; color: ${t.muted}; font-weight: 500; }
  .side { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }

  @media (max-width: 640px) {
    .top { grid-template-columns: minmax(0, 1fr); }
    .side { justify-content: space-between; }
    .big { font-size: 26px; }
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 4px 14px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: ${t.muted};
  font-variant-numeric: tabular-nums;
  i { display: inline-block; width: 9px; height: 9px; border-radius: 3px; margin-right: 6px; }
`;

const EditGoal = styled.button`
  border: 1px solid ${t.line};
  background: ${t.white};
  border-radius: 999px;
  padding: 6px 12px;
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: ${t.ink};
  cursor: pointer;
  white-space: nowrap;
`;

const Bar = styled.div`
  height: 10px;
  background: ${t.subtle};
  border-radius: 999px;
  overflow: hidden;
  display: flex;
  .paid { background: ${t.accent}; }
  .gift { background: #e0a84a; }
`;

const MathLine = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${t.inkSoft};
  font-variant-numeric: tabular-nums;
  .src { color: ${t.muted}; }
`;

const Funnel = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;

  .s { background: ${t.paper}; border-radius: 10px; padding: 10px 12px; display: grid; gap: 2px; min-width: 0; }
  .v { font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .v small { font-size: 14px; color: ${t.muted}; font-weight: 500; }
  .k { font-size: 12px; color: ${t.muted}; }
  .k b { color: ${t.ink}; }

  @media (max-width: 640px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const FreeStrip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  flex-wrap: wrap;
  font-size: 13px;
  color: ${t.inkSoft};
  background: ${t.paper};
  border: 1px dashed ${t.borderHover};
  border-radius: 10px;
  padding: 8px 12px;

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 0;
    border-radius: 999px;
    padding: 6px 12px;
    background: #e8395f;
    color: #fff;
    font: inherit;
    font-size: 12.5px;
    font-weight: 700;
    cursor: pointer;
  }
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid ${t.line};
  min-width: 0;
  @media (max-width: 640px) { padding: 10px 14px; }
`;

const Seg = styled.div`
  display: inline-flex;
  background: ${t.subtle};
  border-radius: 999px;
  padding: 3px;
  gap: 2px;

  button {
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    border: 0;
    background: transparent;
    color: ${t.muted};
    padding: 6px 14px;
    border-radius: 999px;
    cursor: pointer;
  }
  button[aria-pressed='true'] { background: ${t.white}; color: ${t.ink}; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
`;

const Filters = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  min-width: 0;

  button {
    font: inherit;
    font-size: 12.5px;
    font-weight: 600;
    padding: 5px 11px;
    border-radius: 999px;
    border: 1px solid ${t.line};
    background: ${t.white};
    color: ${t.muted};
    cursor: pointer;
    white-space: nowrap;
  }
  button[aria-pressed='true'] { background: ${t.action}; color: ${t.white}; border-color: ${t.action}; }

  @media (max-width: 640px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    width: 100%;
    &::-webkit-scrollbar { display: none; }
  }
`;

const View = styled.div`
  padding: 16px 20px 20px;
  min-width: 0;
  @media (max-width: 640px) { padding: 12px 14px 16px; }
`;

const ColJump = styled.div`
  display: none;
  @media (max-width: 640px) {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    margin: 0 -14px 10px;
    padding: 0 14px;
    &::-webkit-scrollbar { display: none; }
    button {
      flex-shrink: 0;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      color: ${t.inkSoft};
      background: ${t.paper};
      border: 1px solid ${t.line};
      border-radius: 999px;
      padding: 4px 10px;
      white-space: nowrap;
    }
    b { color: ${t.muted}; font-weight: 600; margin-left: 2px; }
  }
`;

const BoardScroll = styled.div`
  overflow-x: auto;
  min-width: 0;
  padding-bottom: 4px;
  &:focus-visible { outline: 2px solid ${t.accentBorder}; }

  @media (max-width: 640px) {
    scroll-snap-type: x mandatory;
    margin-inline: -14px;
    padding-inline: 14px;
    scroll-padding-inline: 14px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`;

const Board = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: ${(p) => (p.$n === 1 ? 'minmax(220px, 360px)' : 'minmax(150px, 1fr)')};
  gap: 10px;
  align-items: start;

  @media (max-width: 640px) {
    grid-auto-columns: calc(100vw - 72px);
  }
`;

const Column = styled.div`
  background: ${t.paper};
  border-radius: 12px;
  padding: 10px;
  display: grid;
  gap: 8px;
  align-content: start;
  min-width: 0;
  scroll-snap-align: start;

  .h { display: flex; justify-content: space-between; font-size: 12.5px; font-weight: 700; color: ${t.muted}; padding: 2px 2px 4px; }
  .h span:last-child { font-variant-numeric: tabular-nums; }
  .empty { font-size: 12px; color: ${t.muted}; padding: 6px 2px; }
`;

const CardBtn = styled.button`
  display: grid;
  gap: 6px;
  width: 100%;
  min-width: 0;
  text-align: left;
  background: ${t.white};
  border: 1px ${(p) => (p.$locked ? 'dashed' : 'solid')} ${(p) => (p.$sel ? t.ink : p.$hot ? '#f5c09c' : t.line)};
  box-shadow: ${(p) => (p.$sel ? `0 0 0 1px ${t.ink}` : 'none')};
  border-radius: 10px;
  padding: 10px;
  font: inherit;
  font-size: 13px;
  color: inherit;
  cursor: pointer;
  opacity: ${(p) => (p.$locked ? 0.78 : 1)};
  transition: border-color .15s, box-shadow .15s;

  &:hover { border-color: ${t.borderHover}; box-shadow: ${t.shadowHover}; }
  &:focus-visible { outline: 2px solid ${t.accent}; outline-offset: 2px; }

  .bn { display: flex; align-items: center; gap: 5px; font-weight: 600; font-size: 13.5px; min-width: 0; }
  .name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .meta { display: flex; justify-content: space-between; gap: 6px; align-items: center; flex-wrap: wrap; color: ${t.muted}; font-size: 12px; }
  .val { font-variant-numeric: tabular-nums; color: ${t.ink}; font-weight: 600; }
  .when { font-size: 12px; color: ${t.muted}; }
  .when.move { color: ${t.hot}; font-weight: 600; }
  .hotr { font-size: 11.5px; color: ${HOT_COLOR}; }
  .views, .lock { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: ${t.muted}; }
  .lock { color: ${t.ink}; font-weight: 600; }
`;

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;

  .wd { font-size: 11.5px; font-weight: 700; color: ${t.muted}; text-transform: uppercase; letter-spacing: .06em; padding: 0 4px; }

  @media (max-width: 640px) { display: none; }
`;

const Cell = styled.div`
  background: ${(p) => (p.$today ? '#fff4f1' : t.paper)};
  border: 1px solid ${(p) => (p.$today ? '#f6c7b8' : 'transparent')};
  border-radius: 10px;
  padding: 6px;
  min-height: 104px;
  display: grid;
  gap: 4px;
  align-content: start;
  min-width: 0;
  opacity: ${(p) => (p.$past ? 0.72 : 1)};

  .dh { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: ${t.muted}; padding: 0 2px; }
  .today { color: ${t.hot}; }
  .more { border: 0; background: none; font: inherit; font-size: 11.5px; color: ${t.muted}; text-align: left; padding: 0 2px; cursor: pointer; }
`;

const Ev = styled.button`
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 6px;
  align-items: center;
  width: 100%;
  min-width: 0;
  text-align: left;
  border: 0;
  border-radius: 7px;
  padding: 4px 5px;
  background: ${t.white};
  box-shadow: ${(p) => (p.$hot ? 'inset 0 0 0 1px #f5c09c' : 'none')};
  font: inherit;
  font-size: 11.5px;
  line-height: 1.25;
  color: ${t.muted};
  cursor: pointer;
  &:disabled { cursor: default; }

  .txt { min-width: 0; display: grid; }
  .txt b, .txt span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .txt b { color: ${t.ink}; font-weight: 600; font-size: 12px; }
`;

const Agenda = styled.div`
  display: none;

  @media (max-width: 640px) {
    display: grid;
    gap: 8px;

    .past {
      justify-self: start;
      border: 0;
      background: none;
      font: inherit;
      font-size: 12.5px;
      font-weight: 600;
      color: ${t.muted};
      padding: 0;
      text-decoration: underline;
    }
    .none { margin: 0; font-size: 13px; color: ${t.muted}; }
  }
`;

const AgendaDay = styled.div`
  background: ${(p) => (p.$today ? '#fff4f1' : t.paper)};
  border-radius: 12px;
  padding: 10px;
  display: grid;
  gap: 6px;
  min-width: 0;

  .dh { display: flex; gap: 8px; align-items: baseline; font-size: 13px; font-weight: 700; color: ${(p) => (p.$today ? t.hot : t.ink)}; }
  .dh span { font-weight: 500; color: ${t.muted}; font-size: 12px; }
  ${Ev} { font-size: 12.5px; padding: 7px 8px; grid-template-columns: 22px minmax(0, 1fr); }
  ${Ev} .txt { display: flex; gap: 6px; align-items: baseline; }
  ${Ev} .txt b { font-size: 13px; flex-shrink: 1; }
  ${Ev} .txt span { flex-shrink: 2; }
`;

const CalLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  font-size: 12px;
  color: ${t.muted};
  margin-top: 12px;
  span { display: inline-flex; align-items: center; gap: 6px; }
`;

const MobileSort = styled.div`
  display: none;
  @media (max-width: 640px) {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 13px;
    color: ${t.muted};
    select { font: inherit; font-size: 13px; padding: 5px 8px; border-radius: 8px; border: 1px solid ${t.line}; background: ${t.white}; color: ${t.ink}; }
  }
`;

const Rows = styled.div`
  display: grid;
  min-width: 0;

  .head, .r {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) 96px minmax(0, 1fr) 84px minmax(0, 1.8fr);
    gap: 10px;
    align-items: center;
  }
  .head { border-bottom: 1px solid ${t.line}; }
  .head button {
    border: 0;
    background: none;
    font: inherit;
    font-size: 12px;
    font-weight: 700;
    color: ${t.muted};
    text-align: left;
    padding: 8px 0;
    cursor: pointer;
  }
  .r {
    width: 100%;
    border: 0;
    border-bottom: 1px solid ${t.line};
    background: none;
    font: inherit;
    font-size: 13px;
    color: ${t.ink};
    text-align: left;
    padding: 10px 0;
    cursor: pointer;
  }
  .r:hover { background: ${t.paper}; }
  .r[data-locked] { color: ${t.muted}; }
  .b { display: flex; align-items: center; gap: 5px; min-width: 0; }
  .b b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600; }
  .st { color: ${t.inkSoft}; }
  .va { font-variant-numeric: tabular-nums; }
  .nx { color: ${t.muted}; min-width: 0; }
  .nx.move { color: ${t.hot}; font-weight: 600; }
  .none { font-size: 13px; color: ${t.muted}; }

  @media (max-width: 640px) {
    .head { display: none; }
    .r {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-template-areas: 'b va' 'nx ty' 'st st';
      gap: 3px 10px;
      padding: 10px 2px;
    }
    .b { grid-area: b; }
    .va { grid-area: va; text-align: right; font-weight: 600; }
    .nx { grid-area: nx; font-size: 12.5px; }
    .ty { grid-area: ty; justify-self: end; }
    .st { grid-area: st; font-size: 12px; color: ${t.muted}; }
  }
`;

const EmptyBox = styled.div`
  text-align: center;
  padding: ${(p) => (p.$inline ? '28px 12px' : '32px 20px')};
  ${(p) => (p.$inline ? '' : `background: ${t.white}; border: 1px solid ${t.line}; border-radius: 16px; margin-top: 12px;`)}
  h2 { font-family: ${t.fontDisplay}; font-weight: 400; font-size: 24px; margin: 0 0 6px; }
  p { margin: 0 auto 16px; max-width: 46ch; color: ${t.muted}; font-size: 14px; }
  button { background: ${t.action}; color: #fff; border: 0; border-radius: ${t.radiusBtn}; padding: 10px 16px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
`;

const Skeleton = styled.div`
  display: grid;
  gap: 12px;
  div { background: ${t.subtle}; border-radius: 16px; height: 120px; }
  div:first-child { height: 40px; width: 180px; }
  div:last-child { height: 320px; }
`;

const ModalBack = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(18, 20, 26, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;

  @media (max-width: 640px) { align-items: flex-end; padding: 0; }
`;

const ModalCard = styled.div`
  background: ${t.white};
  border-radius: 18px;
  width: min(560px, 100%);
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  font-family: ${t.fontSans};

  .mh { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
  .mh h2 { margin: 0; font-size: 18px; font-weight: 700; }
  .mh button { width: 34px; height: 34px; border-radius: 50%; border: 0; background: ${t.subtle}; font-size: 20px; cursor: pointer; }

  @media (max-width: 640px) {
    border-radius: 18px 18px 0 0;
    max-height: 92dvh;
    padding: 16px 16px calc(20px + env(safe-area-inset-bottom));
  }
`;
