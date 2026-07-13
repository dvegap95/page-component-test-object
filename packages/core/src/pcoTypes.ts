/** Sync scope instruction — Cypress deferral lives inside the returned chain. */
export type ContextResolver<TScope = unknown> = () => TScope;

export interface PCOClickOptions {
  [key: string]: unknown;
}

export interface PCOTypeOptions {
  [key: string]: unknown;
}

/**
 * Base target partition — shared `*.to.ts` code and RTL adapter.
 * Cypress merges `Chainable` at runtime; do not reference chain methods in shared code.
 */
export interface PCOTargetBase<TNode = unknown> extends PromiseLike<TNode> {
  readonly rootResolver: ContextResolver;

  userClick(options?: PCOClickOptions): PCOTargetBase<TNode> | Promise<void>;
  userType(text: string, options?: PCOTypeOptions): PCOTargetBase<TNode> | Promise<void>;
  userClear(): PCOTargetBase<TNode> | Promise<void>;
  userHover(): PCOTargetBase<TNode> | Promise<void>;
}

/** Query partition — `this.context` in ComponentTestObject. */
export interface PCOContext {
  readonly rootResolver: ContextResolver;

  getByRole: (...args: unknown[]) => PCOTargetBase;
  queryByRole: (...args: unknown[]) => PCOTargetBase | null;
  findByRole: (...args: unknown[]) => PCOTargetBase;
  getAllByRole: (...args: unknown[]) => PCOTargetBase[];
  queryAllByRole: (...args: unknown[]) => PCOTargetBase[];
  findAllByRole: (...args: unknown[]) => Promise<PCOTargetBase[]>;

  getByLabelText: (...args: unknown[]) => PCOTargetBase;
  queryByLabelText: (...args: unknown[]) => PCOTargetBase | null;
  findByLabelText: (...args: unknown[]) => PCOTargetBase;
  getAllByLabelText: (...args: unknown[]) => PCOTargetBase[];
  queryAllByLabelText: (...args: unknown[]) => PCOTargetBase[];
  findAllByLabelText: (...args: unknown[]) => Promise<PCOTargetBase[]>;

  getByText: (...args: unknown[]) => PCOTargetBase;
  queryByText: (...args: unknown[]) => PCOTargetBase | null;
  findByText: (...args: unknown[]) => PCOTargetBase;
  getAllByText: (...args: unknown[]) => PCOTargetBase[];
  queryAllByText: (...args: unknown[]) => PCOTargetBase[];
  findAllByText: (...args: unknown[]) => Promise<PCOTargetBase[]>;

  getByTestId: (id: string) => PCOTargetBase;
  queryByTestId: (id: string) => PCOTargetBase | null;
  findByTestId: (id: string) => PCOTargetBase;

  getByPlaceholderText: (...args: unknown[]) => PCOTargetBase;
  queryByPlaceholderText: (...args: unknown[]) => PCOTargetBase | null;
  findByPlaceholderText: (...args: unknown[]) => PCOTargetBase;

  within(resolver: ContextResolver): PCOContext;
}

/** Optional materialized root — sync HTMLElement on RTL; thenable on Cypress. */
export type PCORoot = PCOTargetBase<HTMLElement>;

/** Adapter contract — RTL default; Cypress/Playwright register via configureRuntime. */
export interface PCOAdapterRuntime {
  readonly id: 'rtl' | 'cypress' | 'playwright';

  createContext(rootResolver: ContextResolver): PCOContext;

  /** Materialize scope to HTMLElement (may be async on browser runners). */
  materializeRoot(rootResolver: ContextResolver): HTMLElement | Promise<HTMLElement>;
}

export class PcoUnsupportedInRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PcoUnsupportedInRuntimeError';
  }
}
