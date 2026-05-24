/**
 * @fileoverview Request authentication.
 *
 * Production verifies a Cognito ID token against the user pool's JWKS and extracts
 * the caller's identity claims. Local dev (AUTH_MODE=dev) skips Cognito entirely —
 * no user pool exists until Phase 3 — and trusts an identity supplied via optional
 * `x-dev-*` request headers, defaulting to a fixed dev user.
 */
import {
  AdminDeleteUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { config } from './config';

export interface AuthUser {
  /** Cognito `sub` — the stable user id and DynamoDB partition key. */
  id: string;
  email: string;
  name: string;
}

let verifier: ReturnType<typeof createVerifier> | undefined;
let adminClient: CognitoIdentityProviderClient | undefined;

function createVerifier() {
  if (!config.cognitoUserPoolId || !config.cognitoClientId) {
    throw new Error('Cognito is not configured (COGNITO_USER_POOL_ID / COGNITO_CLIENT_ID).');
  }
  return CognitoJwtVerifier.create({
    userPoolId: config.cognitoUserPoolId,
    tokenUse: 'id',
    clientId: config.cognitoClientId,
  });
}

/** Resolve the caller's identity from request headers, or null if unauthenticated. */
export async function authenticate(headers: Headers): Promise<AuthUser | null> {
  if (config.authMode === 'dev') {
    return {
      id: headers.get('x-dev-user-id') ?? 'dev-user',
      email: headers.get('x-dev-email') ?? 'dev@example.com',
      name: headers.get('x-dev-name') ?? 'Dev User',
    };
  }

  const header = headers.get('authorization') ?? '';
  const token = /^bearer /i.test(header) ? header.slice(7).trim() : '';
  if (!token) return null;

  try {
    verifier ??= createVerifier();
    const claims = await verifier.verify(token);
    return {
      id: claims.sub,
      email: typeof claims.email === 'string' ? claims.email : '',
      name: typeof claims.name === 'string' ? claims.name : '',
    };
  } catch {
    return null;
  }
}

/**
 * Remove a user from the Cognito user pool.
 * No-op in dev mode (no pool configured locally).
 * Username is the user's email — Cognito treats email as the login identifier
 * when username_attributes = ["email"].
 */
export async function deleteCognitoUser(email: string): Promise<void> {
  if (config.authMode !== 'cognito' || !config.cognitoUserPoolId) return;
  adminClient ??= new CognitoIdentityProviderClient({ region: config.awsRegion });
  await adminClient.send(
    new AdminDeleteUserCommand({
      UserPoolId: config.cognitoUserPoolId,
      Username: email,
    }),
  );
}
