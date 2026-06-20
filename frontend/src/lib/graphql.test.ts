import { describe, expect, it } from '@jest/globals';
import { Client } from 'urql';
import { createGraphQLClient } from './graphql';

describe('createGraphQLClient', () => {
  it('builds a urql Client', () => {
    expect(createGraphQLClient('/graphql', () => Promise.resolve(undefined))).toBeInstanceOf(
      Client,
    );
  });
});
