import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { Provider } from 'urql';
import { TravelPage } from './TravelPage';
import { createMockClient } from '../../test/urql';

const PHOTOS = {
  travelImages: [
    {
      imageUrl: 'https://images.example/jp.jpg',
      attribution: 'Photo by Ada on Unsplash',
      photographerName: 'Ada',
      photographerUrl: 'https://unsplash.com/@ada',
      unsplashUrl: 'https://unsplash.com/photos/jp',
      tags: ['temple', 'forest'],
      color: '#224466',
      downloadLocation: 'https://api.unsplash.com/photos/jp/download',
      country: { code: 'JP', name: 'Japan' },
    },
    {
      imageUrl: 'https://images.example/no.jpg',
      attribution: 'Photo by Grace on Unsplash',
      photographerName: 'Grace',
      photographerUrl: 'https://unsplash.com/@grace',
      unsplashUrl: 'https://unsplash.com/photos/no',
      tags: ['mountain', 'snow'],
      color: '#88aacc',
      downloadLocation: 'https://api.unsplash.com/photos/no/download',
      country: { code: 'NO', name: 'Norway' },
    },
  ],
};

describe('TravelPage', () => {
  it('renders the active photo card', () => {
    const { client } = createMockClient({ query: () => PHOTOS });
    render(
      <Provider value={client}>
        <TravelPage />
      </Provider>,
    );
    expect(screen.getByRole('img', { name: 'Travel photo' })).toBeInTheDocument();
  });

  it('shows the driver toggle (Engagement vs User-First)', () => {
    const { client } = createMockClient({ query: () => PHOTOS });
    render(
      <Provider value={client}>
        <TravelPage />
      </Provider>,
    );
    expect(screen.getByRole('tab', { name: 'Engagement' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'User-First' })).toBeInTheDocument();
  });

  it('renders linked photographer + Unsplash attribution (UTM)', () => {
    const { client } = createMockClient({ query: () => PHOTOS });
    render(
      <Provider value={client}>
        <TravelPage />
      </Provider>,
    );
    const photographer = screen.getByRole('link', { name: 'Ada' });
    expect(photographer.getAttribute('href')).toContain('unsplash.com/@ada');
    expect(photographer.getAttribute('href')).toContain('utm_source');
    const unsplash = screen.getByRole('link', { name: 'Unsplash' });
    expect(unsplash.getAttribute('href')).toContain('utm_medium=referral');
  });

  it('does not show the submit button before the batch is rated', () => {
    const { client } = createMockClient({ query: () => PHOTOS });
    render(
      <Provider value={client}>
        <TravelPage />
      </Provider>,
    );
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
  });
});
