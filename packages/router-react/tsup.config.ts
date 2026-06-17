import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  loader: { '.tsx': 'tsx' },
  external: ['@pco/core', 'react', 'react-dom', 'react-router-dom'],
});
