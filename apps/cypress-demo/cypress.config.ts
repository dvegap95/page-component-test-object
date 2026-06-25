import path from 'node:path';
import { fileURLToPath } from 'node:url';

import webpackPreprocessor from '@cypress/webpack-preprocessor';
import { defineConfig } from 'cypress';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5174',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    video: false,
    setupNodeEvents(on) {
      on(
        'file:preprocessor',
        webpackPreprocessor({
          webpackOptions: {
            resolve: {
              extensions: ['.ts', '.tsx', '.js'],
              alias: {
                '@pco/core': path.join(repoRoot, 'packages/core/src/index.ts'),
                '@pco/queries': path.join(repoRoot, 'packages/queries/src/index.ts'),
                '@pco/adapter-cypress': path.join(
                  repoRoot,
                  'packages/adapters/cypress/src/index.ts',
                ),
                '@pco/demo-shared/story-objects': path.join(
                  repoRoot,
                  'apps/demo-shared/src/views/CatalogHomeStory.to.ts',
                ),
              },
            },
            module: {
              rules: [
                {
                  test: /\.tsx?$/,
                  exclude: /node_modules/,
                  use: { loader: 'ts-loader', options: { transpileOnly: true } },
                },
              ],
            },
          },
        }),
      );
    },
  },
});
