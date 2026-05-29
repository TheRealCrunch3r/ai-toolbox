import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    '@lmstudio/sdk',
    'pdf-parse',
    'mammoth',
    'sharp',
    'tesseract.js',
    'pixelmatch',
    'pngjs',
    'simple-git',
    'puppeteer',
    'node-notifier',
  ],
  banner: {
    js: '"use strict";',
  },
  target: 'es2020',
  platform: 'node',
  tsconfig: './tsconfig.json',
});
