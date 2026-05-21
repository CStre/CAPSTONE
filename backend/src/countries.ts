/**
 * @fileoverview The country catalog — static server-side config.
 *
 * Each country has a stable `code` (ISO 3166-1 alpha-2), a display `name`, and an
 * Unsplash `searchTerm` used to fetch representative travel photos.
 *
 * This is just data: the catalog can grow to any size (a curated set, or all ~195
 * countries) with no code or schema changes. Per-user preferences key off `code`,
 * so reordering or extending this list never breaks stored data.
 */

export interface Country {
  /** ISO 3166-1 alpha-2 code — the stable key for preferences. */
  code: string;
  /** Human-readable country name. */
  name: string;
  /** Query string sent to the Unsplash photo search. */
  searchTerm: string;
}

/** Curated starter catalog — extend freely; size does not affect the data model. */
export const COUNTRIES: readonly Country[] = [
  { code: 'FR', name: 'France', searchTerm: 'Paris France' },
  { code: 'IT', name: 'Italy', searchTerm: 'Rome Italy' },
  { code: 'ES', name: 'Spain', searchTerm: 'Barcelona Spain' },
  { code: 'GB', name: 'United Kingdom', searchTerm: 'London England' },
  { code: 'DE', name: 'Germany', searchTerm: 'Berlin Germany' },
  { code: 'CH', name: 'Switzerland', searchTerm: 'Swiss Alps' },
  { code: 'NL', name: 'Netherlands', searchTerm: 'Amsterdam Netherlands' },
  { code: 'PT', name: 'Portugal', searchTerm: 'Lisbon Portugal' },
  { code: 'IE', name: 'Ireland', searchTerm: 'Ireland landscape' },
  { code: 'GR', name: 'Greece', searchTerm: 'Santorini Greece' },
  { code: 'NO', name: 'Norway', searchTerm: 'Lofoten Norway' },
  { code: 'FI', name: 'Finland', searchTerm: 'Helsinki Finland' },
  { code: 'IS', name: 'Iceland', searchTerm: 'Reykjavik Iceland' },
  { code: 'US', name: 'United States', searchTerm: 'New York City' },
  { code: 'CA', name: 'Canada', searchTerm: 'Banff Canada' },
  { code: 'MX', name: 'Mexico', searchTerm: 'Mexico City' },
  { code: 'BR', name: 'Brazil', searchTerm: 'Rio de Janeiro Brazil' },
  { code: 'AR', name: 'Argentina', searchTerm: 'Buenos Aires Argentina' },
  { code: 'PE', name: 'Peru', searchTerm: 'Machu Picchu Peru' },
  { code: 'JP', name: 'Japan', searchTerm: 'Kyoto Japan' },
  { code: 'KR', name: 'South Korea', searchTerm: 'Seoul South Korea' },
  { code: 'CN', name: 'China', searchTerm: 'Beijing China' },
  { code: 'TH', name: 'Thailand', searchTerm: 'Bangkok Thailand' },
  { code: 'VN', name: 'Vietnam', searchTerm: 'Hanoi Vietnam' },
  { code: 'IN', name: 'India', searchTerm: 'Jaipur India' },
  { code: 'SG', name: 'Singapore', searchTerm: 'Singapore city' },
  { code: 'AE', name: 'United Arab Emirates', searchTerm: 'Dubai' },
  { code: 'TR', name: 'Turkey', searchTerm: 'Istanbul Turkey' },
  { code: 'EG', name: 'Egypt', searchTerm: 'Cairo Egypt' },
  { code: 'MA', name: 'Morocco', searchTerm: 'Marrakech Morocco' },
  { code: 'ZA', name: 'South Africa', searchTerm: 'Cape Town South Africa' },
  { code: 'AU', name: 'Australia', searchTerm: 'Sydney Australia' },
  { code: 'NZ', name: 'New Zealand', searchTerm: 'Queenstown New Zealand' },
];

/** Fast lookup by country code. */
export const COUNTRY_BY_CODE: ReadonlyMap<string, Country> = new Map(
  COUNTRIES.map((c) => [c.code, c]),
);

/** True if a code exists in the catalog. */
export function isValidCountryCode(code: string): boolean {
  return COUNTRY_BY_CODE.has(code);
}
