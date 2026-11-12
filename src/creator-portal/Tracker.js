import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import UpgradeModal from './UpgradeModal';
import DealDrawer from './tracker/DealDrawer';
import GoalModal from './tracker/GoalModal';
import { Flame, KindIcon, KIND_LABEL, HOT_COLOR, LineIcon } from './tracker/TrackerIcons';
import {
  TRACKER_PATH, agendaDays, allCards, cardMatches, dayLabel, findCard, localIso, mondayOf, money, monthName, monthWeeks, parseIso, paywallGoal, weekGroups, weekTarget,
} from './tracker/trackerModel';

// Tracker (replaces Timeline): the monthly goal, every brand on one calendar, the dates that matter.
// GET /api/tracker; one brand opens in the deal drawer (/tracker/:brandId or ?brand=ID&step=amount).

const LEGEND = ['hot', 'view', 'sched', 'sent', 'fu', 'due', 'ship', 'post', 'pay'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const LIST_COLS = [
  { id: 'brand', label: 'Brand' },
  { id: 'type', label: 'Type' },
  { id: 'stage', label: 'Stage' },
  { id: 'value', label: 'Value' },
  { id: 'next', label: 'Next step' },
];

function useTracker() {
  const [state, setState] = useState({ data: null, loading: true, error: false });
  const load = useCallback(() => {
    let live = true;
    apiClient.get('/api/tracker', { params: { seen: 1 } })
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
          <span className="lbl">{goal.set ? `My ${month} goal` : `${month} goal (suggested)`}</span>
          <span className="big">{money(total)} <small>of {money(amount)}</small></span>
        </div>
        <div className="side">
          <Legend>
            <span><i style={{ background: t.accent }} />{money(paid)} paid</span>
            <span><i style={{ background: '#e0a84a' }} />{money(gifted)} in free products</span>
            <span>{tracker.days_left} day{tracker.days_left === 1 ? '' : 's'} left</span>
          </Legend>
          <EditGoal type="button" onClick={onEditGoal}>{goal.set ? 'Edit goal' : 'Set my goal'}</EditGoal>
        </div>
      </div>
      <Bar role="img" aria-label={`${money(total)} of ${money(amount)}: ${money(paid)} paid, ${money(gifted)} in products`}>
        <span className="paid" style={{ width: `${paidW}%` }} />
        <span className="gift" style={{ width: `${giftW}%` }} />
      </Bar>
      {m.pitches ? <MathLine>{goalPlan(m)}</MathLine> : null}
    </GoalRow>
  );
}

// Plain words for aspiring creators: brands per week, "1 in N write back", collabs. No rates or funnels.
export function goalPlan(m) {
  const perWeek = Math.max(1, Math.round((m.pitches || 0) / 4.3));
  const oneIn = (r) => Math.max(1, Math.round(1 / (Number(r) || 1)));
  return (
    <>
      <b>Pitch about {perWeek} brand{perWeek === 1 ? '' : 's'} a week</b> to get there.
      <span className="src"> {m.rates_source === 'yours' ? 'From your results so far' : 'Usually'}, 1 in {oneIn(m.reply_rate)} brands
      writes back and 1 in {oneIn(m.deal_rate)} of those becomes a collab (about {money(m.avg_deal_cents)} each).</span>
    </>
  );
}

function FunnelStrip({ funnel }) {
  const f = funnel || {};
  return (
    <Funnel>
      <div className="s"><span className="v">{f.pitched || 0}{f.pitches_needed ? <small> / {f.pitches_needed}</small> : null}</span><span className="k">brands pitched</span></div>
      <div className="s opened"><span className="v"><LineIcon name="eye" size={16} /> {f.opened || 0}</span><span className="k">opened your kit</span></div>
      <div className="s"><span className="v">{f.replied || 0}</span><span className="k">wrote back</span></div>
      <div className="s"><span className="v">{f.negotiating || 0}</span><span className="k">talking money{f.negotiating_cents ? <>, <b>{money(f.negotiating_cents)}</b></> : null}</span></div>
      <div className="s"><span className="v">{f.booked_or_paid || 0}</span><span className="k">collabs confirmed</span></div>
    </Funnel>
  );
}

// Brands that opened the kit in the last 7 days: the "it's working" moment, one tap to follow up in Polly.
function KitOpens({ views }) {
  if (!views?.length) return null;
  return (
    <Opens aria-label="Brands that opened your kit">
      <div className="h"><span aria-hidden="true">👀</span> Opened your kit this week</div>
      <ul>
        {views.slice(0, 3).map((v) => (
          <li key={v.brand_id}>
            <span className="t"><b>{v.brand_name}</b> opened your kit {v.when}{v.count > 1 ? ` · ${v.count}×` : ''}</span>
            {v.replied ? <span className="ok">They wrote back</span> : (
              <a className="go" href={`/creator/dashboard/for-you?chip=draft_followup&brand_id=${v.brand_id}&brand_name=${encodeURIComponent(v.brand_name)}`}>
                Follow up
              </a>
            )}
          </li>
        ))}
      </ul>
    </Opens>
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

const MAX_PER_CELL = 3;
const MAX_PER_AGENDA_DAY = 4;

function weekSummary(w) {
  const bits = [];
  if (w.pitches) bits.push(`${w.pitches} pitch${w.pitches === 1 ? '' : 'es'} planned`);
  if (w.sent) bits.push(`${w.sent} sent`);
  if (w.followups) bits.push(`${w.followups} follow-up${w.followups === 1 ? '' : 's'}`);
  if (w.deadlines) bits.push(`${w.deadlines} deadline${w.deadlines === 1 ? '' : 's'}`);
  return bits.join(' · ');
}

// Week chips (Todoist "Upcoming" / Google Calendar week picker): every week of the plan at a glance, filled
// against the goal's weekly number, so a creator sees whether the pipeline is full. Tap jumps to that week.
function WeekStrip({ weeks, weekly, today, selected, onPick }) {
  return (
    <Weeks role="tablist" aria-label="Weeks">
      {weeks.map((w) => {
        const goal = weekTarget(weekly, w.start, today);
        const done = w.pitches + w.sent;
        const pct = goal ? Math.min(100, Math.round((done / goal) * 100)) : 0;
        return (
          <WeekChip key={w.start} type="button" role="tab" aria-selected={selected === w.start}
            $on={selected === w.start} onClick={() => onPick(w)}>
            <span className="l">{w.label}</span>
            <span className="r">{w.range}</span>
            <span className="n">{goal ? <><b>{done}</b> of {goal} brands</> : <><b>{done}</b> brands</>}</span>
            {goal ? <span className="bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span> : null}
          </WeekChip>
        );
      })}
    </Weeks>
  );
}

function CalendarView({ events, onOpen, weekly = 0 }) {
  const today = localIso();
  const todayDate = new Date();
  const [showPast, setShowPast] = useState(false);
  const weeks = useMemo(() => weekGroups(events, today, { includePast: showPast }), [events, today, showPast]);
  const pastDays = useMemo(() => agendaDays((events || []).filter((e) => e.date < today)), [events, today]);
  const [selected, setSelected] = useState(() => mondayOf(today));
  const [month, setMonth] = useState({ y: todayDate.getFullYear(), m: todayDate.getMonth() });
  const [open, setOpen] = useState({});
  const grid = useMemo(() => monthWeeks(events, month.y, month.m), [events, month]);
  const lastWeek = weeks.length ? weeks[weeks.length - 1].end : today;
  const lastMonth = parseIso(lastWeek);
  const canNext = month.y < lastMonth.getFullYear() || (month.y === lastMonth.getFullYear() && month.m < lastMonth.getMonth());
  const canPrev = month.y > todayDate.getFullYear() || (month.y === todayDate.getFullYear() && month.m > todayDate.getMonth() - 1);
  const shiftMonth = (n) => setMonth(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const monthTitle = new Date(month.y, month.m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const pick = (w) => {
    setSelected(w.start);
    const d = parseIso(w.start);
    const thu = new Date(d); thu.setDate(d.getDate() + 3); // the month a week "belongs to" (ISO rule)
    setMonth({ y: thu.getFullYear(), m: thu.getMonth() });
  };
  const selIndex = Math.max(0, weeks.findIndex((w) => w.start === selected));
  const nextWeek = weeks[selIndex + 1];
  const prevWeek = weeks[selIndex - 1];

  return (
    <>
      <WeekStrip weeks={weeks} weekly={weekly} today={today} selected={selected} onPick={pick} />

      <MonthHead>
        <h3>{monthTitle}</h3>
        <div className="nav">
          <button type="button" onClick={() => { setMonth({ y: todayDate.getFullYear(), m: todayDate.getMonth() }); setSelected(mondayOf(today)); }}>Today</button>
          <button type="button" aria-label="Previous month" disabled={!canPrev} onClick={() => shiftMonth(-1)}>‹</button>
          <button type="button" aria-label="Next month" disabled={!canNext} onClick={() => shiftMonth(1)}>›</button>
        </div>
      </MonthHead>
      <MonthGrid aria-label={`Calendar, ${monthTitle}`}>
        {WEEKDAYS.map((d) => <div key={d} className="wd">{d}</div>)}
        {grid.map((week) => {
          const inSel = week[0].iso === selected;
          return week.map((cell) => {
            const extra = cell.events.length - MAX_PER_CELL;
            const shown = open[cell.iso] ? cell.events : cell.events.slice(0, MAX_PER_CELL);
            return (
              <Cell key={cell.iso} $today={cell.iso === today} $past={cell.iso < today} $out={cell.month !== month.m} $sel={inSel}>
                <div className="dh">
                  <span>{cell.day}</span>
                  {cell.iso === today ? <span className="today">Today</span> : null}
                </div>
                {shown.map((ev, i) => <EventChip key={`${ev.kind}-${ev.brand_id}-${i}`} ev={ev} onOpen={onOpen} />)}
                {extra > 0 && !open[cell.iso] ? (
                  <button type="button" className="more" onClick={() => setOpen((o) => ({ ...o, [cell.iso]: true }))}>+{extra} more</button>
                ) : null}
              </Cell>
            );
          });
        })}
      </MonthGrid>

      <Agenda aria-label="Plan by week">
        {pastDays.length && !showPast ? (
          <button type="button" className="past" onClick={() => setShowPast(true)}>Show earlier weeks</button>
        ) : null}
        {/* Phones: one week at a time (the chips above are the tabs), like Google Calendar's week view. */}
        {weeks.filter((w) => w.start === selected).map((w) => (
          <AgendaWeek key={w.start} id={`tracker-wk-${w.start}`} $sel={selected === w.start}>
            <div className="wh">
              <span className="l">{w.label}</span>
              <span className="r">{w.range}</span>
            </div>
            <div className="ws">{weekSummary(w) || 'Nothing planned yet. Polly adds brands as the week gets closer.'}</div>
            {w.days.map((d) => {
              const extra = d.events.length - MAX_PER_AGENDA_DAY;
              const shown = open[d.iso] ? d.events : d.events.slice(0, MAX_PER_AGENDA_DAY);
              return (
                <AgendaDay key={d.iso} $today={d.iso === today}>
                  <div className="dh">{dayLabel(d.iso, today)}{d.iso === today || dayLabel(d.iso, today) === 'Tomorrow' ? <span>{new Date(d.iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span> : null}</div>
                  {shown.map((ev, i) => <EventChip key={`${ev.kind}-${ev.brand_id}-${i}`} ev={ev} onOpen={onOpen} />)}
                  {extra > 0 && !open[d.iso] ? (
                    <button type="button" className="more" onClick={() => setOpen((o) => ({ ...o, [d.iso]: true }))}>Show {extra} more</button>
                  ) : null}
                </AgendaDay>
              );
            })}
          </AgendaWeek>
        ))}
        <WeekPager>
          {prevWeek ? <button type="button" onClick={() => { pick(prevWeek); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>‹ {prevWeek.label}</button> : <span />}
          {nextWeek ? <button type="button" className="next" onClick={() => { pick(nextWeek); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{nextWeek.label} ›</button> : null}
        </WeekPager>
      </Agenda>
      <CalLegend>
        {LEGEND.map((k) => <span key={k}><KindIcon kind={k} small />{KIND_LABEL[k]}</span>)}
      </CalLegend>
    </>
  );
}

const MINUTES_PER_PITCH = 12; // same estimate as the Pro renewal note (finding the email, writing, sending)

// Free plan: their plan, paused (Noom / Duolingo framing: it's yours, it's waiting), plus the time Pro saves.
function PlanStrip({ free, goalCents, onUpgrade }) {
  const waiting = Number(free.locked) || 0;
  const left = Number(free.pitches_left) || 0;
  const hours = Math.max(1, Math.round((waiting * MINUTES_PER_PITCH) / 60));
  const goal = goalCents ? money(goalCents) : 'your goal';
  if (!waiting) {
    return (
      <FreeStrip>
        <span className="txt"><b>{left} free pitch{left === 1 ? '' : 'es'} left this month.</b> Replies to brands are always free.</span>
      </FreeStrip>
    );
  }
  return (
    <FreeStrip $paused={!left}>
      <span className="txt">
        {left ? (
          <><b>{left} free pitch{left === 1 ? '' : 'es'} left this month.</b> Pro runs your whole plan: {waiting} more brand{waiting === 1 ? '' : 's'},
            sent on schedule from your Gmail, with follow-ups.</>
        ) : (
          <><b>Your plan is paused.</b> {waiting} brand{waiting === 1 ? ' is' : 's are'} ready to pitch. Pro sends them on
            schedule from your Gmail and follows up (about {hours} hour{hours === 1 ? '' : 's'} of outreach done for you),
            so you keep moving toward {goal}.</>
        )}
        <small>Replies to brands are always free.</small>
      </span>
      <button type="button" onClick={onUpgrade}>{left ? 'Run my plan on Pro' : 'Resume my plan'}</button>
    </FreeStrip>
  );
}

export default function Tracker() {
  const navigate = useNavigate();
  const { brandId: routeBrandId } = useParams();
  const [searchParams] = useSearchParams();
  const { data, loading, error, reload } = useTracker();
  const [filter, setFilter] = useState('all');
  const [goalOpen, setGoalOpen] = useState(false);
  const [paywall, setPaywall] = useState(false);

  const drawerId = routeBrandId || searchParams.get('brand');
  const startStep = searchParams.get('step');

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
  const openedCount = cards.filter((c) => Number(c.kit_views) > 0 && c.column !== 'closed').length;
  const drawerCard = drawerId ? findCard(data, drawerId) : null;
  const totalCards = cards.filter((c) => c.column !== 'closed').length;
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'your_move', label: `Your move${moveCount ? ` (${moveCount})` : ''}` },
    ...(openedCount ? [{ id: 'opened', label: `Opened kit (${openedCount})` }] : []),
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
          <KitOpens views={data.recent_views} />
          {free ? <PlanStrip free={free} goalCents={data.goal?.amount_cents} onUpgrade={() => setPaywall(true)} /> : null}
        </Top>

        <Toolbar>
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
              <p>Pick brands in Polly and they show up here: lined up, pitched, wrote back, confirmed, then paid.</p>
              <button type="button" onClick={() => navigate('/creator/dashboard/for-you')}>Find brands with Polly</button>
            </EmptyBox>
          ) : (
            <CalendarView events={events} onOpen={openCard}
              weekly={data?.goal?.weekly_target || Math.round((data?.goal?.math?.pitches || 0) / 4.3)} />
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

const Opens = styled.section`
  margin: 0 0 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #f7f2fe;
  border: 1px solid #e6d9fb;
  display: grid;
  gap: 8px;
  .h { font-size: 12.5px; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; color: #6d28d9; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  li { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .t { font-size: 14px; color: ${t.inkSoft}; min-width: 0; }
  .t b { color: ${t.ink}; }
  .go {
    font-size: 13px; font-weight: 700; color: #fff; background: #7c3aed; border-radius: 999px;
    padding: 6px 14px; text-decoration: none; white-space: nowrap;
  }
  .ok { font-size: 12.5px; font-weight: 700; color: ${t.accentDeep}; }
`;

const Funnel = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  .s.opened { background: #f4eefc; }
  .s.opened .v { color: #6d28d9; display: flex; align-items: center; gap: 6px; }

  .s { background: ${t.paper}; border-radius: 10px; padding: 10px 12px; display: grid; gap: 2px; min-width: 0; }
  .v { font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .v small { font-size: 14px; color: ${t.muted}; font-weight: 500; }
  .k { font-size: 12px; color: ${t.muted}; }
  .k b { color: ${t.ink}; }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    .s:first-child { grid-column: span 2; }
  }
`;

const FreeStrip = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
  flex-wrap: wrap;
  font-size: 14px;
  line-height: 1.5;
  color: ${t.inkSoft};
  background: ${(p) => (p.$paused ? '#fff6f2' : t.paper)};
  border: 1px solid ${(p) => (p.$paused ? '#f6c7b8' : t.line)};
  border-radius: 14px;
  padding: 12px 14px;

  .txt { flex: 1 1 320px; min-width: 0; }
  .txt b { color: ${t.ink}; }
  .txt small { display: block; margin-top: 4px; font-size: 12.5px; color: ${t.muted}; }
  button {
    flex-shrink: 0;
    border: 0;
    border-radius: 999px;
    padding: 10px 18px;
    background: ${t.ink};
    color: ${t.white};
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }
  @media (max-width: 640px) { button { width: 100%; } }
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

const MonthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;

  .wd { font-size: 11.5px; font-weight: 700; color: ${t.muted}; text-transform: uppercase; letter-spacing: .06em; padding: 0 4px; }

  @media (max-width: 640px) { display: none; }
`;

const Cell = styled.div`
  background: ${(p) => (p.$today ? '#fff4f1' : p.$out ? 'transparent' : t.paper)};
  border: 1px solid ${(p) => (p.$today ? '#f6c7b8' : p.$sel ? t.line : 'transparent')};
  border-radius: 10px;
  padding: 6px;
  min-height: 104px;
  display: grid;
  gap: 4px;
  align-content: start;
  min-width: 0;
  opacity: ${(p) => (p.$past || p.$out ? 0.6 : 1)};
  box-shadow: ${(p) => (p.$sel && !p.$today ? `inset 0 2px 0 ${t.ink}` : 'none')};

  .dh { display: flex; justify-content: space-between; font-size: 12px; font-weight: 700; color: ${t.muted}; padding: 0 2px; }
  .today { color: ${t.hot}; }
  .more { border: 0; background: none; font: inherit; font-size: 11.5px; color: ${t.muted}; text-align: left; padding: 0 2px; cursor: pointer; }
`;

const Ev = styled.button`
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  gap: 7px;
  align-items: start;
  > span:first-child { margin-top: 1px; }
  width: 100%;
  min-width: 0;
  text-align: left;
  border: 0;
  border-radius: 8px;
  padding: 6px 7px;
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

const Weeks = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scroll-snap-type: x proximity;
  padding: 2px 2px 10px;
  margin: 0 -2px 6px;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const WeekChip = styled.button`
  flex: 0 0 auto;
  min-width: 132px;
  scroll-snap-align: start;
  display: grid;
  gap: 3px;
  text-align: left;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid ${(p) => (p.$on ? t.ink : t.line)};
  background: ${(p) => (p.$on ? t.ink : t.white)};
  color: ${(p) => (p.$on ? t.white : t.ink)};
  font: inherit;
  cursor: pointer;

  .l { font-size: 13.5px; font-weight: 700; }
  .r { font-size: 12px; opacity: .7; }
  .n { font-size: 12.5px; opacity: .85; }
  .n b { font-weight: 700; }
  .bar { height: 4px; border-radius: 999px; background: ${(p) => (p.$on ? 'rgba(255,255,255,.25)' : t.subtle)}; overflow: hidden; margin-top: 3px; }
  .bar i { display: block; height: 100%; border-radius: 999px; background: ${(p) => (p.$on ? t.white : t.accent)}; }
`;

const MonthHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 4px 0 10px;
  h3 { margin: 0; font-size: 17px; font-weight: 700; color: ${t.ink}; }
  .nav { display: flex; gap: 6px; }
  .nav button {
    min-width: 34px; height: 34px; padding: 0 12px; border-radius: 999px; border: 1px solid ${t.line};
    background: ${t.white}; color: ${t.ink}; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
  }
  .nav button:disabled { opacity: .4; cursor: default; }

  @media (max-width: 640px) { display: none; }
`;

const AgendaWeek = styled.section`
  display: grid;
  gap: 8px;
  scroll-margin-top: 140px;
  padding-top: 6px;

  .wh { display: flex; align-items: baseline; gap: 8px; padding: 0 2px; }
  .wh .l { font-size: 16px; font-weight: 700; color: ${t.ink}; }
  .wh .r { font-size: 13px; color: ${t.muted}; }
  .ws { font-size: 13px; color: ${t.muted}; padding: 0 2px 2px; }
  & + & { border-top: 1px solid ${t.line}; padding-top: 14px; margin-top: 6px; }
`;

const WeekPager = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding-top: 4px;
  button {
    border: 1px solid ${t.line}; background: ${t.white}; color: ${t.ink}; border-radius: 999px;
    padding: 9px 14px; font: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer;
  }
  .next { background: ${t.ink}; color: ${t.white}; border-color: ${t.ink}; }
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
  .more { justify-self: start; border: 0; background: none; font: inherit; font-size: 12.5px; font-weight: 600; color: ${t.muted}; padding: 2px; cursor: pointer; }
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

