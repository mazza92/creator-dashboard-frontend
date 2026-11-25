import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SentCheck from './SentCheck';
import { apiClient } from '../config/api';

jest.mock('../config/api', () => ({ apiClient: { post: jest.fn(() => Promise.resolve({ data: { success: true } })) } }));

test('yes logs the send and says what happens next', async () => {
  const onAnswered = jest.fn();
  render(<SentCheck brandId={5} brandName="Glow" method="copy_pitch" onAnswered={onAnswered} />);
  fireEvent.click(screen.getByRole('button', { name: 'Yes, sent' }));
  expect(await screen.findByText(/check on day 4 whether Glow replied/)).toBeInTheDocument();
  expect(apiClient.post).toHaveBeenCalledWith('/api/polly/pitch/sent-check',
    { brand_id: 5, brand_name: 'Glow', sent: true, method: 'copy_pitch' });
  expect(onAnswered).toHaveBeenCalledWith(true);
});

test('not yet keeps it a draft', async () => {
  render(<SentCheck brandId={5} brandName="Glow" method="open_email" />);
  fireEvent.click(screen.getByRole('button', { name: 'Not yet' }));
  expect(await screen.findByText(/saved here/)).toBeInTheDocument();
  await waitFor(() => expect(apiClient.post).toHaveBeenLastCalledWith('/api/polly/pitch/sent-check',
    expect.objectContaining({ sent: false })));
});

test('send email counts as sent straight away, with undo', async () => {
  apiClient.post.mockClear();
  render(<SentCheck brandId={7} brandName="HEVA" method="open_email" logged />);
  expect(screen.getByText(/Logged as sent on Timeline/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Yes, sent' })).not.toBeInTheDocument();
  expect(apiClient.post).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
  expect(await screen.findByText(/saved here as a draft/)).toBeInTheDocument();
  expect(apiClient.post).toHaveBeenCalledWith('/api/polly/pitch/sent-check',
    { brand_id: 7, brand_name: 'HEVA', sent: false, method: 'open_email' });
});
