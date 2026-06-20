/**
 * @fileoverview Amplify Auth configuration.
 *
 * Points Amplify at the Cognito user pool (ids come from env, populated by the
 * Phase 3 Terraform outputs). Tokens are stored in Secure + SameSite cookies
 * rather than localStorage, which is XSS-readable.
 */
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { CookieStorage } from 'aws-amplify/utils';

/** Configure Amplify Auth. Call once, before the app renders. */
export function configureAuth(userPoolId: string, userPoolClientId: string): void {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
      },
    },
  });
  // secure:true requires HTTPS — on localhost (HTTP) the cookie is silently
  // rejected, which breaks the sign-in challenge state between signIn and
  // confirmSignIn.  Production always runs on HTTPS so secure is still enforced.
  const secure = window.location.protocol === 'https:';
  cognitoUserPoolsTokenProvider.setKeyValueStorage(
    new CookieStorage({ secure, sameSite: 'strict' }),
  );
}
