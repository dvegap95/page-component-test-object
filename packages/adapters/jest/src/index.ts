import '@semantic-matchers/jest/register-types';
import './jestMatcherTypes';

import { afterEach, beforeAll, expect, jest } from '@jest/globals';
import { installSemanticExpect } from '@semantic-matchers/jest';
import type { SemanticMatcherFn } from '@semantic-matchers/core';

import {
  App,
  configureRuntime,
  resetSharedUserAgent,
  type UserAgent,
} from '@page-component-object/core';
import { ApiTestObject } from '@page-component-object/msw';
import { apiMockGlobalMatchers } from '@page-component-object/msw/matchers';
import { createRtlUserAgent } from '@page-component-object/queries';

export interface SetupPCOOptions {
  /** Base URL for `resolveApiUrl()` when API test objects use relative paths. Default: `http://localhost` */
  apiBaseUrl?: string;
}

let semanticMatchersInstalled = false;

function installSemanticMatchers(): void {
  if (semanticMatchersInstalled) return;

  const { expect: semanticExpect } = installSemanticExpect(expect, { global: false });
  semanticExpect.extendGlobal(
    apiMockGlobalMatchers as unknown as Record<string, SemanticMatcherFn>,
  );
  semanticMatchersInstalled = true;
}

export function setupPCO(options: SetupPCOOptions = {}): void {
  installSemanticMatchers();

  ApiTestObject.apiBaseUrl = options.apiBaseUrl ?? 'http://localhost';

  configureRuntime({
    spyFactory: { fn: (impl) => jest.fn(impl) as never },
    createUserAgent: (): UserAgent => createRtlUserAgent(),
  });
}

export function installPCOLifecycle(options: SetupPCOOptions = {}): void {
  beforeAll(() => {
    setupPCO(options);
  });

  afterEach(async () => {
    ApiTestObject.clear();
    App.reset();
    resetSharedUserAgent();
  });
}

export { setupPCO as default };
