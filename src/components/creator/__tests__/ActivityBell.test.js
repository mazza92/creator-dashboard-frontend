import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ActivityBell from '../ActivityBell';

jest.mock('../../../config/api', () => ({
  __esModule: true,
  default: {
    get: () => Promise.resolve({
      data: {
        success: true,
        unread: 2,
        pulse: null,
        gigs: { new: 3 },
        items: [
          { id: 'hot-1', kind: 'hot_brands', icon: 'hot', at: new Date().toISOString(), unread: true,
            text: '2 skincare brands started running UGC ads', sub: 'Medicube, Cerave', href: '/creator/dashboard/pr-brands' },
          { id: 'view-1', kind: 'kit_view', icon: 'eye', at: new Date().toISOString(), unread: true,
            text: 'Kylie viewed your portfolio', href: '/creator/dashboard/tracker' },
        ],
      },
    }),
    post: () => Promise.resolve({ data: { success: true } }),
  },
}));

test('reports new matching gigs to the nav and lists the new notification kinds', async () => {
  const onGigs = jest.fn();
  render(<MemoryRouter><ActivityBell onGigs={onGigs} /></MemoryRouter>);
  await waitFor(() => expect(onGigs).toHaveBeenCalledWith(3));
  fireEvent.click(screen.getByRole('button', { name: /activity|notifications/i }));
  expect(await screen.findByText('2 skincare brands started running UGC ads')).toBeInTheDocument();
  expect(screen.getByText('Kylie viewed your portfolio')).toBeInTheDocument();
});
