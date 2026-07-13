# Page Component Object (PCO)

**npm:** [`@page-component-object/*`](https://www.npmjs.com/org/page-component-object) — shared TestObjects for React UI tests. The pattern and folder layout go by **PCO** (`__pco__`, `*.to.ts`, `PCOChainable`).

Cross-runner suites often maintain **three parallel copies** of the same work: selectors in Vitest, the same getters again in Storybook `play`, and another set in Cypress. When a date picker or modal flow changes, that fix lands in three places. PCO applies Page Object thinking at the **component and view** level — centralize **queries**, **interactions**, and **intents** in `TestObjects` (`*.to.ts` / `*.to.tsx`) beside your features, then let **adapters** run them in **Vitest**, **Jest**, **Storybook**, and **Cypress**. API mocks, data factories, and test-app wiring live in the same `__pco__` layer.

> **Status:** `0.1.2` on npm — stable for **Vitest**, **Jest**, and **Storybook** (MSW-backed view tests). **Cypress chainables** (`PCOChainable`, `findBy*`) ship today; **unified cross-runner TO definitions** are landing in `0.2.x` via the resolver model. See [Cypress adoption](./docs/cypress-adoption.md).

## Why PCO?

**Start here:** [docs/why-pco.md](./docs/why-pco.md) — the central thesis, duplication diagram, and when PCO pays off. Then [design principles](./docs/design-principles.md) and [getting started](./docs/getting-started.md) (Level 1 → 3).

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
| [`@page-component-object/core`](./packages/core) | Types, `DataFactory`, `App` singleton, runtime injection |
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
| [Why PCO](./docs/why-pco.md) | Central thesis, duplication diagram |
| [Design principles](./docs/design-principles.md) | Runtime contracts, escape hatches |
| [Getting started](./docs/getting-started.md) | Level 1 → 3 progressive onboarding |
| [Cross-runner tutorial](./docs/cross-runner-tutorial.md) | One view in Vitest, Storybook, Cypress |
| [Install](./docs/install.md) | npm packages, peers, compatibility matrix |
| [Portability](./docs/portability.md) | What travels vs runner-native |
| [Resolver model](./docs/resolver-model.md) | `rootResolver`, `PCOTarget` architecture |
| [Cypress adoption](./docs/cypress-adoption.md) | Chainables, E2E path, Playwright comparison |
| [Project structure](./docs/project-structure.md) | `__pco__` layout, factories vs API mocks |
| [MSW in tests vs Storybook](./docs/msw-storybook.md) | Shared handlers, story parameters |
| [MUI preset](./docs/presets/mui.md) | Widget test objects |
| [API matchers](./docs/matchers.md) | `toHaveBeenLastCalledWithUrl` for MSW spies |
| [Philosophy](./docs/philosophy.md) | Query → primitive → intent |
| [When not to use](./docs/when-not-to-use.md) | Honest scope boundaries |
| [Changelog](./CHANGELOG.md) | Version history |

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
| Cypress `PCOChainable` + `findBy*` | **Shipped** — [cypress-adoption](./docs/cypress-adoption.md) |
| Unified cross-runner TO definitions (resolver model) | **In progress** `0.2.x` — [resolver-model](./docs/resolver-model.md) |
| API matchers (`toHaveBeenLastCalledWithUrl`) | **Stable** on Vitest/Jest — [matchers](./docs/matchers.md) |
| Cypress chainable matchers | Planned |
| More UI presets (`@page-component-object/preset-*`) | Planned |
| Playwright adapter | Research spike — both E2E paths open |

Interaction model: [docs/philosophy.md](./docs/philosophy.md).

## Related

- [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles)
- [semantic-matchers](https://github.com/dvegap95/semantic-matchers) — API spy matchers for Vitest/Jest
