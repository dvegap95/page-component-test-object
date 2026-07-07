import { describe, expect, it, vi } from 'vitest';

import { configureRuntime } from '@pco/core';

import ApiTestObject from './ApiTestObject';
import { createMockSession } from './mockSession';

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

class ItemsSource {
  items: string[] = ['default'];

  setupMockData() {
    const api = new ApiTestObject();
    api.registerRestHandler('get', '*/api/items', () => this.items);
    return { items: this.items };
  }
}

describe('createMockSession', () => {
  it('snapshots handlers without leaving them registered', () => {
    installTestRuntime();
    const session = createMockSession(() => new ItemsSource());

    expect(session.handlers).toHaveLength(1);
    expect(ApiTestObject.handlers).toHaveLength(0);
    expect(session.mocks).toEqual({ items: ['default'] });
  });

  it('runs configure after setupMockData', () => {
    installTestRuntime();
    const session = createMockSession(
      () => new ItemsSource(),
      (instance) => {
        instance.items = ['override'];
      },
    );

    expect(session.instance.items).toEqual(['override']);
    // mocks snapshot is from setupMockData() before configure runs
    expect(session.mocks).toEqual({ items: ['default'] });
  });
});
