/**
 * @fileoverview Auth provider — tracks the Cognito session and exposes it.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { signOut } from 'aws-amplify/auth';
import { AuthContext } from './context';
import { loadCurrentUser } from './session';
import type { AuthContextValue, AuthStatus, AuthUser } from './types';

/** Provides auth state to the tree and keeps it in sync with Cognito. */
export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  const reload = useCallback(async () => {
    const current = await loadCurrentUser();
    setUser(current);
    setStatus(current ? 'authenticated' : 'unauthenticated');
  }, []);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // Resolve the initial session on mount; setState runs in the async callback.
  useEffect(() => {
    let cancelled = false;
    void loadCurrentUser().then((current) => {
      if (cancelled) return;
      setUser(current);
      setStatus(current ? 'authenticated' : 'unauthenticated');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, reload, logout }),
    [status, user, reload, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
