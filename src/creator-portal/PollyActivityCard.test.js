import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PollyActivityCard, { ago } from './PollyActivityCard';

const now = Date.now();
const iso = (mins) => new Date(now - mins * 60000).toISOString();
const activity = {
  counts: { sent: 3, kit_views: 1, followups: 1, replies: 0 },
  month: { pitches: 3, goal: 10 },
  items: [
    { type: 'kit_view', brand_id: 1, brand_name: 'Saltwell', text: 'opened your media kit', at: iso(120),
      chip: { id: 'checkin_replied', label: 'They replied', action: 'task_act', brand_id: 1 } },
    { type: 'followup_sent', brand_id: 2, brand_name: 'Lumi', text: 'I followed up (day 4), same thread', at: iso(600),
      gmail_url: 'https://mail.google.com/mail/#all/t2' },
    { type: 'next', brand_id: 3, brand_name: 'Kindle', text: 'I follow up tomorrow, nothing for you to do' },
    { type: 'todo_followup', brand_id: 9, brand_name: 'Acure', text: 'no reply yet',
      chip: { id: 'draft_followup', label: 'Write follow-up', action: 'generate_pitch', brand_id: 9 } },
  ],
};

test('shows proof first, then what needs the creator, with actions', () => {
  const onChip = jest.fn();
  render(<PollyActivityCard activity={activity} onChip={onChip} />);
  expect(screen.getByText('3 sent')).toBeInTheDocument();
  expect(screen.getByText('1 kit view')).toBeInTheDocument();
  expect(screen.getByText('Needs you')).toBeInTheDocument();
  expect(screen.getByText('2h ago')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /View in Gmail/ })).toHaveAttribute('href', 'https://mail.google.com/mail/#all/t2');
  fireEvent.click(screen.getByRole('button', { name: 'Write follow-up' }));
  expect(onChip).toHaveBeenCalledWith(activity.items[3].chip);
  expect(screen.getByText('3 of 10 pitches sent')).toBeInTheDocument();
});

test('relative times', () => {
  expect(ago(iso(0.2))).toBe('just now');
  expect(ago(iso(30))).toBe('30 min ago');
  expect(ago(iso(60 * 26))).toBe('1d ago');
});

test('nothing to show renders nothing', () => {
  const { container } = render(<PollyActivityCard activity={{ items: [] }} />);
  expect(container).toBeEmptyDOMElement();
});
