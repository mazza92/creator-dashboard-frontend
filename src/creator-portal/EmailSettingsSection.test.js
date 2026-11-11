import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { apiClient } from '../config/api';
import EmailSettingsSection from './EmailSettingsSection';

jest.mock('../config/api', () => ({ apiClient: { get: jest.fn(), post: jest.fn() } }));
jest.mock('antd', () => ({ message: { success: jest.fn(), error: jest.fn() } }));

beforeAll(() => { Element.prototype.scrollIntoView = jest.fn(); });

test("Polly's brief: daily / weekly (Monday only) / off, saved on tap", async () => {
  apiClient.get.mockResolvedValue({ data: { success: true, daily_brief: 'daily', timezone: 'America/New_York' } });
  apiClient.post.mockResolvedValue({ data: { success: true, daily_brief: 'weekly' } });
  render(<EmailSettingsSection focus />);
  expect(await screen.findByRole('radio', { name: /Daily/ })).toBeChecked();
  await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled());
  expect(screen.getByText(/America\/New York/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('radio', { name: /Weekly \(Monday only\)/ }));
  await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/brief/preferences', { daily_brief: 'weekly' }));
  expect(screen.getByRole('radio', { name: /Weekly/ })).toBeChecked();
  expect(screen.getByRole('radio', { name: /Off/ })).not.toBeChecked();
});

test('hidden when the API is not there yet', async () => {
  apiClient.get.mockRejectedValue(new Error('404'));
  const { container } = render(<EmailSettingsSection />);
  await waitFor(() => expect(apiClient.get).toHaveBeenCalled());
  expect(container).toBeEmptyDOMElement();
});
