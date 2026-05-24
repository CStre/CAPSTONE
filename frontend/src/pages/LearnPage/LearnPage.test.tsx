import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LearnPage } from './LearnPage';

describe('LearnPage', () => {
  it('renders the essay sections and creator links', () => {
    render(
      <MemoryRouter>
        <LearnPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'What is this project?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Technology Stack' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/CStre',
    );
  });
});
