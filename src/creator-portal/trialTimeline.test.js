import { trialTimeline } from './checkoutCopy';

describe('trialTimeline', () => {
  it('lays out the 7-day trial with the charge date', () => {
    const rows = trialTimeline(7, '2026-12-01');
    expect(rows.map(([when]) => when)).toEqual(['Day 1', 'Every day', 'Day 3–5', 'Day 7']);
    expect(rows[3][1]).toBe('$19/mo starts on Dec 1, unless you cancel from your settings');
  });

  it('works without a date', () => {
    expect(trialTimeline(7, null)[3][1]).toBe('$19/mo starts, unless you cancel from your settings');
  });
});
