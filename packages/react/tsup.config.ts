import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  loader: { '.tsx': 'tsx' },
  sourcemap: true,
  external: [
    '@pco/core',
    '@pco/msw',
    '@pco/queries',
    '@pco/router-react',
    '@testing-library/react',
    'react',
    'react-dom',
    'react-router-dom',
  ],
});
