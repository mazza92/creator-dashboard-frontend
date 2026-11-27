import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KitStudioEditor from './KitStudioEditor';

jest.mock('../config/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() }, apiClient: { get: jest.fn(), post: jest.fn() }, getProxiedMediaUrl: (u) => u, getRuntimeApiUrl: () => '' }));

describe('KitStudioEditor startInPreview', () => {
  it('opens on the portfolio and edits on demand', async () => {
    render(<KitStudioEditor embedded startInPreview persist={() => {}} />);
    // No "This is your portfolio / Edit portfolio" band: the Edit / Preview switch opens the editor.
    expect(screen.queryByText('This is your portfolio')).toBeNull();
    expect(screen.getByText('Done, see my portfolio')).not.toBeVisible();
    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));  // the Edit / Preview / Save bar
    await waitFor(() => expect(screen.getByText('Done, see my portfolio')).toBeVisible());
  });

  it('stays in edit mode by default for other uses', () => {
    render(<KitStudioEditor persist={() => {}} />);
    expect(screen.queryByText('This is your portfolio')).toBeNull();
    expect(screen.queryByText('Done, see my portfolio')).toBeNull();
  });
});
