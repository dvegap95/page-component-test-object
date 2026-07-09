import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/apiMatchers.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['@pco/core', '@semantic-matchers/core', 'msw', 'msw/node'],
});
