/**
 * @fileoverview The per-user dossier — the persistable state both algorithms build,
 * and the pure orchestration that updates it from a single interaction.
 *
 * One interaction feeds BOTH models from the same behavior (the core contrast):
 * Algorithm A's taste vector takes the full firehose (explicit + passive signals) and
 * its confidence rises only on confirming likes; Algorithm B's taste takes the
 * explicit like/dislike alone. Cumulative counters survive across visits (the loop is
 * cumulative — §1b); the interaction log is capped to recent entries for the PDF.
 *
 * Pure and deterministic — DynamoDB (`db.ts`) and the resolvers just load, call
 * `applyInteraction`, and save. See TravelPage/plan/DEVELOPMENT-PLAN.md §2c.
 */
import { FEATURE_KEYS } from './features';
import { extractFeatures } from './features';
import { updateTaste, WEIGHTS_A, WEIGHTS_B, type Interaction } from './scoring';
import { updateConfidence } from './recommender';

const DIM = FEATURE_KEYS.length;

/** Max interaction-log entries kept for the dossier PDF (counters stay cumulative). */
export const MAX_LOG = 250;

export type InteractionAction = 'like' | 'dislike' | 'skip';

/** One interaction the client reports for an image. */
export interface InteractionInput {
  imageId: string;
  country: string;
  tags: string[];
  color?: string;
  action: InteractionAction;
  dwellMs?: number;
  detailsTapped?: boolean;
  reviews?: number;
  /** ISO timestamp; defaults to now if omitted. */
  ts?: string;
}

/** A stored log entry (what Algorithm A would keep forever — shown back in the PDF). */
export interface InteractionRecord {
  imageId: string;
  country: string;
  tags: string[];
  color?: string;
  action: InteractionAction;
  dwellMs?: number;
  detailsTapped?: boolean;
  ts: string;
}

/** Cumulative tallies — survive interaction-log capping and persist across visits. */
export interface DossierCounts {
  likes: number;
  dislikes: number;
  skips: number;
  detailsTaps: number;
  totalDwellMs: number;
  dwellSamples: number;
}

export interface DossierState {
  /** Algorithm A — taste from the full firehose + its narrowing confidence. */
  a: { taste: number[]; confidence: number };
  /** Algorithm B — taste from explicit likes/dislikes only. */
  b: { taste: number[] };
  counts: DossierCounts;
  log: InteractionRecord[];
  createdAt: string;
}

const zeroTaste = (): number[] => new Array<number>(DIM).fill(0);

/** A fresh, neutral dossier (the cold start). */
export function emptyDossier(createdAt = new Date().toISOString()): DossierState {
  return {
    a: { taste: zeroTaste(), confidence: 0 },
    b: { taste: zeroTaste() },
    counts: { likes: 0, dislikes: 0, skips: 0, detailsTaps: 0, totalDwellMs: 0, dwellSamples: 0 },
    log: [],
    createdAt,
  };
}

function toInteraction(input: InteractionInput): Interaction {
  return {
    features: extractFeatures({ tags: input.tags, color: input.color }),
    liked: input.action === 'like' ? true : input.action === 'dislike' ? false : undefined,
    skipped: input.action === 'skip' ? true : undefined,
    dwellMs: input.dwellMs,
    detailsTapped: input.detailsTapped,
    reviews: input.reviews,
  };
}

/**
 * Apply one interaction to the dossier, updating both algorithms, the cumulative
 * counters, and the capped log. Returns a new state (does not mutate the input).
 */
export function applyInteraction(state: DossierState, input: InteractionInput): DossierState {
  const interaction = toInteraction(input);

  // Confidence reacts to confirming *likes* only, measured against the pre-update taste.
  const confidence =
    input.action === 'like'
      ? updateConfidence(state.a.confidence, interaction.features, state.a.taste)
      : state.a.confidence;

  const a = { taste: updateTaste(state.a.taste, interaction, WEIGHTS_A), confidence };
  const b = { taste: updateTaste(state.b.taste, interaction, WEIGHTS_B) };

  const counts: DossierCounts = { ...state.counts };
  if (input.action === 'like') counts.likes += 1;
  else if (input.action === 'dislike') counts.dislikes += 1;
  else counts.skips += 1;
  if (input.detailsTapped) counts.detailsTaps += 1;
  if (typeof input.dwellMs === 'number') {
    counts.totalDwellMs += input.dwellMs;
    counts.dwellSamples += 1;
  }

  const record: InteractionRecord = {
    imageId: input.imageId,
    country: input.country,
    tags: input.tags,
    color: input.color,
    action: input.action,
    dwellMs: input.dwellMs,
    detailsTapped: input.detailsTapped,
    ts: input.ts ?? new Date().toISOString(),
  };
  const log = [...state.log, record].slice(-MAX_LOG);

  return { a, b, counts, log, createdAt: state.createdAt };
}

/** Apply a batch of interactions in order. */
export function applyInteractions(state: DossierState, inputs: InteractionInput[]): DossierState {
  return inputs.reduce(applyInteraction, state);
}

export interface DerivedMetrics {
  totalRatings: number;
  totalInteractions: number;
  likes: number;
  dislikes: number;
  skips: number;
  avgDwellMs: number;
  skipRate: number;
  curiosityRate: number;
}

/** Summary metrics for the dossier panel / PDF, from the cumulative counters. */
export function derivedMetrics(state: DossierState): DerivedMetrics {
  const { likes, dislikes, skips, detailsTaps, totalDwellMs, dwellSamples } = state.counts;
  const totalInteractions = likes + dislikes + skips;
  return {
    totalRatings: likes + dislikes,
    totalInteractions,
    likes,
    dislikes,
    skips,
    avgDwellMs: dwellSamples > 0 ? Math.round(totalDwellMs / dwellSamples) : 0,
    skipRate: totalInteractions > 0 ? skips / totalInteractions : 0,
    curiosityRate: totalInteractions > 0 ? detailsTaps / totalInteractions : 0,
  };
}
