// Pure helpers for the Tracker (GET /api/tracker, backend services/creator_tracker.py). No React here so the
// rules (money, pitch math, which buttons a deal shows) are unit-tested on their own.

export const TRACKER_PATH = '/creator/dashboard/tracker';

export const COLUMN_LABELS = {
  lined_up: 'Lined up',
  pitched: 'Pitched',
  followed_up: 'Followed up',
  replied: 'Wrote back',
  negotiating: 'Talking money',
  booked: 'Confirmed',
  done: 'Paid / received',
  closed: 'Closed',
};

export const COLUMN_ORDER = ['lined_up', 'pitched', 'followed_up', 'replied', 'negotiating', 'booked', 'done', 'closed'];

export function money(cents, { approx = false } = {}) {
  const n = Number(cents);
  if (!Number.isFinite(n)) return '';
  const dollars = n / 100;
  const whole = Math.abs(dollars - Math.round(dollars)) < 0.005;
  const out = `$${dollars.toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 })}`;
  return approx ? `~${out}` : out;
}

export function centsFromInput(raw) {
  const cleaned = String(raw ?? '').replace(/[$,\s]/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

// Same math as the backend's pitch_math(): deals = goal / avg deal, pitches = deals / (reply rate x deal rate).
export function pitchMath(goalCents, math) {
  const avg = Number(math?.avg_deal_cents) || 0;
  const reply = Number(math?.reply_rate) || 0.08;
  const deal = Number(math?.deal_rate) || 0.3;
  if (!avg || !goalCents) return null;
  const deals = Math.max(1, Math.ceil(goalCents / avg));
  return { deals, pitches: Math.ceil(deals / (reply * deal)), avg_deal_cents: avg, reply_rate: reply, deal_rate: deal };
}

export function pct(rate) {
  const n = Number(rate);
  return Number.isFinite(n) ? `${Math.round(n * 100)}%` : '';
}

export function monthName(monthKey) {
  const [y, m] = String(monthKey || '').split('-').map(Number);
  if (!y || !m) return new Date().toLocaleDateString('en-US', { month: 'long' });
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long' });
}

export function localIso(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function parseIso(iso) {
  const [y, m, d] = String(iso || '').slice(0, 10).split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

export function dayLabel(iso, todayIso = localIso()) {
  const d = parseIso(iso);
  if (!d) return '';
  if (iso === todayIso) return 'Today';
  const t = parseIso(todayIso);
  const diff = Math.round((d - t) / 86400000);
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function shortDate(iso) {
  const d = parseIso(iso);
  return d ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
}

export function allCards(tracker) {
  const cols = (tracker?.columns || []).flatMap((c) => c.cards || []);
  return [...cols, ...(tracker?.closed || []).map((c) => ({ ...c, column: 'closed' }))];
}

export function findCard(tracker, brandId) {
  const id = String(brandId);
  return allCards(tracker).find((c) => String(c.brand_id) === id) || null;
}

export function cardMatches(card, filter) {
  if (filter === 'your_move') return Boolean(card.next?.your_move);
  if (filter === 'opened') return Number(card.kit_views) > 0 && card.column !== 'closed';
  if (filter === 'paid') return card.type === 'paid' || card.type === 'gig';
  if (filter === 'gifted') return card.type === 'gifted';
  if (filter === 'closed') return card.column === 'closed';
  return card.column !== 'closed';
}

export function typeLabel(type) {
  if (type === 'paid') return 'Paid';
  if (type === 'gig') return 'Paid gig';
  return 'Gifted';
}

export function cardValue(card) {
  if (card.value_cents) return money(card.value_cents);
  return '';
}

// A card with no deal yet (or a brand that only asked a question / passed) answers "Brand replied" first.
export function needsReplyFlow(card, deal) {
  const stage = deal?.stage || card?.stage;
  if (!stage) return true;
  return stage === 'replied' || stage === 'closed';
}

// The buttons a deal shows after the reply, by stage and deal type (mirrors _deal_next / ACTIONS).
// fields: amount ($), due_date (draft due), payment_due, deliverables.
export function stageActions(card, deal) {
  const stage = deal?.stage || card?.stage;
  const type = deal?.deal_type || card?.type;
  const paid = type === 'paid' || type === 'gig';
  const closeBtn = { action: 'closed', label: 'They passed', ghost: true };
  switch (stage) {
    case 'offered':
      return paid
        ? [{ action: 'booked', label: 'Booked', fields: ['due_date', 'deliverables'], primary: true }, closeBtn]
        : [{ action: 'shipped', label: 'Box shipped', primary: true }, { action: 'arrived', label: 'Box arrived' }, closeBtn];
    case 'negotiating':
      return [
        { action: 'booked', label: 'Booked', fields: ['due_date', 'deliverables'], primary: true },
        { action: 'paid_offer', label: 'Update amount', fields: ['amount'] },
        closeBtn,
      ];
    case 'booked':
      return paid
        ? [
          { action: 'posted', label: 'Posted', fields: ['payment_due'], primary: true },
          ...(deal?.due_date || card?.next?.date ? [] : [{ action: 'booked', label: 'Set draft due date', fields: ['due_date'] }]),
          { action: 'paid', label: 'Paid' },
        ]
        : [{ action: 'shipped', label: 'Box shipped', primary: true }, { action: 'arrived', label: 'Box arrived' }];
    case 'shipped':
      return [{ action: 'arrived', label: 'Box arrived', primary: true }];
    case 'arrived':
      return [{ action: 'posted', label: 'Posted', primary: true }];
    case 'posted':
      return paid
        ? [{ action: 'paid', label: 'Paid', primary: true }]
        : [{ action: 'paid_offer', label: 'They offered paid usage', fields: ['amount'], primary: true }];
    default:
      return [];
  }
}

export const REPLY_CHOICES = [
  { id: 'gifted_offer', label: 'Gifted offer' },
  { id: 'paid_offer', label: 'Paid offer' },
  { id: 'question', label: 'Question' },
  { id: 'closed', label: 'Not now' },
];

export const ACTION_DONE = {
  gifted_offer: 'Gifted offer saved',
  paid_offer: 'Paid offer saved',
  question: 'Saved. Polly can help you answer',
  closed: 'Moved to Closed',
  booked: 'Booked',
  shipped: 'Box on its way',
  arrived: 'Box arrived',
  posted: 'Posted',
  paid: 'Paid. It counts toward your goal',
};

// Polly chips with action "link" go to their in-app href; the paid-offer chip opens the deal's amount on the Tracker.
export function chipHref(chip) {
  if (!chip) return null;
  if (chip.href && /^\/(?!\/)/.test(String(chip.href))) return chip.href;
  if (chip.id === 'open_tracker_deal' && chip.brand_id) return `${TRACKER_PATH}?brand=${chip.brand_id}&step=amount`;
  return TRACKER_PATH;
}

export function pollyChipHref(chip, card) {
  const q = new URLSearchParams({ chip });
  if (card?.brand_id) q.set('brand_id', String(card.brand_id));
  if (card?.brand_name) q.set('brand_name', card.brand_name);
  return `/creator/dashboard/for-you?${q.toString()}`;
}

// Calendar: Monday-first weeks covering every event (and today).
export function calendarWeeks(events, todayIso = localIso()) {
  const dates = [todayIso, ...(events || []).map((e) => e.date)].filter(Boolean).sort();
  const first = parseIso(dates[0]);
  const last = parseIso(dates[dates.length - 1]);
  const start = new Date(first);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(last);
  end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)));
  const byDate = {};
  (events || []).forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  Object.values(byDate).forEach((list) => list.sort((a, b) => Number(Boolean(b.hot)) - Number(Boolean(a.hot))));
  const weeks = [];
  for (let d = new Date(start); d <= end;) {
    const week = [];
    for (let i = 0; i < 7; i += 1) {
      const iso = localIso(d);
      week.push({ iso, day: d.getDate(), month: d.getMonth(), events: byDate[iso] || [] });
      d.setDate(d.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function mondayOf(iso) {
  const d = parseIso(iso);
  if (!d) return '';
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return localIso(d);
}

function addDays(iso, n) {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  return localIso(d);
}

const PITCH_KINDS = ['sched', 'hot'];
const DEADLINE_KINDS = ['due', 'ship', 'post', 'pay'];

function monDay(iso) {
  return parseIso(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function weekLabel(start, todayIso = localIso()) {
  const thisMon = mondayOf(todayIso);
  if (start === thisMon) return 'This week';
  if (start === addDays(thisMon, 7)) return 'Next week';
  if (start === addDays(thisMon, -7)) return 'Last week';
  return `Week of ${monDay(start)}`;
}

// The plan week by week (Mon-Sun): this week and at least ``minWeeks`` ahead, plus any later week with events.
// Each week: its days (agenda), and what's in it: pitches planned, sent, follow-ups, deadlines.
export function weekGroups(events, todayIso = localIso(), { minWeeks = 5, includePast = false } = {}) {
  const thisMon = mondayOf(todayIso);
  const byWeek = {};
  (events || []).forEach((e) => {
    if (!e?.date) return;
    const w = mondayOf(e.date);
    (byWeek[w] = byWeek[w] || []).push(e);
  });
  const keys = new Set(Object.keys(byWeek).filter((k) => includePast || k >= thisMon));
  for (let i = 0; i < minWeeks; i += 1) keys.add(addDays(thisMon, 7 * i));
  return [...keys].sort().map((start) => {
    const evs = byWeek[start] || [];
    const end = addDays(start, 6);
    const count = (kinds) => evs.filter((e) => kinds.includes(e.kind)).length;
    return {
      start,
      end,
      label: weekLabel(start, todayIso),
      range: `${monDay(start)} – ${parseIso(end).getMonth() === parseIso(start).getMonth()
        ? parseIso(end).getDate() : monDay(end)}`,
      days: agendaDays(evs),
      pitches: count(PITCH_KINDS),
      sent: count(['sent']),
      followups: count(['fu']),
      deadlines: count(DEADLINE_KINDS),
      past: end < todayIso,
    };
  });
}

// Weekday slots left in a week (for "12 of 39" on this week's chip: only the days still ahead count).
export function weekTarget(weekly, start, todayIso = localIso()) {
  if (!weekly) return 0;
  const days = [0, 1, 2, 3, 4].map((i) => addDays(start, i)).filter((d) => d >= todayIso).length;
  return days >= 5 ? weekly : Math.max(days ? 1 : 0, Math.round((weekly * days) / 5));
}

// Month grid (Mon-first weeks covering the month) for a {year, month} with events per day.
export function monthWeeks(events, year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const start = parseIso(mondayOf(localIso(first)));
  const end = new Date(last);
  end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)));
  const byDate = {};
  (events || []).forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  Object.values(byDate).forEach((list) => list.sort((a, b) => Number(Boolean(b.hot)) - Number(Boolean(a.hot))));
  const weeks = [];
  for (let d = new Date(start); d <= end;) {
    const week = [];
    for (let i = 0; i < 7; i += 1) {
      const iso = localIso(d);
      week.push({ iso, day: d.getDate(), month: d.getMonth(), events: byDate[iso] || [] });
      d.setDate(d.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function agendaDays(events) {
  const byDate = {};
  (events || []).forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  return Object.keys(byDate).sort().map((iso) => ({
    iso,
    events: byDate[iso].sort((a, b) => Number(Boolean(b.hot)) - Number(Boolean(a.hot))),
  }));
}

const SORTS = {
  brand: (c) => String(c.brand_name || '').toLowerCase(),
  type: (c) => c.type || '',
  stage: (c) => COLUMN_ORDER.indexOf(c.column),
  value: (c) => Number(c.value_cents) || 0,
  next: (c) => c.next?.date || '9999',
};

export function sortCards(cards, key = 'stage', dir = 'asc') {
  const get = SORTS[key] || SORTS.stage;
  const sign = dir === 'desc' ? -1 : 1;
  return [...cards].sort((a, b) => {
    const x = get(a);
    const y = get(b);
    if (x < y) return -1 * sign;
    if (x > y) return 1 * sign;
    return Number(Boolean(b.hot)) - Number(Boolean(a.hot));
  });
}

// What the paywall says, from the creator's own goal and lined-up brands.
export function paywallGoal(tracker) {
  if (!tracker?.goal) return null;
  const lined = (tracker.columns || []).find((c) => c.id === 'lined_up');
  const cards = lined?.cards || [];
  const goal = tracker.goal;
  return {
    amount_cents: Number(goal.amount_cents) || 0,
    total_cents: Number(goal.total_cents) || 0,
    left_cents: Math.max(0, (Number(goal.amount_cents) || 0) - (Number(goal.total_cents) || 0)),
    lined_up: lined?.count ?? cards.length,
    brands: cards.filter((c) => c.locked || c.hot).slice(0, 3).map((c) => ({
      brand_name: c.brand_name,
      reason: c.hot_reason || (c.type === 'gig' ? 'paid gig' : c.category || ''),
      hot: Boolean(c.hot),
    })),
  };
}
