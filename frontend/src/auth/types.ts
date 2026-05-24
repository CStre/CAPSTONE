/**
 * @fileoverview Shared auth types.
 */

/** The signed-in user's identity, taken from the verified Cognito ID token. */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

/** Lifecycle of the auth session. */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/** Value exposed by the auth context. */
export interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  /** Re-read the Cognito session — call after a sign-in flow completes. */
  reload: () => Promise<void>;
  /** Sign out and clear the cached user. */
  logout: () => Promise<void>;
}
