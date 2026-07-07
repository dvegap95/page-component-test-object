export function runCypressCommand(command: () => Cypress.Chainable): Promise<void> {
  return new Cypress.Promise<void>((resolve) => {
    command().then(() => {
      resolve();
    });
  });
}
