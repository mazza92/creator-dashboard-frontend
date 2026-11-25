import React from 'react';
import { render, screen } from '@testing-library/react';
import UpgradeModal from './UpgradeModal';
import { UserContext } from '../contexts/UserContext';

jest.mock('../config/api', () => {
  const get = jest.fn(() => Promise.resolve({ data: { trial_days: 7 } }));
  const post = jest.fn(() => Promise.resolve({ data: {} }));
  return { __esModule: true, default: { get, post }, apiClient: { get, post } };
});
// eslint-disable-next-line global-require
const api = require('../config/api').default;

test('directory creators get the directory paywall: 500 unlocks for $19/mo, no Polly, no free week', () => {
  render(
    <UserContext.Provider value={{ user: { role: 'creator', approval_status: 'rejected' } }}>
      <UpgradeModal isOpen onClose={() => {}} feature="unlock_paywall" unlockRemaining={0} />
    </UserContext.Provider>,
  );
  expect(screen.getByText('500 brand unlocks a month')).toBeInTheDocument();
  expect(screen.getByText('$19/mo')).toBeInTheDocument();
  expect(screen.getByText('Your free unlocks are used up')).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(/Polly|autopilot|free week|free for 7 days|yearly/i);
  // Polly APIs return 403 for directory creators: the paywall must not call them.
  expect(api.get.mock.calls.map(([url]) => url).filter((u) => u.includes('/api/polly') || u.includes('trial-offer'))).toEqual([]);
});
