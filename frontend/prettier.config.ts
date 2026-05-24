/**
 * @fileoverview Prettier configuration.
 *
 * Skipped paths are declared here via prettier-plugin-ignored rather than in a
 * separate .prettierignore file.
 */
import type { Config } from 'prettier';

const config: Config = {
  singleQuote: true,
  semi: true,
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  plugins: ['prettier-plugin-ignored'],
  overrides: [
    {
      // Generated / vendored paths — formatted as-is (the "ignored" parser is a no-op).
      files: ['dist/**', 'coverage/**', 'package-lock.json', 'src/gql/**'],
      options: { parser: 'ignored' },
    },
  ],
};

export default config;
