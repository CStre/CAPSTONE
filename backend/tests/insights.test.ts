import { describe, it, expect } from '@jest/globals';
import { extractFeatures, type FeatureVector } from '../src/features';
import { FEATURE_KEYS } from '../src/features';
import {
  topFeatures,
  inferTraits,
  reasonForCard,
  INFERENCE_DISCLAIMER,
  TRAIT_RULES,
} from '../src/insights';

const zeros = (n: number): FeatureVector => new Array<number>(n).fill(0);
const DIM = extractFeatures({ tags: [] }).length;

const remoteMountain = extractFeatures({
  tags: ['mountain', 'snow', 'alpine', 'remote', 'wilderness'],
});
const coastal = extractFeatures({ tags: ['beach', 'coast', 'island', 'sunny', 'relaxation'] });
const cityNight = extractFeatures({ tags: ['city', 'street', 'nightlife', 'people', 'festival'] });

describe('TRAIT_RULES coverage (Algorithm A maps everything)', () => {
  it('references only valid feature keys', () => {
    const valid = new Set<string>(FEATURE_KEYS);
    const bad = TRAIT_RULES.flatMap((r) => r.axes).filter((a) => !valid.has(a));
    expect(bad).toEqual([]);
  });

  it('covers every feature axis — no collected signal goes unmapped', () => {
    const covered = new Set(TRAIT_RULES.flatMap((r) => r.axes));
    const missing = FEATURE_KEYS.filter((k) => !covered.has(k));
    expect(missing).toEqual([]);
  });
});

describe('topFeatures', () => {
  it('returns the strongest positive axes, highest first', () => {
    const tops = topFeatures(remoteMountain, 3);
    expect(tops.length).toBeGreaterThan(0);
    expect(tops[0]?.value).toBeGreaterThanOrEqual(tops[tops.length - 1]?.value ?? 0);
  });

  it('a neutral taste has no top features', () => {
    expect(topFeatures(zeros(DIM))).toEqual([]);
  });
});

describe('inferTraits', () => {
  it('has a disclaimer constant making the over-reach explicit', () => {
    expect(INFERENCE_DISCLAIMER.toLowerCase()).toContain('not a real diagnosis');
  });

  it('infers solitude/introversion from a remote, mountainous taste', () => {
    const traits = inferTraits(remoteMountain);
    expect(traits.some((t) => /solitude|introvert/i.test(t.trait))).toBe(true);
    // every trait carries a basis and a 0–1 confidence
    for (const t of traits) {
      expect(t.basis.length).toBeGreaterThan(0);
      expect(t.confidence).toBeGreaterThan(0);
      expect(t.confidence).toBeLessThanOrEqual(1);
    }
  });

  it('infers a sociable, city-oriented trait from an urban/nightlife taste', () => {
    const traits = inferTraits(cityNight);
    expect(traits.some((t) => /sociable|city/i.test(t.trait))).toBe(true);
  });

  it('a neutral taste infers nothing', () => {
    expect(inferTraits(zeros(DIM))).toEqual([]);
  });

  it('folds in behavioral metrics (long dwell → deliberative)', () => {
    const traits = inferTraits(remoteMountain, { avgDwellMs: 4000 });
    expect(traits.some((t) => /deliberative/i.test(t.trait))).toBe(true);
  });

  it('a quick-decider metric yields a decisive trait', () => {
    const traits = inferTraits(coastal, { avgDwellMs: 800 });
    expect(traits.some((t) => /quick|decisive/i.test(t.trait))).toBe(true);
  });

  it('sorts traits by descending confidence', () => {
    const traits = inferTraits(remoteMountain, { avgDwellMs: 4000 });
    for (let i = 1; i < traits.length; i++) {
      expect(traits[i - 1]?.confidence ?? 0).toBeGreaterThanOrEqual(traits[i]?.confidence ?? 0);
    }
  });
});

describe('reasonForCard — B (legible)', () => {
  it('names the axes the image shares with the taste', () => {
    const r = reasonForCard({ driver: 'B', imageFeatures: coastal, taste: coastal });
    if (r.driver !== 'B') throw new Error('expected B');
    expect(r.matchedAxes.length).toBeGreaterThan(0);
    expect(r.reason.toLowerCase()).toContain('matches your taste');
  });

  it('falls back to an exploration message when nothing matches (cold start)', () => {
    const r = reasonForCard({ driver: 'B', imageFeatures: coastal, taste: zeros(DIM) });
    if (r.driver !== 'B') throw new Error('expected B');
    expect(r.matchedAxes).toEqual([]);
    expect(r.reason.toLowerCase()).toContain('something new');
  });
});

describe('reasonForCard — A (two-layer)', () => {
  it('returns a platitude (Layer 1) and the hidden truth (Layer 2)', () => {
    const r = reasonForCard({
      driver: 'A',
      imageFeatures: remoteMountain,
      taste: remoteMountain,
      confidence: 0.87,
    });
    if (r.driver !== 'A') throw new Error('expected A');
    expect(r.layer1.length).toBeGreaterThan(0);
    expect(r.layer2).toContain('87%');
    expect(r.layer2.toLowerCase()).toContain('because you engaged');
    expect(r.layer2.toLowerCase()).toContain('also inferred');
  });

  it('rotates the Layer 1 platitude by variant', () => {
    const a = reasonForCard({
      driver: 'A',
      imageFeatures: remoteMountain,
      taste: remoteMountain,
      variant: 0,
    });
    const b = reasonForCard({
      driver: 'A',
      imageFeatures: remoteMountain,
      taste: remoteMountain,
      variant: 1,
    });
    if (a.driver !== 'A' || b.driver !== 'A') throw new Error('expected A');
    expect(a.layer1).not.toEqual(b.layer1);
  });
});
