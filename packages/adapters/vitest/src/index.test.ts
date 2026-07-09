import './vitestMatcherTypes';
import '@pco/msw/matchers';

import { describe, expect, it } from 'vitest';

import { getSharedUserAgent, type MockFn } from '@pco/core';
import { ApiTestObject } from '@pco/msw';

import { setupPCO } from './index';

describe('setupPCO', () => {
  it('configures api base url and user agent', () => {
    setupPCO({ apiBaseUrl: 'http://example.test' });

    expect(ApiTestObject.apiBaseUrl).toBe('http://example.test');

    const agent = getSharedUserAgent();
    expect(agent.click).toBeTypeOf('function');
    expect(agent.type).toBeTypeOf('function');
  });

  it('registers toHaveBeenLastCalledWithUrl matcher', () => {
    setupPCO();
    const mock = (() => undefined) as MockFn;
    mock.mock = {
      calls: [[{ request: new Request('http://localhost/api/items') }]],
    };

    expect(mock).toHaveBeenLastCalledWithUrl('http://localhost/api/items');
  });
});
