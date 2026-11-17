import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PollyFirstRun, { leadWithPick } from './PollyFirstRun';

jest.mock('./scrollChatTo', () => () => {});

const data = {
  goal_cents: 50000, month: 'November', this_week: 3, niches: ['beauty'], free_left: 3,
  brands: [
    { brand_id: 1, brand_name: 'Alpha', offer: 'gifted', reason: 'Fits' },
    { brand_id: 2, brand_name: 'Beta', offer: 'gifted', reason: 'Fits', hot: true },
    { brand_id: 3, brand_name: 'Gamma', offer: 'gifted', reason: 'Fits' },
    { brand_id: 4, brand_name: 'Delta', offer: 'gifted', reason: 'Fits' },
  ],
};

test('leadWithPick moves the picked brand first and ignores unknown picks', () => {
  expect(leadWithPick(data.brands, 4).map((b) => b.brand_id)).toEqual([4, 1, 2, 3]);
  expect(leadWithPick(data.brands, 99).map((b) => b.brand_id)).toEqual([1, 2, 3, 4]);
  expect(leadWithPick(data.brands, null).map((b) => b.brand_id)).toEqual([1, 2, 3, 4]);
});

test('the welcome still shows with the emailed pick leading the first pitches', () => {
  const onStart = jest.fn();
  render(<PollyFirstRun data={data} firstName="Ana" onStart={onStart} pick={4} />);
  expect(screen.getByText(/your first brands are lined up/)).toBeInTheDocument();
  expect(screen.getByText('💌 Your pick')).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Start contacting brands for me/));
  expect(onStart).toHaveBeenCalledWith('gmail', [4, 1, 2]);
});
