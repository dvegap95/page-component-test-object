import '@testing-library/cypress';

import { asPCOChainable, type PCOChainable } from './pcoChainable';

type FindByCommand =
  | 'findByRole'
  | 'findByLabelText'
  | 'findByText'
  | 'findByTestId'
  | 'findByPlaceholderText'
  | 'findByDisplayValue'
  | 'findByAltText'
  | 'findByTitle';

type FindAllByCommand =
  | 'findAllByRole'
  | 'findAllByLabelText'
  | 'findAllByText'
  | 'findAllByTestId'
  | 'findAllByPlaceholderText'
  | 'findAllByDisplayValue'
  | 'findAllByAltText'
  | 'findAllByTitle';

/** Wrap a `cy.findBy*` command as a PCO chainable. */
export function cyFindBy(command: FindByCommand, ...args: unknown[]): PCOChainable {
  const run = (cy as Record<FindByCommand, (...a: unknown[]) => Cypress.Chainable<JQuery<HTMLElement>>>)[
    command
  ];
  return asPCOChainable(run(...args));
}

/** Wrap `cy.findAllBy*(…).eq(index)` as a PCO chainable. */
export function cyFindAllByAt(
  command: FindAllByCommand,
  index: number,
  ...args: unknown[]
): PCOChainable {
  const run = (cy as Record<
    FindAllByCommand,
    (...a: unknown[]) => Cypress.Chainable<JQuery<HTMLElement>>
  >)[command];
  const list = args.length > 0 ? run(...args) : run();
  return asPCOChainable(list.eq(index));
}
