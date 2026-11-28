import React from 'react';
import fs from 'fs';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import VerifyCode from './VerifyCode';

const mockPosts = [];
let mockVerify = 'ok';
jest.mock('../config/api', () => ({
  __esModule: true,
  apiClient: {
    get: () => Promise.resolve({ data: { email: 'maya@example.com', email_verified: false } }),
    post: (url, body) => {
      mockPosts.push([url, body]);
      if (url === '/api/auth/email-code/verify') {
        return mockVerify === 'ok' ? Promise.resolve({ data: { success: true } })
          : Promise.reject({ response: { data: { message: 'That code isn’t right. Check the email and try again.' } } });
      }
      return Promise.resolve({ data: { success: true, retry_in: 30 } });
    },
  },
}));

const OUT = process.env.WF_OUT;
const snap = (name) => {
  if (!OUT) return;
  const css = Array.from(document.querySelectorAll('style')).map((s) => s.outerHTML).join('');
  fs.writeFileSync(`${OUT}/${name}.html`, `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${css}<style>body{margin:0}</style></head><body>${document.body.innerHTML}</body></html>`);
};

function renderPage() {
  const ctx = { setUser: jest.fn(), refreshUser: jest.fn(() => Promise.resolve()), handleLogout: jest.fn() };
  render(
    <UserContext.Provider value={ctx}>
      <MemoryRouter initialEntries={['/verify-code']}>
        <Routes>
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/onboarding" element={<div>Onboarding step 1</div>} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>,
  );
  return ctx;
}

beforeEach(() => { mockPosts.length = 0; mockVerify = 'ok'; });

test('six digits submit by themselves and open onboarding', async () => {
  const ctx = renderPage();
  expect(await screen.findByText('maya@example.com')).toBeInTheDocument();
  const input = screen.getByLabelText('Verification code');
  expect(input).toHaveAttribute('autocomplete', 'one-time-code');
  expect(input).toHaveAttribute('inputmode', 'numeric');
  snap('verify_code');
  fireEvent.change(input, { target: { value: '12 34 56' } });
  expect(await screen.findByText('Onboarding step 1')).toBeInTheDocument();
  expect(mockPosts).toContainEqual(['/api/auth/email-code/verify', { code: '123456' }]);
  expect(ctx.refreshUser).toHaveBeenCalled();
});

test('a wrong code says so and clears the field', async () => {
  mockVerify = 'wrong';
  renderPage();
  const input = await screen.findByLabelText('Verification code');
  fireEvent.change(input, { target: { value: '000000' } });
  expect(await screen.findByRole('alert')).toHaveTextContent('isn’t right');
  expect(input).toHaveValue('');
  snap('verify_code_wrong');
});

test('new code only after the countdown', async () => {
  jest.useFakeTimers();
  renderPage();
  expect(await screen.findByText(/send a new code in 30s/)).toBeInTheDocument();
  for (let i = 0; i < 30; i += 1) act(() => { jest.advanceTimersByTime(1000); });
  fireEvent.click(screen.getByText('send a new code'));
  await waitFor(() => expect(mockPosts.some(([u]) => u === '/api/auth/email-code/resend')).toBe(true));
  jest.useRealTimers();
});
