import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DirectPitch, { PitchWriting } from './DirectPitch';

jest.mock('../../config/api', () => ({
  __esModule: true,
  default: { get: () => Promise.resolve({ data: { trial_days: 7 } }) },
}));

const noop = () => {};
const base = {
  brandName: 'Maison Louis Marie', subject: 'Video idea', body: 'Hi team,\n\nNo fee.', onSubject: noop, onBody: noop,
  mailtoHref: 'mailto:pr@mlm.com', onSendEmail: noop,
};

describe('DirectPitch', () => {
  it('moves through live status lines while Polly writes', () => {
    jest.useFakeTimers();
    render(<PitchWriting brandName="Maison Louis Marie" />);
    expect(screen.getByText('Reading Maison Louis Marie…')).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(1700); });
    expect(screen.getByText('Looking at your 3 posts…')).toBeInTheDocument();
    act(() => { jest.advanceTimersByTime(60000); });
    expect(screen.getByText('Polishing the last lines…')).toBeInTheDocument();
    jest.useRealTimers();
  });

  it('shows the pitch with one full-width Send email, and Autopilot for free creators', () => {
    const onSendEmail = jest.fn();
    render(<DirectPitch {...base} isFree onSendEmail={onSendEmail}
      draft={{ status: 'ready', pitch: { email: 'pr@mlm.com' }, gmail: false }} />);
    expect(screen.getByText('pr@mlm.com')).toBeInTheDocument();
    const send = screen.getByText('Send email');
    expect(send.closest('a')).toHaveAttribute('href', 'mailto:pr@mlm.com');
    fireEvent.click(send);
    expect(onSendEmail).toHaveBeenCalled();
    expect(screen.getByText('Let Autopilot send pitches like this')).toBeInTheDocument();
  });

  it('Gmail-connected: Gmail send first; nothing sends while the pitch is still streaming', () => {
    const onSendGmail = jest.fn();
    render(<DirectPitch {...base} streaming onSendGmail={onSendGmail}
      draft={{ status: 'ready', pitch: { email: 'pr@mlm.com' }, gmail: true }} />);
    expect(screen.getByText('Send from my Gmail').closest('button')).toBeDisabled();
    expect(screen.queryByText('Edit')).toBeNull();
  });

  it('Edit opens the subject and message fields', () => {
    const onBody = jest.fn();
    render(<DirectPitch {...base} onBody={onBody} draft={{ status: 'ready', pitch: { email: 'pr@mlm.com' } }} />);
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'New text' } });
    expect(onBody).toHaveBeenCalledWith('New text');
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('cold brand: Polly says why, offers better bets and both choices', () => {
    const onWriteAnyway = jest.fn();
    render(<DirectPitch {...base} onWriteAnyway={onWriteAnyway} onPickAnother={noop}
      draft={{ status: 'cold', message: '**MLM** answered 1 of 40 creators.', alternatives: [{ name: 'Phlur' }] }} />);
    expect(screen.getByText('MLM answered 1 of 40 creators.')).toBeInTheDocument();
    expect(screen.getByText('Better bets right now: Phlur.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Write it anyway'));
    expect(onWriteAnyway).toHaveBeenCalled();
  });

  it('profile being verified: the pitch reads and edits, sending waits, skip the wait offered', async () => {
    const onSkipReview = jest.fn();
    render(<MemoryRouter><DirectPitch {...base} onSkipReview={onSkipReview}
      draft={{ status: 'ready', pitch: { email: '', mailto: null, locked: 'verification' } }} /></MemoryRouter>);
    expect(screen.getByText('Sending unlocks once your profile is verified')).toBeInTheDocument();
    expect(screen.queryByText('Send email')).toBeNull();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Skip the wait · $19/mo'));
    expect(onSkipReview).toHaveBeenCalled();
  });
});
