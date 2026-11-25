import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import KitStudioEditor from './KitStudioEditor';

jest.mock('../config/api', () => ({ __esModule: true, default: { get: jest.fn(), post: jest.fn() }, apiClient: { get: jest.fn(), post: jest.fn() }, getProxiedMediaUrl: (u) => u, getRuntimeApiUrl: () => '' }));

describe('KitStudioEditor startInPreview', () => {
  it('opens on the portfolio and edits on demand', () => {
    render(<KitStudioEditor embedded startInPreview persist={() => {}} />);
    expect(screen.getByText('This is your portfolio')).toBeInTheDocument();
    expect(screen.getByText('Done, see my portfolio')).not.toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Edit portfolio' }));
    expect(screen.getByText('Done, see my portfolio')).toBeVisible();
    expect(screen.queryByText('This is your portfolio')).toBeNull();
  });

  it('stays in edit mode by default for other uses', () => {
    render(<KitStudioEditor persist={() => {}} />);
    expect(screen.queryByText('This is your portfolio')).toBeNull();
    expect(screen.queryByText('Done, see my portfolio')).toBeNull();
  });
});
