# Project structure

PCO artifacts are shared across **Vitest/Jest**, **Storybook** (`parameters`, optional `play`), and sometimes **Cypress** (DOM-only getters). They are not test-only code — avoid placing them under `__tests__` where story files would import from a test directory.

## Recommended: `__pco__` per feature

Colocate PCO files beside the UI they describe, in a dedicated `__pco__` folder:

```
src/
  features/
    catalog/
      views/
        CatalogHome.tsx
      __pco__/
        CatalogHome.to.tsx       # BaseViewTestObject — render helpers, getters, setupMockData
        CatalogHomeStory.to.ts   # ComponentTestObject — DOM-only (Cypress / props stories)
        ItemsApi.to.ts           # ApiTestObject — MSW route registration
        items.factory.ts         # ItemFactory — plain data builders (no MSW)
      __stories__/
        CatalogHome.stories.tsx  # imports from ../__pco__/CatalogHome.to
      __tests__/
        CatalogHome.bh.test.ts   # imports from ../__pco__/CatalogHome.to — assertions only
```

### Why `__pco__` instead of `__tests__`

| Location | Problem |
|----------|---------|
| `__tests__/Home.to.tsx` | Stories import from `__tests__` — blurs “test code” vs shared PCO surface |
| `testing/Home.to.tsx` | Works, but scatters PCO away from the feature |
| `__pco__/Home.to.tsx` | Clear intent: Page Component Object layer, safe for stories + tests |

Apply the same pattern at whatever granularity fits your app: per route, per view folder, or a shared `src/common/__pco__/` for cross-cutting API test objects.

## File roles

| File | Extends | Contains |
|------|---------|----------|
| `*View.to.tsx` | `BaseViewTestObject` | `setupMockData()`, getters, `render()` / `renderApp()` |
| `*Story.to.ts` | `ComponentTestObject` | DOM getters only — no MSW, no `BaseViewTestObject` |
| `*Api.to.ts` | `ApiTestObject` | `registerGet*` / `registerPost*` — handler paths and spies |
| `*.factory.ts` | `DataFactory` or plain helpers | Default lists, edge-case payloads — **no HTTP, no MSW** |

Use `*.to.ts` when the file has no JSX; use `*.to.tsx` when it calls `renderView(<Component />)` or `renderApp(<Routes />)`.

## Keep factories independent of API mocks

**Do not** define `ItemFactory` inside `ItemsApi.to.ts`. Factories describe **domain data**; API test objects describe **HTTP contracts**. Splitting them lets you:

- Reuse factories in unit tests, Storybook args, and seed scripts without pulling MSW
- Override story data with `view.items = ItemFactory.empty()` while `setupMockData()` still uses `() => this.items`
- Change mock paths or response shapes without touching factory logic

```ts
// items.factory.ts
export const ItemFactory = {
  defaultList(count = 3): Item[] { /* … */ },
  empty(): Item[] { return []; },
};

// ItemsApi.to.ts
import { ItemFactory } from './items.factory';

export class ItemsApiTestObject extends ApiTestObject {
  registerGetItems(handler: () => Item[]) {
    return this.registerRestHandler('get', '*/api/items', () => handler());
  }
}

// CatalogHome.to.tsx
import { ItemFactory } from './items.factory';
import { ItemsApiTestObject } from './ItemsApi.to';

export class CatalogHomeViewTestObject extends BaseViewTestObject {
  itemsApi = new ItemsApiTestObject();
  items = ItemFactory.defaultList(3);

  setupMockData() {
    this.mocks.getItems = this.itemsApi.registerGetItems(() => this.items);
    return this.mocks;
  }
}
```

## Import boundaries

| Consumer | Import from `__pco__` |
|----------|------------------------|
| `*.bh.test.ts` | View test object + factories as needed |
| `*.stories.tsx` | `storyParameters()` / `mockSession()` from view TO; DOM-only story TO for Cypress-aligned stories |
| Cypress specs | **DOM-only** `*Story.to.ts` — never `BaseViewTestObject` (pulls node MSW) |
| Production app code | **Do not** import from `__pco__` |

## App manager and setup

Keep runner wiring outside `__pco__`:

```
src/
  testing/                    # or test-utils/
    AppManager.tsx            # extends BaseAppManager
    setupPco.ts               # configureViewTestObjects + installPCOLifecycle
```

See [getting-started.md](./getting-started.md) for adapter setup and [install.md](./install.md) for npm packages and peers.
