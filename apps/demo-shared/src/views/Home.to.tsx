import { BaseViewTestObject } from '@pco/react';

import { ApiTestObject, ItemsApiTestObject, ItemFactory } from '../api/ItemsApi.to';
import { DemoApp, Home } from '../views/DemoApp';
import { createDemoAppManager } from '../testing/DemoAppManager';

export class HomeViewTestObject extends BaseViewTestObject {
  itemsApi = new ItemsApiTestObject();
  items = ItemFactory.defaultList(3);

  readonly mocks = {
    getItems: null as ReturnType<ItemsApiTestObject['registerGetItems']> | null,
  };

  constructor() {
    super();
    createDemoAppManager();
    this.setupMockData();
  }

  setupMockData() {
    this.mocks.getItems = this.itemsApi.registerGetItems(() => this.items);
    return this.mocks;
  }

  get heading() {
    return this.context.getByRole('heading', { name: /items/i });
  }

  get itemLinks() {
    return this.context.getAllByRole('link');
  }

  async render() {
    return this.app.renderView(<Home items={this.items} loading={false} />, {
      route: '/',
      routePath: '/',
    });
  }
}

export class DemoAppViewTestObject extends BaseViewTestObject {
  itemsApi = new ItemsApiTestObject();
  items = ItemFactory.defaultList(3);

  readonly mocks = {
    getItems: null as ReturnType<ItemsApiTestObject['registerGetItems']> | null,
  };

  constructor() {
    super();
    createDemoAppManager();
    this.setupMockData();
  }

  setupMockData() {
    this.mocks.getItems = this.itemsApi.registerGetItems(() => this.items);
    return this.mocks;
  }

  get listHeading() {
    return this.context.queryByRole('heading', { name: /items/i });
  }

  get itemLinks() {
    return this.context.queryAllByRole('link');
  }

  async renderApp() {
    return this.app.renderApp(<DemoApp />, { initialRoute: '/' });
  }
}
