# Page Component Object (PCO)

**A toolset for behavioral integration tests in React** — scoped TestObjects (`*.to.ts` / `*.to.tsx` in `__pco__`) hold queries, interactions, and (where supported) assertions so specs describe *what the user does*, not how to find every node in the tree.

> **New here?** Copy [Install](#install) → follow [Getting started](./docs/getting-started.md) (Level 1). Skim [What it is](#what-it-is) for context. For the booking-flow story: [vision](./docs/vision.md).
>
> **Status:** `0.1.2` on npm — [`@page-component-object/*`](https://www.npmjs.com/org/page-component-object). **Stable:** Vitest, Jest, Storybook (MSW-backed view tests). **Shipped:** Cypress `PCOChainable` / `findBy*`. **In progress (`0.2.x`):** unified cross-runner TestObjects — [resolver model](./docs/resolver-model.md), [Cypress adoption](./docs/cypress-adoption.md).

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
// Vitest behavioral test — elements from getters are PCO targets
const view = new HomeViewTestObject();
await view.render();
expect(view.itemLinks).toHaveLength(3);
await view.itemLinks[0].userClick();
```

See [getting started](./docs/getting-started.md) for the full walkthrough (Level 1 → 3).

## Install

```bash
pnpm add @page-component-object/core @page-component-object/queries @page-component-object/msw \
  @page-component-object/react @page-component-object/router-react \
  @page-component-object/adapter-vitest
```

Add `@page-component-object/adapter-jest`, `@page-component-object/adapter-storybook`, or `@page-component-object/adapter-cypress` for other runners. Peer dependencies and per-runner bundles: [install](./docs/install.md).

## What it is

Integration tests tend to accumulate **inline query chains and interaction blocks** — repeated setup and selectors scattered across specs instead of behavior.

In a **focused test** (one dialog, one primary action), a direct query is often enough:

```ts
await screen.findByRole('button', { name: 'Accept' }).click();
```

That breaks down in **full integration views**: another Accept on a card, a sticky bar, or a row action added later can make the same global query ambiguous. Teams then reach for nested `within()` scopes — workable, but duplicated across every spec that touches the same flow.

PCO applies Page Object thinking at the **component and view** level: scoped test objects beside the feature hold query knowledge once. For an **already-open** dialog:

```ts
await view.addItemButton.userClick(); // view action that opens the modal
await view.confirmAdditionModal.acceptButton.userClick(); // scoped to that dialog
```

`confirmAdditionModal` scopes queries to the Confirm Addition dialog — not whichever Accept matches first on the page. Opening the modal stays a **view action** (or a view intent like `confirmAddition()` if you compose the whole flow). The modal test object does not need to know what opened it.

Specs stay focused on **observable behavior**: render a view, act through intents or scoped targets, assert outcomes.

## Supporting the full integration surface

Behavioral view tests need more than DOM helpers. PCO bundles the surrounding harness:

| Concern | Where it lives |
|---------|----------------|
| Scoped queries & user actions | `ComponentTestObject` / view `*.to.*` |
| Scenario-focused payloads | `DataFactory` — strip fields irrelevant to the test ([project structure](./docs/project-structure.md)) |
| Render, router, storage | `BaseViewTestObject` — view-owned harness ([getting started — Level 3](./docs/getting-started.md#level-3--app-harness-msw-and-routing)) |
| HTTP mocks & request assertions | `ApiTestObject` + MSW — mock the response you expect, assert what was sent ([HTTP boundary](./docs/http-boundary.md), [matchers](./docs/matchers.md)) |

## Across the testing stack

That ecosystem is usually built first for **one runner** (Vitest or Jest). Then the same intents show up again — Storybook `play` functions, Cypress E2E — redefining queries and procedures for the same widgets even when files sit beside the component.

PCO **abstracts and widens** the Page Component Object pattern through adapters. **Today:** Vitest, Jest, and Storybook share MSW-backed view test objects; Cypress reuses DOM getters (chainables shipped in `0.1.2`). **Direction (`0.2.x`):** unified TestObject definitions across runners via the [resolver model](./docs/resolver-model.md) — so the same `__pco__` surface runs everywhere without parallel getter copies. Cross-runner reuse extends the central contract; it is not the reason to adopt scoped TestObjects in the first place.

## Vision

A booking-flow spec should read like the scenario — not like fixture assembly plus DOM chains. PCO keeps **Given / When / Then** in the test; query knowledge, mock wiring, and widget mechanics live in test objects you own.

Full walkthrough — verbose spec vs PCO, feature by feature: **[docs/vision.md](./docs/vision.md)**.

## Technical context

| Area | In this repo |
|------|----------------|
| Monorepo | pnpm workspaces, Turborepo, tsup builds across scoped packages |
| Library design | Adapter pattern — one TestObject surface, four test runners |
| Test layering | Query → primitive interaction → domain intent ([philosophy](./docs/philosophy.md)) |
| Selectors | Testing Library roles and accessible names; Cypress via `@testing-library/cypress` |
| HTTP boundary | MSW v2 registry — handlers shared between node tests and Storybook ([http-boundary](./docs/http-boundary.md)) |
| Test data | `DataFactory` — scenario-focused payloads, separate from `ApiTestObject` |
| Widget reuse | Composable presets (e.g. [`@page-component-object/preset-mui`](./packages/presets/mui)) in view test objects |
| API assertions | [`@semantic-matchers`](https://github.com/dvegap95/semantic-matchers) integration for Vitest/Jest spy matchers |

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
| [Getting started](./docs/getting-started.md) | Level 1 → 3 progressive onboarding — **start here after install** |
| [Vision](./docs/vision.md) | Booking-flow walkthrough — verbose spec vs PCO, design goals |
| [Install](./docs/install.md) | npm packages, peers, compatibility matrix |
| [Why PCO (deep dive)](./docs/why-pco.md) | Duplication diagram, layer model, when it pays off |
| [HTTP boundary](./docs/http-boundary.md) | MSW, `ApiTestObject`, request vs response testing |
| [Design principles](./docs/design-principles.md) | Runtime contracts, escape hatches |
| [Cross-runner tutorial](./docs/cross-runner-tutorial.md) | One view in Vitest, Storybook, Cypress |
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

## Related

- [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles)
- [semantic-matchers](https://github.com/dvegap95/semantic-matchers) — API spy matchers for Vitest/Jest
