import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@pco/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@pco/queries$': '<rootDir>/../../packages/queries/src/index.ts',
    '^@pco/msw$': '<rootDir>/../../packages/msw/src/index.ts',
    '^@pco/msw/matchers$': '<rootDir>/../../packages/msw/src/apiMatchers.ts',
    '^@pco/react$': '<rootDir>/../../packages/react/src/index.ts',
    '^@pco/router-react$': '<rootDir>/../../packages/router-react/src/index.tsx',
    '^@pco/adapter-jest$': '<rootDir>/../../packages/adapters/jest/src/index.ts',
    '^@pco/demo-shared$': '<rootDir>/../demo-shared/src/index.ts',
    '^@pco/demo-shared/testing$': '<rootDir>/../demo-shared/src/testing/index.ts',
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
