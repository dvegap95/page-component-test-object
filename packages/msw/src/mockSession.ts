import type { HttpHandler } from 'msw';

import ApiTestObject from './ApiTestObject';

export type MockDataSource = {
  setupMockData(): unknown;
};

export type MockSession<T extends MockDataSource> = {
  handlers: HttpHandler[];
  instance: T;
  mocks: ReturnType<T['setupMockData']>;
};

/** Copy of handlers registered since last reset — safe to pass to Storybook or node MSW. */
export function snapshotHandlers(): HttpHandler[] {
  return [...ApiTestObject.handlers];
}

/**
 * Register mocks in an isolated session without starting the node MSW server.
 * Returns the same handler instances (and embedded spies) for Vitest/Jest and Storybook.
 */
export function createMockSession<T extends MockDataSource>(
  factory: () => T,
): MockSession<T> {
  ApiTestObject.resetHandlers();
  const instance = factory();
  const mocks = instance.setupMockData() as ReturnType<T['setupMockData']>;
  const handlers = snapshotHandlers();
  ApiTestObject.resetHandlers();
  return { handlers, instance, mocks };
}

export function buildMswParameters(handlers: HttpHandler[]): { msw: { handlers: HttpHandler[] } } {
  return { msw: { handlers } };
}
