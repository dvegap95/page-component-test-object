import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  loader: { '.tsx': 'tsx' },
  sourcemap: true,
  external: [
    '@page-component-object/core',
    '@page-component-object/msw',
    '@page-component-object/queries',
    '@page-component-object/router-react',
    '@testing-library/react',
    'react',
    'react-dom',
    'react-router-dom',
  ],
});
