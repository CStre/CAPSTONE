import { describe, it, expect } from '@jest/globals';
import { extractFeatures, type FeatureVector } from '../src/features';
import {
  dot,
  magnitude,
  normalize,
  cosineSimilarity,
  addScaled,
  countrySignature,
  interactionWeight,
  updateTaste,
  scoreCountries,
  WEIGHTS_A,
  WEIGHTS_B,
  DWELL_FULL_MS,
} from '../src/scoring';

// A tiny helper: build a short vector for the pure math (length need not match DIM
// for the vector utilities, which operate index-wise).
const v = (...xs: number[]): FeatureVector => xs;

// A typed zero vector of length n (the neutral / cold-start taste).
const zeros = (n: number): FeatureVector => new Array<number>(n).fill(0);
const DIM = extractFeatures({ tags: [] }).length;

describe('vector utilities', () => {
  it('dot and magnitude', () => {
    expect(dot(v(1, 2, 3), v(4, 5, 6))).toBe(32);
    expect(magnitude(v(3, 4))).toBe(5);
  });

  it('normalize returns a unit vector; zero stays zero', () => {
    expect(magnitude(normalize(v(3, 4)))).toBeCloseTo(1);
    expect(normalize(v(0, 0, 0))).toEqual([0, 0, 0]);
  });

  it('cosineSimilarity: identical = 1, orthogonal = 0, opposite = -1', () => {
    expect(cosineSimilarity(v(1, 1), v(2, 2))).toBeCloseTo(1);
    expect(cosineSimilarity(v(1, 0), v(0, 1))).toBeCloseTo(0);
    expect(cosineSimilarity(v(1, 0), v(-1, 0))).toBeCloseTo(-1);
  });

  it('cosineSimilarity is 0 against a zero vector (neutral cold start)', () => {
    expect(cosineSimilarity(v(0, 0), v(1, 1))).toBe(0);
  });

  it('addScaled and meanVector', () => {
    expect(addScaled(v(1, 1), v(2, 0), 3)).toEqual([7, 1]);
  });
});

describe('countrySignature', () => {
  it('averages the (normalized) feature profiles of a country pool', () => {
    const sig = countrySignature([{ tags: ['mountain', 'snow'] }, { tags: ['beach', 'palm'] }]);
    // Mountain and beach photos both contribute → both axes are positive in the mean.
    const mountainIdx = extractFeatures({ tags: ['mountain'] }).findIndex((x) => x > 0);
    const beachIdx = extractFeatures({ tags: ['beach'] }).findIndex((x) => x > 0);
    expect(sig[mountainIdx]).toBeGreaterThan(0);
    expect(sig[beachIdx]).toBeGreaterThan(0);
  });

  it('empty pool → zero vector', () => {
    expect(magnitude(countrySignature([]))).toBe(0);
  });
});

describe('interactionWeight', () => {
  it('B responds only to explicit like/dislike', () => {
    const features = extractFeatures({ tags: ['mountain'] });
    expect(interactionWeight({ features, liked: true }, WEIGHTS_B)).toBe(1);
    expect(interactionWeight({ features, liked: false }, WEIGHTS_B)).toBe(-1);
    // passive signals ignored entirely
    expect(
      interactionWeight(
        { features, dwellMs: 10000, skipped: true, detailsTapped: true },
        WEIGHTS_B,
      ),
    ).toBe(0);
  });

  it('A folds in passive signals (dwell, skip, curiosity, reviews)', () => {
    const features = extractFeatures({ tags: ['mountain'] });
    // a long dwell with no explicit rating still moves A
    expect(interactionWeight({ features, dwellMs: DWELL_FULL_MS }, WEIGHTS_A)).toBeCloseTo(
      WEIGHTS_A.dwell,
    );
    // a skip is a mild negative for A
    expect(interactionWeight({ features, skipped: true }, WEIGHTS_A)).toBeCloseTo(-WEIGHTS_A.skip);
    // a details tap is positive curiosity
    expect(interactionWeight({ features, detailsTapped: true }, WEIGHTS_A)).toBeCloseTo(
      WEIGHTS_A.curiosity,
    );
  });

  it('A caps the dwell contribution', () => {
    const features = extractFeatures({ tags: ['mountain'] });
    const huge = interactionWeight({ features, dwellMs: 10 * DWELL_FULL_MS }, WEIGHTS_A);
    expect(huge).toBeCloseTo(WEIGHTS_A.dwell); // capped at full, not 10×
  });
});

describe('updateTaste', () => {
  const mountain = extractFeatures({ tags: ['mountain', 'snow', 'alpine'] });

  it('a like moves the taste toward the image features', () => {
    const t = updateTaste(zeros(mountain.length), { features: mountain, liked: true }, WEIGHTS_B);
    expect(cosineSimilarity(t, mountain)).toBeCloseTo(1);
  });

  it('a dislike moves the taste away from the image features', () => {
    const t = updateTaste(zeros(mountain.length), { features: mountain, liked: false }, WEIGHTS_B);
    expect(cosineSimilarity(t, mountain)).toBeCloseTo(-1);
  });

  it('B leaves the taste unchanged on a skip (no explicit rating)', () => {
    const start = updateTaste(
      zeros(mountain.length),
      { features: mountain, liked: true },
      WEIGHTS_B,
    );
    const after = updateTaste(
      start,
      { features: mountain, skipped: true, dwellMs: 8000 },
      WEIGHTS_B,
    );
    expect(after).toEqual(start);
  });

  it('A does move on a passive-only interaction', () => {
    const after = updateTaste(
      zeros(mountain.length),
      { features: mountain, dwellMs: 8000 },
      WEIGHTS_A,
    );
    expect(magnitude(after)).toBeGreaterThan(0);
  });
});

describe('scoreCountries', () => {
  const signatures = {
    NOR: countrySignature([{ tags: ['mountain', 'snow', 'fjord', 'remote'] }]),
    GRC: countrySignature([{ tags: ['beach', 'coast', 'island', 'sunny'] }]),
  };

  it('a neutral (cold-start) taste scores every country exactly 50', () => {
    const neutral = zeros(DIM);
    expect(scoreCountries(neutral, signatures)).toEqual({ NOR: 50, GRC: 50 });
  });

  it('a mountain-lover scores the alpine country above the beach country', () => {
    const taste = updateTaste(
      zeros(DIM),
      { features: extractFeatures({ tags: ['mountain', 'snow', 'remote'] }), liked: true },
      WEIGHTS_B,
    );
    const scores = scoreCountries(taste, signatures);
    expect(scores.NOR ?? 0).toBeGreaterThan(scores.GRC ?? 0);
    expect(scores.NOR ?? 0).toBeGreaterThan(50);
  });

  it('a beach-lover scores the coastal country highest', () => {
    const taste = updateTaste(
      zeros(DIM),
      { features: extractFeatures({ tags: ['beach', 'island', 'sunny'] }), liked: true },
      WEIGHTS_B,
    );
    const scores = scoreCountries(taste, signatures);
    expect(scores.GRC ?? 0).toBeGreaterThan(scores.NOR ?? 0);
  });
});
