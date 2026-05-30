/**
 * @fileoverview Jest configuration (loaded as TypeScript via ts-node).
 *
 * Runs in ESM mode — the package is "type": "module" — with jsdom for the
 * DOM-dependent React component tests. ts-jest transforms TS/TSX using the
 * app tsconfig.
 */
import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  setupFiles: ['<rootDir>/jest.polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  clearMocks: true,
  moduleNameMapper: {
    // ESM relative specifiers may carry a .js suffix — resolve back to source.
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // Asset imports are irrelevant to logic tests — stub them.
    '\\.(css|svg|png|jpe?g|gif|webp)$': '<rootDir>/src/test/assetMock.ts',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.test.json' }],
  },
};

export default config;
