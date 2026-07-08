# Page Component Object (PCO) — Architecture & Roadmap

> **Release:** `0.1.0` — **publish-ready** for Vitest, Jest, and Storybook (MSW-backed view tests).  
> **Cypress:** getters and `UserAgent` bridging ship in `0.1.0`; **native Cypress chain integration** (`PCOChainable`) is ongoing — see [Phase 3](#phase-3--cypress-pcochainable-ongoing).

---

## Vision

PCO is a **cross-runner UI interaction model**, not just a prettier Testing Library wrapper. Teams define **TestObjects** (`*.to.ts` / `*.to.tsx`) once; the same getters and primitive interactions drive Vitest, Jest, Storybook, and (with documented caveats) Cypress.

Three layers — only the first two belong in `@pco/*`; the third belongs in consumer `__pco__` code:

| Layer | Example | Owner |
|-------|---------|-------|
| **Query** | `view.email` — RTL `getByRole`, etc. | Framework (`ComponentTestObject` getters) |
| **Primitive interaction** | `await view.email.userType('x')`, `await view.submit.userClick()` | Framework (adapter-backed, element-centric) |
| **Intent** | `await view.loginForm.fill(credentials)` | **Consumer PCOs** (domain workflows) |

See [docs/philosophy.md](./docs/philosophy.md) for the decision guide (“does this method belong in the library?”).

---

## Design principles

- **Testing Library first** — roles and accessible names over `data-testid`.
- **Framework provides primitives; user PCOs own intents** — no `fillLogin` in `@pco/react`.
- **MSW for HTTP boundary** in Vitest, Jest, and Storybook only — not in Cypress E2E.
- **Element-centric interactions** — `await view.button.userClick()`, not `await user.click(view.button)`; singleton `UserAgent` behind the scenes.
- **Cypress: Testing Library queries + native chains** — `@testing-library/cypress` (`cy.findBy*`) for getters; `PCOChainable` adds semantic `userType()` / `userClick()` without overriding Cypress `.type()` / `.click()`.
- **Jest/Vitest: await-based** — same intent method names as Cypress; execution model may differ.

### Non-goals (v1)

- Playwright adapter in the same chain model as Cypress
- Multi-user simulation in one test
- Overriding Cypress native `.type()` / `.click()`
- Domain workflows shipped inside `@pco/*`

---

## Package maturity (`0.1.0`)

| Runner / surface | Status in `0.1.0` | Notes |
|------------------|-------------------|-------|
| **Vitest** + MSW | **Stable** | Primary demo path; `installPCOLifecycle` |
| **Jest** + MSW | **Stable** | Parity with Vitest demos |
| **Storybook** + MSW addon | **Stable** | `storyParameters`, `mockSession`, `pcoViewLoader` |
| **Cypress** E2E | **Experimental** | `@testing-library/cypress` queries + `PCOChainable`; legacy `ComponentTestObject` + `cy.wrap` still supported |
| **`@pco/preset-mui`** | **Stable** | Storybook `play` demos |
| **npm registry** | **Pending** | Tarballs via `pnpm pack:dist` until `@pco` scope is claimed |

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
  core/           @pco/core
  queries/        @pco/queries
  msw/            @pco/msw
  react/          @pco/react
  router-react/   @pco/router-react
  presets/        mui (future: more @pco/preset-*)
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

Handler spies captured at setup. Storybook reuses handlers via `BaseViewTestObject.storyParameters()` / `mockSession()` (see [docs/msw-storybook.md](./docs/msw-storybook.md)).

### Consumer layout

Colocate PCO artifacts under **`__pco__`** per feature. See [docs/project-structure.md](./docs/project-structure.md).

---

## Phases {#phases}

### Phase 0 — Foundation (complete)

- [x] Core packages: `@pco/core`, `@pco/queries`, `@pco/msw`, `@pco/react`, `@pco/router-react`
- [x] Adapters: Vitest, Jest, Storybook, Cypress
- [x] `@pco/preset-mui` + demo apps
- [x] Pack pipeline (`pnpm pack:dist`) + [CONSUMER_INSTALL](./docs/CONSUMER_INSTALL.md)
- [x] Consumer smoke (`fixtures/rr7-consumer`)
- [x] MSW Storybook ergonomics (`storyParameters`, `pcoViewLoader`; collapsed `BaseViewTestObject` hierarchy)
- [x] RR v6/v7 (`Routes`, `useNavigate`)
- [x] `__pco__` project-structure guide
- [x] Roadmap + interaction model documentation (this file)

### Phase 1 — Publish to npm (in progress)

**Goal:** External apps install `@pco/*` from npm for Vitest, Jest, and Storybook.

- [x] Align package versions to `0.1.0` (`pnpm version:sync`)
- [x] Document publish tiers and Cypress experimental status
- [x] Package-level unit tests (`@pco/msw`, `@pco/adapter-vitest`)
- [x] CI workflow (test + consumer smoke)
- [x] Publish workflow + [PUBLISH.md](./docs/PUBLISH.md)
- [ ] Claim `@pco` npm org (manual — see PUBLISH.md)

**Done when:** `pnpm add @pco/react @pco/adapter-vitest @pco/adapter-storybook` works from npm; CONSUMER_INSTALL documents both npm and tarball paths.

### Phase 2 — Interaction model clarity (complete in docs)

**Goal:** Contributors know where framework ends and consumer PCOs begin.

- [x] Three-layer model in [philosophy.md](./docs/philosophy.md)
- [x] Primitive vs intent in [getting-started.md](./docs/getting-started.md)

**Done when:** “Does `fillLogin` belong in the library?” → **No** (documented).

### Phase 3 — Cypress PCOChainable (spike shipped)

**Goal:** Cypress-native chains **and** PCO semantic methods on the same locator object.

**Shipped (`0.1.0` spike — Option B):**

- `CypressComponentTestObject` + `PCOChainable` in `@pco/adapter-cypress`
- Queries: [`@testing-library/cypress`](https://testing-library.com/docs/cypress-testing-library/intro) (`findByRole`, `findAllByRoleAt`, …) — retry-aware, same RTL query vocabulary
- Native: `.type()`, `.click()`, `.should()` — Cypress pass-through on chainable getters
- Semantic: `.userType()`, `.userClick()`, `.userClear()` — PCO extensions
- Demo: `CatalogHomeCypressTestObject` + specs in `apps/cypress-demo`

**Remaining:**

- [x] Richer semantic primitives (`selectOptionByText`) on `PCOChainable`
- [x] More `findBy*` helpers on `CypressComponentTestObject` (`findByAltText`, `findByTitle`, `findByDisplayValue`, indexed variants)
- [x] Broader demo coverage (native + semantic select flows)
- [ ] Revisit unified class (Option A) after consumer feedback

**Done when:** Cypress demo shows native + semantic side-by-side without `cy.wrap` for common flows. *(Spike met — polish ongoing.)*

### Phase 4 — semantic-matchers

Replace interim `@pco/msw/matchers` with [semantic-matchers](https://github.com/dvegap95/semantic-matchers) for API spy assertions.

### Phase 5 — Ecosystem expansion

- Additional UI presets (`@pco/preset-*`)
- Storybook demo parity (`HomeViewTestObject.storyParameters` stories)
- `waitForIdle` / `registerTriggeredRestHandler` demos
- Playwright adapter (evaluate after Cypress PCOChainable stabilizes)

---

## Philosophy

Behavioral testing guidelines, Testing Trophy alignment, and when to use PCO vs plain RTL: [docs/philosophy.md](./docs/philosophy.md).

## Related

- [ChatGPT architectural discussion](https://chatgpt.com/share/6a4a22b5-02e4-83eb-a287-c9e7478ccb21) — interaction model north star (summarized above, not pasted in full)
