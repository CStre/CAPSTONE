/**
 * @fileoverview The selection engine — how each driver picks the next batch, and
 * the emergent feedback loop that lets Algorithm A narrow into a bubble.
 *
 * The trap is **not rigged**: it emerges from a coupling. Confidence (`κ`) rises only
 * when the user's likes *confirm* the current taste; exploration shrinks
 * exponentially with confidence (`ε = ε_max·e^(−α·κ)`); low exploration makes A serve
 * ever-more-similar images, which (if the user keeps confirming) drives `κ` higher
 * still. Behave diversely and `κ` stays low and the feed never narrows. See
 * TravelPage/plan/DEVELOPMENT-PLAN.md §1b/§2c.
 *
 * Algorithm B ignores `κ`/`ε` entirely: it selects for preference **and** diversity,
 * so it never narrows and actively *recovers* novelty when the user flips to it.
 *
 * Pure and deterministic (selection takes an injectable `rng`).
 */
import { cosineSimilarity } from './scoring';
import { type FeatureVector } from './features';

/** How fast confidence moves toward the confirming/surprising signal (per like). */
export const CONFIDENCE_RATE = 0.25;
/** Exploration fraction at zero confidence (the cold start). */
export const EXPLORATION_MAX = 0.9;
/** Exponential decay of exploration as confidence rises. */
export const EXPLORATION_DECAY = 3;
/** Algorithm B's weighting of novelty vs preference when selecting (0–1). */
export const B_DIVERSITY = 0.5;

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x));

export type Driver = 'A' | 'B';

/** A candidate image available to be served next. */
export interface Candidate {
  id: string;
  country: string;
  /** The image's feature vector (from `extractFeatures`). */
  features: FeatureVector;
}

/**
 * Update Algorithm A's confidence after a **confirming** signal (call on likes).
 * Confidence climbs toward 1 when the liked image aligns with the current taste
 * (the loop tightening) and decays toward 0 when likes are surprising/diverse (no
 * trap). At the cold start (taste all-zero) alignment is 0, so confidence stays low.
 */
export function updateConfidence(
  confidence: number,
  features: FeatureVector,
  taste: FeatureVector,
): number {
  const align = cosineSimilarity(features, taste); // [-1, 1]; 0 if taste is neutral
  const target = Math.max(0, align); // only genuine confirmation builds confidence
  return clamp(confidence + CONFIDENCE_RATE * (target - confidence), 0, 1);
}

/** Exploration fraction for a given confidence: `ε_max·e^(−α·κ)`, clamped to [0,1]. */
export function explorationFraction(confidence: number): number {
  return clamp(EXPLORATION_MAX * Math.exp(-EXPLORATION_DECAY * confidence), 0, 1);
}

function argmaxIndex<T>(items: T[], score: (item: T) => number): number {
  let best = 0;
  let bestScore = -Infinity;
  items.forEach((item, i) => {
    const s = score(item);
    if (s > bestScore) {
      bestScore = s;
      best = i;
    }
  });
  return best;
}

/** Max cosine similarity of `features` to any already-picked candidate (0 if none). */
function maxSimilarityToPicked(features: FeatureVector, picked: Candidate[]): number {
  let max = 0;
  for (const p of picked) max = Math.max(max, cosineSimilarity(features, p.features));
  return max;
}

export interface SelectOptions {
  driver: Driver;
  pool: Candidate[];
  count: number;
  /** Algorithm A: the user's taste vector (drives exploit picks). */
  taste?: FeatureVector;
  /** Algorithm A: exploration fraction `ε` (from `explorationFraction`). */
  exploration?: number;
  /** Algorithm B: per-country scores (0–100) used as preference weight. */
  countryScores?: Record<string, number>;
  /** Injectable RNG for determinism in tests. */
  rng?: () => number;
}

/**
 * Pick the next batch (without replacement).
 *
 * - **A** exploits with probability `1−ε` (the most taste-similar remaining image →
 *   narrowing) and explores at random with probability `ε`.
 * - **B** greedily maximizes a blend of country preference and novelty-vs-already-
 *   picked, so the batch stays diverse regardless of taste (and recovers novelty
 *   after a narrowed A-feed).
 */
export function selectNext(opts: SelectOptions): Candidate[] {
  const { driver, count } = opts;
  const rng = opts.rng ?? Math.random;
  const remaining = [...opts.pool];
  const picks: Candidate[] = [];

  while (picks.length < count && remaining.length > 0) {
    let idx: number;

    if (driver === 'A') {
      const taste = opts.taste ?? [];
      const epsilon = opts.exploration ?? 0;
      idx =
        rng() < epsilon
          ? Math.floor(rng() * remaining.length)
          : argmaxIndex(remaining, (c) => cosineSimilarity(c.features, taste));
    } else {
      const scores = opts.countryScores ?? {};
      idx = argmaxIndex(remaining, (c) => {
        const pref = (scores[c.country] ?? 50) / 100; // 0–1; floor keeps all in play
        const novelty = 1 - maxSimilarityToPicked(c.features, picks);
        return (1 - B_DIVERSITY) * pref + B_DIVERSITY * novelty;
      });
    }

    const pick = remaining[idx];
    if (!pick) break;
    picks.push(pick);
    remaining.splice(idx, 1);
  }

  return picks;
}

/**
 * Novelty / diversity of a set of images: the mean pairwise feature distance
 * (`1 − cosine`) scaled to 0–100. 100 = maximally diverse, 0 = identical (a bubble).
 * Fewer than two items → 100 (nothing has collapsed yet).
 */
export function noveltyScore(items: FeatureVector[]): number {
  if (items.length < 2) return 100;
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (!a || !b) continue;
      sum += 1 - cosineSimilarity(a, b);
      pairs++;
    }
  }
  if (pairs === 0) return 100;
  return clamp(Math.round((sum / pairs) * 100), 0, 100);
}
