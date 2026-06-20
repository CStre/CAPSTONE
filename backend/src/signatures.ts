/**
 * @fileoverview Per-country feature signatures — the abstract profile each country's
 * photos average to. Both algorithms rank countries by cosine(taste, signature), so
 * preference is reconstructed from abstract features, never a location lookup (§1b).
 *
 * **Seed for now:** signatures are derived from each catalog country's search term +
 * name as pseudo-tags. This is a cheap, real stand-in so scoring differentiates and is
 * testable before the cache exists. **Step 3 (B8)** replaces the seed with signatures
 * computed from the cached, metadata-enriched photo pool via `setCountrySignatures`.
 */
import { COUNTRIES } from './countries';
import { countrySignature } from './scoring';
import type { FeatureVector, ImageFeatureInput } from './features';
import { PHOTO_POOL } from './photos.data';

let cache: Record<string, FeatureVector> | null = null;

function seed(): Record<string, FeatureVector> {
  const out: Record<string, FeatureVector> = {};
  for (const c of COUNTRIES) {
    const tags = `${c.searchTerm} ${c.name}`.split(/\s+/).filter(Boolean);
    out[c.code] = countrySignature([{ tags }]);
  }
  return out;
}

/** Compute a signature per country from a pool of enriched photos. */
export function signaturesFromPool(
  pool: Record<string, ImageFeatureInput[]>,
): Record<string, FeatureVector> {
  const out: Record<string, FeatureVector> = {};
  for (const [code, photos] of Object.entries(pool)) {
    out[code] = countrySignature(photos);
  }
  return out;
}

/**
 * The current country→signature map. Prefers the precomputed photo pool (real,
 * photo-derived signatures); falls back to the catalog seed until the pool exists.
 */
export function getCountrySignatures(): Record<string, FeatureVector> {
  cache ??= Object.keys(PHOTO_POOL).length > 0 ? signaturesFromPool(PHOTO_POOL) : seed();
  return cache;
}

/** Replace the signature map — used by step 3 to inject cached-pool signatures (and by tests). */
export function setCountrySignatures(sigs: Record<string, FeatureVector>): void {
  cache = sigs;
}
