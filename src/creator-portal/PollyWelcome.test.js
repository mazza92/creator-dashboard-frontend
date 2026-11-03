import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PollyWelcome from './PollyWelcome';
import { apiClient } from '../config/api';

jest.mock('../config/api', () => ({ apiClient: { post: jest.fn(() => Promise.resolve({ data: { success: true } })) } }));

const facts = { niches: ['skincare', 'wellness'], niche_options: ['skincare', 'wellness', 'pet', 'fashion', 'food'], followers: 3100 };

test('one question, prefilled niches, saves and hands over', async () => {
  const onDone = jest.fn();
  render(<PollyWelcome facts={facts} firstName="Brianna" onDone={onDone} />);
  expect(screen.getByText(/Hi Brianna, I'm Polly/)).toBeInTheDocument();
  expect(screen.getByText('3.1K followers')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Skincare/ })).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(screen.getByRole('button', { name: 'Pet' }));
  expect(screen.getByRole('button', { name: 'Fashion' })).toBeDisabled(); // max 3
  fireEvent.click(screen.getByRole('button', { name: /Find my brands/ }));
  await waitFor(() => expect(onDone).toHaveBeenCalledWith(['skincare', 'wellness', 'pet']));
  expect(apiClient.post).toHaveBeenCalledWith('/api/polly/pitch-facts', { niches: ['skincare', 'wellness', 'pet'], confirm: true });
});

test('still hands over when saving fails', async () => {
  apiClient.post.mockImplementationOnce(() => Promise.reject(new Error('down')));
  const onDone = jest.fn();
  render(<PollyWelcome facts={facts} onDone={onDone} />);
  fireEvent.click(screen.getByRole('button', { name: /Find my brands/ }));
  await waitFor(() => expect(onDone).toHaveBeenCalled());
});
