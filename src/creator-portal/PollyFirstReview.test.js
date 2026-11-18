import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PollyFirstReview from './PollyFirstReview';
import PollyFirstWin, { listNames } from './PollyFirstWin';

jest.mock('../config/api', () => ({ apiClient: { post: jest.fn(() => Promise.resolve({ data: { success: true } })) } }));

const batch = { items: [
  { brand_id: 1, brand_name: 'Anua', email: 'pr@anua.com', subject: 'Hi Anua', body: 'Hello Anua team', meta_ads: true },
  { brand_id: 2, brand_name: 'belif', email: 'pr@belif.com', subject: 'Hi belif', body: 'Hello belif team' },
] };
const options = [{ brand_id: 1, brand_name: 'Anua' }, { brand_id: 2, brand_name: 'belif' },
  { brand_id: 9, brand_name: 'Medicube', offer: 'paid' }];

test('approval queue: edit, swap from the drawer, approve', () => {
  const onEdit = jest.fn(() => Promise.resolve());
  const onSwap = jest.fn();
  const onApprove = jest.fn();
  render(<PollyFirstReview batch={batch} swapOptions={options} onEdit={onEdit} onSwap={onSwap}
    onApprove={onApprove} gmailConnected={false} />);
  expect(screen.getByText(/Step 1 of 2/)).toBeInTheDocument();
  expect(screen.getByText('🔥 Running UGC ads')).toBeInTheDocument();
  const box = screen.getByLabelText('Pitch to Anua');
  fireEvent.change(box, { target: { value: 'My own words' } });
  fireEvent.blur(box);
  expect(onEdit).toHaveBeenCalledWith(batch.items[0], 'My own words');
  fireEvent.click(screen.getAllByText(/Swap brand/)[1]);
  fireEvent.click(screen.getByText('Medicube'));
  expect(onSwap).toHaveBeenCalledWith(batch.items[1], options[2]);
  expect(screen.getByText(/2 of 2/)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Approve & start autopilot/));
  expect(onApprove).toHaveBeenCalled();
  expect(screen.getByText(/Next: connect Gmail/)).toBeInTheDocument();
});

test('first win and Pro card', () => {
  const onUpgrade = jest.fn();
  const onWait = jest.fn();
  expect(listNames(['A', 'B', 'C'])).toBe('A, B and C');
  render(<PollyFirstWin names={['Anua', 'Twisted Lily', 'belif']} freeLeft={0} onUpgrade={onUpgrade} onWait={onWait} />);
  expect(screen.getByText('3 pitches sent to Anua, Twisted Lily and belif!')).toBeInTheDocument();
  expect(screen.getByText('0 free pitches left')).toBeInTheDocument();
  fireEvent.click(screen.getByText(/Upgrade to Pro/));
  fireEvent.click(screen.getByText(/wait for replies on these 3 first/));
  expect(onUpgrade).toHaveBeenCalled();
  expect(onWait).toHaveBeenCalled();
});
