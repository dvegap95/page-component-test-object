import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    '@page-component-object/core',
    '@page-component-object/queries',
    '@page-component-object/msw',
    '@page-component-object/msw/matchers',
    '@semantic-matchers/core',
    '@semantic-matchers/jest',
    '@testing-library/user-event',
    'jest',
    '@jest/globals',
  ],
});
