import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['@pco/core', '@pco/msw', '@pco/msw/matchers', '@testing-library/user-event', 'vitest'],
});
