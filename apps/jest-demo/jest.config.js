import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@page-component-object/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@page-component-object/queries$': '<rootDir>/../../packages/queries/src/index.ts',
    '^@page-component-object/msw$': '<rootDir>/../../packages/msw/src/index.ts',
    '^@page-component-object/msw/matchers$': '<rootDir>/../../packages/msw/src/apiMatchers.ts',
    '^@page-component-object/react$': '<rootDir>/../../packages/react/src/index.ts',
    '^@page-component-object/router-react$': '<rootDir>/../../packages/router-react/src/index.tsx',
    '^@page-component-object/adapter-jest$': '<rootDir>/../../packages/adapters/jest/src/index.ts',
    '^@page-component-object/demo-shared$': '<rootDir>/../demo-shared/src/index.ts',
    '^@page-component-object/demo-shared/testing$': '<rootDir>/../demo-shared/src/testing/index.ts',
    '^@mswjs/interceptors/ClientRequest$': require.resolve('@mswjs/interceptors/ClientRequest'),
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!(msw|@mswjs|until-async)/)'],
  setupFiles: ['<rootDir>/src/jest.polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/src/setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.bh.test.ts'],
};
