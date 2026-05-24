/**
 * @fileoverview urql GraphQL client.
 *
 * A factory rather than a singleton: the caller passes the endpoint URL and a
 * token getter (both resolved at the app entry), keeping this module free of
 * Vite globals and Amplify imports, and trivially testable.
 */
import { cacheExchange, createClient, fetchExchange, type Client } from 'urql';
import { authExchange } from '@urql/exchange-auth';

/** Resolves the current Cognito ID token, or undefined when signed out. */
export type TokenGetter = () => Promise<string | undefined>;

/** Build a urql client that attaches the Cognito ID token to each request. */
export function createGraphQLClient(url: string, getToken: TokenGetter): Client {
  return createClient({
    url,
    exchanges: [
      cacheExchange,
      authExchange(async (utils) => {
        let token = await getToken();
        return {
          addAuthToOperation(operation) {
            return token
              ? utils.appendHeaders(operation, { Authorization: `Bearer ${token}` })
              : operation;
          },
          willAuthError: () => token === undefined,
          didAuthError: (error) =>
            error.graphQLErrors.some((e) => e.extensions.code === 'UNAUTHENTICATED'),
          async refreshAuth() {
            token = await getToken();
          },
        };
      }),
      fetchExchange,
    ],
  });
}
