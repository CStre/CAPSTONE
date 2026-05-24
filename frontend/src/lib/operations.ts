/**
 * @fileoverview Shared GraphQL operations.
 *
 * Page-specific operations live inline in their components; app-wide ones —
 * like the country catalog — live here. Typed by GraphQL Code Generator.
 */
import { graphql } from '../gql';

/** The full country catalog. */
export const CountriesQuery = graphql(`
  query Countries {
    countries {
      code
      name
    }
  }
`);
