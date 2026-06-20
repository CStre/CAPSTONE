/**
 * @fileoverview The GraphQL Yoga server instance.
 *
 * Shared by the Lambda entrypoint (handler.ts) and the local dev server (dev.ts).
 * The context factory resolves the caller's identity once per request.
 */
import { createYoga } from 'graphql-yoga';
import { schema, type GraphQLContext } from './schema';
import { authenticate } from './auth';
import { config } from './config';

export const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  // Introspection UI is enabled only outside production.
  graphiql: config.isLocal,
  landingPage: false,
  context: async ({ request }): Promise<GraphQLContext> => ({
    user: await authenticate(request.headers),
  }),
});
