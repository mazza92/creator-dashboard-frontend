import {
  agendaDays, calendarWeeks, cardMatches, centsFromInput, money, needsReplyFlow, paywallGoal, pitchMath, sortCards,
  stageActions,
} from './trackerModel';

test('money and amounts', () => {
  expect(money(32500)).toBe('$325');
  expect(money(125050)).toBe('$1,250.50');
  expect(money(4000, { approx: true })).toBe('~$40');
  expect(centsFromInput('$1,250')).toBe(125000);
  expect(centsFromInput('')).toBeNull();
  expect(centsFromInput('abc')).toBeNull();
});

test('pitch math matches the backend: deals = goal / avg, pitches = deals / (reply x deal)', () => {
  const m = pitchMath(50000, { avg_deal_cents: 18500, reply_rate: 0.08, deal_rate: 0.3 });
  expect(m.deals).toBe(3);
  expect(m.pitches).toBe(125);
  expect(pitchMath(0, { avg_deal_cents: 100 })).toBeNull();
});

test('reply flow first, then stage buttons per deal', () => {
  expect(needsReplyFlow({ column: 'pitched' }, null)).toBe(true);
  expect(needsReplyFlow({}, { stage: 'replied' })).toBe(true);
  expect(needsReplyFlow({}, { stage: 'negotiating' })).toBe(false);

  const neg = stageActions({}, { stage: 'negotiating', deal_type: 'paid' }).map((a) => a.action);
  expect(neg).toEqual(['booked', 'paid_offer', 'closed']);
  const booked = stageActions({}, { stage: 'booked', deal_type: 'paid' });
  expect(booked.map((a) => a.action)).toEqual(['posted', 'booked', 'paid']);
  expect(booked[0].fields).toEqual(['payment_due']);
  expect(stageActions({}, { stage: 'booked', deal_type: 'paid', due_date: '2026-11-20' }).map((a) => a.action))
    .toEqual(['posted', 'paid']);
  expect(stageActions({}, { stage: 'offered', deal_type: 'gifted' }).map((a) => a.action))
    .toEqual(['shipped', 'arrived', 'closed']);
  expect(stageActions({}, { stage: 'shipped', deal_type: 'gifted' }).map((a) => a.action)).toEqual(['arrived']);
  expect(stageActions({}, { stage: 'posted', deal_type: 'paid' }).map((a) => a.action)).toEqual(['paid']);
  expect(stageActions({}, { stage: 'paid', deal_type: 'paid' })).toEqual([]);
});

test('filters', () => {
  expect(cardMatches({ column: 'replied', next: { your_move: true } }, 'your_move')).toBe(true);
  expect(cardMatches({ column: 'pitched', type: 'gig' }, 'paid')).toBe(true);
  expect(cardMatches({ column: 'closed' }, 'all')).toBe(false);
  expect(cardMatches({ column: 'closed' }, 'closed')).toBe(true);
});

test('calendar weeks start on Monday and hot events come first', () => {
  const events = [
    { date: '2026-11-12', kind: 'sched', brand_name: 'A' },
    { date: '2026-11-12', kind: 'hot', brand_name: 'B', hot: true },
  ];
  const weeks = calendarWeeks(events, '2026-11-11');
  expect(weeks[0][0].iso).toBe('2026-11-09');
  const thu = weeks[0].find((d) => d.iso === '2026-11-12');
  expect(thu.events[0].brand_name).toBe('B');
  expect(agendaDays(events)).toHaveLength(1);
});

test('list sorting', () => {
  const cards = [
    { brand_name: 'b', column: 'booked', value_cents: 100 },
    { brand_name: 'a', column: 'pitched', value_cents: 900 },
  ];
  expect(sortCards(cards, 'stage').map((c) => c.brand_name)).toEqual(['a', 'b']);
  expect(sortCards(cards, 'value', 'asc').map((c) => c.brand_name)).toEqual(['b', 'a']);
  expect(sortCards(cards, 'brand', 'desc').map((c) => c.brand_name)).toEqual(['b', 'a']);
});

test('paywall copy comes from the goal and lined-up brands', () => {
  const g = paywallGoal({
    goal: { amount_cents: 50000, total_cents: 7500 },
    columns: [{ id: 'lined_up', count: 37, cards: [
      { brand_name: 'Velthentic', hot: true, hot_reason: 'running 4 UGC ads' },
      { brand_name: 'GlowDrop', locked: true, category: 'skincare' },
      { brand_name: 'Open', locked: false },
    ] }],
  });
  expect(g.left_cents).toBe(42500);
  expect(g.lined_up).toBe(37);
  expect(g.brands.map((b) => b.brand_name)).toEqual(['Velthentic', 'GlowDrop']);
});
