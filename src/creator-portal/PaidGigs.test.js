import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaidGigs from './PaidGigs';
import { apiClient } from '../config/api';

jest.mock('../config/api', () => ({ apiClient: { get: jest.fn(), post: jest.fn() } }));

const base = { pay_label: '$250', pr_value_usd: 250, source_label: 'SideShift', source_platform: 'sideshift',
  apply_mode: 'url', posted_at: '2026-11-03T10:00:00Z', headline: 'App demo video', summary: 'One video a week.' };
const GIGS = [
  { ...base, id: 1, brand_name: 'Kettlebell Body', direct_contact: true },
  { ...base, id: 2, brand_name: 'Smudge', direct_contact: false },
];

beforeEach(() => {
  jest.clearAllMocks();
  apiClient.get.mockImplementation((url) => Promise.resolve({ data: url.endsWith('/applied')
    ? { success: true, items: [] }
    : { success: true, gigs: GIGS, is_pro: true, has_more: false, counts: {}, stats: {}, applied_count: 0 } }));
  apiClient.post.mockImplementation((url, body) => {
    if (url.endsWith('/application-draft')) {
      return Promise.resolve({ data: { success: true, draft: { subject: 'UGC for Kettlebell Body', body: 'Hi team' } } });
    }
    return Promise.resolve({ data: body?.via === 'direct'
      ? { success: true, apply_mode: 'email', apply_email: 'hi@kettlebellbody.app', external_apply_url: null }
      : { success: true, apply_mode: 'url', external_apply_url: 'https://app.sideshift.app/jobs/x' } });
  });
});

test('direct-contact gigs show the badge and email the brand directly', async () => {
  render(<PaidGigs />);
  expect(await screen.findAllByText('Direct contact')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: /Kettlebell Body/ }));
  const direct = await screen.findByRole('button', { name: /Email the brand directly/ });
  expect(screen.getByRole('button', { name: /Or apply on SideShift/ })).toBeInTheDocument();
  expect(screen.getByText('Your pitch')).toBeInTheDocument();
  await waitFor(() => expect(direct).not.toBeDisabled());
  fireEvent.click(direct);
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/opportunities/1/apply', { via: 'direct' }, expect.anything()));
  expect(await screen.findByText('Sent your pitch to the brand?')).toBeInTheDocument();
});

test('gigs without a found inbox keep the source-platform flow', async () => {
  render(<PaidGigs />);
  fireEvent.click(await screen.findByRole('button', { name: /Smudge/ }));
  expect(await screen.findByRole('button', { name: /Copy & apply on SideShift/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Email the brand directly/ })).not.toBeInTheDocument();
});
