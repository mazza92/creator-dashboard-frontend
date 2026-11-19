import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../config/api';
import SubscriptionSuccess from './SubscriptionSuccess';

jest.mock('../config/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn(() => Promise.resolve({ data: {} })) } }));
jest.mock('../utils/subscriptionAnalytics', () => ({ trackProPurchase: jest.fn() }));

function setup(connected) {
  api.get.mockImplementation((url) => Promise.resolve({ data: url.includes('autopilot/status') ? { gmail: { connected } } : {} }));
  render(<MemoryRouter><SubscriptionSuccess /></MemoryRouter>);
}

test('Gmail already connected (from the free pitches): no second Gmail ask', async () => {
  jest.useFakeTimers();
  setup(true);
  jest.advanceTimersByTime(1100);
  jest.useRealTimers();
  expect(await screen.findByText(/Set up my autopilot/)).toBeInTheDocument();
  expect(screen.queryByText(/Connect Gmail/)).not.toBeInTheDocument();
  expect(screen.getByText(/Up to 20 brand pitches daily/)).toBeInTheDocument();
});

test('Gmail not connected: one Connect Gmail step', async () => {
  jest.useFakeTimers();
  setup(false);
  jest.advanceTimersByTime(1100);
  jest.useRealTimers();
  expect(await screen.findByText(/Connect Gmail/)).toBeInTheDocument();
  expect(screen.getByText(/I'll do it later/)).toBeInTheDocument();
});
