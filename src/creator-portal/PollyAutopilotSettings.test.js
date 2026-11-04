import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AutopilotSettings } from './PollyAutopilot';

jest.mock('../config/api', () => ({ apiClient: { get: jest.fn(), post: jest.fn(() => Promise.resolve({ data: {} })) } }));
jest.mock('../utils/trialOffer', () => ({ useTrialDays: () => 0 }));

const STATE = {
  success: true, is_pro: true, enabled: true, monthly_target: 60, deal_focus: 'auto', followups: 2,
  gmail: { connected: true, email: 'maya@gmail.com' }, month: { sent: 18, followups: 7, replied: 2 },
  pitch_prefs: { offer_type: 'gifted_ugc' }, targeting: { niches: ['skincare', 'wellness'] },
  setup: { done: true, step: 6, style: '✂️ Brief & direct', posts: 2 },
};

test('settings mirror the pitch style setup, with no send days or never-pitch lists', () => {
  const onOpenSetup = jest.fn();
  render(<AutopilotSettings isOpen state={STATE} setState={jest.fn()} onClose={jest.fn()} onOpenSetup={onOpenSetup} />);
  expect(screen.getByText('✂️ Brief & direct')).toBeInTheDocument();
  expect(screen.getByText('Gifted first, paid when they pay · Gifted + UGC')).toBeInTheDocument();
  expect(screen.getByText('2 posts + your stats')).toBeInTheDocument();
  expect(screen.getByText('Skincare, Wellness · 60 a month')).toBeInTheDocument();
  expect(screen.queryByText('Send days')).not.toBeInTheDocument();
  expect(screen.queryByText('Never pitch')).not.toBeInTheDocument();
  expect(screen.queryByText('Tone')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Edit offer' }));
  expect(onOpenSetup).toHaveBeenCalledWith('offer');
});

test('unfinished setup offers to finish it; an own template can be cleared', () => {
  const onOpenSetup = jest.fn();
  const state = { ...STATE, setup: { done: false, step: 2, style: '✂️ Brief & direct', posts: 0 },
    pitch_prefs: { custom_template: 'Hi {{brand}} team' } };
  render(<AutopilotSettings isOpen state={state} setState={jest.fn()} onClose={jest.fn()} onOpenSetup={onOpenSetup} />);
  fireEvent.click(screen.getByRole('button', { name: 'Finish setup' }));
  expect(onOpenSetup).toHaveBeenCalledWith(null);
  expect(screen.getByRole('button', { name: "Use Polly's pitches instead" })).toBeInTheDocument();
});
