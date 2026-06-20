import { describe, it, expect } from '@jest/globals';
import {
  FEATURE_KEYS,
  COLOR_FEATURE_KEYS,
  extractFeatures,
  featuresToRecord,
  hexToHsl,
  colorFeatures,
} from '../src/features';

describe('FEATURE_KEYS', () => {
  it('is large and fine-grained (Algorithm A harvests as much as possible)', () => {
    expect(FEATURE_KEYS.length).toBeGreaterThan(150);
  });

  it('has no duplicate keys', () => {
    expect(new Set(FEATURE_KEYS).size).toBe(FEATURE_KEYS.length);
  });

  it('ends with the colour-derived axes (append-only ordering)', () => {
    const tail = FEATURE_KEYS.slice(-COLOR_FEATURE_KEYS.length);
    expect(tail).toEqual([...COLOR_FEATURE_KEYS]);
  });
});

describe('extractFeatures — tags', () => {
  it('credits the matching axis for a tag', () => {
    const rec = featuresToRecord(extractFeatures({ tags: ['Mountain'] }));
    expect(rec.mountain).toBe(1);
  });

  it('matches keywords as substrings of tag words (plurals, compounds)', () => {
    const rec = featuresToRecord(extractFeatures({ tags: ['mountains', 'waterfalls'] }));
    expect(rec.mountain).toBe(1);
    expect(rec.waterfall).toBe(1);
  });

  it('is case-insensitive and splits multi-word tags', () => {
    const rec = featuresToRecord(extractFeatures({ tags: ['Golden Hour', 'CITY STREET'] }));
    expect(rec.goldenHour).toBe(1);
    expect(rec.city).toBe(1);
    expect(rec.street).toBe(1);
  });

  it('credits several axes for a rich, neutral scenic photo', () => {
    const rec = featuresToRecord(
      extractFeatures({ tags: ['snow', 'mountain', 'alpine', 'remote', 'wilderness', 'sunrise'] }),
    );
    expect(rec.snow).toBe(1);
    expect(rec.mountain).toBe(2); // 'mountain' + 'alpine' both map to mountain
    expect(rec.remoteness).toBe(2); // 'remote' + 'wilderness' both map to remoteness
    expect(rec.sunrise).toBe(1);
  });

  it('prefix matching avoids mid-word collisions (alpine ≠ pine, waterfall ≠ fall)', () => {
    const alpine = featuresToRecord(extractFeatures({ tags: ['alpine'] }));
    expect(alpine.conifer).toBeUndefined(); // 'pine' is inside 'alpine' but not a prefix
    const waterfall = featuresToRecord(extractFeatures({ tags: ['waterfall'] }));
    expect(waterfall.autumn).toBeUndefined(); // 'fall' is inside 'waterfall' but not a prefix
    expect(waterfall.waterfall).toBe(1);
  });

  it('does not credit unrelated axes', () => {
    const rec = featuresToRecord(extractFeatures({ tags: ['beach', 'palm', 'tropical'] }));
    expect(rec.mountain).toBeUndefined();
    expect(rec.snow).toBeUndefined();
    expect(rec.beach).toBe(1);
    expect(rec.palm).toBe(1);
    expect(rec.tropical).toBe(1);
  });

  it('returns an all-zero vector for no tags and no colour', () => {
    const vec = extractFeatures({ tags: [] });
    expect(vec).toHaveLength(FEATURE_KEYS.length);
    expect(vec.every((v) => v === 0)).toBe(true);
    expect(featuresToRecord(vec)).toEqual({});
  });

  it('avoids the "sea"/"season" false positive', () => {
    const rec = featuresToRecord(extractFeatures({ tags: ['season'] }));
    expect(rec.seaWater).toBeUndefined();
    expect(rec.ocean).toBeUndefined();
  });
});

describe('hexToHsl', () => {
  it('parses a hex string (with or without #)', () => {
    expect(hexToHsl('#ffffff')).toEqual({ h: 0, s: 0, l: 1 });
    expect(hexToHsl('000000')).toEqual({ h: 0, s: 0, l: 0 });
  });

  it('returns null for missing/invalid colour', () => {
    expect(hexToHsl(undefined)).toBeNull();
    expect(hexToHsl('not-a-color')).toBeNull();
    expect(hexToHsl('#fff')).toBeNull();
  });

  it('computes hue for a saturated red', () => {
    const hsl = hexToHsl('#ff0000');
    expect(hsl?.h).toBe(0);
    expect(hsl?.s).toBeGreaterThan(0.9);
  });
});

describe('colorFeatures', () => {
  it('classifies a warm, vivid red', () => {
    const cf = colorFeatures('#e23a2a');
    expect(cf).toContain('warmPalette');
    expect(cf).toContain('redHue');
    expect(cf).toContain('vividTone');
  });

  it('classifies a cool blue', () => {
    const cf = colorFeatures('#2a5fe2');
    expect(cf).toContain('coolPalette');
    expect(cf).toContain('blueHue');
  });

  it('classifies a low-saturation grey as neutral + monochrome', () => {
    const cf = colorFeatures('#7a7a7a');
    expect(cf).toContain('neutralPalette');
    expect(cf).toContain('monochrome');
  });

  it('flags a very dark colour as darkTone and a very light one as brightTone', () => {
    expect(colorFeatures('#0b132b')).toContain('darkTone');
    expect(colorFeatures('#eaf3ff')).toContain('brightTone');
  });

  it('returns nothing for no colour', () => {
    expect(colorFeatures(undefined)).toEqual([]);
  });
});

describe('extractFeatures — tags + colour together', () => {
  it('credits both tag axes and colour axes', () => {
    const rec = featuresToRecord(
      extractFeatures({ tags: ['coast', 'beach', 'sunset'], color: '#e8853a' }),
    );
    expect(rec.beach).toBe(2); // 'coast' + 'beach' both map to beach
    expect(rec.sunset).toBe(1);
    expect(rec.warmPalette).toBe(1);
    expect(rec.orangeHue).toBe(1);
  });
});
