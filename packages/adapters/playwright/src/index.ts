import type { ContextResolver, PCOAdapterRuntime } from '@page-component-object/core';

/**
 * Playwright adapter research spike (not production-ready).
 *
 * Maps PCO's sync `rootResolver` model to Playwright `Locator`:
 * - `page` as document scope
 * - `locator(root).getByRole(...)` for nested scope
 *
 * Tradeoffs vs Cypress documented in docs/cypress-adoption.md.
 */
export interface PlaywrightScope {
  getByRole: (role: string, options?: { name?: string | RegExp }) => PlaywrightScope;
  getByLabelText: (text: string | RegExp) => PlaywrightScope;
  getByText: (text: string | RegExp) => PlaywrightScope;
  getByTestId: (id: string) => PlaywrightScope;
  click: () => Promise<void>;
  fill: (text: string) => Promise<void>;
}

export interface PlaywrightPageLike {
  getByRole: (role: string, options?: { name?: string | RegExp }) => PlaywrightScope;
  getByLabelText: (text: string | RegExp) => PlaywrightScope;
  locator: (selector: string) => PlaywrightScope;
}

/** Stub — implement when adding a playwright demo app. */
export function createPlaywrightPCOContext(
  _page: PlaywrightPageLike,
  _rootResolver: ContextResolver,
): { rootResolver: ContextResolver } {
  throw new Error(
    'Playwright adapter is a research spike only. See packages/adapters/playwright/README.md',
  );
}

export const playwrightPcoAdapter: PCOAdapterRuntime = {
  id: 'playwright',
  createContext: () => {
    throw new Error('Playwright adapter not implemented — research spike only');
  },
  materializeRoot: async () => {
    throw new Error('Playwright adapter not implemented — research spike only');
  },
};
