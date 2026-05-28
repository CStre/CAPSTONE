import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { Provider } from 'urql';
import { AccountPage } from './AccountPage';
import { AuthContext } from '../../auth/context';
import type { AuthContextValue } from '../../auth/types';
import { createMockClient } from '../../test/urql';

const authValue: AuthContextValue = {
  status: 'authenticated',
  user: {
    id: 'u1',
    email: 'ada@example.com',
    firstName: 'Ada',
    lastName: 'Lovelace',
    phone: '+15550001234',
  },
  reload: jest.fn<() => Promise<void>>(),
  logout: jest.fn<() => Promise<void>>(),
};

describe('AccountPage', () => {
  it('shows the signed-in profile and management controls', () => {
    const { client } = createMockClient();
    render(
      <AuthContext value={authValue}>
        <Provider value={client}>
          <MemoryRouter>
            <AccountPage />
          </MemoryRouter>
        </Provider>
      </AuthContext>,
    );

    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send reset code to email' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete my account' })).toBeInTheDocument();
  });
});
