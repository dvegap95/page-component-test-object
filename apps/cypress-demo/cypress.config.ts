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
                '@page-component-object/core': path.join(repoRoot, 'packages/core/src/index.ts'),
                '@page-component-object/queries': path.join(repoRoot, 'packages/queries/src/index.ts'),
                '@page-component-object/adapter-cypress': path.join(
                  repoRoot,
                  'packages/adapters/cypress/src/index.ts',
                ),
                '@page-component-object/demo-shared/story-objects': path.join(
                  repoRoot,
                  'apps/demo-shared/src/views/CatalogHomeStory.to.ts',
                ),
                '@page-component-object/demo-shared/cypress-objects': path.join(
                  repoRoot,
                  'apps/demo-shared/src/views/CatalogHomeCypress.to.ts',
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
