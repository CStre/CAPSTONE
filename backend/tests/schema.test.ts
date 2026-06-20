import { describe, it, expect } from '@jest/globals';
import { printSchema } from 'graphql';
import { schema } from '../src/schema';

describe('GraphQL schema', () => {
  const sdl = printSchema(schema);

  it('exposes the core object types', () => {
    expect(sdl).toContain('type Country');
    expect(sdl).toContain('type CountryPreference');
    expect(sdl).toContain('type TravelImage');
    expect(sdl).toContain('type User');
  });

  it('exposes the expected queries and mutations', () => {
    expect(sdl).toMatch(/countries:/);
    expect(sdl).toMatch(/travelImages\(/);
    expect(sdl).toMatch(/submitFeedback\(/);
    expect(sdl).toMatch(/deleteAccount:/);
    expect(sdl).toMatch(/recordSlideView\(/);
    expect(sdl).toMatch(/mergeLearnProgress\(/);
    expect(sdl).toMatch(/resetLearnProgress:/);
  });

  it('exposes the two-algorithm surface', () => {
    expect(sdl).toContain('type Dossier');
    expect(sdl).toContain('enum Driver');
    expect(sdl).toContain('input InteractionInput');
    expect(sdl).toMatch(/travelImages\(count: Int = 8, driver: Driver = B\)/);
    expect(sdl).toMatch(/submitFeedback\(interactions: \[InteractionInput!\]!\)/);
    expect(sdl).toMatch(/dossier: Dossier!/);
    expect(sdl).toMatch(/resetPreferences:/);
    expect(sdl).toMatch(/resetDossier:/);
  });

  it('exposes the Unsplash attribution + download-tracking surface', () => {
    expect(sdl).toMatch(/photographerName: String!/);
    expect(sdl).toMatch(/photographerUrl: String!/);
    expect(sdl).toMatch(/unsplashUrl: String!/);
    expect(sdl).toMatch(/trackPhotoUse\(downloadLocation: String!\)/);
  });
});
