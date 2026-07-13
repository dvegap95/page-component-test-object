import { screen, within } from '@testing-library/react';

import type { ContextResolver, PCOContext, PCOTargetBase } from '@page-component-object/core';

import { createAsyncTarget, createSyncTarget } from './rtlTarget';

type RtlQueries = ReturnType<typeof within>;

function resolveScope(rootResolver: ContextResolver<HTMLElement>): RtlQueries {
  const scope = rootResolver();
  if (scope === document.body) {
    return screen as unknown as RtlQueries;
  }
  return within(scope);
}

function wrapSync(
  rootResolver: ContextResolver<HTMLElement>,
  resolve: () => HTMLElement,
): PCOTargetBase<HTMLElement> {
  return createSyncTarget(rootResolver, resolve);
}

function wrapAsync(
  rootResolver: ContextResolver<HTMLElement>,
  resolve: () => Promise<HTMLElement>,
): PCOTargetBase<HTMLElement> {
  return createAsyncTarget(rootResolver, resolve);
}

export function createRtlPCOContext(
  rootResolver: ContextResolver<HTMLElement>,
): PCOContext {
  const bound = resolveScope(rootResolver);

  return {
    rootResolver,
    getByRole: (...args: unknown[]) =>
      wrapSync(rootResolver, () => bound.getByRole(...args)),
    queryByRole: (...args: unknown[]) => {
      const el = bound.queryByRole(...args);
      return el ? wrapSync(rootResolver, () => el) : null;
    },
    findByRole: (...args: unknown[]) =>
      wrapAsync(rootResolver, () => bound.findByRole(...args)),
    getAllByRole: (...args: unknown[]) =>
      bound.getAllByRole(...args).map((_el: HTMLElement, i: number) =>
        wrapSync(rootResolver, () => bound.getAllByRole(...args)[i] as HTMLElement),
      ),
    queryAllByRole: (...args: unknown[]) =>
      bound.queryAllByRole(...args).map((_el: HTMLElement, i: number) =>
        wrapSync(rootResolver, () => bound.queryAllByRole(...args)[i] as HTMLElement),
      ),
    findAllByRole: async (...args: unknown[]) => {
      const elements = await bound.findAllByRole(...args);
      return elements.map((_el: HTMLElement, i: number) =>
        wrapAsync(rootResolver, async () => (await bound.findAllByRole(...args))[i] as HTMLElement),
      );
    },
    getByLabelText: (...args: unknown[]) =>
      wrapSync(rootResolver, () => bound.getByLabelText(...args)),
    queryByLabelText: (...args: unknown[]) => {
      const el = bound.queryByLabelText(...args);
      return el ? wrapSync(rootResolver, () => el) : null;
    },
    findByLabelText: (...args: unknown[]) =>
      wrapAsync(rootResolver, () => bound.findByLabelText(...args)),
    getAllByLabelText: (...args: unknown[]) =>
      bound.getAllByLabelText(...args).map((_el: HTMLElement, i: number) =>
        wrapSync(rootResolver, () => bound.getAllByLabelText(...args)[i] as HTMLElement),
      ),
    queryAllByLabelText: (...args: unknown[]) =>
      bound.queryAllByLabelText(...args).map((_el: HTMLElement, i: number) =>
        wrapSync(rootResolver, () => bound.queryAllByLabelText(...args)[i] as HTMLElement),
      ),
    findAllByLabelText: async (...args: unknown[]) => {
      const elements = await bound.findAllByLabelText(...args);
      return elements.map((_el: HTMLElement, i: number) =>
        wrapAsync(rootResolver, async () =>
          (await bound.findAllByLabelText(...args))[i] as HTMLElement,
        ),
      );
    },
    getByText: (...args: unknown[]) => wrapSync(rootResolver, () => bound.getByText(...args)),
    queryByText: (...args: unknown[]) => {
      const el = bound.queryByText(...args);
      return el ? wrapSync(rootResolver, () => el) : null;
    },
    findByText: (...args: unknown[]) =>
      wrapAsync(rootResolver, () => bound.findByText(...args)),
    getAllByText: (...args: unknown[]) =>
      bound.getAllByText(...args).map((_el: HTMLElement, i: number) =>
        wrapSync(rootResolver, () => bound.getAllByText(...args)[i] as HTMLElement),
      ),
    queryAllByText: (...args: unknown[]) =>
      bound.queryAllByText(...args).map((_el: HTMLElement, i: number) =>
        wrapSync(rootResolver, () => bound.queryAllByText(...args)[i] as HTMLElement),
      ),
    findAllByText: async (...args: unknown[]) => {
      const elements = await bound.findAllByText(...args);
      return elements.map((_el: HTMLElement, i: number) =>
        wrapAsync(rootResolver, async () => (await bound.findAllByText(...args))[i] as HTMLElement),
      );
    },
    getByTestId: (id: string) => wrapSync(rootResolver, () => bound.getByTestId(id)),
    queryByTestId: (id: string) => {
      const el = bound.queryByTestId(id);
      return el ? wrapSync(rootResolver, () => el) : null;
    },
    findByTestId: (id: string) => wrapAsync(rootResolver, () => bound.findByTestId(id)),
    getByPlaceholderText: (...args: unknown[]) =>
      wrapSync(rootResolver, () => bound.getByPlaceholderText(...args)),
    queryByPlaceholderText: (...args: unknown[]) => {
      const el = bound.queryByPlaceholderText(...args);
      return el ? wrapSync(rootResolver, () => el) : null;
    },
    findByPlaceholderText: (...args: unknown[]) =>
      wrapAsync(rootResolver, () => bound.findByPlaceholderText(...args)),
    within: (resolver: ContextResolver) => {
      const nested = () => {
        const parent = rootResolver();
        const child = (resolver as ContextResolver<HTMLElement>)();
        return child ?? parent;
      };
      return createRtlPCOContext(nested);
    },
  };
}

export const rtlPcoAdapter = {
  id: 'rtl' as const,
  createContext: createRtlPCOContext,
  materializeRoot: (rootResolver: ContextResolver<HTMLElement>) => rootResolver(),
};
