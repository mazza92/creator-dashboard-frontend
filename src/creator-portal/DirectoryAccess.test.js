import React from 'react';
import fs from 'fs';
import path from 'path';
import { render, screen, fireEvent } from '@testing-library/react';
import DirectoryAccess, { DIRECTORY_STATUS_LINE } from './DirectoryAccess';
import { UserContext } from '../contexts/UserContext';
import { directoryUnlockCounter } from '../config/proOffer';

jest.mock('../config/api', () => {
  const get = jest.fn();
  const post = jest.fn(() => Promise.resolve({ data: {} }));
  return { __esModule: true, default: { get, post }, apiClient: { get, post } };
});
jest.mock('../cra-pages/UnifiedBrandDirectory', () => ({
  __esModule: true,
  default: ({ directoryMode }) => <div>directory:{directoryMode ? 'slim' : 'full'}</div>,
}));
jest.mock('./UpgradeModal', () => ({
  __esModule: true,
  default: ({ isOpen, directory }) => (isOpen ? <div>upgrade:{directory ? 'directory' : 'polly'}</div> : null),
}));
// eslint-disable-next-line global-require
const api = require('../config/api').default;

function renderPage(balance) {
  api.get.mockImplementation((url) => Promise.resolve({
    data: url.includes('unlocks/balance') ? balance : { status: 'pending' },
  }));
  return render(
    <UserContext.Provider value={{ user: { role: 'creator', approval_status: 'pending' }, handleLogout: jest.fn(), refreshUser: jest.fn() }}>
      <DirectoryAccess />
    </UserContext.Provider>,
  );
}

const FREE = { tier: 'free', access: 'directory', remaining: 7, used: 3, limit: 10, period: 'total', is_unlimited: false };
const PRO = { tier: 'pro', access: 'directory', remaining: 432, used: 68, limit: 500, period: 'month', is_unlimited: false };

test('free directory creators see a lifetime counter and an Upgrade button', async () => {
  renderPage(FREE);
  expect(await screen.findByText('7 of 10 free unlocks left')).toBeInTheDocument();
  expect(screen.getByText(DIRECTORY_STATUS_LINE)).toBeInTheDocument();
  expect(await screen.findByText('directory:slim')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Upgrade' }));
  expect(screen.getByText('upgrade:directory')).toBeInTheDocument();
});

test('Pro directory creators see a monthly counter and no Upgrade button', async () => {
  renderPage(PRO);
  expect(await screen.findByText('432 of 500 unlocks left this month')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Upgrade' })).not.toBeInTheDocument();
});

test('counter copy: free is a total, Pro is per month', () => {
  expect(directoryUnlockCounter(FREE)).toBe('7 of 10 free unlocks left');
  expect(directoryUnlockCounter({ ...FREE, remaining: 0, used: 10 })).toBe('0 of 10 free unlocks left');
  expect(directoryUnlockCounter(PRO)).toBe('432 of 500 unlocks left this month');
  expect(directoryUnlockCounter({ tier: 'pro', remaining: 500 })).toBe('500 of 500 unlocks left this month');
  expect(directoryUnlockCounter({ tier: 'free', used: 2 })).toBe('8 of 10 free unlocks left');
});

test('the status line has no em-dash and no waitlist promise', () => {
  expect(DIRECTORY_STATUS_LINE).not.toMatch(/—/);
  expect(DIRECTORY_STATUS_LINE).not.toMatch(/waitlist|skip/i);
});

test('no "Skip the line" copy remains anywhere in src', () => {
  const phrase = new RegExp(['skip', 'the', 'line'].join('\\s+'), 'i');
  const root = path.join(__dirname, '..');
  const hits = [];
  const walk = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules') walk(full);
      } else if (/\.(js|jsx|ts|tsx|json|md|html)$/.test(entry.name) && full !== __filename) {
        if (phrase.test(fs.readFileSync(full, 'utf8'))) hits.push(path.relative(root, full));
      }
    });
  };
  walk(root);
  expect(hits).toEqual([]);
});
