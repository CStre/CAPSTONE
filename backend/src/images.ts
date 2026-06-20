/**
 * @fileoverview Travel image selection and fetching.
 *
 * Picks countries by weighted random draw — a country's preference value is its
 * weight, ported from the v1 places.py logic — and fetches a representative photo
 * for each from the Unsplash API. Without an Unsplash key it returns placeholder
 * images so local development works offline.
 */
import { COUNTRIES, type Country } from './countries';
import { NEUTRAL_PREFERENCE, type PreferenceMap } from './algorithm';
import { config } from './config';
import { PHOTO_POOL } from './photos.data';
import type { CachedPhoto } from './photos.types';

const COUNTRY_BY_CODE: Record<string, Country> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c]),
);

export interface TravelImage {
  country: Country;
  imageUrl: string;
  attribution: string;
  /** Photographer's full name (for the linked credit). */
  photographerName: string;
  /** Photographer's Unsplash profile URL. */
  photographerUrl: string;
  /** The photo's Unsplash page URL. */
  unsplashUrl: string;
  /** Unsplash keyword tags — the abstract signal the recommender reasons over. */
  tags: string[];
  /** Dominant colour as a hex string, when Unsplash provides one. */
  color?: string;
  /** Unsplash download-tracking endpoint — ping via trackPhotoUse when the photo is used. */
  downloadLocation?: string;
}

/**
 * Pick `count` countries weighted by preference value. Draws are independent, so a
 * country may appear more than once in a batch (matches the v1 behavior).
 */
export function selectCountries(
  preferences: PreferenceMap,
  count: number,
  rng: () => number = Math.random,
): Country[] {
  const weights = COUNTRIES.map((c) => Math.max(preferences[c.code] ?? NEUTRAL_PREFERENCE, 0));
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (count <= 0 || total <= 0) return [];

  const picks: Country[] = [];
  for (let n = 0; n < count; n++) {
    let r = rng() * total;
    for (let i = 0; i < COUNTRIES.length; i++) {
      r -= weights[i] ?? 0;
      const country = COUNTRIES[i];
      if (country && r <= 0) {
        picks.push(country);
        break;
      }
    }
  }
  return picks;
}

interface UnsplashPhoto {
  urls: { regular: string };
  user: { name: string; links: { html: string } };
  links: { html: string; download_location: string };
  tags?: { title: string }[];
  color?: string;
}

/**
 * Ping a photo's Unsplash download endpoint (fire-and-forget) — required by the API
 * guidelines whenever a photo is *used*. No-op without a key.
 */
export function triggerDownload(downloadLocation: string): void {
  const key = config.unsplashAccessKey;
  if (!key || !downloadLocation) return;
  void fetch(downloadLocation, { headers: { Authorization: `Client-ID ${key}` } }).catch(
    () => undefined,
  );
}

async function fetchUnsplashPhoto(country: Country, accessKey: string): Promise<TravelImage> {
  const url = new URL('https://api.unsplash.com/photos/random');
  url.searchParams.set('query', country.searchTerm);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('content_filter', 'high');

  const res = await fetch(url, { headers: { Authorization: `Client-ID ${accessKey}` } });
  if (!res.ok) throw new Error(`Unsplash request failed: ${String(res.status)}`);
  const photo = (await res.json()) as UnsplashPhoto;

  return {
    country,
    imageUrl: photo.urls.regular,
    attribution: `Photo by ${photo.user.name} on Unsplash`,
    photographerName: photo.user.name,
    photographerUrl: photo.user.links.html,
    unsplashUrl: photo.links.html,
    tags: photo.tags?.map((t) => t.title).filter(Boolean) ?? [],
    color: photo.color,
    downloadLocation: photo.links.download_location,
  };
}

function placeholderImage(country: Country): TravelImage {
  return {
    country,
    imageUrl: `https://picsum.photos/seed/${country.code}/1200/800`,
    attribution: 'Placeholder image (no Unsplash key configured)',
    photographerName: 'Lorem Picsum',
    photographerUrl: 'https://picsum.photos',
    unsplashUrl: 'https://picsum.photos',
    tags: [],
  };
}

/** Select countries by preference weight and fetch a travel photo for each. */
export async function fetchTravelImages(
  preferences: PreferenceMap,
  count: number,
): Promise<TravelImage[]> {
  const countries = selectCountries(preferences, count);
  const key = config.unsplashAccessKey;
  return Promise.all(
    countries.map(async (country) => {
      if (!key) return placeholderImage(country);
      try {
        return await fetchUnsplashPhoto(country, key);
      } catch {
        return placeholderImage(country);
      }
    }),
  );
}

/** Map a cached photo (only catalog countries) to a TravelImage. */
function cachedToTravelImage(p: CachedPhoto): TravelImage | null {
  const country = COUNTRY_BY_CODE[p.country];
  if (!country) return null;
  return {
    country,
    imageUrl: p.imageUrl,
    attribution: p.attribution,
    photographerName: p.photographerName,
    photographerUrl: p.photographerUrl,
    unsplashUrl: p.unsplashUrl,
    tags: p.tags,
    color: p.color,
    downloadLocation: p.downloadLocation,
  };
}

/**
 * A neutral candidate pool for the driver to select from. Prefers the precomputed
 * `PHOTO_POOL` (zero runtime Unsplash calls); falls back to a live neutral fetch
 * until the pool is generated.
 */
export async function getImagePool(
  count: number,
  rng: () => number = Math.random,
): Promise<TravelImage[]> {
  const flat = Object.values(PHOTO_POOL)
    .flat()
    .map(cachedToTravelImage)
    .filter((x): x is TravelImage => x !== null);

  if (flat.length === 0) return fetchTravelImages({}, count);

  // Sample `count` distinct photos at random from the cached pool.
  const picks: TravelImage[] = [];
  const pool = [...flat];
  while (picks.length < count && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    const [chosen] = pool.splice(idx, 1);
    if (chosen) picks.push(chosen);
  }
  return picks;
}
