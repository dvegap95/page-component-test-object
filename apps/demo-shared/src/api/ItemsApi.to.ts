import { ObjectFactory } from '@pco/core';
import { ApiTestObject } from '@pco/msw';

import type { Item } from '../types';

export class ItemsApiTestObject extends ApiTestObject {
  registerGetItems(handler: Item[] | (() => Item[])) {
    const data = typeof handler === 'function' ? handler : () => handler;
    return this.registerRestHandler('get', '*/api/items', () => data());
  }
}

export class ItemFactory extends ObjectFactory<Item> {
  constructor() {
    super({ id: '1', name: 'Alpha' });
  }

  static defaultList(count = 3): Item[] {
    return Array.from({ length: count }, (_, i) =>
      new ItemFactory().setProps({ id: String(i + 1), name: `Item ${i + 1}` }).build(),
    );
  }
}
