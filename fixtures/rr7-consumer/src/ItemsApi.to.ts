import { ApiTestObject } from '@page-component-object/msw';

import type { Item } from './types';

export class ItemsApiTestObject extends ApiTestObject {
  registerGetItems(handler: Item[] | (() => Item[])) {
    const data = typeof handler === 'function' ? handler : () => handler;
    return this.registerRestHandler('get', '*/api/items', () => data());
  }
}
