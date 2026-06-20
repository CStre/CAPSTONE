import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Provider } from 'urql';
import { AuthContext } from '../../../auth/context';
import type { AuthContextValue } from '../../../auth/types';
import { createMockClient } from '../../../test/urql';
import { LearnProgressProvider } from '../LearnProgressContext';
import { LearnProgressMenu } from './LearnProgressMenu';

const authed = { status: 'authenticated' } as unknown as AuthContextValue;
const noop = (): void => {
  /* no-op */
};

describe('LearnProgressMenu', () => {
  it('lists sections and shows synced progress for authenticated users', () => {
    const { client } = createMockClient({
      query: () => ({ me: { id: 'u1', learnProgress: [] } }),
    });
    render(
      <Provider value={client}>
        <AuthContext.Provider value={authed}>
          <LearnProgressProvider>
            <LearnProgressMenu activeSectionId="orientation" onSelect={noop} open setOpen={noop} />
          </LearnProgressProvider>
        </AuthContext.Provider>
      </Provider>,
    );

    expect(screen.getByRole('button', { name: /progress 0\/9/i })).toBeInTheDocument();
    // Short, fully-visible labels in the menu.
    expect(screen.getByRole('menuitem', { name: /how they work/i })).toBeInTheDocument();
    // No sign-in prompt when authenticated.
    expect(screen.queryByText(/sign in to save/i)).not.toBeInTheDocument();
  });

  it('still renders for anonymous users with a sign-in prompt', () => {
    const { client } = createMockClient();
    const onSelect = jest.fn();
    render(
      <Provider value={client}>
        <LearnProgressProvider>
          <LearnProgressMenu
            activeSectionId="orientation"
            onSelect={onSelect}
            open
            setOpen={noop}
          />
        </LearnProgressProvider>
      </Provider>,
    );

    expect(screen.getByRole('button', { name: /progress 0\/9/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in to save/i)).toBeInTheDocument();
    // Sections are still navigable (short label).
    expect(screen.getByRole('menuitem', { name: /orientation/i })).toBeInTheDocument();
  });
});
