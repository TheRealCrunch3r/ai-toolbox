import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'], // Output CommonJS modules (required for LM Studio plugin runner)
  dts: true,       // Generate declaration files
  sourcemap: true, // Source maps for debugging
  clean: true,     // Clean dist folder before build
  external: [
    '@lmstudio/sdk',
    'puppeteer',
    'simple-git',
    'zod',
    'duck-duck-scrape',
    'html-to-text',
    'mammoth',
    'node-notifier',
    'open',
    'pdf-parse',
    'node:sqlite', // Node.js 23+ built-in — must be external for bundler
  ], // Mark SDK and heavy deps as external to reduce bundle size
  banner: {
    js: '', // No "use strict" needed for CJS (it's implicit)
  },
  minify: false, // Keep readable for debugging plugin issues
  target: 'es2020', // Match tsconfig target
  
  // 🔧 TypeScript Build Optimizations (per PDF: Chmelev 2025)
  // Note: incremental/composite removed — incompatible with tsup's ephemeral build process.
  // For this small project (14 files), incremental builds provide <5ms gain — not worth the conflict.
});
