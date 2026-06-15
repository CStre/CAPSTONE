/**
 * @fileoverview Vite build & dev-server configuration.
 *
 * The dev server proxies /graphql to the local backend so the browser sees a
 * single origin — mirroring the CloudFront setup used in AWS.
 *
 * CSS is processed by **Lightning CSS** (not the default esbuild) for both the
 * dev transform and production minification. esbuild's CSS minifier deduplicates
 * `backdrop-filter` / `-webkit-backdrop-filter` pairs and keeps only the
 * `-webkit-` form — which Chrome's Blink engine ignores, so every frosted-glass
 * surface rendered fully transparent on the deployed (minified) build while
 * working in dev (unminified). Lightning CSS prefixes correctly from the
 * browserslist targets below, emitting BOTH properties so Chrome and Safari each
 * get the form they need.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';

// Include legacy Safari (needs -webkit-backdrop-filter) and Chrome (needs the
// unprefixed property) so Lightning CSS emits both prefixed and standard forms.
const cssTargets = browserslistToTargets(
  browserslist('>= 0.5%, last 2 versions, Firefox ESR, not dead, Safari >= 13, Chrome >= 87'),
);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/graphql': 'http://localhost:4000',
    },
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: cssTargets,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    cssMinify: 'lightningcss',
  },
});
