/** Bound DOM query functions (RTL `screen` / `within` shape). */
export type QueryContext = {
  getByRole: (...args: never[]) => HTMLElement;
  queryByRole: (...args: never[]) => HTMLElement | null;
  getByLabelText: (...args: never[]) => HTMLElement;
  queryByLabelText: (...args: never[]) => HTMLElement | null;
  getByText: (...args: never[]) => HTMLElement;
  queryByText: (...args: never[]) => HTMLElement | null;
  getByTestId: (id: string) => HTMLElement;
  queryByTestId: (id: string) => HTMLElement | null;
  [key: string]: unknown;
};

export interface UserAgent {
  click(target: Element, options?: Record<string, unknown>): Promise<void>;
  dblClick(target: Element, options?: Record<string, unknown>): Promise<void>;
  hover(target: Element, options?: Record<string, unknown>): Promise<void>;
  type(
    target: Element,
    text: string,
    options?: Record<string, unknown>,
  ): Promise<void>;
  keyboard(text: string, options?: Record<string, unknown>): Promise<void>;
  tab(options?: Record<string, unknown>): Promise<void>;
  upload(target: Element, files: File | File[]): Promise<void>;
}

export interface MockFn<T extends (...args: never[]) => unknown = (...args: never[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T>;
  mock: {
    calls: unknown[][];
  };
}

export interface SpyFactory {
  fn<T extends (...args: never[]) => unknown>(implementation?: T): MockFn<T>;
}

export interface RenderResult {
  container: HTMLElement;
  rerender: (ui: unknown) => void;
  unmount: () => void;
}

export interface ShallowRenderOptions {
  route: string;
  routePath?: string;
  initialEntries?: string[];
  initialIndex?: number;
  waitForIdle?: boolean;
}

export interface FullAppRenderOptions {
  initialRoute?: string;
  initialEntries?: string[];
  waitForIdle?: boolean;
}

export interface RouterHistory {
  readonly location: { pathname: string; search?: string; hash?: string };
  push: (path: string) => void;
}

/**
 * App shell contract — apps extend via `BaseAppManager` in `@pco/react`.
 * Access globally through `App.get()` after `App.register()`.
 */
export interface AppManager {
  renderView(element: unknown, options: ShallowRenderOptions): Promise<RenderResult>;
  renderApp(element: unknown, options?: FullAppRenderOptions): Promise<RenderResult>;
  getHistory(): RouterHistory;
  isRendered(): boolean;
  cleanup(): void;
}

/** Captured MSW handler spies from `setupMockData()`. */
export type MockHandles<T extends Record<string, MockFn>> = {
  readonly [K in keyof T]: T[K];
};
