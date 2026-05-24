/**
 * @fileoverview Auth context and the useAuth hook.
 *
 * Kept separate from AuthProvider.tsx so that file can export only a component
 * (a requirement of React Fast Refresh).
 */
import { createContext, useContext } from 'react';
import type { AuthContextValue } from './types';

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Access the auth context. Throws if used outside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }
  return value;
}
