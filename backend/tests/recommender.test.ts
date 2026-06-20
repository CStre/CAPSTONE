import { describe, it, expect } from '@jest/globals';
import { extractFeatures, type FeatureVector } from '../src/features';
import { updateTaste, WEIGHTS_A, type Interaction } from '../src/scoring';
import {
  updateConfidence,
  explorationFraction,
  selectNext,
  noveltyScore,
  EXPLORATION_MAX,
  type Candidate,
} from '../src/recommender';

const zeros = (n: number): FeatureVector => new Array<number>(n).fill(0);
const DIM = extractFeatures({ tags: [] }).length;

// Deterministic RNG (mulberry32) so selection tests are reproducible.
function rngFrom(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mountain = extractFeatures({ tags: ['mountain', 'snow', 'alpine', 'remote'] });
const beach = extractFeatures({ tags: ['beach', 'coast', 'island', 'sunny'] });
const desert = extractFeatures({ tags: ['desert', 'dune', 'arid'] });
const city = extractFeatures({ tags: ['city', 'street', 'urban'] });

describe('explorationFraction', () => {
  it('is highest at the cold start and decays with confidence', () => {
    expect(explorationFraction(0)).toBeCloseTo(EXPLORATION_MAX);
    expect(explorationFraction(1)).toBeLessThan(0.1);
    expect(explorationFraction(0.5)).toBeLessThan(explorationFraction(0));
    expect(explorationFraction(1)).toBeLessThan(explorationFraction(0.5));
  });
});

describe('updateConfidence', () => {
  it('a confirming like (aligned with taste) raises confidence', () => {
    const taste = mountain; // taste already points at mountains
    expect(updateConfidence(0, mountain, taste)).toBeGreaterThan(0);
  });

  it('a surprising/diverse like does not raise confidence', () => {
    const taste = mountain;
    expect(updateConfidence(0.5, beach, taste)).toBeLessThan(0.5);
  });

  it('stays low at the cold start (neutral taste → no alignment)', () => {
    expect(updateConfidence(0, mountain, zeros(DIM))).toBe(0);
  });
});

describe('the feedback loop (emergent, not forced)', () => {
  // Simulate a stream of likes: build taste + confidence the way the live loop would.
  function runStream(images: FeatureVector[]): { confidence: number } {
    let taste = zeros(DIM);
    let confidence = 0;
    for (const features of images) {
      const interaction: Interaction = { features, liked: true };
      confidence = updateConfidence(confidence, features, taste);
      taste = updateTaste(taste, interaction, WEIGHTS_A);
    }
    return { confidence };
  }

  it('a confirming stream drives confidence up and exploration down (the trap)', () => {
    const stream = Array.from({ length: 12 }, () => mountain);
    const { confidence } = runStream(stream);
    expect(confidence).toBeGreaterThan(0.6);
    expect(explorationFraction(confidence)).toBeLessThan(0.2);
  });

  it('a diverse stream keeps confidence low and exploration high (no trap)', () => {
    const stream = [mountain, beach, desert, city, mountain, beach, desert, city];
    const { confidence } = runStream(stream);
    expect(confidence).toBeLessThan(0.4);
    expect(explorationFraction(confidence)).toBeGreaterThan(0.3);
  });
});

describe('noveltyScore', () => {
  it('identical images → 0 (a collapsed bubble)', () => {
    expect(noveltyScore([mountain, mountain, mountain])).toBe(0);
  });

  it('distinct images → high novelty', () => {
    expect(noveltyScore([mountain, beach, desert, city])).toBeGreaterThan(50);
  });

  it('fewer than two items → 100 (nothing has collapsed)', () => {
    expect(noveltyScore([mountain])).toBe(100);
  });
});

describe('selectNext', () => {
  const pool: Candidate[] = [
    { id: 'm1', country: 'NOR', features: extractFeatures({ tags: ['mountain', 'snow'] }) },
    { id: 'm2', country: 'CHE', features: extractFeatures({ tags: ['mountain', 'alpine'] }) },
    { id: 'm3', country: 'NPL', features: extractFeatures({ tags: ['mountain', 'remote'] }) },
    { id: 'b1', country: 'GRC', features: extractFeatures({ tags: ['beach', 'island'] }) },
    { id: 'b2', country: 'THA', features: extractFeatures({ tags: ['beach', 'tropical'] }) },
    { id: 'd1', country: 'MAR', features: extractFeatures({ tags: ['desert', 'dune'] }) },
    { id: 'c1', country: 'JPN', features: extractFeatures({ tags: ['city', 'street'] }) },
  ];

  it('A exploiting (ε=0) serves a narrow, taste-similar batch (the bubble)', () => {
    const picks = selectNext({ driver: 'A', pool, count: 3, taste: mountain, exploration: 0 });
    // pure exploit → all mountains
    expect(picks.every((p) => p.id.startsWith('m'))).toBe(true);
    expect(noveltyScore(picks.map((p) => p.features))).toBeLessThan(40);
  });

  it('A exploring (ε=1) serves a varied batch', () => {
    const picks = selectNext({
      driver: 'A',
      pool,
      count: 4,
      taste: mountain,
      exploration: 1,
      rng: rngFrom(7),
    });
    expect(noveltyScore(picks.map((p) => p.features))).toBeGreaterThan(40);
  });

  it('B keeps the batch diverse despite a mountain-biased preference', () => {
    const scores = { NOR: 100, CHE: 95, NPL: 90, GRC: 50, THA: 50, MAR: 50, JPN: 50 };
    const aPicks = selectNext({ driver: 'A', pool, count: 3, taste: mountain, exploration: 0 });
    const bPicks = selectNext({ driver: 'B', pool, count: 3, countryScores: scores });
    // B's batch is more diverse than A's narrowed exploit batch — the escape.
    expect(noveltyScore(bPicks.map((p) => p.features))).toBeGreaterThan(
      noveltyScore(aPicks.map((p) => p.features)),
    );
  });

  it('returns the whole pool when count exceeds it, and never repeats', () => {
    const picks = selectNext({ driver: 'A', pool, count: 99, taste: mountain, exploration: 0 });
    expect(picks).toHaveLength(pool.length);
    expect(new Set(picks.map((p) => p.id)).size).toBe(pool.length);
  });
});
