import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PollyProSetup from './PollyProSetup';
import { apiClient } from '../config/api';

jest.mock('../config/api', () => ({ apiClient: { get: jest.fn(), post: jest.fn(), patch: jest.fn() } }));

const SETUP = {
  success: true,
  setup_done: false,
  step: 0,
  profile: { tone: 'brief', voice: 'preset', style_rules: [], proof_posts: ['https://www.tiktok.com/@maya/video/1'], win: '' },
  tones: [
    { id: 'brief', label: 'Brief & direct', emoji: '✂️', example: 'Quick note.' },
    { id: 'warm', label: 'Warm & relatable', emoji: '🏡', example: 'Between school runs.' },
  ],
  offer: { offer_type: 'gifted_ugc', deal: 'auto', city: 'Austin', country: 'United States',
    options: [{ id: 'gifted_post', label: '1 post' }, { id: 'gifted_ugc', label: 'Raw UGC videos' }] },
  stats: { avg_views: '14.8K', followers: 8300, engagement: 0.011, engagement_strong: false, lead_metric: '' },
  posts: [
    { post_url: 'https://www.tiktok.com/@maya/video/1', thumbnail_url: '', views: 48200 },
    { post_url: 'https://www.tiktok.com/@maya/video/2', thumbnail_url: '', views: 31400 },
  ],
  niches: ['skincare'],
  niche_options: ['skincare', 'wellness', 'home'],
  monthly_target: 60,
  gmail_connected: false,
};

const PREVIEW = {
  success: true,
  item: { id: 9, brand_id: 3, brand_name: 'Saltwell', to_email: 'hi@saltwell.co', subject: 'Video idea for Sea Mineral Cleanser',
    body: 'Hi Saltwell team,\n\nI have an idea for Sea Mineral Cleanser.\n\nWorth a try?\nMaya' },
  followups: [{ subject: 'Re: Video idea', body: 'One more idea' }, { subject: 'Re: Video idea', body: 'Last note' }],
  checks: [{ ok: true, label: 'Written for this brand\'s product' }, { ok: true, label: 'Checked send-ready' }],
};

beforeEach(() => {
  jest.clearAllMocks();
  apiClient.get.mockResolvedValue({ data: SETUP });
  apiClient.post.mockImplementation((url, body) => {
    if (url.endsWith('/setup/preview')) return Promise.resolve({ data: PREVIEW });
    if (url.endsWith('/setup/sample')) {
      return Promise.resolve({ data: { success: true, rules: ['Short sentences'], summary: 'Short and warm', example_opener: 'Love it.' } });
    }
    return Promise.resolve({ data: { ...SETUP, step: body.step || 0 } });
  });
});

const next = (name = /Continue/) => fireEvent.click(screen.getByRole('button', { name }));

test('walks the journey, saving each step, and never asks for send days', async () => {
  const onDone = jest.fn();
  render(<PollyProSetup open firstName="Maya" trialDays={7} onClose={jest.fn()} onDone={onDone} />);
  expect(await screen.findByText(/build your/)).toBeInTheDocument();
  expect(screen.getByText(/free week started/)).toBeInTheDocument();
  next(/Let's go/);

  // Voice
  fireEvent.click(await screen.findByRole('button', { name: /Warm & relatable/ }));
  next();
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/polly/autopilot/setup',
    { voice: 'preset', tone: 'warm', step: 2 }));

  // Offer
  expect(await screen.findByRole('radio', { name: 'Gifted first, paid when they pay' })).toHaveAttribute('aria-checked', 'true');
  fireEvent.click(screen.getByRole('radio', { name: '1 post' }));
  next();
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/polly/autopilot/setup',
    { deal: 'auto', offer_type: 'gifted_post', city: 'Austin', country: 'United States', step: 3 }));

  // Best work: weak engagement hidden, first post preselected, second added
  expect(await screen.findByText('Hidden')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Use post with 31K views/ }));
  next();
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/polly/autopilot/setup', {
    proof_posts: ['https://www.tiktok.com/@maya/video/1', 'https://www.tiktok.com/@maya/video/2'],
    win: '', lead_metric: 'views', step: 4,
  }));

  // Brands
  fireEvent.click(await screen.findByRole('button', { name: 'Wellness' }));
  next();
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/polly/autopilot/setup',
    { niches: ['skincare', 'wellness'], monthly_target: 60, step: 5 }));

  // First pitch: real draft, follow-ups, checks
  expect(await screen.findByText('Video idea for Sea Mineral Cleanser')).toBeInTheDocument();
  expect(screen.getByText('Checked send-ready')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Day 4 follow-up' }));
  expect(screen.getByText('One more idea')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Try another angle/ }));
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/polly/autopilot/setup/preview', { angle: 1, brand_id: 3 }));
  next(/write them all like this/);

  // Go live: Gmail, no send-day or approval choices
  expect(await screen.findByRole('button', { name: 'Connect Gmail' })).toBeInTheDocument();
  expect(screen.queryByText(/approve each/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Mon|Tue|Wed/)).not.toBeInTheDocument();
});

test('resumes where they left off and goes live once Gmail is connected', async () => {
  apiClient.get.mockResolvedValue({ data: { ...SETUP, step: 6, gmail_connected: true } });
  const onDone = jest.fn();
  render(<PollyProSetup open gmail={{ connected: true, email: 'maya@gmail.com' }} onClose={jest.fn()} onDone={onDone} />);
  fireEvent.click(await screen.findByRole('button', { name: 'Turn on Autopilot' }));
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/polly/autopilot/setup', { done: true, step: 6 }));
  expect(await screen.findByText('Autopilot is on.')).toBeInTheDocument();
  await waitFor(() => expect(onDone).toHaveBeenCalled(), { timeout: 2500 });
});

test('Write like me learns the style and saves it', async () => {
  apiClient.get.mockResolvedValue({ data: { ...SETUP, step: 1 } });
  render(<PollyProSetup open onClose={jest.fn()} onDone={jest.fn()} />);
  fireEvent.click(await screen.findByRole('button', { name: /Write like me/ }));
  fireEvent.change(screen.getByLabelText('Your writing sample'), {
    target: { value: 'honestly obsessed with how this serum layers, tried ten of these and this is the only one that works' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Learn my style' }));
  expect(await screen.findByText('Short sentences')).toBeInTheDocument();
  next();
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/polly/autopilot/setup', {
    voice: 'sample', style_rules: ['Short sentences'], style_summary: 'Short and warm', tone: 'brief', step: 2,
  }));
});

test('Preferences opens one part and saves it', async () => {
  const onClose = jest.fn();
  const onSaved = jest.fn();
  render(<PollyProSetup open section="brands" onClose={onClose} onDone={jest.fn()} onSaved={onSaved} />);
  fireEvent.click(await screen.findByRole('radio', { name: '100' }));
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(onClose).toHaveBeenCalled());
  expect(apiClient.post).toHaveBeenCalledWith('/api/polly/autopilot/setup', { niches: ['skincare'], monthly_target: 100 });
  expect(onSaved).toHaveBeenCalled();
  expect(screen.queryByText(/Step \d of/)).not.toBeInTheDocument();
});
