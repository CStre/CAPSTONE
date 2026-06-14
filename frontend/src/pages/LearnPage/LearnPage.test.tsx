import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Provider } from 'urql';
import { createMockClient } from '../../test/urql';
import { LearnPage } from './LearnPage';

describe('LearnPage', () => {
  it('renders the banner, the active deck, and the progress menu', () => {
    const { client } = createMockClient();
    render(
      <Provider value={client}>
        <LearnPage />
      </Provider>,
    );

    // Hero banner.
    expect(screen.getByRole('heading', { name: 'Building Better Algorithms' })).toBeInTheDocument();
    // The active section (00) is shown — its first slide is in the deck.
    expect(screen.getByRole('heading', { name: "Why you're here" })).toBeInTheDocument();
    // The navigation/progress menu is present (8 trackable sections).
    expect(screen.getByRole('button', { name: /progress 0\/8/i })).toBeInTheDocument();
  });
});
