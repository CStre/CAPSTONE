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
  });
});
