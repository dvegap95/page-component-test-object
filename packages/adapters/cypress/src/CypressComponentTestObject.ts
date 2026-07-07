import { ComponentTestObject } from '@pco/queries';

import { asPCOChainable, type PCOChainable } from './pcoChainable';

/**
 * Cypress-oriented test object base (Option B).
 * Getters return `PCOChainable` for native Cypress chains plus PCO semantic methods.
 * Use in E2E specs — not in Vitest/Jest/Storybook (those use `ComponentTestObject`).
 */
export class CypressComponentTestObject extends ComponentTestObject {
  /** Wrap a resolved element in a PCO-augmented Cypress chain. Call after `bindToRoot`. */
  protected chain<T extends HTMLElement = HTMLElement>(resolve: () => T): PCOChainable<T> {
    return asPCOChainable(cy.wrap(resolve()));
  }

  /** Chainable for one element from a list getter. */
  protected chainAt(resolveAll: () => HTMLElement[], index: number): PCOChainable {
    return asPCOChainable(cy.wrap(resolveAll()[index]));
  }
}
