import { describe, it, expect } from '@jest/globals';
import { COUNTRIES, COUNTRY_BY_CODE, isValidCountryCode } from '../src/countries';

describe('country catalog', () => {
  it('covers the whole world (UN members + observers + territories)', () => {
    expect(COUNTRIES.length).toBeGreaterThan(190);
  });

  it('uses neutral, landmark-free search terms', () => {
    for (const c of COUNTRIES) {
      expect(c.searchTerm).toContain('landscape');
    }
  });

  it('has unique country codes', () => {
    const codes = COUNTRIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('has well-formed entries', () => {
    for (const c of COUNTRIES) {
      expect(c.code).toMatch(/^[A-Z]{2}$/);
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.searchTerm.length).toBeGreaterThan(0);
    }
  });

  it('looks up a country by code', () => {
    expect(COUNTRY_BY_CODE.get('FR')?.name).toBe('France');
  });

  it('validates codes against the catalog', () => {
    expect(isValidCountryCode('FR')).toBe(true);
    expect(isValidCountryCode('XX')).toBe(false);
  });
});
