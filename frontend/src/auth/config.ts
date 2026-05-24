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
  cognitoUserPoolsTokenProvider.setKeyValueStorage(
    new CookieStorage({ secure: true, sameSite: 'strict' }),
  );
}
