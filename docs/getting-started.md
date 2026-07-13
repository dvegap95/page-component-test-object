# Getting started

Progressive onboarding for PCO — start at the level that matches your runner, then go deeper when you need MSW and routing.

| Level | You learn | Good first demo |
|-------|-----------|-----------------|
| [**Level 1**](#level-1--component-test-objects) | `ComponentTestObject` + getters + primitives | [MuiPlayground.stories.tsx](../apps/storybook-demo/src/mui/MuiPlayground.stories.tsx) |
| [**Level 2**](#level-2--cross-runner-dom-getters) | Same DOM getters in Storybook + Cypress | [cross-runner-tutorial.md](./cross-runner-tutorial.md) |
| [**Level 3**](#level-3--app-harness-msw-and-routing) | `BaseViewTestObject`, MSW, router shell | [vitest-demo](../apps/vitest-demo) |

**Prerequisites:** React 18+, React Router v6/v7 for Level 3. Install: [install.md](./install.md).

---

## Level 1 — Component test objects

DOM-only test objects — **no `App`, no MSW, no router**. Ideal for Storybook `play` and MUI preset demos.

```ts
import { ComponentTestObject } from '@page-component-object/queries';

export class CatalogHomeStoryTestObject extends ComponentTestObject {
  get heading() {
    return this.context.getByRole('heading', { name: /items/i });
  }

  get itemLinks() {
    return this.context.getAllByRole('link');
  }
}
```

**Storybook:** `createStoryPlay` binds the story canvas:

```ts
play: createStoryPlay(
  () => new CatalogHomeStoryTestObject(),
  async (_canvas, view) => {
    expect(view.heading).toBeTruthy();
    await view.itemLinks[0].userClick();
  },
),
```

**MUI widgets:** `@page-component-object/preset-mui` — see [presets/mui.md](./presets/mui.md).

### Level 1 adapter setup

Storybook only:

```ts
// .storybook/preview.ts
import { setupPCOStorybook } from '@page-component-object/adapter-storybook';
setupPCOStorybook();
```

Vitest/Jest not required at this level.

---

## Level 2 — Cross-runner DOM getters

Reuse **getter definitions** across Storybook and Cypress. Cypress does **not** use MSW — bind to the live AUT document.

```ts
// Cypress — after cy.visit
const view = new CatalogHomeStoryTestObject();
view.bindToRoot(document.body);
// Prefer CatalogHomeCypressTestObject + PCOChainable for retry — see cypress-adoption.md
```

Full walkthrough: [cross-runner-tutorial.md](./cross-runner-tutorial.md).

**Cypress setup:**

```ts
// cypress/support/e2e.ts
import '@testing-library/cypress/add-commands';
import { setupPCOCypress } from '@page-component-object/adapter-cypress';
setupPCOCypress();
```

---

## Level 3 — App harness, MSW, and routing

View test objects with `render()`, API mocks, and optional full-app navigation.

### Install (Vitest example)

```bash
pnpm add @page-component-object/core @page-component-object/queries @page-component-object/msw \
  @page-component-object/react @page-component-object/router-react \
  @page-component-object/adapter-vitest
```

### Adapter setup (once per runner)

```ts
// vitest — src/setup.ts
import { installPCOLifecycle } from '@page-component-object/adapter-vitest';
import { configureViewTestObjects } from '@page-component-object/react';
import { createDemoAppManager } from './testing/DemoAppManager';

configureViewTestObjects({ createAppManager: createDemoAppManager });
installPCOLifecycle({ apiBaseUrl: 'http://localhost' });
```

Equivalent: `setupPCO()` (Vitest), `setupPCOJest()` (Jest), `setupPCOStorybook()` (Storybook).

### TestObject hierarchy

| Layer | Class | Role |
|-------|-------|------|
| Query + primitive | `ComponentTestObject` | Getters + `userClick` / `userType` |
| View + app + API mocks | `BaseViewTestObject` | Above + `setupMockData()` + `render()` |

**Intent methods** (`fillLogin`, `openSettings`) belong on **your** `*.to.*` classes — see [philosophy.md](./philosophy.md).

### Where to put PCO files

Colocate under **`__pco__`** beside features. **Data factories** in `*.factory.ts`; **API mocks** in `*Api.to.ts`. Layout: [project-structure.md](./project-structure.md).

**JSX rule:** files with `render()` / JSX must be `*.to.tsx`.

### BaseView example

```tsx
import { BaseViewTestObject } from '@page-component-object/react';

export class HomeViewTestObject extends BaseViewTestObject {
  itemsApi = new ItemsApiTestObject();
  items = ItemFactory.defaultList(3);

  readonly mocks = {
    getItems: null as ReturnType<ItemsApiTestObject['registerGetItems']> | null,
  };

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

```ts
const view = new HomeViewTestObject();
await view.render();
expect(view.heading).toBeTruthy();
expect(view.mocks.getItems).toBeTruthy();
```

### Shallow vs full app

| Mode | API | When |
|------|-----|------|
| Shallow | `view.render()` | Single screen |
| Full app | `view.renderApp()` | Multi-route navigation |

After navigation, create a **new** view test object or use `view.getHistory()`.

#### Route subtree, not production shell

Pass **`AppRoutes`** (route tree only) to `renderApp()` — not production `App` with `BrowserRouter`. See troubleshooting in prior docs if you see nested router errors.

### Storybook + shared MSW handlers

```ts
export const Default: Story = {
  parameters: HomeViewTestObject.storyParameters(),
};
```

Details: [msw-storybook.md](./msw-storybook.md).

---

## App runtime contract

`App.get()` is a **module singleton** for the test app shell. View test objects call `this.app.renderView()` — they do not own the manager.

| Rule | Detail |
|------|--------|
| Registration | `configureViewTestObjects({ createAppManager })` in test setup |
| Access | `BaseViewTestObject` uses `App.get()` internally |
| Isolation | Adapters call `App.reset()` in `afterEach` — always use `installPCOLifecycle` / Jest equivalent |
| Parallel tests | Same-file concurrent view tests sharing `App` are unsupported — rare in practice |

DOM-only test objects (Level 1–2) never touch `App`.

`DataFactory` (formerly `ObjectFactory`) builds fixture **data** — not test object instances. See [project-structure.md](./project-structure.md).

---

## Run the demos

```bash
pnpm install && pnpm build

pnpm --filter @page-component-object/vitest-demo test
pnpm --filter @page-component-object/jest-demo test
pnpm --filter @page-component-object/storybook-demo storybook
pnpm --filter @page-component-object/cypress-demo test
```

---

## Next steps

| Doc | Topic |
|-----|-------|
| [Why PCO](./why-pco.md) | Central thesis |
| [Cross-runner tutorial](./cross-runner-tutorial.md) | One view, three runners |
| [Install](./install.md) | Peers + compatibility matrix |
| [Resolver model](./resolver-model.md) | `rootResolver` architecture |
| [Cypress adoption](./cypress-adoption.md) | Chainables + E2E path |
| [Philosophy](./philosophy.md) | Query → primitive → intent |
