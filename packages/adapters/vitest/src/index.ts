import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, expect, vi } from 'vitest';

import {
  App,
  configureRuntime,
  resetSharedUserAgent,
  type UserAgent,
} from '@pco/core';
import { createApiMatchers } from '@pco/msw/matchers';

export interface SetupPCOOptions {
  apiBaseUrl?: string;
}

export function setupPCO(options: SetupPCOOptions = {}): void {
  if (options.apiBaseUrl) {
    void import('@pco/msw').then(({ ApiTestObject }) => {
      ApiTestObject.apiBaseUrl = options.apiBaseUrl!;
    });
  }

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

export function installPCOLifecycle(): void {
  beforeAll(() => {
    setupPCO();
  });

  afterEach(async () => {
    const { ApiTestObject } = await import('@pco/msw');
    ApiTestObject.clear();
    App.reset();
    resetSharedUserAgent();
  });
}

export { setupPCO as default };
