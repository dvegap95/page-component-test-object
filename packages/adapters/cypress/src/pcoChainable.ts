export type PCOChainable<T extends HTMLElement = HTMLElement> = Cypress.Chainable<JQuery<T>> & {
  /** PCO semantic click — enqueues Cypress click on this chain. */
  userClick(options?: Partial<Cypress.ClickOptions>): Cypress.Chainable<void>;
  /** PCO semantic type — clear + type (matches `createCypressUserAgent` behavior). */
  userType(text: string, options?: Partial<Cypress.TypeOptions>): Cypress.Chainable<void>;
  /** Clear the field via Cypress native clear. */
  userClear(): PCOChainable<T>;
};

/** Wrap a Cypress chain with PCO semantic methods. Native `.type()` / `.click()` / `.should()` unchanged. */
export function asPCOChainable<T extends HTMLElement>(
  chain: Cypress.Chainable<JQuery<T>>,
): PCOChainable<T> {
  const pco = chain as PCOChainable<T>;

  pco.userClick = (options?: Partial<Cypress.ClickOptions>) =>
    chain.click(options) as unknown as Cypress.Chainable<void>;

  pco.userType = (text: string, options?: Partial<Cypress.TypeOptions>) =>
    chain.clear().type(text, options) as unknown as Cypress.Chainable<void>;

  pco.userClear = () => chain.clear() as PCOChainable<T>;

  return pco;
}
