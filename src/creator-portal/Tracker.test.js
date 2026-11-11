import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { apiClient } from '../config/api';
import Tracker from './Tracker';
import GoalSetup from './tracker/GoalSetup';
import { chipHref } from './tracker/trackerModel';

jest.mock('../config/api', () => ({ apiClient: { get: jest.fn(), post: jest.fn() } }));
jest.mock('./UpgradeModal', () => (props) => (props.isOpen ? (
  <div role="dialog" aria-label="Upgrade">{`goal-left-${props.goal?.left_cents} lined-${props.goal?.lined_up}`}</div>
) : null));
jest.mock('antd', () => ({ message: { success: jest.fn(), error: jest.fn() } }));

const card = (o) => ({
  type: 'gifted', value_cents: null, next: {}, kit_views: 0, hot: false, locked: false, category: 'skincare', ...o,
});

const tracker = {
  success: true,
  month: '2026-11',
  days_left: 19,
  is_pro: false,
  goal: {
    set: true, amount_cents: 50000, source: 'suggested', paid_cents: 25000, gifted_cents: 7500, total_cents: 32500,
    pipeline_cents: 25000, math: { avg_deal_cents: 18500, deals: 3, pitches: 40, reply_rate: 0.08, deal_rate: 0.3, rates_source: 'default' },
  },
  funnel: { pitched: 24, pitches_needed: 40, replied: 3, negotiating: 1, negotiating_cents: 25000, booked_or_paid: 2 },
  columns: [
    { id: 'lined_up', label: 'Lined up', count: 2, cards: [
      card({ brand_id: 1, brand_name: 'Velthentic', column: 'lined_up', hot: true, hot_reason: 'running 4 UGC ads', next: { label: 'Pitch Tue 10 Nov' } }),
      card({ brand_id: 2, brand_name: 'GlowDrop', column: 'lined_up', locked: true, next: { label: 'Pitch being written' } }),
    ] },
    { id: 'pitched', label: 'Pitched', count: 0, cards: [] },
    { id: 'followed_up', label: 'Followed up', count: 0, cards: [] },
    { id: 'replied', label: 'Replied', count: 0, cards: [] },
    { id: 'negotiating', label: 'Negotiating', count: 1, cards: [
      card({ brand_id: 3, brand_name: 'Rhode', column: 'negotiating', type: 'paid', stage: 'negotiating', value_cents: 25000,
        next: { label: 'Answer with your rate', your_move: true, action: 'answer' } }),
    ] },
    { id: 'booked', label: 'Booked', count: 0, cards: [] },
    { id: 'done', label: 'Paid / received', count: 0, cards: [] },
  ],
  closed: [],
  calendar: [{ date: '2026-11-11', kind: 'hot', brand_id: 1, brand_name: 'Velthentic', label: 'Hot today', hot: true }],
  your_move_count: 1,
  hot: { brand_id: 1, brand_name: 'Velthentic', reason: 'running 4 UGC ads' },
  free: { pitches_left: 0, limit: 3, locked: 1 },
};

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/creator/dashboard/tracker" element={<Tracker />} />
        <Route path="/creator/dashboard/tracker/:brandId" element={<Tracker />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  apiClient.get.mockImplementation((url) => {
    if (url === '/api/tracker') return Promise.resolve({ data: tracker });
    if (url.startsWith('/api/tracker/brand/')) {
      return Promise.resolve({ data: { brand: { name: 'Rhode' }, events: [], deal: { stage: 'negotiating', deal_type: 'paid', value_cents: null } } });
    }
    return Promise.resolve({ data: {} });
  });
  apiClient.post.mockResolvedValue({ data: { success: true, deal: { stage: 'negotiating' } } });
});

test('goal header, funnel, hot brand and a locked card that opens the paywall', async () => {
  renderAt('/creator/dashboard/tracker');
  expect(await screen.findByText(/November goal/)).toBeInTheDocument();
  expect(screen.getByText('$325')).toBeInTheDocument();
  expect(screen.getByText(/Pitch about 9 brands a week/)).toBeInTheDocument();
  expect(screen.getByText('19 days left')).toBeInTheDocument();
  expect(screen.getAllByRole('img', { name: 'Hot brand today' }).length).toBeGreaterThan(0);
  expect(screen.getByRole('button', { name: /Your move \(1\)/ })).toBeInTheDocument();

  expect(screen.queryByRole('button', { name: 'Board' })).not.toBeInTheDocument(); // Calendar only
  fireEvent.click(screen.getByRole('button', { name: /my plan/ }));
  expect(screen.getByRole('dialog', { name: 'Upgrade' })).toHaveTextContent('goal-left-17500 lined-2');
});

test('?brand=ID&step=amount opens the drawer on the paid amount and saves it', async () => {
  renderAt('/creator/dashboard/tracker?brand=3&step=amount');
  const dialog = await screen.findByRole('dialog', { name: 'Rhode deal' });
  const input = await within(dialog).findByLabelText('Amount $');
  fireEvent.change(input, { target: { value: '250' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/tracker/deal',
    expect.objectContaining({ brand_id: 3, action: 'paid_offer', amount: '250' })));
});

test('Brand replied: four choices, a paid offer asks for the amount', async () => {
  const pitched = { ...tracker, columns: tracker.columns.map((c) => (c.id === 'pitched'
    ? { ...c, count: 1, cards: [card({ brand_id: 9, brand_name: 'Biossance', column: 'pitched', next: { label: 'Waiting for a reply' } })] }
    : c)) };
  apiClient.get.mockImplementation((url) => Promise.resolve({ data: url === '/api/tracker' ? pitched : { events: [], deal: null } }));
  renderAt('/creator/dashboard/tracker/9');
  const dialog = await screen.findByRole('dialog', { name: 'Biossance deal' });
  await within(dialog).findByRole('button', { name: 'Gifted offer' });
  ['Gifted offer', 'Paid offer', 'Question', 'Not now'].forEach((l) => {
    expect(within(dialog).getByRole('button', { name: l })).toBeInTheDocument();
  });
  expect(within(dialog).getByText(/free on every plan/)).toBeInTheDocument();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Paid offer' }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save paid offer' }));
  expect(within(dialog).getByRole('alert')).toHaveTextContent('Add the amount');
  fireEvent.change(within(dialog).getByLabelText('Amount $'), { target: { value: '300' } });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Save paid offer' }));
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/tracker/deal',
    expect.objectContaining({ brand_id: 9, action: 'paid_offer', amount: '300' })));
});

test('goal setup: three suggestions, custom amount, pitch count', async () => {
  const suggestion = {
    options: [
      { id: 'starter', amount_cents: 25000, deals: 2, math: { avg_deal_cents: 11500, deals: 3, pitches: 125, reply_rate: 0.08, deal_rate: 0.3 } },
      { id: 'suggested', amount_cents: 50000, deals: 4, math: { avg_deal_cents: 11500, deals: 5, pitches: 209, reply_rate: 0.08, deal_rate: 0.3 } },
      { id: 'stretch', amount_cents: 100000, deals: 7, math: { avg_deal_cents: 11500, deals: 9, pitches: 375, reply_rate: 0.08, deal_rate: 0.3 } },
    ],
    recommended: 'suggested',
    basis: { followers: 8300, niches: ['skincare'], engagement_pct: 4.1, rate_low_cents: 8000, rate_high_cents: 15000, gifted_avg_cents: 4000 },
    current: null,
  };
  const onSaved = jest.fn();
  apiClient.post.mockResolvedValue({ data: { success: true, goal: { amount_cents: 23000 } } });
  render(<GoalSetup suggestion={suggestion} onSaved={onSaved} />);
  expect(screen.getAllByRole('radio')).toHaveLength(3);
  expect(screen.getByRole('radio', { name: /Recommended/ })).toHaveAttribute('aria-checked', 'true');
  expect(screen.getByText(/pitch about 49 brands a week/)).toBeInTheDocument();
  expect(screen.getByText(/8.3K followers/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText(/Or pick your own/), { target: { value: '230' } });
  expect(screen.getByText(/pitch about 20 brands a week/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Set my goal' }));
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/tracker/goal', { amount_cents: 23000, source: 'custom' }));
  await waitFor(() => expect(onSaved).toHaveBeenCalled());
});

test('Polly link chips go to their href; the amount chip opens the Tracker deal', () => {
  expect(chipHref({ id: 'open_tracker_deal', action: 'link', href: '/creator/dashboard/tracker?brand=4&step=amount' }))
    .toBe('/creator/dashboard/tracker?brand=4&step=amount');
  expect(chipHref({ id: 'open_tracker_deal', action: 'link', brand_id: 7 })).toBe('/creator/dashboard/tracker?brand=7&step=amount');
  expect(chipHref({ action: 'link', href: 'https://evil.example' })).toBe('/creator/dashboard/tracker');
});
