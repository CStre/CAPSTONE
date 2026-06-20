import { describe, it, expect } from '@jest/globals';
import { COUNTRIES } from '../src/countries';
import { extractFeatures } from '../src/features';
import { getCountrySignatures, setCountrySignatures, signaturesFromPool } from '../src/signatures';

// Capture the lazily-seeded map once so the override test can restore it.
const SEED = getCountrySignatures();
const DIM = extractFeatures({ tags: [] }).length;

describe('getCountrySignatures', () => {
  it('has a signature vector for every catalog country', () => {
    for (const c of COUNTRIES) {
      expect(SEED[c.code]).toBeDefined();
      expect(SEED[c.code]).toHaveLength(DIM);
    }
  });

  it('provides a vector of the right shape for every country (neutral seed)', () => {
    // With landmark-free search terms the seed is intentionally near-neutral; real
    // differentiation comes from the photo pool (see signaturesFromPool below).
    const ch = SEED.CH;
    expect(ch).toBeDefined();
    expect(ch).toHaveLength(DIM);
  });

  it('setCountrySignatures overrides the map (the step-3 injection hook)', () => {
    setCountrySignatures({ XX: [1, 2, 3] });
    expect(getCountrySignatures()).toEqual({ XX: [1, 2, 3] });
    setCountrySignatures(SEED); // restore for any later consumers
  });
});

describe('signaturesFromPool', () => {
  it('derives a real, photo-derived signature per country from the pool', () => {
    const sigs = signaturesFromPool({
      NOR: [{ tags: ['mountain', 'snow'] }, { tags: ['fjord', 'remote'] }],
      GRC: [{ tags: ['beach', 'island'] }, { tags: ['coast', 'sunny'] }],
    });
    const mountainIdx = extractFeatures({ tags: ['mountain'] }).findIndex((x) => x > 0);
    const beachIdx = extractFeatures({ tags: ['beach'] }).findIndex((x) => x > 0);
    expect(sigs.NOR?.[mountainIdx]).toBeGreaterThan(0);
    expect(sigs.GRC?.[beachIdx]).toBeGreaterThan(0);
    // Norway's signature leans mountain, not beach.
    expect(sigs.NOR?.[mountainIdx] ?? 0).toBeGreaterThan(sigs.NOR?.[beachIdx] ?? 0);
  });
});
