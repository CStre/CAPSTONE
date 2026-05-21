import { describe, it, expect } from '@jest/globals';
import {
  applyFeedback,
  updatePreferences,
  NEUTRAL_PREFERENCE,
  LEARNING_INCREMENT,
  MIN_PREFERENCE,
  MAX_PREFERENCE,
} from '../src/algorithm';

describe('applyFeedback', () => {
  it('adds the increment on a like', () => {
    expect(applyFeedback(50, true)).toBe(55);
  });

  it('subtracts the increment on a dislike', () => {
    expect(applyFeedback(50, false)).toBe(45);
  });

  it('caps a like at the maximum', () => {
    expect(applyFeedback(98, true)).toBe(MAX_PREFERENCE);
  });

  it('bounces a like off the max rail (100 -> 95)', () => {
    expect(applyFeedback(MAX_PREFERENCE, true)).toBe(MAX_PREFERENCE - LEARNING_INCREMENT);
  });

  it('floors a dislike at the minimum', () => {
    expect(applyFeedback(2, false)).toBe(MIN_PREFERENCE);
  });

  it('bounces a dislike off the min rail (0 -> 5)', () => {
    expect(applyFeedback(MIN_PREFERENCE, false)).toBe(MIN_PREFERENCE + LEARNING_INCREMENT);
  });
});

describe('updatePreferences', () => {
  it('starts an unseen country from the neutral default', () => {
    const changed = updatePreferences({}, [{ country: 'FR', liked: true }]);
    expect(changed.FR).toBe(NEUTRAL_PREFERENCE + LEARNING_INCREMENT);
  });

  it('returns only the countries that changed', () => {
    const changed = updatePreferences({ FR: 50, JP: 50 }, [{ country: 'FR', liked: true }]);
    expect(Object.keys(changed)).toEqual(['FR']);
  });

  it('uses the stored value as the starting point', () => {
    const changed = updatePreferences({ FR: 80 }, [{ country: 'FR', liked: false }]);
    expect(changed.FR).toBe(75);
  });

  it('compounds repeated feedback for the same country', () => {
    const changed = updatePreferences({ FR: 50 }, [
      { country: 'FR', liked: true },
      { country: 'FR', liked: true },
    ]);
    expect(changed.FR).toBe(60);
  });

  it('does not mutate the input map', () => {
    const current = { FR: 50 };
    updatePreferences(current, [{ country: 'FR', liked: true }]);
    expect(current.FR).toBe(50);
  });
});
