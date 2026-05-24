/**
 * @fileoverview Cognito session reads.
 *
 * Thin wrappers over Amplify's session APIs. Amplify caches tokens and refreshes
 * them transparently, so callers can treat these as cheap.
 */
import { fetchAuthSession, fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import type { AuthUser } from './types';

/** The current Cognito ID token (JWT), or undefined when signed out. */
export async function getIdToken(): Promise<string | undefined> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.idToken?.toString();
  } catch {
    return undefined;
  }
}

/** Load the signed-in user's identity, or null when there is no session. */
export async function loadCurrentUser(): Promise<AuthUser | null> {
  try {
    await getCurrentUser();
    const [attributes, session] = await Promise.all([fetchUserAttributes(), fetchAuthSession()]);
    const id = session.tokens?.idToken?.payload.sub;
    if (typeof id !== 'string') return null;
    return {
      id,
      email: attributes.email ?? '',
      name: attributes.name ?? '',
    };
  } catch {
    return null;
  }
}
