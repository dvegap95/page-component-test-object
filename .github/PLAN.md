# Page Component Object (PCO) — Architecture & Roadmap

> **Maintainer doc** — not part of the public user guides. User-facing docs live in [README](../README.md) and [docs/](../docs/).

> **Release:** `0.1.2` — published on npm as `@page-component-object/*`.  
> **Cypress:** experimental — `@testing-library/cypress` queries + `PCOChainable` spike shipped; polish ongoing.

---

## Vision

PCO is a **cross-runner UI interaction model**, not just a prettier Testing Library wrapper. Teams define **TestObjects** (`*.to.ts` / `*.to.tsx`) once; the same getters and primitive interactions drive Vitest, Jest, Storybook, and (with documented caveats) Cypress.

Three layers — only the first two belong in `@page-component-object/*`; the third belongs in consumer `__pco__` code:

| Layer | Example | Owner |
|-------|---------|-------|
| **Query** | `view.email` — RTL `getByRole`, etc. | Framework (`ComponentTestObject` getters) |
| **Primitive interaction** | `await view.email.userType('x')`, `await view.submit.userClick()` | Framework (adapter-backed, element-centric) |
| **Intent** | `await view.loginForm.fill(credentials)` | **Consumer PCOs** (domain workflows) |

See [docs/philosophy.md](../docs/philosophy.md) for the decision guide (“does this method belong in the library?”).

---

## Design principles

- **Testing Library first** — roles and accessible names over `data-testid`.
- **Framework provides primitives; user PCOs own intents** — no `fillLogin` in `@page-component-object/react`.
- **MSW for HTTP boundary** in Vitest, Jest, and Storybook only — not in Cypress E2E.
- **Element-centric interactions** — `await view.button.userClick()`, not `await user.click(view.button)`; singleton `UserAgent` behind the scenes.
- **Cypress: Testing Library queries + native chains** — `@testing-library/cypress` (`cy.findBy*`) for getters; `PCOChainable` adds semantic `userType()` / `userClick()` without overriding Cypress `.type()` / `.click()`.
- **Jest/Vitest: await-based** — same intent method names as Cypress; execution model may differ.

### Non-goals (v1)

- Playwright adapter in the same chain model as Cypress
- Multi-user simulation in one test
- Overriding Cypress native `.type()` / `.click()`
- Domain workflows shipped inside `@page-component-object/*`

---

## Package maturity (`0.1.2`)

| Runner / surface | Status | Notes |
|------------------|--------|-------|
| **Vitest** + MSW | **Stable** | Primary demo path; `installPCOLifecycle` |
| **Jest** + MSW | **Stable** | Parity with Vitest demos |
| **Storybook** + MSW addon | **Stable** | `storyParameters`, `mockSession`, `pcoViewLoader` |
| **Cypress** E2E | **Experimental** | `@testing-library/cypress` queries + `PCOChainable`; legacy `ComponentTestObject` + `cy.wrap` still supported |
| **`@page-component-object/preset-mui`** | **Stable** | Storybook `play` demos |
| **npm** | **Published** | Scope `@page-component-object`; landing package `@page-component-object/page` |

---

## Architecture reference

### Naming

| Term | Meaning |
|------|---------|
| `TestObject` / `*.to.*` | Umbrella for mocks, APIs, factories, and DOM wrappers |
| `ComponentTestObject` | **DOM-only** base (queries + primitive interactions) |
| `BaseViewTestObject` | View under `App.get()` with `setupMockData()` for HTTP API mocks |

### Monorepo layout

```
packages/
  page/           @page-component-object/page (npm org landing)
  core/           @page-component-object/core
  queries/        @page-component-object/queries
  msw/            @page-component-object/msw
  react/          @page-component-object/react
  router-react/   @page-component-object/router-react
  presets/        mui (future: more @page-component-object/preset-*)
  adapters/       vitest | jest | storybook | cypress
apps/             demo-shared, vitest-demo, jest-demo, storybook-demo, cypress-demo (not published)
```

Tooling: **pnpm + Turborepo + tsup**. Version: **`scripts/release-version.json`** → `pnpm version:sync`.

### App singleton (`App.get()`)

One `AppManager` per test, registered via `configureViewTestObjects({ createAppManager })`. After navigation, a new ViewTestObject queries `screen` — no binding step.

### Two render modes

| Mode | API | Use |
|------|-----|-----|
| **Shallow** | `app.renderView(<View />, { route, routePath })` | Single-view tests inside router shell |
| **Full app** | `app.renderApp(<AppRoutes />, { initialRoute })` | Multi-view navigation — mount **route subtree**, not prod `BrowserRouter` shell |

### `setupMockData()` + `mocks`

Handler spies captured at setup. Storybook reuses handlers via `BaseViewTestObject.storyParameters()` / `mockSession()` (see [docs/msw-storybook.md](../docs/msw-storybook.md)).

### Consumer layout

Colocate PCO artifacts under **`__pco__`** per feature. See [docs/project-structure.md](../docs/project-structure.md).

---

## Phases {#phases}

### Phase 0 — Foundation (complete)

- [x] Core packages, adapters, preset-mui, demo apps
- [x] Pack pipeline (`pnpm pack:dist`) for consumer-smoke CI
- [x] MSW Storybook ergonomics, RR v6/v7, `__pco__` guide

### Phase 1 — Publish to npm (complete)

- [x] `@page-component-object/*` on npm; [install guide](../docs/install.md) for consumers
- [x] CI + publish workflow — see [PUBLISH.md](./PUBLISH.md)
- [x] `@page-component-object/page` landing package for npm org

### Phase 2 — Interaction model clarity (complete)

- [x] Three-layer model in [philosophy.md](../docs/philosophy.md)

### Phase 3 — Cypress PCOChainable (spike shipped, polish ongoing)

- [x] `CypressComponentTestObject` + `PCOChainable`
- [x] `selectOptionByText`, expanded `findBy*` helpers, demo coverage
- [ ] Revisit unified class (Option A) after consumer feedback

### Phase 4 — semantic-matchers (node runners shipped)

- [x] Vitest/Jest API matchers via `@page-component-object/msw/matchers`
- [ ] Cypress chainable matchers on `PCOChainable`

### Phase 5 — Ecosystem expansion

- Additional UI presets (`@page-component-object/preset-*`)
- Playwright adapter (evaluate after Cypress stabilizes)

---

## Philosophy

User-facing guidelines: [docs/philosophy.md](../docs/philosophy.md).
