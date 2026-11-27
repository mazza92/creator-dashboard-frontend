import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Waitlist, { GOOD_UGC } from './Waitlist';
import { UserContext } from '../contexts/UserContext';

const STATUS = {
  status: 'pending', first_name: 'Liv', email_masked: 'liv***@gmail.com', applied_at: new Date().toISOString(),
  queue_position: 640, estimated_wait_days: 32, can_skip_with_pro: true,
  post_nudge: { latest_post_days_ago: 41, max_days: 30 },
};

jest.mock('../config/api', () => {
  const get = jest.fn();
  const post = jest.fn(() => Promise.resolve({ data: {} }));
  return { __esModule: true, default: { get, post } };
});
jest.mock('./UpgradeModal', () => ({ isOpen, feature }) => (isOpen ? <div>checkout:{feature}</div> : null));
jest.mock('../components/TikTokVideo', () => () => null);
jest.mock('./PromoteVisuals', () => ({ BRAND_ICON: '/icon.png' }));
// eslint-disable-next-line global-require
const api = require('../config/api').default;

function renderPage(status = STATUS) {
  api.get.mockImplementation((url) => Promise.resolve({
    data: url.includes('showcase') ? { gigs: [{ brand: 'Lemora', title: 'Grocery app UGC', pay: '$400', regions: ['US'] }] } : status,
  }));
  return render(<UserContext.Provider value={{ handleLogout: jest.fn() }}><Waitlist /></UserContext.Provider>);
}

test('shows a review tracker, never a queue number or day count', async () => {
  renderPage();
  expect(await screen.findByText(/verifying your profile/)).toBeInTheDocument();
  expect(screen.getByText('Liv')).toBeInTheDocument();
  expect(screen.getByText(/Sending unlocks once your profile is verified/)).toBeInTheDocument();
  expect(screen.queryByText(/24 hours/)).not.toBeInTheDocument();
  expect(screen.getByText('Explore my brands')).toHaveAttribute('href', '/creator/dashboard/for-you');
  expect(screen.getByText('liv***@gmail.com')).toBeInTheDocument();
  expect(screen.getAllByText('Profile check').length).toBeGreaterThan(0);
  expect(screen.getByText('In review')).toBeInTheDocument();
  expect(screen.queryByText(/#640/)).not.toBeInTheDocument();
  expect(screen.queryByText(/32 days/)).not.toBeInTheDocument();
  expect(screen.getByText(/your last post was 41 days ago/)).toBeInTheDocument();
  expect(screen.getByText('Content brands say yes to')).toBeInTheDocument();
  // rendered twice (mobile slot + desktop slot), one hidden by CSS per breakpoint
  expect(screen.getAllByText(/^@/)).toHaveLength(GOOD_UGC.length * 2);
  expect(await screen.findByText('$400')).toBeInTheDocument();
});

test('skip the line opens checkout', async () => {
  renderPage();
  fireEvent.click(await screen.findByRole('button', { name: /Skip the line & start today/ }));
  await waitFor(() => expect(screen.getByText('checkout:waitlist_skip')).toBeInTheDocument());
});

test('rejected profiles see the reason and can still get in with Pro', async () => {
  renderPage({ ...STATUS, status: 'rejected', rejection_reason: 'No posts in the last 30 days.', post_nudge: null });
  expect(await screen.findByText(/isn’t ready for outreach yet/)).toBeInTheDocument();
  expect(screen.getByText('No posts in the last 30 days.')).toBeInTheDocument();
  expect(screen.queryByText('Your application')).not.toBeInTheDocument();
  expect(screen.getByText(/SKIP THE REVIEW/)).toBeInTheDocument();
});
