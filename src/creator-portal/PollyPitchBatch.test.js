import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PitchBatchCard from './PollyPitchBatch';

const items = [
  { brand_id: 1, brand_name: 'Glow', email: 'pr@glow.com', subject: 'Idea for Glow', body: 'Hi Glow', mailto: 'mailto:pr@glow.com' },
  { brand_id: 2, brand_name: 'Sol', email: 'pr@sol.com', subject: 'Idea for Sol', body: 'Hi Sol', mailto: 'mailto:pr@sol.com' },
];

function setup(extra = {}) {
  const props = {
    batch: { items }, available: true, gmailConnected: false, sending: false, disabled: false,
    onSend: jest.fn(), onConnect: jest.fn(), onOpenMail: jest.fn(() => Promise.resolve(true)), onCopy: jest.fn(), free: true,
    ...extra,
  };
  render(<PitchBatchCard {...props} />);
  return props;
}

test('one tap connects Gmail and sends, with what happens next', () => {
  const p = setup();
  expect(screen.getByText('Your 2 free pitches')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Connect Gmail & send all 2' }));
  expect(p.onConnect).toHaveBeenCalled();
  expect(screen.getByText(/follow up on day 4 and day 10/)).toBeInTheDocument();
});

test('not on Gmail: send them myself opens each in the mail app', async () => {
  const p = setup();
  fireEvent.click(screen.getByRole('button', { name: /Send them myself/ }));
  expect(screen.queryByRole('button', { name: /Connect Gmail/ })).toBeNull();
  fireEvent.click(screen.getAllByRole('button', { name: 'Open email' })[0]);
  expect(p.onOpenMail).toHaveBeenCalledWith(items[0]);
  await waitFor(() => expect(screen.getAllByText('Sent').length).toBe(1));
  fireEvent.click(screen.getByRole('button', { name: 'Copy pitch' }));
  expect(p.onCopy).toHaveBeenCalledWith(items[1]);
  fireEvent.click(screen.getByRole('button', { name: /Back to one-tap sending/ }));
  expect(screen.getByRole('button', { name: 'Connect Gmail & send' })).toBeInTheDocument();
});

test('connected Gmail sends directly', () => {
  const p = setup({ gmailConnected: true, free: false });
  expect(screen.getByText('2 pitches, written for you')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Send all 2 from my Gmail' }));
  expect(p.onSend).toHaveBeenCalled();
});

test('without Gmail sending available it is send-it-myself only', () => {
  setup({ available: false });
  expect(screen.queryByRole('button', { name: /Gmail/ })).toBeNull();
  expect(screen.getAllByRole('button', { name: 'Open email' })).toHaveLength(2);
});

test('sent pitches show a delivery receipt with a Gmail link', () => {
  const sent = items.map((i) => ({ ...i, status: 'sent', sent_at: '2026-11-10T10:42:00Z', to: i.email,
    gmail_url: `https://mail.google.com/mail/#all/${i.brand_id}` }));
  setup({ batch: { items: sent }, gmailConnected: true });
  expect(screen.getAllByText(/Delivered/)).toHaveLength(2);
  expect(screen.getAllByRole('link', { name: /View in Gmail/ })[0]).toHaveAttribute('href', 'https://mail.google.com/mail/#all/1');
  expect(screen.getByText(/All sent/)).toBeInTheDocument();
});

test('while sending, each row says Sending', () => {
  setup({ gmailConnected: true, sending: true });
  expect(screen.getAllByText('Sending…')).toHaveLength(3); // two rows + the button
});
