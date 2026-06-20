/**
 * @fileoverview The preference-learning algorithm.
 *
 * Ported from the v1 Django `update_preferences()` (see legacy/backend/backend/
 * algorithm.py) — same fixed increment, clamp, and rail-bounce behavior — but keyed
 * on country code instead of a brittle array index.
 *
 * Preferences are a sparse map of `countryCode -> value` on a 0–100 scale. A country
 * absent from the map is treated as the neutral default.
 */

/** Starting value for a country a user has never interacted with. */
export const NEUTRAL_PREFERENCE = 50;

/** Amount a single like/dislike moves a country's score. */
export const LEARNING_INCREMENT = 5;

export const MIN_PREFERENCE = 0;
export const MAX_PREFERENCE = 100;

export type PreferenceMap = Record<string, number>;

export interface Feedback {
  /** Country code the feedback applies to. */
  country: string;
  /** true = liked, false = disliked. */
  liked: boolean;
}

/**
 * Apply one like/dislike to a single country's value.
 *
 * A liked country gains `+5`; a disliked one loses `-5`. Values are clamped to
 * 0–100, and "bounce" off the rails (100 -> 95, 0 -> 5) so no country is ever fully
 * excluded from the weighted random draw — matching the v1 behavior exactly.
 */
export function applyFeedback(value: number, liked: boolean): number {
  if (liked) {
    if (value >= MAX_PREFERENCE) return MAX_PREFERENCE - LEARNING_INCREMENT;
    return Math.min(value + LEARNING_INCREMENT, MAX_PREFERENCE);
  }
  if (value <= MIN_PREFERENCE) return MIN_PREFERENCE + LEARNING_INCREMENT;
  return Math.max(value - LEARNING_INCREMENT, MIN_PREFERENCE);
}

/**
 * Run a batch of feedback against the current preference map.
 *
 * Returns a new map containing only the countries that changed — ready to be
 * persisted with a targeted DynamoDB update (never a whole-map overwrite).
 */
export function updatePreferences(current: PreferenceMap, feedback: Feedback[]): PreferenceMap {
  const changed: PreferenceMap = {};
  for (const { country, liked } of feedback) {
    const before = changed[country] ?? current[country] ?? NEUTRAL_PREFERENCE;
    changed[country] = applyFeedback(before, liked);
  }
  return changed;
}
