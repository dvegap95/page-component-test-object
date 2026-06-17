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
import { ApiTestObject } from '@pco/msw';
import { ComponentTestObject } from '@pco/queries';
import { buildShallowRouteTree, RoutedShell } from '@pco/router-react';

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

export class BaseViewTestObject extends ComponentTestObject {
  protected get app() {
    return App.get();
  }

  getUser() {
    return getSharedUserAgent();
  }
}
