import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PollyFirstRun, { leadWithPick, intentTag } from './PollyFirstRun';

jest.mock('./scrollChatTo', () => () => {});

const data = {
  goal_cents: 50000, month: 'November', this_week: 3, niches: ['beauty'], free_left: 3,
  brands: [
    { brand_id: 1, brand_name: 'Alpha', offer: 'gifted', reason: 'Fits' },
    { brand_id: 2, brand_name: 'Beta', offer: 'paid', reason: 'Fits', hot: true },
    { brand_id: 3, brand_name: 'Gamma', offer: 'paid', reason: 'Fits' },
    { brand_id: 4, brand_name: 'Delta', offer: 'gifted', reason: 'Fits' },
  ],
};

test('leadWithPick moves the picked brand first and ignores unknown picks', () => {
  expect(leadWithPick(data.brands, 4).map((b) => b.brand_id)).toEqual([4, 1, 2, 3]);
  expect(leadWithPick(data.brands, 99).map((b) => b.brand_id)).toEqual([1, 2, 3, 4]);
  expect(leadWithPick(data.brands, null).map((b) => b.brand_id)).toEqual([1, 2, 3, 4]);
});

test('intent tags', () => {
  expect(intentTag(data.brands[1])).toBe('🔥 Running UGC ads');
  expect(intentTag({ ...data.brands[2], works_with_creators: true })).toBe('🎁 Works with creators');
  expect(intentTag({ ...data.brands[0], category: 'Skincare' })).toBe('✨ Fits your skincare');
});

test('two paths: autopilot with the free pitches, or pitch myself / search', () => {
  const onStart = jest.fn();
  const onBrowse = jest.fn();
  render(<PollyFirstRun data={data} firstName="Ana" onStart={onStart} onBrowse={onBrowse} pick={4} />);
  expect(screen.getByText(/Hi Ana, I'm Polly/)).toBeInTheDocument();
  expect(screen.getByText('Use your 3 free pitches on autopilot.')).toBeInTheDocument();
  expect(screen.getByText('💌 Your pick')).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Start autopilot with 3 free pitches/));
  expect(onStart).toHaveBeenCalledWith('autopilot', [4, 1, 2]);
  fireEvent.click(screen.getByText('See all my matches'));
  expect(onStart).toHaveBeenLastCalledWith('manual', [4, 1, 2, 3]);
  fireEvent.click(screen.getByText(/Looking for a specific brand/));
  expect(onBrowse).toHaveBeenCalled();
});

test('pro creators: plain autopilot copy', () => {
  render(<PollyFirstRun data={{ ...data, is_pro: true, free_left: null }} onStart={() => {}} />);
  expect(screen.getByText('Start autopilot')).toBeInTheDocument();
});

test('first name falls back to the one the server knows', () => {
  render(<PollyFirstRun data={{ ...data, first_name: 'Lina' }} onStart={() => {}} />);
  expect(screen.getByText(/Hi Lina, I'm Polly/)).toBeInTheDocument();
});

test('creators who chose to pitch themselves see their matches first, autopilot as a small option', () => {
  const onStart = jest.fn();
  render(<PollyFirstRun data={{ ...data, start_choice: 'free' }} firstName="Ana" onStart={onStart} />);
  expect(screen.getByText(/your matches are ready/i)).toBeInTheDocument();
  expect(screen.queryByText('Run it all for me')).not.toBeInTheDocument();
  expect(screen.getByText('Delta')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /pitch my matches/i }));
  expect(onStart).toHaveBeenLastCalledWith('manual', [1, 2, 3, 4]);
  fireEvent.click(screen.getByRole('button', { name: /do the full job/i }));
  expect(onStart).toHaveBeenLastCalledWith('autopilot', [1, 2, 3]);
});
