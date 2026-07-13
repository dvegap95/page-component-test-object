# Page Component Object (PCO)

**npm:** [`@page-component-object/*`](https://www.npmjs.com/org/page-component-object) — shared TestObjects for React UI tests. The pattern and folder layout go by **PCO** (`__pco__`, `*.to.ts`, `PCOChainable`).

Cross-runner suites often maintain **three parallel copies** of the same work: selectors in Vitest, the same getters again in Storybook `play`, and another set in Cypress. When a date picker or modal flow changes, that fix lands in three places. PCO applies Page Object thinking at the **component and view** level — centralize **queries**, **interactions**, and **intents** in `TestObjects` (`*.to.ts` / `*.to.tsx`) beside your features, then let **adapters** run them in **Vitest**, **Jest**, **Storybook**, and **Cypress**. API mocks, data factories, and test-app wiring live in the same `__pco__` layer.

> **Status:** `0.1.2` on npm — stable for **Vitest**, **Jest**, and **Storybook** (MSW-backed view tests). **Cypress** is experimental: getter reuse and `PCOChainable` ship today; see [cypress integration](./docs/cypress.md).

## Technical context

| Area | In this repo |
|------|----------------|
| Monorepo | pnpm workspaces, Turborepo, tsup builds across scoped packages |
| Library design | Adapter pattern — one TestObject surface, four test runners |
| Test layering | Query → primitive interaction → domain intent ([philosophy](./docs/philosophy.md)) |
| Selectors | Testing Library roles and accessible names; Cypress via `@testing-library/cypress` |
| HTTP boundary | MSW v2 registry — handlers shared between node tests and Storybook |
| Widget reuse | Composable presets (e.g. [`@page-component-object/preset-mui`](./packages/presets/mui)) in view test objects |
| API assertions | [`@semantic-matchers`](https://github.com/dvegap95/semantic-matchers) integration for Vitest/Jest spy matchers |

## Install

```bash
pnpm add @page-component-object/core @page-component-object/queries @page-component-object/msw \
  @page-component-object/react @page-component-object/router-react \
  @page-component-object/adapter-vitest
```

Add `@page-component-object/adapter-jest`, `@page-component-object/adapter-storybook`, or `@page-component-object/adapter-cypress` for other runners. Peer dependencies and per-runner bundles: [docs/install.md](./docs/install.md).

## Why PCO?

PCO is a **Page Component Object** strategy: Page Object thinking applied to **components and views**, not only full pages. The goal is to stop tests from spending ten lines manipulating a date picker, a select, or a modal — you define **queries** (where things are), **interactions** (how to act on them), and **intents** (higher-level procedures your app cares about) once, then reuse and extend them.

| Layer | What you define | Example |
|-------|-----------------|---------|
| **Query** | Accessible locators | `get startDate()` → role/label query |
| **Interaction** | Primitive user actions | `await field.userType('2026-01-15')` |
| **Intent** | Widget- or flow-level procedure | `await datePicker.selectDate('2026-01-15')` |

Two date pickers on the same form? Two intent calls — not two copies of open-calendar-click-day-blur. When the selection procedure changes, you fix it in **one** preset or test object.

Design-system widgets get their own reusable objects (see [`@page-component-object/preset-mui`](./packages/presets/mui)). View test objects compose them and add domain intents (`fillCheckout`, `openSettings`). Factories and API test objects keep **data** and **HTTP contracts** beside the UI layer under [`__pco__`](./docs/project-structure.md).

### Multi-runner reuse

Even with a Page Object pattern in **each** runner, you still maintain **three parallel blocks** — the same queries, primitives, and intents for Vitest/Jest, Storybook `play`, and Cypress. Adapters let one `__pco__` surface drive every context that can import it.

| Concern | Per-runner PCO (3×) | Shared `__pco__` + adapters |
|--------|---------------------|-----------------------------|
| Widget intents | Copied across bh / Storybook / Cypress TOs | One intent; runner-specific execution only |
| DOM queries | Three getter sets | One getter definition |
| API boundary | Three MSW / mock setups | `setupMockData()` shared with Storybook; E2E uses real HTTP |
| Maintenance | Fix a date-picker flow in three places | Fix once in preset or view TO |

### Query libraries by runner

**Vitest, Jest, and Storybook** use [`@testing-library/dom`](https://testing-library.com/docs/dom-testing-library/intro) (and `@testing-library/react` where components mount). PCO getters delegate to RTL queries and follow [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles).

**Cypress** uses [`@testing-library/cypress`](https://testing-library.com/docs/cypress-testing-library/intro) via `CypressComponentTestObject` and `PCOChainable`. See [docs/cypress.md](./docs/cypress.md).

See [philosophy](./docs/philosophy.md) for the query → primitive → intent model.

## Quick example

```ts
// Home.to.tsx — view test object: queries + render + API mocks
export class HomeViewTestObject extends BaseViewTestObject {
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
```

```ts
// Vitest behavioral test
const view = new HomeViewTestObject();
await view.render();
expect(view.itemLinks).toHaveLength(3);
await view.getUser().click(view.itemLinks[0]);
```

See [docs/getting-started.md](./docs/getting-started.md) for the full walkthrough.

## Packages

| Package | Description |
|---------|-------------|
| [`@page-component-object/page`](./packages/page) | npm org landing — links to all packages (not a runtime dependency) |
| [`@page-component-object/core`](./packages/core) | Types, `ObjectFactory`, `App` singleton, runtime injection |
| [`@page-component-object/queries`](./packages/queries) | `ComponentTestObject` — RTL queries + user agent |
| [`@page-component-object/msw`](./packages/msw) | MSW v2 API mock registry and session helpers |
| [`@page-component-object/react`](./packages/react) | `BaseViewTestObject`, `BaseAppManager` |
| [`@page-component-object/router-react`](./packages/router-react) | React Router v6/v7 test shell (`MemoryRouter`, `Routes`, `useNavigate`) |
| [`@page-component-object/preset-mui`](./packages/presets/mui) | MUI widget test objects (Button, Select, Snackbar, TimePicker, TableRow, …) |
| [`@page-component-object/adapter-vitest`](./packages/adapters/vitest) | Vitest lifecycle + user agent |
| [`@page-component-object/adapter-jest`](./packages/adapters/jest) | Jest lifecycle + user agent |
| [`@page-component-object/adapter-storybook`](./packages/adapters/storybook) | `createStoryPlay`, `storyParameters`, `pcoViewLoader`, MSW bridge |
| [`@page-component-object/adapter-cypress`](./packages/adapters/cypress) | Cypress runtime, `CypressComponentTestObject`, `PCOChainable` |

## Demo apps (not published)

Fictitious catalog domain under [`apps/demo-shared`](./apps/demo-shared).

| App | Runner | What it demonstrates |
|-----|--------|----------------------|
| [`apps/vitest-demo`](./apps/vitest-demo) | Vitest + MSW | Shallow view + full-app navigation |
| [`apps/jest-demo`](./apps/jest-demo) | Jest + MSW | Same behavioral specs as Vitest |
| [`apps/storybook-demo`](./apps/storybook-demo) | Storybook | MSW stories + MUI preset `play` demos |
| [`apps/cypress-demo`](./apps/cypress-demo) | Cypress E2E | TestObject getters bound to a live app |

## Documentation

| Doc | Topic |
|-----|-------|
| [Install](./docs/install.md) | npm packages, peers, Vitest setup |
| [Getting started](./docs/getting-started.md) | Adapters, TestObject hierarchy, first test |
| [Project structure](./docs/project-structure.md) | `__pco__` layout, factories vs API mocks |
| [MSW in tests vs Storybook](./docs/msw-storybook.md) | Shared handlers, `createMockSession`, story parameters |
| [Cypress integration](./docs/cypress.md) | `PCOChainable`, `bindToRoot`, getter reuse |
| [API matchers](./docs/matchers.md) | `toHaveBeenLastCalledWithUrl` for MSW spies |
| [Philosophy](./docs/philosophy.md) | Behavioral tests, Testing Trophy, RTL alignment |

## Development

**Requirements:** Node 20+, pnpm 9+

```bash
pnpm install
pnpm build
pnpm test                    # Vitest + Jest demos (excludes slow Cypress E2E)
pnpm --filter @page-component-object/cypress-demo test   # Cypress E2E
pnpm test:consumer-smoke     # tarball install smoke (CI)
pnpm --filter @page-component-object/storybook-demo storybook
```

Monorepo tooling: **pnpm workspaces**, **Turborepo**, **tsup** for package builds.

Maintainers: release workflow in [`.github/PUBLISH.md`](./.github/PUBLISH.md); architecture notes in [`.github/PLAN.md`](./.github/PLAN.md).

## Roadmap

| Area | Status |
|------|--------|
| Vitest / Jest / Storybook + MSW | **Stable** in `0.1.2` |
| Cypress `PCOChainable` + Testing Library queries | **Experimental** — ships; polish ongoing |
| API matchers (`toHaveBeenLastCalledWithUrl`) | **Stable** on Vitest/Jest — [matchers](./docs/matchers.md) |
| Cypress chainable matchers | Planned |
| More UI presets (`@page-component-object/preset-*`) | Planned |
| Playwright adapter | Under evaluation |

Interaction model: [docs/philosophy.md](./docs/philosophy.md).

## Related

- [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles)
- [semantic-matchers](https://github.com/dvegap95/semantic-matchers) — API spy matchers for Vitest/Jest
