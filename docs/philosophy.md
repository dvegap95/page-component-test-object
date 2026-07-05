# Testing philosophy

PCO is a **structure layer** for behavioral UI tests. It does not change what you should test — only where you put the selectors and flows.

## Behavioral over implementation

Specs named `*.bh.test.*` (behavioral) should assert **observable outcomes**:

- What the user sees (headings, links, error messages)
- What the user can do (click, type, navigate)
- Side effects that matter to the user (loading states, empty states)

Avoid asserting on component state, private hooks, or implementation-specific class names unless they are part of the public UX contract.

## Testing Trophy alignment

PCO targets the **integration / behavioral** band of the [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications):

- **Unit tests** for pure logic (factories, reducers, formatters) stay outside PCO view objects.
- **Behavioral view tests** (Vitest/Jest + MSW) exercise a view or small app shell with real DOM and mocked network.
- **Storybook `play`** validates isolated UI states and interactions in the design system context.
- **Cypress E2E** validates the same getters against a running build — no MSW, real browser navigation.

Use the cheapest runner that still gives confidence for the risk you care about.

## Testing Library first

TestObjects expose **getters** that delegate to Testing Library queries (`getByRole`, `getByLabelText`, …). Prefer roles and accessible names over `data-testid`.

The shared `UserAgent` (`userClick`, `userType`, …) wraps `@testing-library/user-event` in node runners and can be bridged to Cypress for hybrid flows.

## One TestObject per view (usually)

A view test object maps to a **screen or meaningful UI region**, not every leaf component. Nested widgets can use smaller `ComponentTestObject` subclasses (see `@pco/preset-mui`).

For multi-step flows across routes, use **separate view test objects** per route and `view.getHistory()` when you need the current path.

## PCO file layout

Colocate test objects, API mocks, and factories under **`__pco__`** (not `__tests__`) so Storybook stories can import them without crossing test boundaries. Keep **factories** (`*.factory.ts`) independent of **API test objects** (`*Api.to.ts`). See [project-structure.md](./project-structure.md).

## MSW as boundary

HTTP mocks define the **API contract** your UI depends on. Register handlers in `setupMockData()` and assert spies on `view.mocks.*` — not fetch implementation details.

Storybook reuses the same handler definitions via `createMockSession()`; see [msw-storybook.md](./msw-storybook.md).

## Cypress is different on purpose

E2E tests do not run MSW. Reuse **getters** from story-oriented test objects; drive clicks through Cypress when `UserAgent` and the command queue do not mix cleanly. See [cypress.md](./cypress.md).

## When not to use PCO

- One-off smoke tests with a single assertion
- Non-React surfaces (use `ComponentTestObject` patterns as inspiration only)
- Tests that only need a single `render` + `screen` call with no reuse across runners

If you only ever run Vitest, a thin custom hook around RTL may be enough. PCO pays off when **the same view** is tested in multiple environments.
