/**
 * @fileoverview Vite build & dev-server configuration.
 *
 * The dev server proxies /graphql to the local backend so the browser sees a
 * single origin — mirroring the CloudFront setup used in AWS.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/graphql': 'http://localhost:4000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
