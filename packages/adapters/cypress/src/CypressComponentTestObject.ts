import { ComponentTestObject } from '@pco/queries';

import { cyFindAllByAt, cyFindBy } from './cypressTestingLibrary';
import { asPCOChainable, type PCOChainable } from './pcoChainable';

/**
 * Cypress-oriented test object base (Option B).
 * Getters return `PCOChainable` for native Cypress chains plus PCO semantic methods.
 * Use in E2E specs — not in Vitest/Jest/Storybook (those use `ComponentTestObject`).
 *
 * Queries use `@testing-library/cypress` (`cy.findBy*` / `cy.findAllBy*`) wherever possible.
 * Register commands once: `import '@testing-library/cypress/add-commands'`.
 */
export class CypressComponentTestObject extends ComponentTestObject {
  /** Wrap a resolved element in a PCO-augmented Cypress chain. Prefer `findBy*` for new getters. */
  protected chain<T extends HTMLElement = HTMLElement>(resolve: () => T): PCOChainable<T> {
    return asPCOChainable(cy.wrap(resolve()));
  }

  /** Chainable for one element from a sync RTL list getter. Prefer `findAllBy*At` for new getters. */
  protected chainAt(resolveAll: () => HTMLElement[], index: number): PCOChainable {
    return asPCOChainable(cy.wrap(resolveAll()[index]));
  }

  protected findByRole(...args: Parameters<typeof cy.findByRole>): PCOChainable {
    return cyFindBy('findByRole', ...args);
  }

  protected findAllByRoleAt(
    role: Parameters<typeof cy.findAllByRole>[0],
    optionsOrIndex: Parameters<typeof cy.findAllByRole>[1] | number,
    index?: number,
  ): PCOChainable {
    if (typeof optionsOrIndex === 'number') {
      return cyFindAllByAt('findAllByRole', optionsOrIndex, role);
    }
    return cyFindAllByAt('findAllByRole', index ?? 0, role, optionsOrIndex);
  }

  protected findByLabelText(...args: Parameters<typeof cy.findByLabelText>): PCOChainable {
    return cyFindBy('findByLabelText', ...args);
  }

  protected findAllByLabelTextAt(
    text: Parameters<typeof cy.findAllByLabelText>[0],
    optionsOrIndex: Parameters<typeof cy.findAllByLabelText>[1] | number,
    index?: number,
  ): PCOChainable {
    if (typeof optionsOrIndex === 'number') {
      return cyFindAllByAt('findAllByLabelText', optionsOrIndex, text);
    }
    return cyFindAllByAt('findAllByLabelText', index ?? 0, text, optionsOrIndex);
  }

  protected findByText(...args: Parameters<typeof cy.findByText>): PCOChainable {
    return cyFindBy('findByText', ...args);
  }

  protected findAllByTextAt(
    text: Parameters<typeof cy.findAllByText>[0],
    optionsOrIndex: Parameters<typeof cy.findAllByText>[1] | number,
    index?: number,
  ): PCOChainable {
    if (typeof optionsOrIndex === 'number') {
      return cyFindAllByAt('findAllByText', optionsOrIndex, text);
    }
    return cyFindAllByAt('findAllByText', index ?? 0, text, optionsOrIndex);
  }

  protected findByTestId(...args: Parameters<typeof cy.findByTestId>): PCOChainable {
    return cyFindBy('findByTestId', ...args);
  }

  protected findAllByTestIdAt(
    id: Parameters<typeof cy.findAllByTestId>[0],
    optionsOrIndex: Parameters<typeof cy.findAllByTestId>[1] | number,
    index?: number,
  ): PCOChainable {
    if (typeof optionsOrIndex === 'number') {
      return cyFindAllByAt('findAllByTestId', optionsOrIndex, id);
    }
    return cyFindAllByAt('findAllByTestId', index ?? 0, id, optionsOrIndex);
  }

  protected findByPlaceholderText(
    ...args: Parameters<typeof cy.findByPlaceholderText>
  ): PCOChainable {
    return cyFindBy('findByPlaceholderText', ...args);
  }

  protected findAllByPlaceholderTextAt(
    text: Parameters<typeof cy.findAllByPlaceholderText>[0],
    optionsOrIndex: Parameters<typeof cy.findAllByPlaceholderText>[1] | number,
    index?: number,
  ): PCOChainable {
    if (typeof optionsOrIndex === 'number') {
      return cyFindAllByAt('findAllByPlaceholderText', optionsOrIndex, text);
    }
    return cyFindAllByAt('findAllByPlaceholderText', index ?? 0, text, optionsOrIndex);
  }
}
