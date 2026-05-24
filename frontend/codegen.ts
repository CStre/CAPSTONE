/**
 * @fileoverview GraphQL Code Generator configuration.
 *
 * Reads the backend's SDL schema and emits fully-typed operations into src/gql/.
 * Re-run after a schema change or when adding operations: `npm run codegen`.
 */
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../backend/schema.graphql',
  documents: ['src/**/*.{ts,tsx}', '!src/gql/**'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        // Emit `import type` so the output satisfies verbatimModuleSyntax.
        useTypeImports: true,
      },
    },
  },
};

export default config;
