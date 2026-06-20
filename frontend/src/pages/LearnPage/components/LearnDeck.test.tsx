import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render } from '@testing-library/react';
import { Provider } from 'urql';
import { createMockClient } from '../../../test/urql';
import { ICONS } from '../../../icons';
import type { LearnSection } from '../types';
import { LearnProgressProvider } from '../LearnProgressContext';
import { LearnDeck } from './LearnDeck';

const section: LearnSection = {
  id: 'dwell',
  number: '99',
  title: 'Dwell',
  slides: [
    {
      icon: ICONS.slidePlaceholder,
      title: 'Only Slide',
      body: 'This is a reasonably long slide body that takes a moment to type out.',
    },
  ],
};

function renderDeck() {
  const { client } = createMockClient();
  return render(
    <Provider value={client}>
      <LearnProgressProvider>
        <LearnDeck section={section} onOpenMenu={() => undefined} />
      </LearnProgressProvider>
    </Provider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
});

describe('LearnDeck slide completion', () => {
  it('completes the active slide once the typewriter finishes and reveals the check', () => {
    const { container } = renderDeck();
    expect(container.querySelector('.learn-slide-check')).toBeNull();

    // Long enough for the whole body to type out.
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(container.querySelector('.learn-slide-check')).not.toBeNull();
  });

  it('does not complete before the typewriter finishes', () => {
    const { container } = renderDeck();

    // Only a few characters in — not done yet.
    act(() => {
      jest.advanceTimersByTime(80);
    });

    expect(container.querySelector('.learn-slide-check')).toBeNull();
  });
});
