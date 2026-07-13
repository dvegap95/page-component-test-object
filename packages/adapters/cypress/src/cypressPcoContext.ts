import type { ContextResolver, PCOContext, PCOTargetBase } from '@page-component-object/core';

import { cyFindAllByAt, cyFindBy } from './cypressTestingLibrary';
import { asPCOChainable, type PCOChainable } from './pcoChainable';

type CypressTarget = PCOChainable & PCOTargetBase<HTMLElement>;

type FindAllByCommand =
  | 'findAllByRole'
  | 'findAllByLabelText'
  | 'findAllByText'
  | 'findAllByTestId';

/** Attach PCOTarget metadata without overriding PCOChainable methods (avoids recursion). */
function asTarget(chain: PCOChainable): CypressTarget {
  const target = chain as CypressTarget;
  target.rootResolver = () => document.body;
  return target;
}

function findAllAt(
  command: FindAllByCommand,
  index: number,
  ...args: unknown[]
): CypressTarget {
  return asTarget(cyFindAllByAt(command, index, ...args));
}

/** Lazy indexable list — `links[0]`, `links[1]` enqueue `cy.findAllBy*.eq(n)`. */
function createIndexedTargets(
  command: FindAllByCommand,
  ...args: unknown[]
): PCOTargetBase[] {
  const cache = new Map<number, CypressTarget>();
  return new Proxy([] as PCOTargetBase[], {
    get(_target, prop) {
      if (typeof prop === 'symbol') return undefined;
      const idx = Number(prop);
      if (Number.isInteger(idx) && idx >= 0 && String(prop) === String(idx)) {
        if (!cache.has(idx)) {
          cache.set(idx, findAllAt(command, idx, ...args));
        }
        return cache.get(idx);
      }
      if (prop === 'length') {
        return cache.size;
      }
      return undefined;
    },
  });
}

export function createCypressPCOContext(
  _rootResolver: ContextResolver,
): PCOContext {
  return {
    rootResolver: () => document.body,
    getByRole: (...args: unknown[]) => asTarget(cyFindBy('findByRole', ...args)),
    queryByRole: (...args: unknown[]) => asTarget(cyFindBy('findByRole', ...args)),
    findByRole: (...args: unknown[]) => asTarget(cyFindBy('findByRole', ...args)),
    getAllByRole: (...args: unknown[]) => createIndexedTargets('findAllByRole', ...args),
    queryAllByRole: (...args: unknown[]) => createIndexedTargets('findAllByRole', ...args),
    findAllByRole: async (...args: unknown[]) => createIndexedTargets('findAllByRole', ...args),
    getByLabelText: (...args: unknown[]) => asTarget(cyFindBy('findByLabelText', ...args)),
    queryByLabelText: (...args: unknown[]) => asTarget(cyFindBy('findByLabelText', ...args)),
    findByLabelText: (...args: unknown[]) => asTarget(cyFindBy('findByLabelText', ...args)),
    getAllByLabelText: (...args: unknown[]) =>
      createIndexedTargets('findAllByLabelText', ...args),
    queryAllByLabelText: (...args: unknown[]) =>
      createIndexedTargets('findAllByLabelText', ...args),
    findAllByLabelText: async (...args: unknown[]) =>
      createIndexedTargets('findAllByLabelText', ...args),
    getByText: (...args: unknown[]) => asTarget(cyFindBy('findByText', ...args)),
    queryByText: (...args: unknown[]) => asTarget(cyFindBy('findByText', ...args)),
    findByText: (...args: unknown[]) => asTarget(cyFindBy('findByText', ...args)),
    getAllByText: (...args: unknown[]) => createIndexedTargets('findAllByText', ...args),
    queryAllByText: (...args: unknown[]) => createIndexedTargets('findAllByText', ...args),
    findAllByText: async (...args: unknown[]) => createIndexedTargets('findAllByText', ...args),
    getByTestId: (id: string) => asTarget(cyFindBy('findByTestId', id)),
    queryByTestId: (id: string) => asTarget(cyFindBy('findByTestId', id)),
    findByTestId: (id: string) => asTarget(cyFindBy('findByTestId', id)),
    getByPlaceholderText: (...args: unknown[]) =>
      asTarget(cyFindBy('findByPlaceholderText', ...args)),
    queryByPlaceholderText: (...args: unknown[]) =>
      asTarget(cyFindBy('findByPlaceholderText', ...args)),
    findByPlaceholderText: (...args: unknown[]) =>
      asTarget(cyFindBy('findByPlaceholderText', ...args)),
    within: (resolver: ContextResolver) => createCypressPCOContext(resolver),
  };
}

export const cypressPcoAdapter = {
  id: 'cypress' as const,
  createContext: createCypressPCOContext,
  materializeRoot: async (rootResolver: ContextResolver) => {
    const result = rootResolver();
    if (result && typeof (result as Cypress.Chainable).then === 'function') {
      return (result as Cypress.Chainable<JQuery<HTMLElement>>).then(
        ($el) => $el[0],
      ) as unknown as HTMLElement;
    }
    return result as HTMLElement;
  },
};
