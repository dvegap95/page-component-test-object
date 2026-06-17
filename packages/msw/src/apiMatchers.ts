import type { MockFn } from '@pco/core';

import type { HttpHandlerInfo } from './ApiTestObject';

export function createApiMatchers(equals: (a: unknown, b: unknown) => boolean) {
  return {
    toHaveBeenLastCalledWithUrl(
      received: MockFn,
      expected: string | RegExp,
      isNot: boolean,
      printExpected: (v: unknown) => string,
      printReceived: (v: unknown) => string,
    ) {
      if (received.mock.calls.length === 0) {
        return {
          pass: false,
          message: () => 'Expected mock function to have been called, but it was not called.',
        };
      }

      const lastCall = received.mock.calls[received.mock.calls.length - 1];
      const info = lastCall[0] as HttpHandlerInfo;
      const actualUrl = info.request.url;
      const pass =
        expected instanceof RegExp ? expected.test(actualUrl) : equals(actualUrl, expected);

      return {
        pass: isNot ? !pass : pass,
        message: () =>
          `Expected request URL to ${isNot ? 'not ' : ''}be:\n` +
          `  ${printExpected(expected)}\n\nReceived:\n  ${printReceived(actualUrl)}`,
      };
    },
  };
}

export type { HttpHandlerInfo } from './ApiTestObject';
