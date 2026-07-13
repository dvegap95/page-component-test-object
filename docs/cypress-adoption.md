# Cypress adoption

Cypress support in PCO is **two separate concerns**:

1. **Chainable execution (shipped in 0.1.2)** — `PCOChainable`, `@testing-library/cypress`, semantic `userClick()` / `userType()`.
2. **Unified test object definitions (0.2.x)** — one `*.to.ts` class across Storybook, Vitest, and Cypress via the resolver model.

This page documents both — honestly — without deprecating Cypress in favor of Playwright.

## Status matrix

| Capability | Status | Notes |
|------------|--------|-------|
| `PCOChainable` + `findBy*` | **Shipped** 0.1.2 | [cypress-demo](../apps/cypress-demo) |
| `CypressComponentTestObject` base | **Shipped** Option B | Separate class from `ComponentTestObject` |
| Unified TO class (Option A) | **0.2.x** | Resolver model — [resolver-model.md](./resolver-model.md) |
| MUI presets on chainable path | **Planned** 0.2.x | Presets today use sync RTL `ComponentTestObject` |
| Cypress semantic matchers | **Planned** | Vitest/Jest matchers exist — [matchers.md](./matchers.md) |
| Playwright adapter | **Research spike** | Comparative; no Cypress deprecation |

## Resolver-first encapsulation

Lead with `this.context` and `this.rootResolver` in Cypress specs. Do **not** require `this.root` in E2E — materializing a node breaks the retry chain.

```ts
// GOOD — chain as resolver
const view = new CatalogHomeTestObject();
view.bindResolver(() => cy.get('body'));

// GOOD — chainable getter
get heading() {
  return this.context.findByRole('heading', { name: /items/i });
}
view.heading.should('contain.text', 'Items');

// BAD — captured element
cy.get('.sidebar').then(($el) => view.bindResolver(() => cy.wrap($el[0])));
```

See [resolver-model.md](./resolver-model.md#anti-patterns).

## getBy vs findBy in Cypress

| Style | When to use | Behavior |
|-------|-------------|----------|
| `findBy*` | **Default for E2E getters** | Enqueues `cy.findBy*` — retries until pass/timeout |
| `getBy*` | Rare — sync snapshot | No implicit retry; may flake after navigation |
| `queryBy*` | Optional presence checks | Returns null or chain variant |

Sync RTL `getByRole` inside a shared getter **does not retry** in Cypress. That is why 0.1.2 ships a separate `CatalogHomeCypressTestObject` with `findByRole` — not because Cypress cannot chain queries.

## PCOChainable philosophy

Augment Cypress — do not fight it:

- Semantic actions: `userClick()`, `userType()`, `selectOptionByText()`
- Native escape hatches: `.should()`, `.click()`, `.type()` stay on the chain
- No override of Cypress native `.type()` / `.click()`

```ts
bindCypressView().then((view) => {
  view.firstItemLink.should('be.visible');
  view.firstItemLink.userClick(); // semantic — stays in command queue
});
```

## Legacy hybrid (discouraged)

`ComponentTestObject` + `bindToRoot` + `cy.wrap(syncElement)` still works for quick experiments but is **fragile**:

- No retry on sync `getBy*` getters
- Detached DOM if element captured in `.then()`

Prefer `CypressComponentTestObject` or unified resolver model for new specs.

## Command queue vs Promise

Cypress actions must return `Chainable` — not bare `Promise`:

```ts
// BAD — Promise not awaited by Cypress queue
view.firstItemLink.userClick(); // if this returned Promise<void> only
cy.url().should('include', '/items/1'); // may run before click

// GOOD — PCOChainable extends Chainable
view.firstItemLink.userClick(); // enqueued
cy.url().should('include', '/items/1');
```

Avoid `await` inside `.then()` for Cypress actions unless you fully control ordering.

## MSW in Cypress

PCO does **not** run MSW in Cypress E2E. Reuse **DOM getters** from MSW-free test objects against a live app. API state comes from the real server or your own network stubs outside PCO.

## Playwright comparison (research)

Both E2E paths stay open. Playwright’s `Locator` model aligns with `await` used in Vitest/Jest — potentially less adapter friction for unified targets. Cypress expertise and shipped `PCOChainable` work remain valuable.

| Factor | Cypress | Playwright |
|--------|---------|------------|
| Execution | Command queue + chainables | `async`/`await` + `Locator` |
| Shipped PCO code | `adapter-cypress`, demo E2E | Research spike only |
| Encapsulation | Subject chaining + TL quirks | `locator(root).getByRole` |
| Deprecation | **None planned** | Additive research |

See `packages/adapters/playwright/README.md` for spike notes.

## Setup

```ts
// cypress/support/e2e.ts
import '@testing-library/cypress/add-commands';
import { setupPCOCypress } from '@page-component-object/adapter-cypress';

setupPCOCypress();
```

Install peers: `cypress` ^13–^15, `@testing-library/cypress` ^10. See [install.md](./install.md).

## Related

- [cypress.md](./cypress.md) — setup and `bindToRoot` patterns (0.1.x)
- [Cross-runner tutorial](./cross-runner-tutorial.md)
- [Portability](./portability.md)
