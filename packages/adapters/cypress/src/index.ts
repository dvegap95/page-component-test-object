import { configureRuntime, resetSharedUserAgent, type UserAgent } from '@page-component-object/core';

import { runCypressCommand } from './cypressCommand';

export { CypressComponentTestObject } from './CypressComponentTestObject';
export { asPCOChainable, type PCOChainable } from './pcoChainable';
export { runCypressCommand } from './cypressCommand';

export function createCypressUserAgent(): UserAgent {
  return {
    click: (target, options) => runCypressCommand(() => cy.wrap(target).click(options)),
    dblClick: (target, options) => runCypressCommand(() => cy.wrap(target).dblclick(options)),
    hover: (target, options) =>
      runCypressCommand(() => cy.wrap(target).trigger('mouseover', options)),
    type: (target, text, options) =>
      runCypressCommand(() => cy.wrap(target).clear().type(text, options)),
    keyboard: (text, options) => runCypressCommand(() => cy.focused().type(text, options)),
    tab: () =>
      runCypressCommand(() => cy.focused().trigger('keydown', { key: 'Tab', keyCode: 9 })),
    upload: (target, files) =>
      runCypressCommand(() => cy.wrap(target).selectFile(files as never, { force: true })),
  };
}

export interface SetupPCOCypressOptions {
  resetUserAgentEachTest?: boolean;
}

/**
 * Configure PCO runtime for Cypress E2E/component tests.
 * Call once from `cypress/support/e2e.ts`.
 */
export function setupPCOCypress(options: SetupPCOCypressOptions = {}): void {
  configureRuntime({
    spyFactory: {
      fn: (impl) => {
        const stub = cy.stub().callsFake(impl as never);
        return stub as never;
      },
    },
    createUserAgent: createCypressUserAgent,
  });

  if (options.resetUserAgentEachTest !== false) {
    beforeEach(() => {
      resetSharedUserAgent();
    });
  }
}

export { resetSharedUserAgent };
