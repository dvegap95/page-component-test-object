import type { HttpHandler } from '@pco/msw';

import {
  buildMswParameters,
  createMockSession,
  snapshotHandlers,
  type MockSession,
} from '@pco/msw';

import { BaseViewTestObject } from './BaseAppManager';

/**
 * View test object with shared mock setup for node MSW (Vitest/Jest) and Storybook.
 *
 * - In tests: constructor calls `setupMockData()`; `BaseAppManager` starts MSW with registered handlers.
 * - In Storybook: use `createMockSession()` / `buildStoryMswParameters()` so the same handlers drive `parameters.msw`.
 */
export abstract class MswViewTestObject extends BaseViewTestObject {
  abstract setupMockData(): unknown;

  /** Handlers registered by this view's APIs (after `setupMockData` in the test constructor). */
  getMswHandlers(): HttpHandler[] {
    return snapshotHandlers();
  }

  /**
   * Build Storybook `parameters.msw` from a fresh mock session (no AppManager render).
   */
  static buildStoryMswParameters<T extends MswViewTestObject>(
    this: new () => T,
    configure?: (view: T) => void,
  ): { msw: { handlers: HttpHandler[] } } {
    const session = createMockSession(() => {
      const view = new this();
      configure?.(view);
      return view;
    });
    return buildMswParameters(session.handlers);
  }

  /**
   * Isolated mock registration — reuse `handlers` in Storybook and `mocks` in `play`.
   */
  static createMockSession<T extends MswViewTestObject>(
    this: new () => T,
    configure?: (view: T) => void,
  ): MockSession<T> & { view: T } {
    const session = createMockSession(() => {
      const view = new this();
      configure?.(view);
      return view;
    });
    return { ...session, view: session.instance };
  }
}
