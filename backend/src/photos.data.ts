/**
 * @fileoverview Precomputed per-country photo pool — the cached, metadata-enriched
 * photos that feed both country signatures (`signatures.ts`) and the Travel feed
 * (`images.ts`), so runtime Unsplash calls drop to ~zero (no rate-limit pressure).
 *
 * **Generated**, not hand-edited: run `npm run build:photos` (needs an Unsplash key)
 * to fetch a batch per country and overwrite this file. Empty by default — until then
 * the app falls back to live Unsplash fetches and seed signatures.
 */
import type { CachedPhoto } from './photos.types';

/** countryCode → its cached photos. Empty until generated. */
export const PHOTO_POOL: Record<string, CachedPhoto[]> = {};
