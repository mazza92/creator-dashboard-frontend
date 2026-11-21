import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WaitingRoom from './WaitingRoom';

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
