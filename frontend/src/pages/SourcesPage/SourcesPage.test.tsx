import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { SourcesPage } from './SourcesPage';

describe('SourcesPage', () => {
  it('renders the hero, two sections, a research reference, and tooling credits', () => {
    render(<SourcesPage />);

    expect(screen.getByRole('heading', { name: /scholarly foundations/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /peer-reviewed sources/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /technical attributions/i })).toBeInTheDocument();

    // A corpus reference (AMA style) is present.
    expect(screen.getByText(/Covington P, Adams J, Sargin E\./)).toBeInTheDocument();

    // Source-link buttons render for each citation.
    const sourceLinks = screen.getAllByRole('link', { name: /view source/i });
    expect(sourceLinks.length).toBeGreaterThan(0);
  });
});
