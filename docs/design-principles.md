# Design principles

These principles govern how `@page-component-object/*` packages behave. They complement [philosophy.md](./philosophy.md), which explains the **layer model** (query → primitive → intent). This page covers **runtime contracts** and architectural boundaries.

## Accessibility-first queries

Test objects expose **getters** that delegate to Testing Library queries — roles and accessible names first, `data-testid` only when necessary. This keeps tests aligned with how assistive technology perceives the UI.

## Framework owns primitives; consumers own intents

| Layer | Package owner |
|-------|---------------|
| Queries + `userClick` / `userType` | `@page-component-object/queries` |
| MUI/Radix widget flows | `@page-component-object/preset-*` |
| Business workflows (`fillCheckout`, `openSettings`) | **Your** `*.to.*` classes |

Never ship domain workflows inside framework packages. See [philosophy.md](./philosophy.md#when-to-add-a-method-to-the-library-vs-your-to).

## Composition over deep inheritance

Prefer **small, composable** test objects:

- View TOs compose widget presets (`MuiSelectTestObject`, `MuiDialogTestObject`).
- Child scopes use `rootResolver` or `child(TO, resolver)` — not deep `extends` trees.
- API mocks (`*Api.to.ts`) and data factories (`*.factory.ts`) stay separate from view TOs.

MSW is **composed** via `setupMockData()` on `BaseViewTestObject` — there is no `MswViewTestObject` base class.

## Native runner APIs preserved

PCO unifies **query definitions** and **semantic primitives** — not assertions, render lifecycle, or transport:

| Portable | Runner-native |
|----------|---------------|
| Getter definitions, intent methods | `expect()` vs `cy.should()` |
| MSW handler **definitions** (node + Storybook) | MSW in Cypress E2E |
| `userClick` / `userType` semantics | Cypress command queue ordering |
| `rootResolver` / `context` | `render()` vs `cy.visit` |

Cypress specs keep `.should()`, `.click()`, and `@testing-library/cypress` retry chains. Node specs keep `await` and `expect`. See [portability.md](./portability.md).

## Element-centric interactions

Prefer `await target.userClick()` over `await user.click(target)`. A shared `UserAgent` singleton implements primitives per runner (`user-event` in node; Cypress bridge in E2E).

Intent methods on your TOs compose primitives — they do not call `userEvent` directly.

## MSW for HTTP boundary (node + Storybook only)

Vitest, Jest, and Storybook share MSW handler definitions through `setupMockData()` and `storyParameters()`. Cypress E2E runs against a real app — reuse **DOM getters**, not MSW setup. See [msw-storybook.md](./msw-storybook.md).

## Sync resolvers, lazy scope

Test objects resolve DOM scope through **sync `rootResolver` functions** — not stored `HTMLElement` references. Cypress deferral lives inside the chain returned by the resolver; RTL re-resolution happens on each interaction.

See [resolver-model.md](./resolver-model.md) for the full contract.

## App singleton with explicit reset

`App.get()` provides a global app shell for view tests. Adapters call `App.reset()` in `afterEach` — tests must not assume cross-test isolation without the adapter lifecycle. See [getting-started.md](./getting-started.md#app-runtime-contract).

## Adapter stability contract (Jest / Vitest / Storybook)

Changes to the resolver model must preserve existing node-runner behavior behind the RTL adapter until demos and consumer-smoke CI pass. Cypress enhancements are additive — no deprecation of the chainable path.

## Non-goals (v1 / 0.2.x)

- Shipping domain workflows in `@page-component-object/*`
- Overriding Cypress native `.type()` / `.click()`
- Multi-user simulation in one test
- Forcing one assertion style across runners
- `native()` escape hatches on shared targets — use partitioned types instead (`PCOTargetBase` vs Cypress `PCOChainable`)

Longer-term evaluation (not blocking adoption):

- Playwright adapter (research spike; both E2E paths stay open)
- `children()` collection helpers
- `App` AsyncLocalStorage for in-file parallelism

Maintainer roadmap: [`.github/PLAN.md`](../.github/PLAN.md).

## Related

- [When not to use PCO](./when-not-to-use.md)
- [Why PCO](./why-pco.md)
- [Resolver model](./resolver-model.md)
