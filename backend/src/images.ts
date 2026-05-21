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

export interface TravelImage {
  country: Country;
  imageUrl: string;
  attribution: string;
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
  user: { name: string };
  links: { download_location: string };
}

async function fetchUnsplashPhoto(country: Country, accessKey: string): Promise<TravelImage> {
  const url = new URL('https://api.unsplash.com/photos/random');
  url.searchParams.set('query', country.searchTerm);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('content_filter', 'high');

  const res = await fetch(url, { headers: { Authorization: `Client-ID ${accessKey}` } });
  if (!res.ok) throw new Error(`Unsplash request failed: ${String(res.status)}`);
  const photo = (await res.json()) as UnsplashPhoto;

  // Unsplash API guideline: trigger the photo's download endpoint (fire-and-forget).
  void fetch(photo.links.download_location, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  }).catch(() => undefined);

  return {
    country,
    imageUrl: photo.urls.regular,
    attribution: `Photo by ${photo.user.name} on Unsplash`,
  };
}

function placeholderImage(country: Country): TravelImage {
  return {
    country,
    imageUrl: `https://picsum.photos/seed/${country.code}/1200/800`,
    attribution: 'Placeholder image (no Unsplash key configured)',
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
