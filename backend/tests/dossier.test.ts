import { describe, it, expect } from '@jest/globals';
import { magnitude, cosineSimilarity } from '../src/scoring';
import { extractFeatures } from '../src/features';
import {
  emptyDossier,
  applyInteraction,
  applyInteractions,
  derivedMetrics,
  MAX_LOG,
  type InteractionInput,
} from '../src/dossier';

const like = (over: Partial<InteractionInput> = {}): InteractionInput => ({
  imageId: 'i1',
  country: 'NOR',
  tags: ['mountain', 'snow', 'alpine'],
  action: 'like',
  ...over,
});

describe('emptyDossier', () => {
  it('starts neutral — zero tastes, zero confidence, empty log', () => {
    const d = emptyDossier('2026-01-01T00:00:00Z');
    expect(magnitude(d.a.taste)).toBe(0);
    expect(magnitude(d.b.taste)).toBe(0);
    expect(d.a.confidence).toBe(0);
    expect(d.log).toEqual([]);
    expect(d.createdAt).toBe('2026-01-01T00:00:00Z');
  });
});

describe('applyInteraction — both algorithms from one behavior', () => {
  it('a like moves both A and B toward the image features', () => {
    const d = applyInteraction(emptyDossier(), like());
    const f = extractFeatures({ tags: ['mountain', 'snow', 'alpine'] });
    expect(cosineSimilarity(d.a.taste, f)).toBeGreaterThan(0.9);
    expect(cosineSimilarity(d.b.taste, f)).toBeGreaterThan(0.9);
  });

  it('a skip moves A (passive) but leaves B unchanged', () => {
    const d = applyInteraction(emptyDossier(), like({ action: 'skip', dwellMs: 5000 }));
    expect(magnitude(d.a.taste)).toBeGreaterThan(0);
    expect(magnitude(d.b.taste)).toBe(0);
  });

  it('does not mutate the input state', () => {
    const start = emptyDossier();
    applyInteraction(start, like());
    expect(magnitude(start.a.taste)).toBe(0);
    expect(start.log).toHaveLength(0);
  });

  it('counts likes/dislikes/skips, details taps, and dwell cumulatively', () => {
    let d = emptyDossier();
    d = applyInteraction(d, like({ dwellMs: 2000, detailsTapped: true }));
    d = applyInteraction(d, like({ action: 'dislike', tags: ['city'], dwellMs: 1000 }));
    d = applyInteraction(d, like({ action: 'skip' }));
    expect(d.counts).toMatchObject({
      likes: 1,
      dislikes: 1,
      skips: 1,
      detailsTaps: 1,
      dwellSamples: 2,
    });
    expect(d.counts.totalDwellMs).toBe(3000);
  });

  it('confidence rises across a confirming like-stream', () => {
    const stream = Array.from({ length: 10 }, () => like());
    const d = applyInteractions(emptyDossier(), stream);
    expect(d.a.confidence).toBeGreaterThan(0.5);
  });

  it('confidence stays low across a diverse like-stream', () => {
    const tagSets = [['mountain'], ['beach'], ['city'], ['desert'], ['forest']];
    const stream = tagSets.concat(tagSets).map((tags, i) => like({ tags, imageId: `i${i}` }));
    const d = applyInteractions(emptyDossier(), stream);
    expect(d.a.confidence).toBeLessThan(0.4);
  });
});

describe('log capping', () => {
  it('keeps only the most recent MAX_LOG entries', () => {
    const stream = Array.from({ length: MAX_LOG + 25 }, (_, i) => like({ imageId: `i${i}` }));
    const d = applyInteractions(emptyDossier(), stream);
    expect(d.log).toHaveLength(MAX_LOG);
    expect(d.log[d.log.length - 1]?.imageId).toBe(`i${MAX_LOG + 24}`);
  });
});

describe('derivedMetrics', () => {
  it('summarizes the cumulative counters', () => {
    let d = emptyDossier();
    d = applyInteraction(d, like({ dwellMs: 4000, detailsTapped: true }));
    d = applyInteraction(d, like({ action: 'dislike', tags: ['city'], dwellMs: 2000 }));
    d = applyInteraction(d, like({ action: 'skip' }));
    const m = derivedMetrics(d);
    expect(m.totalRatings).toBe(2);
    expect(m.totalInteractions).toBe(3);
    expect(m.avgDwellMs).toBe(3000);
    expect(m.skipRate).toBeCloseTo(1 / 3);
    expect(m.curiosityRate).toBeCloseTo(1 / 3);
  });

  it('handles an empty dossier without dividing by zero', () => {
    const m = derivedMetrics(emptyDossier());
    expect(m).toMatchObject({ totalRatings: 0, avgDwellMs: 0, skipRate: 0, curiosityRate: 0 });
  });
});
