# Testing philosophy

PCO is a **structure layer for behavioral integration tests**. It centralizes scoped queries and user interactions in TestObjects so specs assert observable outcomes — not inline DOM chains. Runners consume the same surface through adapters when you extend to Storybook or Cypress.

## Query, primitive, intent

PCO separates three concerns. Only the first two belong in `@page-component-object/*`; **intents** belong in your `__pco__` test objects.

| Layer | Example | Owner |
|-------|---------|-------|
| **Query** | `view.email` | Framework — getters delegate to Testing Library |
| **Primitive** | `await view.email.userType('a@b.com')` | Framework — `userClick`, `userType`, … on `ComponentTestObject` |
| **Intent** | `await view.fillLogin(email, password)` | **Your PCO** — composes primitives into domain flows |

```ts
// @page-component-object/queries — primitive (framework)
await this.email.userType('a@b.com');
await this.submit.userClick();

// LoginView.to.tsx — intent (consumer)
async fillLogin(email: string, password: string) {
  await this.email.userType(email);
  await this.password.userType(password);
  await this.submit.userClick();
}
```

### When to add a method to the library vs your `*.to.*`

| Question | Add to `@page-component-object/*` | Add to consumer `*.to.*` |
|----------|-----------------|---------------------------|
| Is it a DOM query (role, label, text)? | Yes — getter on `ComponentTestObject` | Rarely — only if app-specific scoping |
| Is it a generic interaction (click, type, hover)? | Yes — primitive on `ComponentTestObject` | No |
| Does it encode a business workflow (login, checkout, tab switch)? | **No** | **Yes** — intent method |
| Is it MUI/Radix widget-specific? | Yes — `@page-component-object/preset-*` | No |

If you are unsure, default to **consumer intent**. The framework should stay runner- and domain-agnostic.

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

Primitive interactions (`userClick`, `userType`, …) are available on PCO targets and via the shared `UserAgent` (`getUser()`). Examples often use `target.userClick()`; both styles are supported. See [authoring-philosophy.md](./authoring-philosophy.md).

## One TestObject per view (usually)

A view test object maps to a **screen or meaningful UI region**, not every leaf component. Nested widgets can use smaller `ComponentTestObject` subclasses (see `@page-component-object/preset-mui`).

For multi-step flows across routes, use **separate view test objects** per route and `view.getHistory()` when you need the current path.

## PCO file layout

Colocate test objects, API mocks, and factories under **`__pco__`** (not `__tests__`) so Storybook stories can import them without crossing test boundaries. Keep **factories** (`*.factory.ts`) independent of **API test objects** (`*Api.to.ts`). See [project-structure.md](./project-structure.md).

## MSW as boundary

HTTP mocks define the **API contract** your UI depends on. Register handlers in `setupMockData()` via `*Api.to.ts` and assert spies on `view.mocks.*` — not fetch implementation details.

PCO favors MSW at the network edge over blind round-trip tests, but supports asserting outbound requests when the **product of the interaction** is the request itself. See [http-boundary.md](./http-boundary.md).

Storybook reuses the same handler definitions via `storyParameters()` / `mockSession()`; see [msw-storybook.md](./msw-storybook.md).

## Cypress is different on purpose

E2E tests do not run MSW. Reuse **getters** from DOM-only test objects. Prefer `CypressComponentTestObject` + `PCOChainable` for retry-aware queries and semantic actions; legacy `ComponentTestObject` + `cy.wrap` still works. See [cypress.md](./cypress.md).

## When not to use PCO

- One-off smoke tests with a single assertion
- Non-React surfaces (use `ComponentTestObject` patterns as inspiration only)
- Tests that only need a single `render` + `screen` call with no reuse across runners

If you only ever run Vitest, a thin custom hook around RTL may be enough. PCO pays off when **the same view** is tested in multiple environments.
