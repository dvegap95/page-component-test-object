import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const dirname = fileURLToPath(new URL('.', import.meta.url));
const mswSrc = path.resolve(dirname, '../../msw/src');

export default defineConfig({
  resolve: {
    alias: [
      { find: '@pco/core', replacement: path.resolve(dirname, '../../core/src/index.ts') },
      { find: '@pco/msw/matchers', replacement: path.join(mswSrc, 'apiMatchers.ts') },
      { find: '@pco/msw', replacement: path.join(mswSrc, 'index.ts') },
    ],
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
  },
});
