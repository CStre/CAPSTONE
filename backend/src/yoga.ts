/**
 * @fileoverview The GraphQL Yoga server instance.
 *
 * Shared by the Lambda entrypoint (handler.ts) and the local dev server (dev.ts).
 * The context factory resolves the caller's identity once per request.
 */
import { createYoga } from 'graphql-yoga';
import { schema, type GraphQLContext } from './schema';
import { authenticate } from './auth';
import { ensurePool } from './pool';
import { config } from './config';

export const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  // Introspection UI is enabled only outside production.
  graphiql: config.isLocal,
  landingPage: false,
  // Load the photo pool once (memoized) before resolvers run — this also primes the
  // country signatures that the synchronous getCountrySignatures() reads.
  context: async ({ request }): Promise<GraphQLContext> => {
    const [user] = await Promise.all([authenticate(request.headers), ensurePool()]);
    return { user };
  },
});
