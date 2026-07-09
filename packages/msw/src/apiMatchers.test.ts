import { describe, expect, it } from 'vitest';

import type { MockFn } from '@pco/core';

import { toHaveBeenLastCalledWithUrl } from './apiMatchers';
import type { HttpHandlerInfo } from './ApiTestObject';

function createMockFn(calls: unknown[][]): MockFn {
  const fn = (() => undefined) as MockFn;
  fn.mock = { calls };
  return fn;
}

function runMatcher(
  received: MockFn,
  expected: string | RegExp,
  options: { equals?: (a: unknown, b: unknown) => boolean } = {},
) {
  return toHaveBeenLastCalledWithUrl.call(
    {
      isNot: false,
      host: { equals: options.equals ?? Object.is },
      matchers: {},
      rawMatchers: {},
    } as never,
    received,
    expected,
  );
}

describe('apiMockGlobalMatchers', () => {
  it('passes when the last call URL matches a string', () => {
    const mock = createMockFn([
      [{ request: new Request('http://localhost/api/items') } as HttpHandlerInfo],
    ]);

    const result = runMatcher(mock, 'http://localhost/api/items');
    expect(result.pass).toBe(true);
  });

  it('passes when the last call URL matches a RegExp', () => {
    const mock = createMockFn([
      [{ request: new Request('http://localhost/api/items/3') } as HttpHandlerInfo],
    ]);

    const result = runMatcher(mock, /\/api\/items\/\d+$/);
    expect(result.pass).toBe(true);
  });

  it('fails when the mock was never called', () => {
    const mock = createMockFn([]);

    const result = runMatcher(mock, 'http://localhost/api/items');
    expect(result.pass).toBe(false);
    expect(result.message()).toContain('not called');
  });
});
