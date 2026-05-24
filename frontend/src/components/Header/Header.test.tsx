import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { Header } from './Header';
import { AuthContext } from '../../auth/context';
import type { AuthContextValue } from '../../auth/types';

const actions = {
  reload: jest.fn<() => Promise<void>>(),
  logout: jest.fn<() => Promise<void>>(),
};

function renderHeader(value: AuthContextValue) {
  return render(
    <AuthContext value={value}>
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    </AuthContext>,
  );
}

describe('Header', () => {
  it('shows a sign-in link when unauthenticated', () => {
    renderHeader({ status: 'unauthenticated', user: null, ...actions });

    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument();
  });

  it('shows the member links and sign-out when authenticated', () => {
    renderHeader({
      status: 'authenticated',
      user: { id: '1', email: 'traveler@example.com', name: 'Traveler' },
      ...actions,
    });

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });
});
