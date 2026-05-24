import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Provider } from 'urql';
import { TravelPage } from './TravelPage';
import { createMockClient } from '../../test/urql';

const PHOTOS = {
  travelImages: [
    {
      imageUrl: 'https://images.example/jp.jpg',
      attribution: 'Photo by Ada',
      country: { code: 'JP', name: 'Japan' },
    },
    {
      imageUrl: 'https://images.example/no.jpg',
      attribution: 'Photo by Grace',
      country: { code: 'NO', name: 'Norway' },
    },
  ],
};

describe('TravelPage', () => {
  it('renders photo cards for the batch', () => {
    const { client } = createMockClient({ query: () => PHOTOS });
    render(
      <Provider value={client}>
        <TravelPage />
      </Provider>,
    );

    // Photos are rendered as articles with travel-card-photo images
    const imgs = screen.getAllByRole('img', { name: 'Travel photo' });
    expect(imgs.length).toBeGreaterThanOrEqual(1);
  });

  it('does not show the submit button before all photos are swiped', () => {
    const { client } = createMockClient({ query: () => PHOTOS });
    render(
      <Provider value={client}>
        <TravelPage />
      </Provider>,
    );

    // Submit only appears after all cards have been swiped
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
  });
});
