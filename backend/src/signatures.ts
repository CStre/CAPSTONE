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
 * The current country→signature map. Photo-derived signatures are injected by
 * `pool.ts` (`setCountrySignatures`) once the pool loads; until then — and when the
 * pool is empty — this falls back to the catalog seed.
 */
export function getCountrySignatures(): Record<string, FeatureVector> {
  cache ??= seed();
  return cache;
}

/** Replace the signature map — pool.ts injects photo-derived signatures (and tests use it). */
export function setCountrySignatures(sigs: Record<string, FeatureVector>): void {
  cache = sigs;
}
