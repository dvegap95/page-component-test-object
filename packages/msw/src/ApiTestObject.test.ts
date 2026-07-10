import { beforeEach, describe, expect, it, vi } from 'vitest';

import { configureRuntime } from '@page-component-object/core';

import ApiTestObject from './ApiTestObject';

function installTestRuntime() {
  configureRuntime({
    spyFactory: { fn: (impl) => vi.fn(impl) as never },
    createUserAgent: () =>
      ({
        click: vi.fn(),
        dblClick: vi.fn(),
        hover: vi.fn(),
        type: vi.fn(),
        keyboard: vi.fn(),
        tab: vi.fn(),
        upload: vi.fn(),
      }) as never,
  });
}

describe('ApiTestObject', () => {
  beforeEach(() => {
    installTestRuntime();
    ApiTestObject.resetHandlers();
  });

  it('registerRestHandler replaces handler for same method+path', () => {
    const api = new ApiTestObject();
    const first = api.registerRestHandler('get', '*/api/items', () => [{ id: 1 }]);
    const second = api.registerRestHandler('get', '*/api/items', () => [{ id: 2 }]);

    expect(ApiTestObject.handlers).toHaveLength(1);
    expect(first).not.toBe(second);
  });

  it('resetHandlers clears registered handlers', () => {
    const api = new ApiTestObject();
    api.registerRestHandler('get', '*/api/items', () => []);
    ApiTestObject.resetHandlers();
    expect(ApiTestObject.handlers).toHaveLength(0);
  });

  it('registerRestHandler returns a mock fn', () => {
    const api = new ApiTestObject();
    const spy = api.registerRestHandler('get', '*/api/items', () => [{ id: 'x' }]);
    expect(spy).toBeTypeOf('function');
    expect(spy.mock).toBeDefined();
  });
});

describe('resolveApiUrl', () => {
  beforeEach(() => {
    ApiTestObject.apiBaseUrl = 'http://localhost:3000';
  });

  it('joins base and path', async () => {
    const { resolveApiUrl } = await import('./ApiTestObject');
    expect(resolveApiUrl('/api/items')).toBe('http://localhost:3000/api/items');
  });
});
