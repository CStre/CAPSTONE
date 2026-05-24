/**
 * @fileoverview ESLint flat config — strict, type-aware linting for the React app.
 *
 * Loaded as TypeScript via jiti. Uses typescript-eslint's strictest tiers
 * (strictTypeChecked + stylisticTypeChecked), which require type information.
 */
import { defineConfig, globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['dist/', 'coverage/', 'src/gql/']),
  {
    // Type-aware base for every TS/TSX file, including tooling configs.
    files: ['**/*.{ts,tsx}'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  {
    // Browser app code — React rules + browser globals.
    files: ['src/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
  },
  {
    // Tooling configs run in Node.
    files: ['*.config.ts', 'codegen.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    // Tests favor readable assertions over strict type-safety on fixture data.
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
]);
