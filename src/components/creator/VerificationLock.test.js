import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import VerificationLock, { useOutreachLocked } from './VerificationLock';

jest.mock('../../config/api', () => ({ __esModule: true, default: { get: () => Promise.resolve({ data: {} }) } }));

function Probe() {
  return <span>{useOutreachLocked() ? 'locked' : 'open'}</span>;
}
const withUser = (user) => render(<UserContext.Provider value={{ user }}><Probe /></UserContext.Provider>);

test('outreach is locked only while the profile is being verified', () => {
  withUser({ approval_status: 'pending' });
  expect(screen.getByText('locked')).toBeInTheDocument();
});
test('rejected (not ready yet) is locked too', () => {
  withUser({ approval_status: 'rejected' });
  expect(screen.getByText('locked')).toBeInTheDocument();
});
test('approved and paid-to-skip creators are open', () => {
  withUser({ approval_status: 'pro_approved' });
  expect(screen.getByText('open')).toBeInTheDocument();
});
test('no user context: open (server still enforces)', () => {
  render(<Probe />);
  expect(screen.getByText('open')).toBeInTheDocument();
});
test('gifting lock: its own title, $19 skip, no free week', () => {
  render(<MemoryRouter><VerificationLock title="Gifting applications unlock once your profile is verified" onSkip={() => {}} /></MemoryRouter>);
  expect(screen.getByText('Gifting applications unlock once your profile is verified')).toBeInTheDocument();
  expect(screen.getByText('Skip the wait · $19/mo')).toBeInTheDocument();
  expect(screen.queryByText(/days free/)).toBeNull();
});
