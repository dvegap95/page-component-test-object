# Getting started

Hands-on walkthrough for wiring PCO in your app — adapters, TestObject types, and a first behavioral test. Uses the fictitious `apps/demo-shared` catalog example (no proprietary domain references).

## Prerequisites

- React 18+
- **React Router v6 or v7** (`@pco/router-react` uses `Routes`, `useNavigate` — v5 is not supported)
- A test runner adapter: Vitest, Jest, Storybook, and/or Cypress
- MSW v2 (for API-backed view tests in node or Storybook)

Full peer list for tarball consumers: [CONSUMER_INSTALL.md](./CONSUMER_INSTALL.md).

## 1. Install packages in your app

### Monorepo workspace (this repo)

```json
{
  "dependencies": {
    "@pco/core": "workspace:*",
    "@pco/queries": "workspace:*",
    "@pco/react": "workspace:*",
    "@pco/router-react": "workspace:*",
    "@pco/msw": "workspace:*"
  },
  "devDependencies": {
    "@pco/adapter-vitest": "workspace:*"
  }
}
```

### External consumer (tarballs)

Build packs from a PCO checkout (`pnpm pack:dist`), copy `dist/packs/` + `manifest.json`, update `file:` paths to `0.1.0-dev.N` (see [CONSUMER_INSTALL.md](./CONSUMER_INSTALL.md)), then:

```bash
# Replace 0.1.0-dev.N with version from dist/packs/manifest.json
yarn add \
  file:./vendor/pco/pco-core-0.1.0-dev.N.tgz \
  file:./vendor/pco/pco-queries-0.1.0-dev.N.tgz \
  file:./vendor/pco/pco-msw-0.1.0-dev.N.tgz \
  file:./vendor/pco/pco-router-react-0.1.0-dev.N.tgz \
  file:./vendor/pco/pco-react-0.1.0-dev.N.tgz \
  file:./vendor/pco/pco-adapter-vitest-0.1.0-dev.N.tgz
```

Add `pco-adapter-storybook-0.0.0.tgz` and/or `pco-adapter-cypress-0.0.0.tgz` when you use those runners. See [CONSUMER_INSTALL.md](./CONSUMER_INSTALL.md) for the complete tarball + peer manifest.

**View-level tests** need `@pco/react` and `@pco/router-react` — do not reimplement `BaseAppManager` / `BaseViewTestObject` locally.

### Adapter setup

Call the adapter setup **once** per runner. For MSW-backed view tests, also register your `AppManager` factory once (replaces per-view `createAppManager()` boilerplate):

```ts
// vitest — src/setup.ts
import { installPCOLifecycle } from '@pco/adapter-vitest';
import { configureViewTestObjects } from '@pco/react';
import { createDemoAppManager } from './testing/DemoAppManager';

configureViewTestObjects({ createAppManager: createDemoAppManager });

// apiBaseUrl defaults to http://localhost; override to match your API test objects
installPCOLifecycle({ apiBaseUrl: 'http://localhost' });
```

```ts
// vitest — alternative one-shot setup without lifecycle hooks
import { setupPCO } from '@pco/adapter-vitest';

setupPCO({ apiBaseUrl: 'http://localhost' });
```

Equivalent entry points: `setupPCO()` / `installPCOLifecycle()` (Vitest), `setupPCOJest()` (Jest), `setupPCOStorybook()` (Storybook), `setupPCOCypress()` (Cypress).

**Cypress does not use the node MSW server.** API mocking in Cypress is out of scope — reuse DOM getters from MSW-free test objects against a real app. See [cypress.md](./cypress.md).

## 2. TestObject hierarchy

| Layer | Class | Role | Use when |
|-------|-------|------|----------|
| Query + primitive | `ComponentTestObject` | Getters + `userClick` / `userType` | Storybook canvas, Cypress-bound root, props-only stories |
| View + app + API mocks | `BaseViewTestObject` | Above + `setupMockData()` + `render()` | Vitest/Jest/Storybook MSW view tests via `App.get()` |

**BaseView** = routed view under `AppManager` with HTTP mocked through `setupMockData()` (MSW in Vitest/Jest/Storybook is an implementation detail).

**Intent methods** (e.g. `fillLogin`, `openSettings`) belong on **your** `*.to.*` classes — not in `@pco/*`. They compose primitives. See [philosophy.md](./philosophy.md#query-primitive-intent).

### Where to put PCO files

Use a **`__pco__`** directory beside the feature (not `__tests__`) so Storybook and behavioral tests import the same surface. Keep **data factories** in `*.factory.ts` separate from **API mock** classes in `*Api.to.ts`. Full layout: [project-structure.md](./project-structure.md).

Naming convention: `*ViewTestObject` or `*StoryTestObject` in `*.to.ts` / `*.to.tsx`.

### File extension rule

**If `render()`, `renderApp()`, or any method in the file contains JSX, the file must be `*.to.tsx`.** TypeScript/Babel will fail to parse JSX in a `.to.ts` file with a non-obvious error. API-only test objects (`ItemsApi.to.ts`) stay `.ts`; view test objects that call `renderView(<Home />)` use `.to.tsx`.

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

**Cypress:** after `cy.visit`, bind to the AUT document. Import from the same `*.to.tsx` getters as Storybook, but use a **DOM-only** class (no `BaseViewTestObject` / node MSW in the Cypress bundle):

```ts
const view = new CatalogHomeStoryTestObject();
view.bindToRoot(document.body);
```

See [cypress.md](./cypress.md) for command-queue patterns and tarball install.

## 4. BaseView test object (Vitest / Jest)

```tsx
import { BaseViewTestObject } from '@pco/react';

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

### Shallow vs full app

| Mode | API | When |
|------|-----|------|
| Shallow | `view.render()` → `app.renderView(<View />, { route, routePath })` | Single screen, isolated view |
| Full app | `view.renderApp()` → `app.renderApp(<AppRoutes />, { initialRoute })` | Multi-route navigation |

After navigation in a full-app test, **create a new view test object** (or call `view.getHistory()`) — views do not carry router state on the object instance.

`getHistory()` is public on `BaseViewTestObject`; `app` is also public when you need the full `AppManager` (e.g. `isRendered()`).

#### Route subtree, not production shell

`BaseAppManager` wraps your tree in `MemoryRouter` (`@pco/router-react`). Pass the **route subtree** — not the component that already includes `BrowserRouter` / `RouterProvider`:

| Component | Role | Use in `renderApp()`? |
|-----------|------|------------------------|
| `App` | Production shell (`BrowserRouter`, layout, providers) | **No** — nested router error |
| `AppRoutes` | `<Switch>` / `<Routes>` + page components only | **Yes** |

Recommended layout:

```tsx
// App.tsx — production
export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

// AppRoutes.tsx — shared route tree (prod + tests)
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* … */}
    </Routes>
  );
}
```

```tsx
// HomeViewTestObject — full-app test
async renderApp() {
  return this.app.renderApp(<AppRoutes />, { initialRoute: '/' });
}
```

**React Router v5:** not supported by `@pco/router-react`. Upgrade to v6/v7 or stay on a local test shell until you migrate.

**Troubleshooting:** `You cannot render a <Router> inside another <Router>` — you passed the production `App` (or any component that already owns a router) to `renderApp()`. Mount `AppRoutes` instead.

Example (Vitest):

```ts
const view = new HomeViewTestObject();
await view.render();
expect(view.heading).toBeTruthy();
expect(view.mocks.getItems).toBeTruthy();
```

## 5. Storybook with shared mock handlers

Install `@pco/adapter-storybook`, `msw`, and `msw-storybook-addon` (peer dependencies).

Wire MSW once in `.storybook/preview.ts` — see [msw-storybook.md](./msw-storybook.md) for the full snippet. Use `storyParameters()` so the same `setupMockData()` handlers appear in `parameters.msw` — **no `play` required** for visual stories:

```ts
export const Default: Story = {
  parameters: HomeViewTestObject.storyParameters(),
};

export const EmptyList: Story = {
  parameters: HomeViewTestObject.storyParameters((view) => {
    view.items = [];
  }),
};
```

For optional test-runner spy checks, use `mockSession()` or `parameters.pco` — see [msw-storybook.md](./msw-storybook.md).

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
- [MSW in Storybook](./msw-storybook.md) — `msw-storybook-addon` preview wiring
- [Cypress integration](./cypress.md) — tarball install, `bindToRoot`, getter reuse
- [Philosophy](./philosophy.md) — what belongs in a behavioral test
