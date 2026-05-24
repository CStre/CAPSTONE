import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { HomePage } from './HomePage';
import { AuthContext } from '../../auth/context';
import type { AuthContextValue } from '../../auth/types';

const actions = {
  reload: jest.fn<() => Promise<void>>(),
  logout: jest.fn<() => Promise<void>>(),
};

function renderHome(value: AuthContextValue) {
  return render(
    <AuthContext value={value}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </AuthContext>,
  );
}

describe('HomePage', () => {
  it('shows the Next button on the first slide for visitors', () => {
    renderHome({ status: 'unauthenticated', user: null, ...actions });

    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('does not show the intro card for signed-in users', () => {
    renderHome({
      status: 'authenticated',
      user: { id: '1', email: 'ada@example.com', name: 'Ada' },
      ...actions,
    });

    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /get started/i })).not.toBeInTheDocument();
  });
});
