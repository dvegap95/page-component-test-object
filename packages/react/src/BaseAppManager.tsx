import { type ReactElement, type ReactNode } from 'react';

import { render, type RenderResult as RtlRenderResult } from '@testing-library/react';

import {
  App,
  getSharedUserAgent,
  type AppManager,
  type FullAppRenderOptions,
  type RenderResult,
  type RouterHistory,
  type ShallowRenderOptions,
} from '@pco/core';
import {
  buildMswParameters,
  createMockSession,
  snapshotHandlers,
  ApiTestObject,
  type HttpHandler,
  type MockSession,
} from '@pco/msw';
import { ComponentTestObject } from '@pco/queries';
import { buildShallowRouteTree, RoutedShell } from '@pco/router-react';

import { getViewTestConfig } from './viewTestConfig';

export type ProviderWrapperProps = { children: ReactNode };

export type BaseAppManagerOptions = {
  wrapProviders: (children: ReactNode) => ReactNode;
  wrapLayout?: (children: ReactNode) => ReactNode;
  waitForIdle?: () => Promise<void>;
};

/**
 * Extend in consumer apps. Constructor registers singleton: `App.get()`.
 */
export class BaseAppManager implements AppManager {
  private renderResult: RtlRenderResult | null = null;
  private history: RouterHistory | null = null;

  constructor(protected readonly options: BaseAppManagerOptions) {
    App.register(this);
  }

  isRendered(): boolean {
    return this.renderResult !== null;
  }

  getHistory(): RouterHistory {
    if (!this.history) {
      throw new Error('App not rendered yet. Call renderView() or renderApp() first.');
    }
    return this.history;
  }

  async renderView(element: ReactElement, opts: ShallowRenderOptions): Promise<RenderResult> {
    this.ensureMsw();
    const initialEntries = opts.initialEntries ?? [opts.route];
    const view = buildShallowRouteTree(element, {
      routePath: opts.routePath,
      wrapLayout: this.options.wrapLayout
        ? (child) => this.options.wrapLayout!(child) as ReactElement
        : undefined,
    });

    this.renderResult = render(
      this.options.wrapProviders(
        <RoutedShell
          initialEntries={initialEntries}
          initialIndex={opts.initialIndex}
          onHistoryReady={(h) => {
            this.history = h;
          }}
        >
          {view}
        </RoutedShell>,
      ),
    );

    if (opts.waitForIdle !== false && this.options.waitForIdle) {
      await this.options.waitForIdle();
    }

    return this.toRenderResult(this.renderResult);
  }

  async renderApp(element: ReactElement, opts: FullAppRenderOptions = {}): Promise<RenderResult> {
    this.ensureMsw();
    const initialEntries = opts.initialEntries ?? [opts.initialRoute ?? '/'];

    this.renderResult = render(
      this.options.wrapProviders(
        <RoutedShell
          initialEntries={initialEntries}
          onHistoryReady={(h) => {
            this.history = h;
          }}
        >
          {element}
        </RoutedShell>,
      ),
    );

    if (opts.waitForIdle !== false && this.options.waitForIdle) {
      await this.options.waitForIdle();
    }

    return this.toRenderResult(this.renderResult);
  }

  cleanup(): void {
    this.renderResult?.unmount();
    this.renderResult = null;
    this.history = null;
  }

  private ensureMsw(): void {
    if (!ApiTestObject.server) {
      ApiTestObject.setupServer();
      ApiTestObject.startServer();
    }
  }

  private toRenderResult(result: RtlRenderResult): RenderResult {
    return {
      container: result.container,
      rerender: (ui: unknown) => result.rerender(ui as ReactElement),
      unmount: () => result.unmount(),
    };
  }
}

/**
 * Behavioral view test object: routed view under `App.get()` with HTTP mocked via `setupMockData()`.
 *
 * - In tests: call `configureViewTestObjects({ createAppManager })` in setup, then
 *   implement `setupMockData()` + getters (no per-view constructor boilerplate).
 * - In Storybook: `storyParameters` / `mockSession` call `setupMockData()` after field
 *   initializers — no AppManager needed.
 */
export class BaseViewTestObject extends ComponentTestObject {
  private mockDataInitialized = false;

  constructor() {
    super();
    getViewTestConfig()?.createAppManager();
  }

  /** Override when the view fetches HTTP APIs. Default: no handlers. */
  setupMockData(): unknown {
    return {};
  }

  /** Runs once after subclass field initializers (before first render or handler read). */
  protected ensureMockDataInitialized(): void {
    if (!this.mockDataInitialized) {
      this.setupMockData();
      this.mockDataInitialized = true;
    }
  }

  /** Registered `AppManager` from `configureViewTestObjects`. Mock data is ensured on first access. */
  get app(): AppManager {
    this.ensureMockDataInitialized();
    return App.get();
  }

  /** Router history after `render()` / `renderApp()`. Use in specs instead of reaching through `App.get()`. */
  getHistory(): RouterHistory {
    return this.app.getHistory();
  }

  /** Handlers registered by this view's APIs (after `setupMockData`). */
  getMswHandlers(): HttpHandler[] {
    this.ensureMockDataInitialized();
    return snapshotHandlers();
  }

  getUser() {
    return getSharedUserAgent();
  }

  /**
   * Storybook `parameters.msw` from a fresh mock session (no AppManager render).
   * `setupMocks` runs after `setupMockData()` — override `view` fields or API handlers.
   */
  static storyParameters<T extends BaseViewTestObject>(
    this: new () => T,
    setupMocks?: (view: T, mocks: ReturnType<T['setupMockData']>) => void,
  ): { msw: { handlers: HttpHandler[] } } {
    const session = createMockSession(() => new this(), setupMocks);
    return buildMswParameters(session.handlers);
  }

  /**
   * Isolated mock registration — reuse `handlers` in Storybook and `mocks` in optional `play`.
   * `setupMocks` runs after `setupMockData()`.
   */
  static mockSession<T extends BaseViewTestObject>(
    this: new () => T,
    setupMocks?: (view: T, mocks: ReturnType<T['setupMockData']>) => void,
  ): MockSession<T> & { view: T } {
    const session = createMockSession(() => new this(), setupMocks);
    return { ...session, view: session.instance };
  }
}
