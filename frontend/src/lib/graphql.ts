/**
 * @fileoverview urql GraphQL client.
 *
 * A factory rather than a singleton: the caller passes the endpoint URL and a
 * token getter (both resolved at the app entry), keeping this module free of
 * Vite globals and Amplify imports, and trivially testable.
 */
import { cacheExchange, createClient, fetchExchange, type Client, type Exchange } from 'urql';
import { authExchange } from '@urql/exchange-auth';
import { pipe, tap } from 'wonka';

/** Resolves the current Cognito ID token, or undefined when signed out. */
export type TokenGetter = () => Promise<string | undefined>;

/**
 * Dev-only exchange that logs every GraphQL operation and its result.
 * Stripped out in production builds (import.meta.env.DEV is false → dead code).
 */
const debugExchange: Exchange =
  ({ forward }) =>
  (ops$) =>
    pipe(
      ops$,
      tap((op) => {
        console.group(
          `[gql] → ${op.kind} ${op.query.definitions[0] && 'name' in op.query.definitions[0] && op.query.definitions[0].name ? op.query.definitions[0].name.value : '(anonymous)'}`,
        );
        if (op.variables && Object.keys(op.variables).length > 0) {
          console.log('vars', op.variables);
        }
        console.groupEnd();
      }),
      forward,
      tap((result) => {
        const name =
          result.operation.query.definitions[0] &&
          'name' in result.operation.query.definitions[0] &&
          result.operation.query.definitions[0].name
            ? result.operation.query.definitions[0].name.value
            : '(anonymous)';
        if (result.error) {
          console.group(`[gql] ✗ ${name}`);
          console.error('networkError:', result.error.networkError ?? null);
          console.error('graphQLErrors:', result.error.graphQLErrors);
          console.groupEnd();
        } else {
          console.group(`[gql] ← ${name}`);
          console.log('data', result.data);
          console.groupEnd();
        }
      }),
    );

/** Build a urql client that attaches the Cognito ID token to each request. */
export function createGraphQLClient(url: string, getToken: TokenGetter): Client {
  return createClient({
    url,
    exchanges: [
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ...(import.meta.env?.DEV ? [debugExchange] : []),
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
