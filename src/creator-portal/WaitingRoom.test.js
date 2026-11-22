import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WaitingRoom, { resetLabel } from './WaitingRoom';

const mockCalls = [];
let mockServerRoom = null;
jest.mock('../config/api', () => ({
  __esModule: true,
  default: {
    post: (url, body) => { mockCalls.push([url, body]); return Promise.resolve({ data: { success: true } }); },
    get: () => Promise.resolve({ data: { waiting_room: mockServerRoom } }),
  },
}));

beforeEach(() => { mockCalls.length = 0; mockServerRoom = null; });

const base = {
  momentum: { sent: 3, opened: 1, replied: 0 },
  checklist: [{ id: 'rates', done: false, band: '$50–100 a video', path: '/k' }, { id: 'gigs', count: 8, path: '/g' }],
  drafts: [{ brand_id: 1, brand_name: '2XU', subject: 'Video idea for 2XU', opener: 'I have an idea', offer: 'gifted', meta_ads: true }],
  plan_count: 24,
  reset: 'Dec 1',
};

test('follow-up before day 4: shows when it opens, no button, checklist leads', () => {
  const onFollowup = jest.fn();
  render(<WaitingRoom room={{ ...base, followup: { brand_id: 9, brand_name: 'Elite Eleven', due: false, day: 2, opens_on: 'Nov 23' } }} onFollowup={onFollowup} />);
  expect(screen.getByTestId('followup-wait').textContent).toContain('Follow-up opens Nov 23 (day 4)');
  expect(screen.queryByText(/Draft my Elite Eleven follow-up/)).toBeNull();
  expect(screen.getByText('Set your rates').closest('button').className).toContain('lead');
});

test('follow-up due: it is the main action', () => {
  const onFollowup = jest.fn();
  render(<WaitingRoom room={{ ...base, followup: { brand_id: 9, brand_name: 'Elite Eleven', due: true, day: 5, opened_kit: true } }} onFollowup={onFollowup} />);
  fireEvent.click(screen.getByText(/Draft my Elite Eleven follow-up/));
  expect(onFollowup).toHaveBeenCalledWith(expect.objectContaining({ brand_id: 9 }));
  expect(screen.getByText('Set your rates').closest('button').className).not.toContain('lead');
});

test('real plan numbers and drafts', () => {
  render(<WaitingRoom room={{ ...base, followup: null }} />);
  expect(screen.getByText(/24 brands lined up before Dec 1/)).toBeTruthy();
  expect(screen.getByText("I've drafted your next pitch")).toBeTruthy();
  expect(screen.getByText('8 paid UGC gigs match you')).toBeTruthy();
  expect(screen.getByText(/Send these \+ resume my plan/)).toBeTruthy();
});

test('tracks view, checklist and upgrade with source and follow-up state', () => {
  const onOpen = jest.fn();
  render(<WaitingRoom room={{ ...base, followup: null }} source="pill" onOpen={onOpen} onUpgrade={() => {}} />);
  fireEvent.click(screen.getByText('Set your rates'));
  fireEvent.click(screen.getByText(/Send these \+ resume my plan/));
  expect(mockCalls.map((c) => c[1])).toEqual([
    { action: 'view', source: 'pill', followup_due: false },
    { action: 'checklist', source: 'pill', followup_due: false, item: 'rates' },
    { action: 'upgrade', source: 'pill', followup_due: false },
  ]);
  expect(onOpen).toHaveBeenCalledWith('/k', 'rates');
});

test('live card refreshes: a follow-up that became due turns into the main action', async () => {
  mockServerRoom = { ...base, followup: { brand_id: 9, brand_name: 'Elite Eleven', due: true, day: 4, opened_kit: false } };
  render(<WaitingRoom live room={{ ...base, followup: { brand_id: 9, brand_name: 'Elite Eleven', due: false, day: 1, opens_on: 'Nov 23' } }} />);
  expect(screen.getByTestId('followup-wait')).toBeTruthy();
  await waitFor(() => expect(screen.getByText(/Draft my Elite Eleven follow-up/)).toBeTruthy());
});

test('reset label from the balance, else the 1st of next month', () => {
  expect(resetLabel({ reset_at: '2026-12-01T00:00:00Z' })).toBe('Dec 1');
  expect(resetLabel(null, new Date('2026-12-20T10:00:00Z'))).toBe('Jan 1');
});

test('Gmail-sent pitch: Polly follows up by itself, no button, checklist leads', () => {
  render(<WaitingRoom room={{ ...base, followup: { brand_id: 9, brand_name: 'Elite Eleven', due: false, auto: true, opens_on: 'Nov 23' } }} />);
  expect(screen.getByTestId('followup-auto').textContent).toContain('Polly follows up with Elite Eleven on Nov 23');
  expect(screen.queryByText(/Draft my/)).toBeNull();
  expect(screen.getByText('Set your rates').closest('button').className).toContain('lead');
});

test('older card without a room: shows the fallback, then the live room', async () => {
  mockServerRoom = { ...base, followup: null };
  render(<WaitingRoom live room={null} fallback={<p>old card</p>} />);
  expect(screen.getByText('old card')).toBeTruthy();
  await waitFor(() => expect(screen.getByText(/24 brands lined up/)).toBeTruthy());
  expect(screen.queryByText('old card')).toBeNull();
});

test('publishOffer only fires for a real offer', () => {
  const { publishOffer, OFFER_EVENT } = require('./WaitingRoom');
  const got = [];
  const on = (e) => got.push(e.detail);
  window.addEventListener(OFFER_EVENT, on);
  publishOffer({ offer_message: { id: 'credits-out-2026-11', upsell: {} } });
  publishOffer({ offer_message: null });
  publishOffer(undefined);
  window.removeEventListener(OFFER_EVENT, on);
  expect(got).toEqual([{ id: 'credits-out-2026-11', upsell: {} }]);
});

test('a hook that is already quoted is not double-quoted', () => {
  render(<WaitingRoom room={{ ...base, followup: null, checklist: [{ id: 'pulse', hook: '“Lets face it, RDLs are hard”', path: '/p' }] }} />);
  expect(screen.getByText('“Lets face it, RDLs are hard”')).toBeTruthy();
});
