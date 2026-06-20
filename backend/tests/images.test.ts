import { describe, it, expect } from '@jest/globals';
import { selectCountries } from '../src/images';
import { COUNTRIES } from '../src/countries';

describe('selectCountries', () => {
  it('returns the requested number of picks', () => {
    expect(selectCountries({}, 8, () => 0.5)).toHaveLength(8);
  });

  it('returns nothing for a non-positive count', () => {
    expect(selectCountries({}, 0)).toHaveLength(0);
  });

  it('only ever returns catalog countries', () => {
    const codes = new Set(COUNTRIES.map((c) => c.code));
    for (const pick of selectCountries({}, 30)) {
      expect(codes.has(pick.code)).toBe(true);
    }
  });

  it('heavily favors a country with dominant weight', () => {
    const prefs: Record<string, number> = {};
    // FR weight dominates the whole catalog's summed weight.
    for (const c of COUNTRIES) prefs[c.code] = c.code === 'FR' ? 100000 : 1;
    const picks = selectCountries(prefs, 300);
    const frShare = picks.filter((p) => p.code === 'FR').length / picks.length;
    expect(frShare).toBeGreaterThan(0.5);
  });

  it('never picks a country with zero weight', () => {
    const prefs: Record<string, number> = {};
    for (const c of COUNTRIES) prefs[c.code] = c.code === 'FR' ? 0 : 50;
    const picks = selectCountries(prefs, 200);
    expect(picks.some((p) => p.code === 'FR')).toBe(false);
  });
});
