export type PCOChainable<T extends HTMLElement = HTMLElement> = Cypress.Chainable<JQuery<T>> & {
  /** PCO semantic click — enqueues Cypress click on this chain. */
  userClick(options?: Partial<Cypress.ClickOptions>): Cypress.Chainable<void>;
  /** PCO semantic type — clear + type (matches `createCypressUserAgent` behavior). */
  userType(text: string, options?: Partial<Cypress.TypeOptions>): Cypress.Chainable<void>;
  /** Clear the field via Cypress native clear. */
  userClear(): PCOChainable<T>;
  /**
   * PCO semantic select — select an option by its visible text (native `<select>` only).
   *
   * Uses the text of `<option>` elements to derive the option value, then calls Cypress `.select()`.
   */
  selectOptionByText(text: string | RegExp): Cypress.Chainable<void>;
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

  pco.selectOptionByText = (text: string | RegExp) =>
    chain.then(($select) => {
      const options = $select.find('option').toArray();
      const matched = options.find((opt) => {
        const label = (opt.textContent ?? '').trim();
        if (typeof text === 'string') return label === text;
        return text.test(label);
      });

      if (!matched) {
        throw new Error(`selectOptionByText: no <option> matched "${text}"`);
      }

      const value = (matched as unknown as HTMLOptionElement).value;
      return cy.wrap($select as unknown as JQuery<HTMLElement>).select(value as never);
    }) as unknown as Cypress.Chainable<void>;

  return pco;
}
