import { describe, it, expect } from '@jest/globals';
import { curatePhotos, isDenied, DEFAULT_DENY_TERMS } from '../src/photos.curate';
import type { CachedPhoto } from '../src/photos.types';

/** Minimal CachedPhoto factory for tests. */
function photo(overrides: Partial<CachedPhoto> & { id: string }): CachedPhoto {
  return {
    country: 'JP',
    kind: 'landscape',
    imageUrl: `/photos/${overrides.id}.jpg`,
    unsplashImageUrl: `https://images.unsplash.com/${overrides.id}`,
    attribution: 'Photo by Test on Unsplash',
    photographerName: 'Test',
    photographerUrl: 'https://unsplash.com/@test',
    unsplashUrl: `https://unsplash.com/photos/${overrides.id}`,
    tags: ['mountain', 'nature'],
    likes: 100,
    width: 4000,
    height: 3000,
    ...overrides,
  };
}

describe('isDenied', () => {
  it('flags a photo whose tag hits the denylist', () => {
    expect(isDenied(photo({ id: 'a', tags: ['food', 'sunset'] }), DEFAULT_DENY_TERMS)).toBe(true);
  });

  it('flags a photo whose description hits the denylist', () => {
    expect(
      isDenied(
        photo({ id: 'b', tags: ['city'], description: 'A cozy interior' }),
        DEFAULT_DENY_TERMS,
      ),
    ).toBe(true);
  });

  it('passes a clean cities/landscapes photo', () => {
    expect(isDenied(photo({ id: 'c', tags: ['mountain', 'lake'] }), DEFAULT_DENY_TERMS)).toBe(
      false,
    );
  });
});

describe('curatePhotos', () => {
  it('drops photos below the like threshold', () => {
    const kept = curatePhotos([photo({ id: 'a', likes: 5 }), photo({ id: 'b', likes: 200 })], {
      perCountry: 10,
      minLikes: 50,
    });
    expect(kept.map((p) => p.id)).toEqual(['b']);
  });

  it('drops denylisted photos', () => {
    const kept = curatePhotos(
      [photo({ id: 'a', tags: ['table', 'food'] }), photo({ id: 'b', tags: ['coast'] })],
      { perCountry: 10, minLikes: 0 },
    );
    expect(kept.map((p) => p.id)).toEqual(['b']);
  });

  it('caps to perCountry', () => {
    const many = Array.from({ length: 40 }, (_, i) => photo({ id: `p${String(i)}` }));
    expect(curatePhotos(many, { perCountry: 15, minLikes: 0 })).toHaveLength(15);
  });

  it('interleaves landscape and city so the mix is balanced', () => {
    const candidates = [
      photo({ id: 'l1', kind: 'landscape' }),
      photo({ id: 'l2', kind: 'landscape' }),
      photo({ id: 'l3', kind: 'landscape' }),
      photo({ id: 'c1', kind: 'city' }),
      photo({ id: 'c2', kind: 'city' }),
    ];
    const kept = curatePhotos(candidates, { perCountry: 4, minLikes: 0 });
    // landscape/city alternate, so the top 4 include both kinds evenly.
    expect(kept.map((p) => p.id)).toEqual(['l1', 'c1', 'l2', 'c2']);
  });

  it('dedupes within a batch by id', () => {
    const kept = curatePhotos(
      [photo({ id: 'dup' }), photo({ id: 'dup' }), photo({ id: 'other' })],
      { perCountry: 10, minLikes: 0 },
    );
    expect(kept.map((p) => p.id).sort()).toEqual(['dup', 'other']);
  });

  it('excludes ids already seen across the whole pool and records kept ids', () => {
    const seenIds = new Set<string>(['already']);
    const kept = curatePhotos([photo({ id: 'already' }), photo({ id: 'fresh' })], {
      perCountry: 10,
      minLikes: 0,
      seenIds,
    });
    expect(kept.map((p) => p.id)).toEqual(['fresh']);
    expect(seenIds.has('fresh')).toBe(true);
  });

  it('does not mark capped-out photos as seen', () => {
    const seenIds = new Set<string>();
    curatePhotos([photo({ id: 'keep' }), photo({ id: 'drop' })], {
      perCountry: 1,
      minLikes: 0,
      seenIds,
    });
    expect(seenIds.has('keep')).toBe(true);
    expect(seenIds.has('drop')).toBe(false); // still available for another country
  });
});
