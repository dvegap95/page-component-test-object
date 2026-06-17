/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^@pco/core$': '<rootDir>/../../packages/core/src/index.ts',
    '^@pco/adapter-jest$': '<rootDir>/../../packages/adapters/jest/src/index.ts',
    '^@pco/msw/matchers$': '<rootDir>/../../packages/msw/src/apiMatchers.ts',
    '^@pco/demo-shared$': '<rootDir>/../demo-shared/src/index.ts',
    '^@pco/demo-shared/testing$': '<rootDir>/../demo-shared/src/testing/index.ts',
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
  setupFilesAfterEnv: ['<rootDir>/src/setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};
