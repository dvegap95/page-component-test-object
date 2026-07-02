# MSW in tests vs Storybook

PCO registers HTTP mocks through `ApiTestObject` on the **same handler instances** whether you run Vitest/Jest (node `setupServer`) or Storybook (`msw-storybook-addon` + browser worker). MSW is the transport; view test objects use `BaseViewTestObject` and `setupMockData()` — no MSW in class names.

## Storybook preview setup (consumer)

`@pco/adapter-storybook` expects [msw-storybook-addon](https://storybook.js.org/addons/msw-storybook-addon) to load `parameters.msw.handlers` from each story. Install peers in your app:

```bash
yarn add msw msw-storybook-addon
yarn add file:./vendor/pco/pco-adapter-storybook-0.0.0.tgz
# plus core stack: pco-core, pco-queries, pco-msw, pco-react, pco-router-react
```

Minimal `.storybook/preview.ts`:

```ts
import type { Preview } from '@storybook/react';
import {
  setupPCOStorybook,
  getStorybookMswPreviewConfig,
} from '@pco/adapter-storybook';

const msw = getStorybookMswPreviewConfig({ onUnhandledRequest: 'warn' });

setupPCOStorybook();
msw.initializeMsw();

const preview: Preview = {
  loaders: [...msw.loaders],
  // decorators, parameters, …
};

export default preview;
```

`getStorybookMswPreviewConfig()` wraps `initialize()`, `pcoViewLoader`, and `mswLoader`. Call `initializeMsw()` once at module scope (before exporting `preview`).

Place `mockServiceWorker.js` in your Storybook `public/` directory (`npx msw init <storybook-static-dir>`).

Without `msw-storybook-addon`, `storyParameters` still sets `parameters.msw.handlers`, but **no worker runs** — stories silently hit the real network unless you add a custom decorator.

## Shared mock setup per view

View test objects extend `BaseViewTestObject` and implement `setupMockData()` when the view fetches HTTP APIs:

```ts
class HomeViewTestObject extends BaseViewTestObject {
  readonly mocks = { getItems: null as MockFn | null };

  setupMockData() {
    this.mocks.getItems = this.itemsApi.registerGetItems(() => this.items);
    return this.mocks;
  }
}
```

### Vitest / Jest

The view constructor calls `setupMockData()`. Handlers accumulate on `ApiTestObject.handlers`. `BaseAppManager` starts the node MSW server before render. Assert spies via `view.mocks.*`.

### Storybook — MSW-only stories (no `play`)

MSW setup is declarative. The component fetches; the worker intercepts; **no `play` required** for visual stories:

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

`storyParameters(setupMocks?)` snapshots handlers after `setupMockData()` (and optional `setupMocks`, which runs **after** defaults are registered). The global registry is reset so the next story starts clean.

### Storybook — inline mock setup via loader

For one-off tweaks without a module-scope session, use `parameters.pco` and `pcoViewLoader` (included in `getStorybookMswPreviewConfig()` by default):

```ts
export const EmptyList: Story = {
  parameters: {
    pco: {
      view: HomeViewTestObject,
      setupMocks: (view) => {
        view.items = [];
      },
    },
  },
};
```

### Storybook — optional test-runner assertions

Use `mockSession()` at module scope when you need the same spy instances in optional `play`:

```ts
const session = HomeViewTestObject.mockSession();

export const Default: Story = {
  parameters: { msw: { handlers: session.handlers } },
  play: async ({ canvasElement }) => {
    session.view.bindToRoot(canvasElement);
    expect(session.mocks.getItems).toHaveBeenCalled();
  },
};
```

With `parameters.pco`, use `createViewAssertionPlay` and `loaded.pco.session` instead.

**Do not use `play` for MSW wiring or route navigation** — use `storyParameters` / `parameters.pco` for mocks and router `decorators` for the starting route.

Call `setupPCOStorybook()` once in `.storybook/preview.tsx` so handler spies use Storybook's `fn()`.

## API access from the view in both environments

| Concern | Vitest/Jest | Storybook |
|--------|-------------|-----------|
| DOM getters | `view.heading`, etc. | Same, after `bindToRoot(canvas)` in optional `play` |
| API test objects | `view.itemsApi` on the instance | Same on the session `view` |
| Handler spies | `view.mocks.getItems` | `session.mocks.getItems` (same spy objects embedded in handlers) |

Props-only stories (no fetch) can keep a lightweight `ComponentTestObject` and skip MSW.

## Limitations

- **Cypress** does not use MSW; reuse getters/`UserAgent` against a real app. Do not import `BaseViewTestObject` in Cypress bundles.
- Storybook MSW runs in the **browser**; node-only handlers or custom server middleware need separate setup.
- Call `mockSession` / `storyParameters` at module scope (or use `parameters.pco`) — not inside `play` — so handlers match the spies you assert on.
