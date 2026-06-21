/**
 * @fileoverview Test helper — a urql Client stubbed with canned results.
 *
 * Lets component tests drive `useQuery` / `useMutation` from static data with
 * no network layer. Pass `client` to urql's <Provider value={...}>, and assert
 * against `executeQuery` / `executeMutation` to confirm operations were sent.
 */
import { jest } from '@jest/globals';
import { fromValue } from 'wonka';
import type { Client } from 'urql';

/** Produces the `data` payload returned for each operation kind. */
export interface MockHandlers {
  query?: () => unknown;
  mutation?: () => unknown;
}

/** A stub Client plus the spies behind its execute methods. */
export interface MockClient {
  client: Client;
  executeQuery: ReturnType<typeof jest.fn>;
  executeMutation: ReturnType<typeof jest.fn>;
}

/** Build a urql Client that answers operations synchronously from `handlers`. */
export function createMockClient(handlers: MockHandlers = {}): MockClient {
  const executeQuery = jest.fn((operation: unknown) =>
    fromValue({ operation, data: handlers.query?.(), stale: false, hasNext: false }),
  );
  const executeMutation = jest.fn((operation: unknown) =>
    fromValue({ operation, data: handlers.mutation?.(), stale: false, hasNext: false }),
  );
  // Supports useClient().query(...).toPromise() (used by TravelPage's imperative fetches).
  const query = jest.fn((_doc: unknown, _vars: unknown) => {
    const result = {
      data: handlers.query?.() ?? null,
      error: undefined,
      stale: false,
      hasNext: false,
    };
    return { toPromise: () => Promise.resolve(result) };
  });
  const client = {
    executeQuery,
    executeMutation,
    executeSubscription: jest.fn(),
    query,
  } as unknown as Client;
  return { client, executeQuery, executeMutation };
}
