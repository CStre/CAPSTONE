import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { SourcesPage } from './SourcesPage';

describe('SourcesPage', () => {
  it('lists research and tooling sources', () => {
    render(<SourcesPage />);

    expect(screen.getByRole('heading', { name: 'Project Sources' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /algorithms/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'https://react.dev' })).toBeInTheDocument();
  });
});
