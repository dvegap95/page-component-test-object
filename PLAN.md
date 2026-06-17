# Page Component Object (PCO) — Architecture Plan

> **Status:** In progress  
> **Goal:** Environment-agnostic Page Component Object toolkit for Vitest, Jest, Storybook, and Cypress.

---

## 1. Problem

Teams with **views + behavioral tests + Storybook** duplicate DOM access patterns across runners. PCO centralizes **TestObjects** (`*.to.ts` / `*.to.tsx`) so one `HomeViewTestObject` can drive Vitest, Storybook `play`, and Cypress getters.

### Naming

| Term | Meaning |
|------|---------|
| `TestObject` / `*.to.*` | Umbrella for mocks, APIs, factories, and DOM wrappers |
| `ComponentTestObject` | **DOM-only** base (queries + user agent) |
| `BaseViewTestObject` | View under app context via `App.get()` |

---

## 2. Monorepo layout

```
packages/
  core/           @pco/core
  queries/        @pco/queries
  msw/            @pco/msw
  react/          @pco/react
  router-react/   @pco/router-react
  presets/        mui (future: more @pco/preset-*)
  adapters/       vitest | jest | storybook | cypress (future)
apps/             demo-shared, vitest-demo, jest-demo, storybook-demo (not published)
```

Tooling: **pnpm + Turborepo + tsup**.

---

## 3. Core design

### App singleton (`App.get()`)

One `AppManager` per test, registered when the app's manager is constructed. ViewTestObjects do **not** own the manager. After navigation, a new ViewTestObject queries `screen` — no binding step.

```ts
await App.renderApp(<CatalogApp />, { initialRoute: '/' });

const list = new ItemListViewTestObject();
await list.itemLinks[0].userClick();

const detail = new ItemDetailViewTestObject();
expect(detail.heading).toBeTruthy();
```

### Two render modes

| Mode | API | Use |
|------|-----|-----|
| **Shallow** (default) | `App.renderView(<View />, { route, routePath })` | Single-view tests inside router shell |
| **Full app** | `App.renderApp(<App />, { initialRoute })` | Multi-view navigation flows |

### `setupMockData()` + `mocks`

Handler spies are captured at setup — tests assert via `view.mocks.getItems` without re-registering handlers.

`MswViewTestObject` + `createMockSession()` export the same handlers for Storybook `parameters.msw` (see [docs/msw-storybook.md](./docs/msw-storybook.md)).

### Cypress

No MSW. Reuse getters and `UserAgent` against a real running app.

### Matchers (future)

Interim API matchers in `@pco/msw/matchers`; migrate to [semantic-matchers](https://github.com/dvegap95/semantic-matchers).

---

## 4. Consumer apps & test runners

**In-monorepo `apps/` only** — fictitious domain, no proprietary references.

| App | Runner |
|-----|--------|
| `apps/vitest-demo` | Vitest + MSW behavioral tests |
| `apps/jest-demo` | Jest adapter smoke tests |
| `apps/storybook-demo` | Storybook + `createStoryPlay` |

**One runner per package** — never Jest and Vitest in the same workspace package.

---

## 5. Checklist

- [x] Bootstrap `@pco/core`, `@pco/queries`, `@pco/msw`, `@pco/react`
- [x] Adapters: vitest, jest
- [x] Demo apps: vitest-demo, jest-demo, demo-shared
- [x] `@pco/router-react`
- [x] `@pco/adapter-storybook` + storybook-demo
- [ ] `@pco/adapter-cypress` + cypress-demo
- [x] `@pco/preset-mui`
- [ ] Claim `@pco` on npm before publish

---

## 6. Philosophy (summary)

Behavioral `.bh.test.*` specs target **observable user behavior**, not implementation details — aligned with the [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) and [RTL guiding principles](https://testing-library.com/docs/guiding-principles). PCO is a structured Page Object layer on top of Testing Library, not a replacement.
