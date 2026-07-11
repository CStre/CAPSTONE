/**
 * @fileoverview Pure curation of raw Unsplash candidates into the cached pool.
 *
 * The generator fetches more candidates than it keeps (two queries per country —
 * landscape + cityscape) and hands them here to be filtered and trimmed. Kept pure
 * and deterministic so the guardrail is unit-testable without the network:
 *
 *   1. **Dedupe** by Unsplash id (also drops a photo already kept for another
 *      country — the id is globally unique).
 *   2. **Quality gate** — drop anything below `minLikes`, or whose tags/description
 *      hit the denylist (food, interiors, people, text… the "photo of a table"
 *      problem), keeping the demo to cities and landscapes.
 *   3. **Balance & cap** — interleave landscape/city so the per-country set is a mix,
 *      then cap at `perCountry`.
 */
import type { CachedPhoto, PhotoKind } from './photos.types';

/** Tags/description substrings that disqualify a photo (lowercased match). */
export const DEFAULT_DENY_TERMS = [
  // People (whole-word matching means "man" no longer hits "Oman"/"Germany")
  'person',
  'people',
  'human',
  'man',
  'woman',
  'child',
  'kid',
  'boy',
  'girl',
  'crowd',
  'portrait',
  'face',
  'selfie',
  'model',
  'hair',
  'hand',
  'skin',
  'wedding',
  'bride',
  'groom',
  'fashion',
  // Food & drink
  'food',
  'meal',
  'table',
  'restaurant',
  'drink',
  'coffee',
  'plate',
  'breakfast',
  'lunch',
  'dinner',
  'dish',
  'cuisine',
  'dessert',
  'cake',
  'fruit',
  'vegetable',
  'wine',
  'beer',
  'cocktail',
  'cafe',
  'kitchen',
  'cooking',
  'bakery',
  'pizza',
  'burger',
  'salad',
  'soup',
  'bread',
  'snack',
  // Indoor / domestic
  'indoor',
  'interior',
  'room',
  'furniture',
  'bedroom',
  'bathroom',
  'desk',
  'sofa',
  'couch',
  'bed',
  'chair',
  'lamp',
  // Pets / close-up animals
  'dog',
  'cat',
  'pet',
  'puppy',
  'kitten',
  // Objects / products / graphics
  'text',
  'laptop',
  'computer',
  'smartphone',
  'phone',
  'product',
  'mockup',
  'logo',
  'poster',
  'book',
  'shoe',
  'clothing',
  'jewelry',
  'watch',
  'bottle',
  'toy',
] as const;

export interface CurateOptions {
  /** Max photos to keep per country. */
  perCountry: number;
  /** Minimum Unsplash likes to clear the quality gate. */
  minLikes: number;
  /** Lowercased substrings that disqualify a photo via its tags or description. */
  denyTerms?: readonly string[];
  /** Ids already committed elsewhere — excluded so the whole pool stays unique. */
  seenIds?: Set<string>;
}

/** True when a photo trips the denylist on any tag or its description. Matches whole
 * WORDS, not substrings, so "table" no longer flags "vegetable", "bar" "harbor", or
 * "text" "texture" — which lets the list grow without collateral damage. */
export function isDenied(photo: CachedPhoto, denyTerms: readonly string[]): boolean {
  const deny = new Set(denyTerms.map((t) => t.toLowerCase()));
  const words = [...photo.tags, photo.description ?? '']
    .join(' ')
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
  return words.some((w) => deny.has(w));
}

/** Interleave two ordered lists (a, b, a, b, …), appending any remainder. */
function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (i < a.length) out.push(a[i] as T);
    if (i < b.length) out.push(b[i] as T);
  }
  return out;
}

/**
 * Filter and trim candidates for a single country. Mutates `seenIds` (adds the ids
 * it keeps) so a caller looping over countries never repeats a photo across the pool.
 */
export function curatePhotos(candidates: CachedPhoto[], opts: CurateOptions): CachedPhoto[] {
  const { perCountry, minLikes } = opts;
  const denyTerms = opts.denyTerms ?? DEFAULT_DENY_TERMS;
  const seenIds = opts.seenIds ?? new Set<string>();

  const eligible: Record<PhotoKind, CachedPhoto[]> = { landscape: [], city: [] };
  const localSeen = new Set<string>();
  for (const photo of candidates) {
    if (seenIds.has(photo.id) || localSeen.has(photo.id)) continue;
    if (photo.likes < minLikes) continue;
    if (isDenied(photo, denyTerms)) continue;
    localSeen.add(photo.id); // dedupe within this batch before the cap
    eligible[photo.kind].push(photo);
  }

  // Only the photos that survive the cap are committed to the global seen set.
  const kept = interleave(eligible.landscape, eligible.city).slice(0, perCountry);
  for (const photo of kept) seenIds.add(photo.id);
  return kept;
}
