/**
 * @fileoverview Type for the cached photo pool — kept separate from the generated
 * `photos.data.ts` so regenerating the data never clobbers the type.
 */

/** One cached photo: a hotlinked Unsplash URL plus the metadata we reason over. */
export interface CachedPhoto {
  /** ISO 3166-1 alpha-2 country code (the catalog key). */
  country: string;
  imageUrl: string;
  /** Display credit, e.g. "Photo by Annie Spratt on Unsplash". */
  attribution: string;
  /** Photographer's full name (for the linked credit). */
  photographerName: string;
  /** Photographer's Unsplash profile URL (link target for the credit). */
  photographerUrl: string;
  /** The photo's Unsplash page URL (link target for "Unsplash"). */
  unsplashUrl: string;
  tags: string[];
  color?: string;
  /** Unsplash download-tracking endpoint — pinged when the photo is used (ToS). */
  downloadLocation?: string;
}
