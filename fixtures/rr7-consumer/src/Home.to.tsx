import { BaseViewTestObject } from '@page-component-object/react';

import { ItemsApiTestObject } from './ItemsApi.to';
import { AppRoutes, CatalogHome } from './AppRoutes';
import type { Item } from './types';

const defaultItems: Item[] = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' },
];

export class HomeViewTestObject extends BaseViewTestObject {
  itemsApi = new ItemsApiTestObject();
  items = defaultItems;

  readonly mocks = {
    getItems: null as ReturnType<ItemsApiTestObject['registerGetItems']> | null,
  };

  setupMockData() {
    this.mocks.getItems = this.itemsApi.registerGetItems(() => this.items);
    return this.mocks;
  }

  get heading() {
    return this.context.getByRole('heading', { name: /items/i });
  }

  async render() {
    return this.app.renderView(<CatalogHome items={this.items} />, {
      route: '/',
      routePath: '/',
    });
  }
}

export class AppRoutesViewTestObject extends BaseViewTestObject {
  itemsApi = new ItemsApiTestObject();
  items = defaultItems;

  readonly mocks = {
    getItems: null as ReturnType<ItemsApiTestObject['registerGetItems']> | null,
  };

  setupMockData() {
    this.mocks.getItems = this.itemsApi.registerGetItems(() => this.items);
    return this.mocks;
  }

  async renderApp() {
    return this.app.renderApp(<AppRoutes items={this.items} />, { initialRoute: '/' });
  }

  get heading() {
    return this.context.getByRole('heading', { name: /items/i });
  }
}
