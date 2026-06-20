import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { NotFoundPage } from './NotFoundPage';

describe('NotFoundPage', () => {
  it('renders the 404 error heading and redirect message', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Error 404')).toBeInTheDocument();
    expect(screen.getByText(/you will be redirected/i)).toBeInTheDocument();
  });
});
