import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['@pco/core', '@pco/queries', '@pco/react', '@storybook/test', 'storybook'],
});
