import { CypressComponentTestObject } from '@pco/adapter-cypress';

/** Cypress E2E test object — chainable getters via `CypressComponentTestObject`. */
export class CatalogHomeCypressTestObject extends CypressComponentTestObject {
  get heading() {
    return this.findByRole('heading', { name: /items/i });
  }

  get firstItemLink() {
    return this.findAllByRoleAt('link', 0);
  }
}
