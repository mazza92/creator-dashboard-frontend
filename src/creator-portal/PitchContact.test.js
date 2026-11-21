import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PitchContact, { inboxKind } from './PitchContact';

jest.mock('../config/api', () => ({
  __esModule: true,
  default: { post: () => Promise.resolve({ data: { success: true, outcome: 'alternative', email: 'collabs@varley.com', mailto: 'mailto:x' } }) },
}));

test('labels the inbox kind', () => {
  expect(inboxKind('marketing@varley.com')).toBe('team');
  expect(inboxKind('hello@smallbrand.com')).toBe('main');
  expect(inboxKind('jane.doe@brand.com')).toBe('direct');
});

test('explains a main inbox and reports a dead one, switching to the alternative', async () => {
  const changed = jest.fn();
  render(<PitchContact email="hello@varley.com" brandId={5} brandName="Varley" onChanged={changed} />);
  fireEvent.click(screen.getByRole('button', { name: /About this contact: Main inbox/ }));
  expect(screen.getByRole('tooltip')).toHaveTextContent(/doesn't list a dedicated creator or PR person/);
  fireEvent.click(screen.getByRole('button', { name: 'Not working?' }));
  fireEvent.click(screen.getByRole('button', { name: /Report it/ }));
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/collabs@varley.com/));
  expect(screen.getByText('To: collabs@varley.com')).toBeInTheDocument();
  expect(changed).toHaveBeenCalledWith('collabs@varley.com', 'mailto:x');
});
