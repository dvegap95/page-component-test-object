import { CypressComponentTestObject } from '@pco/adapter-cypress';

/** Cypress E2E test object — chainable getters via `CypressComponentTestObject`. */
export class CatalogHomeCypressTestObject extends CypressComponentTestObject {
  get heading() {
    return this.chain(() => this.context.getByRole('heading', { name: /items/i }));
  }

  get firstItemLink() {
    return this.chainAt(() => this.context.getAllByRole('link'), 0);
  }
}
