import React from 'react';
import fs from 'fs';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import WelcomeFlow, { outreachPlan } from './WelcomeFlow';

const mockPosts = [];
jest.mock('../config/api', () => ({
  __esModule: true,
  apiClient: {
    get: (url) => (url === '/api/creator/verification'
      ? Promise.resolve({ data: { status: 'checking', checks: [
        { id: 'posts', label: '12+ public posts', ok: true, detail: 'You have 48' },
        { id: 'recent', label: 'A post in the last 30 days', ok: false, detail: 'Last post 41 days ago' },
        { id: 'quality', label: 'Clear, natural videos with your face or hands on camera', ok: null, detail: 'Checked by our team' },
      ] } })
      : url === '/api/pr-crm/brands/search-suggestions'
      ? Promise.resolve({ data: { suggestions: [{ id: 99, name: 'Away', logo: null, category: 'travel' }] } })
      : Promise.resolve({ data: { options: [{ math: { reply_rate: 0.08, deal_rate: 0.32 } }], current: { amount_cents: 40000 } } })),
    post: (url, body) => {
      mockPosts.push([url, body]);
      if (url === '/api/polly/pitch/draft') {
        const name = { 1: 'Wander', 2: 'Ostrichpillow', 3: 'Taima Titanium' }[body.brand_id] || 'Brand';
        return Promise.resolve({ data: { pitch: {
          subject: `UGC collaboration for ${name}?`, email: `hello@${name.toLowerCase().replace(/ /g, '')}.com`,
          body: `Hi ${name} team,\n\nI'm Mahery, a travel content creator who shares hotel stays, travel tips and experience-led videos.\n\nI'd love to create authentic UGC for ${name}, showcasing what makes it unique for travelers.\n\nWould you be open to a collaboration?\n\nBest,\nMahery`,
        } } });
      }
      return Promise.resolve({ data: { ok: true } });
    },
  },
}));
jest.mock('../components/creator/DirectPitch', () => ({ PitchWriting: () => <div>Polly is writing</div> }));

const brands = [
  { brand_id: 1, brand_name: 'Wander', meta_ads: true, tags: ['Travel', 'Stays'],
    about: 'Wander rents design-led cabins near national parks, booked by travelers who want a quiet escape.' },
  { brand_id: 2, brand_name: 'Ostrichpillow', match_niche: 'travel', tags: ['Travel gear', 'Lifestyle'] },
  { brand_id: 3, brand_name: 'Taima Titanium', match_niche: 'travel', tags: ['Luggage', 'Outdoor'] },
  { brand_id: 4, brand_name: 'Medjet', match_niche: 'travel', tags: ['Travel', 'Safety'] },
  { brand_id: 5, brand_name: 'GlobalTravel', works_with_creators: true, tags: ['Travel'] },
  { brand_id: 6, brand_name: 'Béis', match_niche: 'travel', tags: ['Travel', 'Fashion'] },
  { brand_id: 7, brand_name: 'Calpak', match_niche: 'travel', tags: ['Luggage'] },
];
const data = { start_choice: 'matches_first', planned_total: 24, free_left: 3, niches: ['travel'], brands };

const OUT = process.env.WF_OUT;
const snap = (name) => {
  if (!OUT) return;
  const css = Array.from(document.querySelectorAll('style')).map((s) => s.outerHTML).join('');
  fs.writeFileSync(`${OUT}/wf_${name}.html`, `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${css}<style>body{margin:0}</style></head><body>${document.body.innerHTML}</body></html>`);
};

test('outreach plan math', () => {
  expect(outreachPlan(40000, 100, 0.08, 0.32)).toEqual({ deals: 4, pitches: 157, perWeek: 37, perDay: 8 });
});

test('the whole welcome stays in the flow: matches, pitch, plan, choice, manual path, $19 upgrade', async () => {
  const onTrial = jest.fn();
  const onClose = jest.fn();
  Object.assign(navigator, { clipboard: { writeText: jest.fn(() => Promise.resolve()) } });
  render(<WelcomeFlow data={data} onTrial={onTrial} onClose={onClose} />);

  expect(screen.getByText(/We found 24 brands that fit your travel content/)).toBeInTheDocument();
  expect(screen.getByText('Travel • Stays')).toBeInTheDocument();
  expect(screen.getByText('Béis')).toBeInTheDocument(); // 6 fill the screen
  expect(screen.queryByText('Calpak')).toBeNull();
  expect(screen.getByRole('button', { name: /show \+18 more brands/i })).toBeInTheDocument();
  snap('1_matches');

  fireEvent.click(screen.getByRole('button', { name: /preview my first pitch/i }));
  await screen.findByText('UGC collaboration for Wander?', { exact: false });
  snap('2_pitch');

  fireEvent.click(screen.getByRole('button', { name: /^continue/i }));
  await screen.findByText(/Let's work towards your first \$400 month/);
  expect(screen.getByText('Paid collaborations')).toBeInTheDocument();
  snap('3_goal');

  fireEvent.click(screen.getByRole('button', { name: /^continue/i }));
  await screen.findByText('How do you want to start?');
  snap('4_choose');

  fireEvent.click(screen.getByRole('button', { name: /pitch manually/i }));
  await screen.findByText('Pick 3 brands to pitch');
  expect(mockPosts).toContainEqual(['/api/subscription/start-choice', { choice: 'free' }]);
  expect(mockPosts.some(([u]) => u === '/api/tracker/goal')).toBe(false); // their signup goal stays as it is
  fireEvent.click(screen.getByText('Ostrichpillow'));
  // A brand they want that isn't in their matches: looked up inline, in the same step.
  fireEvent.change(screen.getByLabelText('Looking for a specific brand?'), { target: { value: 'Away' } });
  fireEvent.click(await screen.findByText('Away'));
  expect(screen.getByText('3 of 3 selected')).toBeInTheDocument();
  snap('5_pick');

  fireEvent.click(screen.getByRole('button', { name: /^continue$/i }));
  await screen.findByText('Review your pitch');
  await screen.findByText('UGC collaboration for Wander?', { exact: false });
  expect(screen.getByText('1 of 3')).toBeInTheDocument();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: /copy pitch/i })); });
  expect(mockPosts).toContainEqual(['/api/polly/pitch/handoff', { method: 'copy_pitch', brand_id: 1, brand_name: 'Wander' }]);
  snap('6_review');

  fireEvent.click(screen.getByRole('button', { name: /^next pitch/i }));
  fireEvent.click(screen.getByRole('button', { name: /^next pitch/i }));
  fireEvent.click(screen.getByRole('button', { name: /track my outreach/i }));
  await screen.findByText('Your outreach tracker');
  fireEvent.click(screen.getByText('Wander'));
  expect(mockPosts).toContainEqual(['/api/polly/pitch/sent-check', { brand_id: 1, brand_name: 'Wander', sent: true, method: 'copy_pitch' }]);
  expect(screen.getByText('Away')).toBeInTheDocument(); // the searched brand is pitched and tracked too
  snap('7_track');

  fireEvent.click(screen.getByRole('button', { name: /^continue/i }));
  await screen.findByText("You've used your 3 free pitches!");
  expect(screen.queryByText(/7 days free/)).toBeNull(); // manual = the $19 plan, never the free week
  snap('8_done');
  fireEvent.click(screen.getByRole('button', { name: /let polly take over · \$19\/mo/i }));
  expect(onTrial).toHaveBeenCalledWith('welcome_manual_done');
  fireEvent.click(screen.getByRole('button', { name: /keep pitching manually/i }));
  expect(onClose).toHaveBeenCalledWith('manual');
});

test('autopilot choice opens the free week', async () => {
  const onTrial = jest.fn();
  render(<WelcomeFlow data={{ ...data, start_pick: 'trial' }} onTrial={onTrial} onClose={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /start 7 days free/i }));
  await waitFor(() => expect(onTrial).toHaveBeenCalledWith('welcome_trial'));
  expect(mockPosts).toContainEqual(['/api/subscription/start-choice', { choice: 'trial' }]);
});

test('profile being verified: explore everything, sending waits, manual opens the verify step', async () => {
  mockPosts.length = 0;
  const onTrial = jest.fn();
  const onClose = jest.fn();
  render(<WelcomeFlow data={{ ...data, verified: false }} onTrial={onTrial} onClose={onClose} />);
  fireEvent.click(screen.getByText('Preview my first pitch'));
  expect(await screen.findByText(/Sending unlocks once your profile is verified/)).toBeInTheDocument();
  expect(screen.queryByText('Copy pitch')).toBeNull();
  expect(screen.getByText('Edit pitch')).toBeInTheDocument();
  snap('v_pitch');
  fireEvent.click(screen.getByText('Continue'));
  fireEvent.click(await screen.findByText('Skip for now'));
  expect(screen.getByText(/Skips the profile review/)).toBeInTheDocument();
  expect(screen.getByText(/Skip the wait · \$19\/mo/)).toBeInTheDocument();
  expect(screen.queryByText(/7 days free/)).toBeNull();
  expect(screen.getByText('Unlocks once your profile is verified.')).toBeInTheDocument();
  snap('v_choose');
  fireEvent.click(screen.getByText(/pitch manually/));
  expect(await screen.findByText('We’re checking your profile')).toBeInTheDocument();
  expect(await screen.findByText('Last post 41 days ago')).toBeInTheDocument();
  expect(mockPosts.some(([url]) => url === '/api/subscription/start-choice')).toBe(false);
  snap('v_verify');
  fireEvent.click(screen.getByText('Skip the wait · $19/mo'));
  await waitFor(() => expect(onTrial).toHaveBeenCalledWith('welcome_trial'));
  expect(mockPosts.some(([url, body]) => url === '/api/subscription/start-choice' && body.choice === 'trial')).toBe(true);
});

test('back after verification: opens on "You\'re verified", then how to start, normal offers', async () => {
  mockPosts.length = 0;
  const onTrial = jest.fn();
  render(<WelcomeFlow data={{ ...data, verified: true, back_verified: true }} onTrial={onTrial} onClose={() => {}} />);
  expect(screen.getByText(/You.re verified/)).toBeInTheDocument();
  expect(screen.getByText(/Sending is unlocked/)).toBeInTheDocument();
  expect(screen.getByText('Wander')).toBeInTheDocument();
  expect(screen.queryByLabelText('Back')).toBeNull();
  snap('back_verified');
  fireEvent.click(screen.getByText('Choose how to start'));
  expect(screen.getByText('How do you want to start?')).toBeInTheDocument();
  expect(screen.getByText(/Get 3 free pitches/)).toBeInTheDocument();
  expect(screen.queryByText(/Unlocks once your profile is verified/)).toBeNull();
  fireEvent.click(screen.getByLabelText('Back'));
  expect(screen.getByText(/You.re verified/)).toBeInTheDocument();
});

test('matches: tapping a brand opens its quick description, tapping again closes it', () => {
  render(<WelcomeFlow data={data} onTrial={() => {}} onClose={() => {}} />);
  const row = screen.getByRole('button', { name: /Wander/ });
  expect(row).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText(/design-led cabins/)).toBeNull();
  fireEvent.click(row);
  expect(row).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText(/design-led cabins/)).toBeInTheDocument();
  snap('matches_open');
  fireEvent.click(row);
  expect(screen.queryByText(/design-led cabins/)).toBeNull();
});

