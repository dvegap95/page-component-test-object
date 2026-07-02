import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, expect, vi } from 'vitest';

import {
  App,
  configureRuntime,
  resetSharedUserAgent,
  type UserAgent,
} from '@pco/core';
import { ApiTestObject } from '@pco/msw';
import { createApiMatchers } from '@pco/msw/matchers';

export interface SetupPCOOptions {
  /** Base URL for `resolveApiUrl()` when API test objects use relative paths. Default: `http://localhost` */
  apiBaseUrl?: string;
}

export function setupPCO(options: SetupPCOOptions = {}): void {
  ApiTestObject.apiBaseUrl = options.apiBaseUrl ?? 'http://localhost';

  configureRuntime({
    spyFactory: { fn: (impl) => vi.fn(impl) as never },
    createUserAgent: (): UserAgent => userEvent.setup() as unknown as UserAgent,
  });

  const matchers = createApiMatchers((a, b) => {
    try {
      expect(a).toEqual(b);
      return true;
    } catch {
      return false;
    }
  });

  expect.extend({
    toHaveBeenLastCalledWithUrl(
      received: Parameters<typeof matchers.toHaveBeenLastCalledWithUrl>[0],
      expected: string | RegExp,
    ) {
      const result = matchers.toHaveBeenLastCalledWithUrl(
        received,
        expected,
        !!this.isNot,
        this.utils.printExpected,
        this.utils.printReceived,
      );
      return { pass: result.pass, message: result.message };
    },
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
