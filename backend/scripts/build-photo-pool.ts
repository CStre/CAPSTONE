/**
 * @fileoverview Generates the cached photo pool metadata (`backend/photos.json`) — Step A.
 *
 * For each catalog country, runs TWO Unsplash searches — a landscape/nature query
 * and a cityscape query — curates the candidates down to a unique, mixed set
 * (see `photos.curate.ts`), then **enriches** each kept photo with a `GET /photos/:id`
 * call for its real `tags` (search results carry none) plus `location` + `exif`.
 * The metadata is written as `photos.json` (NOT committed); Step B uploads it to S3,
 * and the Lambda loads it at runtime (`pool.ts`), so the running app makes ZERO
 * Unsplash API calls.
 *
 * Country is a **search association**, not a verified geotag (see photos.types.ts).
 *
 * ── Rate limits & resumability ──────────────────────────────────────────────
 * Every call (2 searches + up to PER_COUNTRY enrichment calls per country) shares the
 * demo-mode budget of 50 req/hr, so a full 228-country run is ~2.5–3 days. A single
 * global gate spaces ALL calls ≥ THROTTLE_MS apart. The run is **resumable**: it loads
 * any existing `photos.json` and skips countries already populated, writing a country
 * only after all its photos are enriched — so an interrupted background run picks up
 * cleanly (at most one country of re-work).
 *
 *   UNSPLASH_ACCESS_KEY=... npm run build:photos            # full run (~2.5–3 days demo)
 *   PHOTOS_PER_COUNTRY=8 PHOTOS_MAX_COUNTRIES=10 \
 *     UNSPLASH_ACCESS_KEY=... npm run build:photos          # quick local sample
 *   PHOTOS_ENRICH=0 UNSPLASH_ACCESS_KEY=... npm run build:photos  # skip enrichment (no tags)
 *   PHOTOS_RESET=1 UNSPLASH_ACCESS_KEY=... npm run build:photos   # ignore existing, start fresh
 *
 * Image hosting (S3) is Step B — see `sync-photos-s3.ts`. `imageUrl` is written from
 * PHOTO_CDN_BASE (default `/photos`) so photos load same-origin once synced; the
 * original CDN url is retained in `unsplashImageUrl` as the sync source + local fallback.
 */
import 'dotenv/config'; // load UNSPLASH_ACCESS_KEY (and any PHOTOS_* knobs) from backend/.env
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COUNTRIES, type Country } from '../src/countries';
import { config } from '../src/config';
import { curatePhotos, isDenied, DEFAULT_DENY_TERMS } from '../src/photos.curate';
import type { CachedPhoto, PhotoKind } from '../src/photos.types';

/** Photos kept per country after curation. */
const PER_COUNTRY = Number(process.env.PHOTOS_PER_COUNTRY ?? 15);
/** How many catalog countries to process (default: all). */
const MAX_COUNTRIES = Number(process.env.PHOTOS_MAX_COUNTRIES ?? Number.MAX_SAFE_INTEGER);
/** Candidates requested per search (before curation). Max 30 per Unsplash. */
const PER_PAGE = Number(process.env.PHOTOS_PER_PAGE ?? 25);
/** Minimum Unsplash likes to clear the quality gate. Default 0: a like gate starves
 * the catalog's many niche countries (their Unsplash coverage is thin and low-liked),
 * while popular countries fill up regardless because results come back in relevance
 * order and we keep that order. content_filter=high + landscape orientation + the tag
 * denylist do the quality work; raise PHOTOS_MIN_LIKES to bias popular countries harder. */
const MIN_LIKES = Number(process.env.PHOTOS_MIN_LIKES ?? 0);
/** Delay between API calls (ms). Demo mode (50/hr) needs ≥72000; production (5000/hr) ~800. */
const THROTTLE_MS = Number(process.env.PHOTOS_THROTTLE_MS ?? 73000);
/** When set, ignore any existing pool and rebuild from scratch. */
const RESET = Boolean(process.env.PHOTOS_RESET);
/** Enrich each kept photo (GET /photos/:id) for real tags + location + exif. On by
 * default — search results carry no tags. Set PHOTOS_ENRICH=0 to skip (much faster,
 * but photos will have empty tags). */
const ENRICH = process.env.PHOTOS_ENRICH !== '0';
/** Base for the same-origin image URL baked into the pool. */
const CDN_BASE = (process.env.PHOTO_CDN_BASE ?? '/photos').replace(/\/$/, '');

const OUTPUT_PATH = join(import.meta.dirname, '..', 'photos.json');

/** The subset of Unsplash `/search/photos` result fields we consume. */
interface SearchPhoto {
  id: string;
  urls: { regular: string };
  user: { name: string; links: { html: string } };
  links: { html: string; download_location: string };
  tags?: { title: string }[];
  color?: string;
  blur_hash?: string;
  likes?: number;
  width?: number;
  height?: number;
  description?: string;
  alt_description?: string;
}

/** Full photo fields we consume from the enrichment call (GET /photos/:id). */
interface FullPhoto {
  tags?: { title: string }[];
  location?: {
    name?: string | null;
    position?: { latitude?: number | null; longitude?: number | null };
  };
  exif?: {
    make?: string | null;
    model?: string | null;
    focal_length?: string | null;
    aperture?: string | null;
    exposure_time?: string | null;
    iso?: number | null;
  };
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

// A single global gate: every Unsplash call (search + enrichment) waits so that all
// requests are spaced ≥ THROTTLE_MS apart, keeping the whole run under the hourly cap.
let lastCallAt = 0;
async function gate(): Promise<void> {
  const wait = THROTTLE_MS - (Date.now() - lastCallAt);
  if (wait > 0) await sleep(wait);
  lastCallAt = Date.now();
}

/** Rate-limited GET. On a rate-limit 403 (hourly quota exhausted) it waits for the
 * window to reset and retries, so a multi-day run survives quota blips unattended
 * instead of stopping. Real (non-rate) errors fall through to the caller. */
async function unsplash(url: URL | string, key: string): Promise<Response> {
  for (;;) {
    await gate();
    const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
    if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
      console.error(`${new Date().toISOString()} rate limit reached — waiting 1h for reset…`);
      await sleep(60 * 60 * 1000 + 60_000); // 1h + buffer
      continue;
    }
    return res;
  }
}

/** One Unsplash search. Throws on a non-OK response so the caller can react to 403s. */
async function search(query: string, key: string): Promise<SearchPhoto[]> {
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('content_filter', 'high');
  url.searchParams.set('per_page', String(PER_PAGE));
  const res = await unsplash(url, key);
  if (!res.ok) throw new Error(`Unsplash search failed (${String(res.status)}) for "${query}"`);
  const body = (await res.json()) as { results: SearchPhoto[] };
  return body.results;
}

/** Enrich a photo in place with its real tags + location + exif (GET /photos/:id). */
async function enrich(photo: CachedPhoto, key: string): Promise<void> {
  const res = await unsplash(`https://api.unsplash.com/photos/${photo.id}`, key);
  if (!res.ok) throw new Error(`Unsplash enrich failed (${String(res.status)}) for ${photo.id}`);
  const full = (await res.json()) as FullPhoto;

  const tags = full.tags?.map((t) => t.title).filter(Boolean) ?? [];
  if (tags.length > 0) photo.tags = tags;

  const name = full.location?.name;
  if (name) photo.locationName = name;
  const lat = full.location?.position?.latitude;
  const lng = full.location?.position?.longitude;
  if (typeof lat === 'number') photo.lat = lat;
  if (typeof lng === 'number') photo.lng = lng;

  const e = full.exif;
  if (e) {
    const exif: NonNullable<CachedPhoto['exif']> = {};
    if (e.make) exif.make = e.make;
    if (e.model) exif.model = e.model;
    if (e.focal_length) exif.focalLength = e.focal_length;
    if (e.aperture) exif.aperture = e.aperture;
    if (e.exposure_time) exif.exposureTime = e.exposure_time;
    if (typeof e.iso === 'number') exif.iso = e.iso;
    if (Object.keys(exif).length > 0) photo.exif = exif;
  }
}

/** Map a raw search result to a CachedPhoto for the given country + kind. */
function toCachedPhoto(p: SearchPhoto, country: Country, kind: PhotoKind): CachedPhoto {
  const photo: CachedPhoto = {
    id: p.id,
    country: country.code,
    kind,
    imageUrl: `${CDN_BASE}/${p.id}.jpg`,
    unsplashImageUrl: p.urls.regular,
    attribution: `Photo by ${p.user.name} on Unsplash`,
    photographerName: p.user.name,
    photographerUrl: p.user.links.html,
    unsplashUrl: p.links.html,
    tags: p.tags?.map((t) => t.title).filter(Boolean) ?? [],
    likes: p.likes ?? 0,
    width: p.width ?? 0,
    height: p.height ?? 0,
    downloadLocation: p.links.download_location,
  };
  if (p.color) photo.color = p.color;
  if (p.blur_hash) photo.blurHash = p.blur_hash;
  const desc = p.description ?? p.alt_description;
  if (desc) photo.description = desc;
  return photo;
}

/** A city-focused query companion to the catalog's landscape `searchTerm`. Short, for
 * the same recall reason (see countries.ts) — "<name> city skyline cityscape" starves
 * niche countries; "<name> city" returns far more. */
function cityTerm(country: Country): string {
  return `${country.name} city`;
}

/** Load an existing pool (for resumable runs); {} on any miss. */
function loadExistingPool(): Record<string, CachedPhoto[]> {
  if (RESET) return {};
  try {
    return JSON.parse(readFileSync(OUTPUT_PATH, 'utf8')) as Record<string, CachedPhoto[]>;
  } catch {
    return {};
  }
}

function writePool(pool: Record<string, CachedPhoto[]>): void {
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(pool, null, 2)}\n`);
}

async function main(): Promise<void> {
  const key = config.unsplashAccessKey;
  if (!key) throw new Error('UNSPLASH_ACCESS_KEY is required to build the photo pool.');

  const pool = loadExistingPool();
  const seenIds = new Set<string>(
    Object.values(pool)
      .flat()
      .map((p) => p.id),
  );

  const targets = COUNTRIES.slice(0, MAX_COUNTRIES);
  let processed = 0;
  for (const country of targets) {
    // Resume: skip countries already populated by an earlier run.
    if (!RESET && (pool[country.code]?.length ?? 0) > 0) {
      console.log(`${country.code}: skip (already ${String(pool[country.code]?.length)})`);
      continue;
    }

    try {
      const landscape = await search(country.searchTerm, key);
      const city = await search(cityTerm(country), key);

      const candidates = [
        ...landscape.map((p) => toCachedPhoto(p, country, 'landscape')),
        ...city.map((p) => toCachedPhoto(p, country, 'city')),
      ];
      const kept = curatePhotos(candidates, {
        perCountry: PER_COUNTRY,
        minLikes: MIN_LIKES,
        seenIds,
      });

      // Enrich each kept photo with real tags + location + exif. Done before the
      // country is committed to `pool`, so an interrupt leaves no half-enriched country.
      if (ENRICH) {
        for (const photo of kept) await enrich(photo, key);
      }

      // Real tags only exist after enrichment, so re-apply the denylist here — this is
      // what catches people/portrait shots that had bland descriptions at curation time.
      const clean = ENRICH ? kept.filter((p) => !isDenied(p, DEFAULT_DENY_TERMS)) : kept;

      pool[country.code] = clean;
      processed++;
      writePool(pool); // checkpoint after every country so a long run is resumable
      const dropped = kept.length - clean.length;
      console.log(
        `${country.code}: ${String(clean.length)} kept` +
          (dropped > 0 ? ` (${String(dropped)} dropped on real tags)` : ''),
      );
    } catch (err) {
      const msg = (err as Error).message;
      console.error(`${country.code}: ${msg}`);
      if (msg.includes('403')) {
        console.error('Rate limit reached — progress saved; re-run to resume this country.');
        writePool(pool);
        break;
      }
    }
  }

  const total = Object.values(pool).reduce((n, ps) => n + ps.length, 0);
  console.log(
    `Wrote ${OUTPUT_PATH} — ${String(total)} photos across ` +
      `${String(Object.keys(pool).length)} countries (${String(processed)} processed this run).`,
  );
}

void main();
