# Getting started

This guide walks through the core PCO concepts using the fictitious `apps/demo-shared` catalog example.

## Prerequisites

- React 18 + React Router v5 (for routed demos)
- A test runner adapter: Vitest, Jest, Storybook, and/or Cypress
- MSW v2 (for API-backed view tests in node or Storybook)

## 1. Install adapters in your app

In a consumer project (or monorepo app package), depend on the PCO packages you need:

```json
{
  "dependencies": {
    "@pco/core": "workspace:*",
    "@pco/queries": "workspace:*",
    "@pco/react": "workspace:*",
    "@pco/msw": "workspace:*"
  },
  "devDependencies": {
    "@pco/adapter-vitest": "workspace:*"
  }
}
```

Call the adapter setup **once** in your test setup file:

```ts
// vitest setup
import { setupPCOVitest } from '@pco/adapter-vitest';

setupPCOVitest();
```

Equivalent entry points: `setupPCOJest()`, `setupPCOStorybook()`, `setupPCOCypress()`.

## 2. TestObject hierarchy

| Layer | Class | Use when |
|-------|-------|----------|
| DOM only | `ComponentTestObject` | Storybook canvas, Cypress-bound root, props-only stories |
| View + app | `BaseViewTestObject` | View rendered through `App.get()` / `AppManager` |
| View + MSW | `MswViewTestObject` | View tests that mock HTTP via `ApiTestObject` |

Naming convention: `*ViewTestObject` or `*StoryTestObject` in `*.to.ts` / `*.to.tsx`.

## 3. DOM-only test object (Storybook / Cypress)

```ts
import { ComponentTestObject } from '@pco/queries';

export class CatalogHomeStoryTestObject extends ComponentTestObject {
  get heading() {
    return this.context.getByRole('heading', { name: /items/i });
  }

  get itemLinks() {
    return this.context.getAllByRole('link');
  }
}
```

**Storybook:** `createStoryPlay` binds the object to the story canvas.

**Cypress:** after `cy.visit`, bind to the AUT document:

```ts
const view = new CatalogHomeStoryTestObject();
view.bindToRoot(document.body);
```

See [cypress.md](./cypress.md) for command-queue patterns.

## 4. MSW-backed view test object (Vitest / Jest)

```ts
import { MswViewTestObject } from '@pco/react';

export class HomeViewTestObject extends MswViewTestObject {
  itemsApi = new ItemsApiTestObject();
  items = ItemFactory.defaultList(3);

  readonly mocks = {
    getItems: null as ReturnType<ItemsApiTestObject['registerGetItems']> | null,
  };

  constructor() {
    super();
    createDemoAppManager(); // registers AppManager with the runner's MSW server
    this.setupMockData();
  }

  setupMockData() {
    this.mocks.getItems = this.itemsApi.registerGetItems(() => this.items);
    return this.mocks;
  }

  async render() {
    return this.app.renderView(<Home items={this.items} loading={false} />, {
      route: '/',
      routePath: '/',
    });
  }
}
```

### Shallow vs full app

| Mode | API | When |
|------|-----|------|
| Shallow | `view.render()` → `app.renderView(<View />, { route, routePath })` | Single screen, isolated view |
| Full app | `view.renderApp()` → `app.renderApp(<App />, { initialRoute })` | Multi-route navigation |

After navigation in a full-app test, **create a new view test object** (or query `app.getHistory()`) — views do not carry router state on the object instance.

Example (Vitest):

```ts
const view = new HomeViewTestObject();
await view.render();
expect(view.heading).toBeTruthy();
expect(view.mocks.getItems).toBeTruthy();
```

## 5. Storybook with shared MSW handlers

Use `defineMswViewStory` so the same `setupMockData()` handlers appear in `parameters.msw`:

```ts
const mswStory = defineMswViewStory(HomeViewTestObject, {
  play: async (view) => {
    await waitFor(() => expect(view.heading).toBeTruthy());
    expect(mswStory.mocks.getItems).toHaveBeenCalled();
  },
});

export const Default: Story = {
  parameters: mswStory.parameters,
  play: mswStory.play,
};
```

Details: [msw-storybook.md](./msw-storybook.md).

## 6. MUI widget helpers

`@pco/preset-mui` provides typed wrappers for common MUI components — used in `apps/storybook-demo/src/mui/`:

```ts
const field = MuiFormFieldTestObject.getInstanceByLabel('Name', root);
await field.input.userType('Alice');
expect(field.inputValue).toBe('Alice');
```

## 7. Run the demos

```bash
# From repo root
pnpm install && pnpm build

pnpm --filter @pco/vitest-demo test
pnpm --filter @pco/jest-demo test
pnpm --filter @pco/storybook-demo storybook
pnpm --filter @pco/cypress-demo test
```

## Next steps

- [Architecture plan](../PLAN.md) — `App` singleton, checklist, monorepo map
- [Philosophy](./philosophy.md) — what belongs in a behavioral test
