import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'urql';
import { TravelPage } from './TravelPage';
import { createMockClient } from '../../test/urql';

// jsdom does not implement IntersectionObserver — provide a no-op stub.
beforeEach(() => {
  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })),
  });
});

// 16 photos = 2 full sections (4 cols × 2 rows each).
function makePhotos(count = 16) {
  return Array.from({ length: count }, (_, i) => ({
    imageUrl: `https://images.example/${i}.jpg`,
    attribution: `Photo by Photographer${i} on Unsplash`,
    photographerName: `Photographer${i}`,
    photographerUrl: `https://unsplash.com/@p${i}`,
    unsplashUrl: `https://unsplash.com/photos/${i}`,
    tags: ['nature'],
    color: '#334455',
    downloadLocation: `https://api.unsplash.com/photos/${i}/download`,
    country: { code: 'JP', name: 'Japan' },
  }));
}

const PHOTOS_RESPONSE = { travelImages: makePhotos(16) };

/** Render TravelPage and wait until photo cells are visible. */
async function renderAndLoad() {
  const { client } = createMockClient({ query: () => PHOTOS_RESPONSE });
  render(
    <Provider value={client}>
      <TravelPage />
    </Provider>,
  );
  await waitFor(() => {
    expect(
      screen.getAllByRole('button', { name: 'Like or dislike this photo' }).length,
    ).toBeGreaterThan(0);
  });
}

describe('TravelPage', () => {
  it('shows the driver toggle tabs after load', async () => {
    await renderAndLoad();
    expect(screen.getByRole('tab', { name: 'Engagement' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'User-First' })).toBeInTheDocument();
  });

  it('renders 16 photo cells across 2 sections', async () => {
    await renderAndLoad();
    expect(screen.getAllByRole('button', { name: 'Like or dislike this photo' })).toHaveLength(16);
  });

  it('ArrowRight on a cell likes the photo', async () => {
    const user = userEvent.setup();
    await renderAndLoad();

    const cell = screen.getAllByRole('button', { name: 'Like or dislike this photo' })[0];
    if (!cell) throw new Error('no photo cells rendered');

    await act(async () => {
      cell.focus();
      await user.keyboard('{ArrowRight}');
    });

    expect(screen.getByRole('button', { name: 'Unlike this photo' })).toBeInTheDocument();
  });

  it('ArrowLeft on a cell dislikes the photo', async () => {
    const user = userEvent.setup();
    await renderAndLoad();

    const cell = screen.getAllByRole('button', { name: 'Like or dislike this photo' })[0];
    if (!cell) throw new Error('no photo cells rendered');

    await act(async () => {
      cell.focus();
      await user.keyboard('{ArrowLeft}');
    });

    expect(screen.getByRole('button', { name: 'Remove dislike' })).toBeInTheDocument();
  });

  it('does not show a submit button', async () => {
    await renderAndLoad();
    expect(screen.queryByRole('button', { name: /submit/i })).not.toBeInTheDocument();
  });

  it('includes Unsplash photographer credit links with UTM params', async () => {
    await renderAndLoad();
    const link = screen.getAllByRole('link', {
      name: /photo by photographer0 on unsplash/i,
    })[0];
    expect(link).toBeDefined();
    expect(link?.getAttribute('href')).toContain('unsplash.com/@p0');
    expect(link?.getAttribute('href')).toContain('utm_source');
  });

  it('info button opens a photo details panel', async () => {
    const user = userEvent.setup();
    await renderAndLoad();

    const infoBtn = screen.getAllByRole('button', { name: 'Photo info' })[0];
    if (!infoBtn) throw new Error('no info buttons rendered');

    await act(async () => {
      await user.click(infoBtn);
    });

    const dialog = screen.getByRole('dialog', { name: 'Photo details' });
    expect(dialog).toBeInTheDocument();
    // Photographer name appears inside the info panel.
    expect(within(dialog).getByText('Photographer0')).toBeInTheDocument();
    // Link to Unsplash is present.
    expect(within(dialog).getByRole('link', { name: /view on unsplash/i })).toBeInTheDocument();
  });
});
