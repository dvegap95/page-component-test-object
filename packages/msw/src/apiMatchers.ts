import { defineMatcher } from '@semantic-matchers/core';

import type { MockFn } from '@page-component-object/core';

import type { HttpHandlerInfo } from './ApiTestObject';

function isMockFn(value: unknown): value is MockFn {
  return (
    typeof value === 'function' &&
    typeof (value as MockFn).mock === 'object' &&
    Array.isArray((value as MockFn).mock.calls)
  );
}

/** Global matcher for MSW API spies registered via `ApiTestObject`. */
export const toHaveBeenLastCalledWithUrl = defineMatcher<MockFn, [string | RegExp]>(
  function toHaveBeenLastCalledWithUrl(received, expected) {
    if (!isMockFn(received)) {
      return {
        pass: false,
        message: () => 'Expected an API mock function registered via ApiTestObject.',
      };
    }

    if (received.mock.calls.length === 0) {
      return {
        pass: false,
        message: () => 'Expected mock function to have been called, but it was not called.',
      };
    }

    const lastCall = received.mock.calls[received.mock.calls.length - 1];
    const info = lastCall[0] as HttpHandlerInfo;
    const actualUrl = info.request.url;

    const host = (this.host ?? {}) as { equals?: (a: unknown, b: unknown) => boolean };
    const equals = host.equals ?? Object.is;
    const pass =
      expected instanceof RegExp ? expected.test(actualUrl) : equals(actualUrl, expected);

    return {
      pass,
      message: () =>
        `Expected request URL to match:\n  ${String(expected)}\n\nReceived:\n  ${actualUrl}`,
      actual: actualUrl,
      expected,
    };
  },
);

/** Register with `semanticExpect.extendGlobal(apiMockGlobalMatchers)` in Jest/Vitest setup. */
export const apiMockGlobalMatchers = {
  toHaveBeenLastCalledWithUrl,
};

export type { HttpHandlerInfo } from './ApiTestObject';
