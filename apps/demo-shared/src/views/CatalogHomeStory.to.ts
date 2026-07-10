import { ComponentTestObject } from '@page-component-object/queries';

/** Storybook-only test object — queries canvas, no AppManager or MSW. */
export class CatalogHomeStoryTestObject extends ComponentTestObject {
  get heading() {
    return this.context.getByRole('heading', { name: /items/i });
  }

  get itemLinks() {
    return this.context.getAllByRole('link');
  }
}
