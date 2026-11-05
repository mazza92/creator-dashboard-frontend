import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PollySentCard from './PollySentCard';

const summary = {
  from: 'maya@gmail.com',
  sent: [
    { brand_id: 1, brand_name: 'HyperX', to: 'sponsorships@hyperx.com', gmail_url: 'https://mail.google.com/mail/#all/t1' },
    { brand_id: 2, brand_name: '2XU', to: 'pr@2xu.com', gmail_url: 'https://mail.google.com/mail/#all/t2' },
  ],
  followups: ['2026-11-09T17:00:00Z', '2026-11-15T17:00:00Z'],
  rates: '$50–$100 a video, $150–$250 for a 3-pack',
  rates_saved: false,
  pro_offer: true,
};

test('the win: what went out, what happens next, one offer', () => {
  const onChip = jest.fn();
  render(<PollySentCard summary={summary} onChip={onChip} />);
  expect(screen.getByText('2 pitches sent')).toBeInTheDocument();
  expect(screen.getByText('from maya@gmail.com')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /View/ })).toHaveLength(2);
  expect(screen.getByText(/land straight in your Gmail inbox/)).toBeInTheDocument();
  expect(screen.getByText(/I follow up with anyone/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add to my kit' }));
  expect(onChip).toHaveBeenCalledWith(expect.objectContaining({ action: 'save_rates' }));
  fireEvent.click(screen.getByRole('button', { name: /Keep pitching for me/ }));
  expect(onChip).toHaveBeenLastCalledWith(expect.objectContaining({ action: 'unlock_pro' }));
});

test('Pro creators get no offer', () => {
  render(<PollySentCard summary={{ ...summary, pro_offer: false, rates_saved: true }} />);
  expect(screen.queryByRole('button', { name: /Keep pitching/ })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Add to my kit' })).toBeNull();
});
