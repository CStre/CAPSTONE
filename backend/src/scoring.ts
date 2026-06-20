/**
 * @fileoverview Taste vectors and country scoring — the shared math both
 * recommendation algorithms run on top of the feature taxonomy (`features.ts`).
 *
 * Same functions for A and B; they differ only in **which interaction signals feed
 * the taste vector** (the `AlgorithmWeights` passed in). See
 * TravelPage/plan/DEVELOPMENT-PLAN.md §2c.
 *
 * - `updateTaste` accumulates a per-user taste vector from interactions. B uses
 *   `WEIGHTS_B` (explicit like/dislike only); A uses `WEIGHTS_A` (the firehose —
 *   explicit *plus* dwell, skip, curiosity, re-views).
 * - `countrySignature` is the mean feature profile of a country's photos.
 * - `scoreCountries` ranks countries by cosine(taste, signature) → 0–100, with a
 *   neutral taste (the cold start) mapping every country to exactly 50.
 *
 * Pure and deterministic. Vectors are index-aligned to `FEATURE_KEYS`.
 */
import {
  FEATURE_KEYS,
  extractFeatures,
  type FeatureVector,
  type ImageFeatureInput,
} from './features';

const DIM = FEATURE_KEYS.length;

/** Milliseconds of dwell that count as full engagement weight (capped). */
export const DWELL_FULL_MS = 4000;

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x));

// ── Vector utilities ────────────────────────────────────────────────────────

export function dot(a: FeatureVector, b: FeatureVector): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] ?? 0) * (b[i] ?? 0);
  return sum;
}

export function magnitude(v: FeatureVector): number {
  return Math.sqrt(dot(v, v));
}

/** Unit vector in the same direction. A zero vector maps to a zero vector. */
export function normalize(v: FeatureVector): FeatureVector {
  const m = magnitude(v);
  if (m === 0) return v.map(() => 0);
  return v.map((x) => x / m);
}

/** Cosine similarity in [-1, 1]; 0 when either vector is all-zero. */
export function cosineSimilarity(a: FeatureVector, b: FeatureVector): number {
  const m = magnitude(a) * magnitude(b);
  if (m === 0) return 0;
  return dot(a, b) / m;
}

/** `target + scale·v` as a new vector. */
export function addScaled(target: FeatureVector, v: FeatureVector, scale: number): FeatureVector {
  return target.map((t, i) => t + scale * (v[i] ?? 0));
}

/** Element-wise mean of vectors. Empty input → the zero vector. */
export function meanVector(vectors: FeatureVector[]): FeatureVector {
  const out = new Array<number>(DIM).fill(0);
  if (vectors.length === 0) return out;
  for (const v of vectors) {
    for (let i = 0; i < DIM; i++) out[i] = (out[i] ?? 0) + (v[i] ?? 0);
  }
  return out.map((x) => x / vectors.length);
}

// ── Country signatures ──────────────────────────────────────────────────────

/**
 * The mean feature profile of a country's photos — each photo normalized first so
 * tag-rich images do not dominate. Precomputed once at cache/enrichment time.
 */
export function countrySignature(photos: ImageFeatureInput[]): FeatureVector {
  return meanVector(photos.map((p) => normalize(extractFeatures(p))));
}

// ── Taste vectors ───────────────────────────────────────────────────────────

/** How much each interaction signal moves the taste vector. */
export interface AlgorithmWeights {
  like: number;
  dislike: number;
  /** Passive: longer dwell → stronger positive pull (A only). */
  dwell: number;
  /** Passive: a swipe-past with no rating → mild negative pull (A only). */
  skip: number;
  /** Passive: opening the details/credit panel → curiosity positive (A only). */
  curiosity: number;
  /** Passive: re-viewing an image → positive (A only). */
  review: number;
}

/** Algorithm A — the firehose: explicit choice plus every passive signal. */
export const WEIGHTS_A: AlgorithmWeights = {
  like: 1,
  dislike: 1,
  dwell: 0.5,
  skip: 0.3,
  curiosity: 0.4,
  review: 0.2,
};

/** Algorithm B — explicit like/dislike only; passive signals are ignored. */
export const WEIGHTS_B: AlgorithmWeights = {
  like: 1,
  dislike: 1,
  dwell: 0,
  skip: 0,
  curiosity: 0,
  review: 0,
};

/** One interaction with a single image. */
export interface Interaction {
  /** The image's feature vector (from `extractFeatures`). */
  features: FeatureVector;
  /** Explicit rating: true = like, false = dislike, undefined = no explicit rating. */
  liked?: boolean;
  /** Time the image was on screen, in milliseconds. */
  dwellMs?: number;
  /** True if the user swiped past without an explicit rating. */
  skipped?: boolean;
  /** True if the user opened the details/credit panel. */
  detailsTapped?: boolean;
  /** Number of times the image was re-viewed. */
  reviews?: number;
}

/**
 * Net scalar an interaction applies to its (normalized) feature vector, under the
 * given weights. B-weights zero out every passive term, so B only ever responds to
 * an explicit like/dislike.
 */
export function interactionWeight(i: Interaction, w: AlgorithmWeights): number {
  let s = 0;
  if (i.liked === true) s += w.like;
  else if (i.liked === false) s -= w.dislike;
  if (w.dwell && i.dwellMs) s += w.dwell * clamp(i.dwellMs / DWELL_FULL_MS, 0, 1);
  if (w.skip && i.skipped) s -= w.skip;
  if (w.curiosity && i.detailsTapped) s += w.curiosity;
  if (w.review && i.reviews) s += w.review * i.reviews;
  return s;
}

/**
 * Apply one interaction to a taste vector. The image vector is normalized first so
 * every interaction contributes comparably regardless of how many tags it carried.
 */
export function updateTaste(
  taste: FeatureVector,
  i: Interaction,
  w: AlgorithmWeights,
): FeatureVector {
  const scale = interactionWeight(i, w);
  if (scale === 0) return taste.slice();
  return addScaled(taste, normalize(i.features), scale);
}

// ── Country scoring ─────────────────────────────────────────────────────────

/**
 * Score every country 0–100 by cosine(taste, signature), mapped from [-1, 1] so a
 * **neutral taste (the cold start) yields exactly 50 everywhere**. This becomes
 * Algorithm B's persisted `preferences`; A's ranking is the engagement view.
 */
export function scoreCountries(
  taste: FeatureVector,
  signatures: Record<string, FeatureVector>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [code, sig] of Object.entries(signatures)) {
    const cos = cosineSimilarity(taste, sig);
    out[code] = clamp(Math.round(((cos + 1) / 2) * 100), 0, 100);
  }
  return out;
}
