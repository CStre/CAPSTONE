import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useAuth } from './context';

describe('useAuth', () => {
  it('throws when used outside an AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
  });
});
