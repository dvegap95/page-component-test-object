import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    '@pco/core',
    '@pco/msw',
    '@pco/msw/matchers',
    '@semantic-matchers/core',
    '@semantic-matchers/jest',
    '@testing-library/user-event',
    'jest',
    '@jest/globals',
  ],
});
