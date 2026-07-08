# Page Component Object (`@pco/*`)

**Page Component Object toolkit** — a component-oriented take on the Page Object pattern. Centralize **queries**, **interactions**, and **user intents** in `TestObjects` (`*.to.ts` / `*.to.tsx`) so specs stay short and widget procedures live in one place. Also provides layers for **API mocks**, **data factories**, and test app wiring. Adapters let the same objects run in **Vitest**, **Jest**, **Storybook**, and **Cypress** — a practical bonus once your PCO layer exists, not the reason the project started.

> **Status:** `0.1.0` — **publish-ready** for **Vitest**, **Jest**, and **Storybook** (MSW-backed view tests). Install via `pnpm pack:dist` tarballs until `@pco` is on npm. **Cypress** getter reuse ships today; native chain integration (`PCOChainable`) is [ongoing](./PLAN.md#phase-3--cypress-pcochainable-ongoing).

## Why PCO?

PCO is a **Page Component Object** strategy: Page Object thinking applied to **components and views**, not only full pages. The goal is to stop tests from spending ten lines manipulating a date picker, a select, or a modal — you define **queries** (where things are), **interactions** (how to act on them), and **intents** (higher-level procedures your app cares about) once, then reuse and extend them.

| Layer | What you define | Example |
|-------|-----------------|---------|
| **Query** | Accessible locators | `get startDate()` → role/label query |
| **Interaction** | Primitive user actions | `await field.userType('2026-01-15')` |
| **Intent** | Widget- or flow-level procedure | `await datePicker.selectDate('2026-01-15')` |

Two date pickers on the same form? Two intent calls — not two copies of open-calendar-click-day-blur. When the selection procedure changes, you fix it in **one** preset or test object.

Design-system widgets get their own reusable objects (see [`@pco/preset-mui`](./packages/presets/mui)). View test objects compose them and add domain intents (`fillCheckout`, `openSettings`). Factories and API test objects keep **data** and **HTTP contracts** beside the UI layer under [`__pco__`](./docs/project-structure.md).

### Multi-runner reuse (collateral, not the origin story)

PCO was born for **centralized interaction tooling** in behavioral tests. Storybook and Cypress support address a second problem: even if you adopt a Page Object pattern in **each** runner, you still maintain **three parallel blocks** — the same queries, the same primitive interactions, the same intents — once for Vitest/Jest, again for Storybook `play`, again for Cypress. Different syntax, duplicated maintenance. Adapters let one `__pco__` surface drive every context that can import it, so you **deduplicate how you interact with the app**, not only standardize procedures inside a single runner.

| Concern | Per-runner PCO (3×) | Shared `__pco__` + adapters |
|--------|---------------------|-----------------------------|
| Widget intents | Copied across bh / Storybook / Cypress TOs | One intent; runner-specific execution only |
| DOM queries | Three getter sets | One getter definition |
| API boundary | Three MSW / mock setups | `setupMockData()` shared with Storybook; E2E uses real HTTP |
| Maintenance | Fix a date-picker flow in three places | Fix once in preset or view TO |

### Query libraries by runner

**Vitest, Jest, and Storybook** use [`@testing-library/dom`](https://testing-library.com/docs/dom-testing-library/intro) (and `@testing-library/react` where components mount). PCO getters delegate to RTL queries (`getByRole`, `getByLabelText`, …) and follow [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles) — roles and accessible names over `data-testid`.

**Cypress today** reuses the **same getter definitions** and the same RTL `within()` queries after `bindToRoot` — not a separate selector layer. That shares query *text* with node runners but **does not** use [`@testing-library/cypress`](https://testing-library.com/docs/cypress-testing-library/intro) (`cy.findBy*`, automatic retry). Specs must still wait for the UI (e.g. `cy.get('h1')`) before binding; chainable getters (`PCOChainable`) use Cypress commands for actions. See [docs/cypress.md](./docs/cypress.md).

**Planned (not shipped):** optional `@testing-library/cypress` integration or retry-aware query helpers so E2E getters align with RTL retry semantics without duplicating roles/names. Tracked under [PLAN.md — Phase 3](./PLAN.md#phase-3--cypress-pcochainable-spike-shipped).

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
| [`@pco/core`](./packages/core) | Types, `ObjectFactory`, `App` singleton, runtime injection |
| [`@pco/queries`](./packages/queries) | `ComponentTestObject` — RTL queries + user agent |
| [`@pco/msw`](./packages/msw) | MSW v2 API mock registry and session helpers |
| [`@pco/react`](./packages/react) | `BaseViewTestObject`, `BaseAppManager` |
| [`@pco/router-react`](./packages/router-react) | React Router v6/v7 test shell (`MemoryRouter`, `Routes`, `useNavigate`) |
| [`@pco/preset-mui`](./packages/presets/mui) | MUI widget test objects (Button, Select, Snackbar, TimePicker, TableRow, …) |
| [`@pco/adapter-vitest`](./packages/adapters/vitest) | Vitest lifecycle + user agent |
| [`@pco/adapter-jest`](./packages/adapters/jest) | Jest lifecycle + user agent |
| [`@pco/adapter-storybook`](./packages/adapters/storybook) | `createStoryPlay`, `storyParameters`, `pcoViewLoader`, MSW bridge |
| [`@pco/adapter-cypress`](./packages/adapters/cypress) | Cypress runtime, `CypressComponentTestObject`, `PCOChainable` |

## Demo apps (not published)

Fictitious catalog domain under [`apps/demo-shared`](./apps/demo-shared) — **no proprietary project references**.

| App | Runner | What it demonstrates |
|-----|--------|----------------------|
| [`apps/vitest-demo`](./apps/vitest-demo) | Vitest + MSW | Shallow view + full-app navigation |
| [`apps/jest-demo`](./apps/jest-demo) | Jest + MSW | Same behavioral specs as Vitest |
| [`apps/storybook-demo`](./apps/storybook-demo) | Storybook | MSW stories + MUI preset `play` demos |
| [`apps/cypress-demo`](./apps/cypress-demo) | Cypress E2E | TestObject getters bound to a live app |

## Documentation

| Doc | Topic |
|-----|-------|
| [Getting started](./docs/getting-started.md) | Adapters, TestObject hierarchy, first test |
| [Project structure](./docs/project-structure.md) | `__pco__` layout, factories vs API mocks |
| [Consumer install manifest](./docs/CONSUMER_INSTALL.md) | Tarballs + full peer dependency list |
| [Architecture & roadmap](./PLAN.md) | Vision, phases, `App` singleton, publish tiers |
| [MSW in tests vs Storybook](./docs/msw-storybook.md) | Shared handlers, `createMockSession`, story parameters |
| [Cypress integration](./docs/cypress.md) | `bindToRoot`, hybrid `cy` + getter patterns |
| [Philosophy](./docs/philosophy.md) | Behavioral tests, Testing Trophy, RTL alignment |

## Development

**Requirements:** Node 20+, pnpm 9+

```bash
pnpm install
pnpm build
pnpm test                    # Vitest + Jest demos (excludes slow Cypress E2E)
pnpm --filter @pco/cypress-demo test   # Cypress E2E
pnpm test:consumer-smoke   # tarball install smoke test (RR v7 fixture)
pnpm --filter @pco/storybook-demo storybook
```

Monorepo tooling: **pnpm workspaces**, **Turborepo**, **tsup** for package builds.

### Consumer install (tarballs)

Packages are not on npm yet. After cloning, build and pack tarballs for external monorepos:

```bash
pnpm install
pnpm pack:dist   # bumps 0.1.0-dev.N, writes dist/packs/manifest.json
```

Copy `dist/packs/` into your consumer repo, update `file:` paths from **`manifest.json`** (or run `node scripts/apply-pack-manifest.mjs`), then `yarn install`. Each repack gets a new `dev.N` suffix so Yarn lockfile checksums stay valid.

See [Consumer install manifest](./docs/CONSUMER_INSTALL.md) for the full peer list, checksum refresh workflow, and install examples.



## Roadmap

See [PLAN.md — Phases](./PLAN.md#phases) for the full plan:

- **Phase 0 (done):** Core packages, four adapters, MSW Storybook API, `__pco__` layout
- **Phase 1 (now):** npm publish for Vitest / Jest / Storybook at `0.1.0`
- **Phase 3 (ongoing):** Cypress `PCOChainable` — native chains + semantic PCO methods
- **Later:** [semantic-matchers](https://github.com/dvegap95/semantic-matchers), more UI presets

Interaction model (query → primitive → intent): [docs/philosophy.md](./docs/philosophy.md).

## Related

- [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles)
- [semantic-matchers](https://github.com/dvegap95/semantic-matchers) — planned matcher integration for API assertions
