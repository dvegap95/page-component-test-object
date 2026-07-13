import { ComponentTestObject } from '@page-component-object/queries';

/**
 * Unified catalog home test object — same getters for Storybook, Vitest, and Cypress.
 * Cypress: use after `setupPCOCypress()` so `this.context.findBy*` returns PCOChainable targets.
 */
export class CatalogHomeTestObject extends ComponentTestObject {
  get heading() {
    return this.context.findByRole('heading', { name: /items/i });
  }

  get itemLinks() {
    return this.context.getAllByRole('link');
  }

  get firstItemLink() {
    return this.context.getAllByRole('link')[0];
  }

  get demoSelect() {
    return this.context.findByLabelText(/demo select/i);
  }

  get selectedStatus() {
    return this.context.findByRole('status');
  }
}

/** @deprecated Use `CatalogHomeTestObject` */
export class CatalogHomeStoryTestObject extends CatalogHomeTestObject {}

/** @deprecated Use `CatalogHomeTestObject` with `setupPCOCypress()` */
export class CatalogHomeCypressTestObject extends CatalogHomeTestObject {}
