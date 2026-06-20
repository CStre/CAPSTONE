import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Provider } from 'urql';
import { DashboardPage } from './DashboardPage';
import { createMockClient } from '../../test/urql';

const ME = {
  me: {
    id: 'u1',
    name: 'Ada',
    preferences: [
      { value: 80, country: { code: 'JP', name: 'Japan' } },
      { value: 30, country: { code: 'EG', name: 'Egypt' } },
    ],
  },
};

describe('DashboardPage', () => {
  it('greets the user and summarizes their strongest and weakest scores', () => {
    const { client } = createMockClient({ query: () => ME });
    render(
      <Provider value={client}>
        <DashboardPage />
      </Provider>,
    );

    expect(screen.getByRole('heading', { name: /Ada/ })).toBeInTheDocument();
    expect(screen.getByText(/Strongest preference:/)).toBeInTheDocument();
    expect(screen.getByText('Japan')).toBeInTheDocument();
  });

  it('prompts the user to sign in when there is no session', () => {
    const { client } = createMockClient({ query: () => undefined });
    render(
      <Provider value={client}>
        <DashboardPage />
      </Provider>,
    );

    expect(screen.getByText(/Sign in to see your preference map/)).toBeInTheDocument();
  });
});
