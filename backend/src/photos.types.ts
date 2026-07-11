/**
 * @fileoverview Type for the cached photo pool. The data itself is not committed — it
 * is generated as `photos.json` and loaded at runtime from S3 (see `pool.ts`).
 *
 * Honesty note (decision #2): every field here is either **measured** (returned by
 * Unsplash) or **assigned by us** (`id`, `kind`, `imageUrl`). `tags`, `location*`, and
 * `exif` come from the per-photo **enrichment** call (`GET /photos/:id`); the derived
 * aesthetic axes the recommender reasons over (terrain / light / season) are computed
 * in `features.ts` from `tags` and are never stored here as if measured.
 *
 * Country provenance: `country` is the **search association** — the catalog country
 * whose query returned the photo. Enrichment now also captures `locationName`/`lat`/
 * `lng` **when the photographer geotagged the photo** (most don't); that is stored as
 * real signal but `country` is left as the catalog key. `unsplashUrl` preserves full
 * traceability to the source photo.
 */

/** Which search surfaced the photo — nature/landscape vs urban/cityscape. */
export type PhotoKind = 'landscape' | 'city';

/** Camera EXIF from the enrichment call, when the photographer included it. */
export interface PhotoExif {
  make?: string;
  model?: string;
  focalLength?: string;
  aperture?: string;
  exposureTime?: string;
  iso?: number;
}

/** One cached photo: metadata plus a same-origin `imageUrl` we reason over. */
export interface CachedPhoto {
  /** Unsplash photo id — stable, globally unique; dedup key and S3 filename stem. */
  id: string;
  /** ISO 3166-1 alpha-2 country code — the catalog key; a search association, not a verified geotag. */
  country: string;
  /** Which query surfaced it — powers the cities-vs-landscapes mix. */
  kind: PhotoKind;
  /**
   * Where the running app loads the image from. Written by the generator as
   * `${PHOTO_CDN_BASE}/${id}.jpg` (defaults to `/photos/${id}.jpg` — same-origin S3
   * via CloudFront). Falls back to `unsplashImageUrl` when no CDN base is set.
   */
  imageUrl: string;
  /** Original Unsplash CDN url — provenance + source for the S3 sync + local-dev fallback. */
  unsplashImageUrl: string;
  /** Display credit, e.g. "Photo by Annie Spratt on Unsplash". */
  attribution: string;
  /** Photographer's full name (for the linked credit). */
  photographerName: string;
  /** Photographer's Unsplash profile URL (link target for the credit). */
  photographerUrl: string;
  /** The photo's Unsplash page URL (link target for "Unsplash"). */
  unsplashUrl: string;
  /** Unsplash keyword tags — the abstract signal the recommender reasons over. */
  tags: string[];
  /** Dominant colour as a hex string. */
  color?: string;
  /** Low-res placeholder hash (BlurHash), for a smooth load-in. */
  blurHash?: string;
  /** Community like count — used as a curation quality gate. */
  likes: number;
  /** Native pixel dimensions. */
  width: number;
  height: number;
  /** Photographer-supplied description / alt text, when present. */
  description?: string;
  /** Unsplash download-tracking endpoint — pinged at runtime when a photo is liked (ToS). */
  downloadLocation?: string;
  // ── From enrichment (GET /photos/:id) ──────────────────────────────────────
  /** Human place string ("Kyoto, Japan"), when the photographer geotagged it. */
  locationName?: string;
  lat?: number;
  lng?: number;
  /** Measured camera EXIF, when included. */
  exif?: PhotoExif;
}
