# Cypress integration

Cypress runs against a **real app** with **no MSW**. PCO’s role is to **reuse TestObject getters** and optional `UserAgent` bridging — not to duplicate Cypress’s strengths (network, screenshots, real navigation).

> **Stability (`0.1.2`):** `PCOChainable`, `findBy*`, and DOM getter reuse are **shipped**. Unified cross-runner TestObject definitions are **`0.2.x`** — see [cypress-adoption.md](./cypress-adoption.md).

> **Important:** Cypress never uses the node MSW server or `BaseViewTestObject` constructors. Share **DOM getters** from `ComponentTestObject` subclasses; keep API mock setup in Vitest/Storybook only.

## Install

```bash
pnpm add @page-component-object/core @page-component-object/queries @page-component-object/adapter-cypress
```

Peer dependencies: `cypress` ^13–^15, `@testing-library/cypress` ^10. Full list: [install.md](./install.md).

## Setup

In support or spec entry:

```ts
import { setupPCOCypress } from '@page-component-object/adapter-cypress';

setupPCOCypress({ resetUserAgentEachTest: false });
```

Enable Cypress Testing Library commands (needed for `cy.findBy*` used by PCO getters):

```ts
import '@testing-library/cypress/add-commands';

import { setupPCOCypress } from '@page-component-object/adapter-cypress';

setupPCOCypress();
```

Register the adapter in the **same bundle** as your spec (webpack may duplicate modules; support-file-only setup is not always enough).

After `cy.visit`, call `bindToRoot` on the AUT document — same pattern as [getting started](./getting-started.md#3-dom-only-test-object-storybook--cypress).

## Binding to the application under test

RTL’s `screen` targets the wrong document in Cypress. After `cy.visit`, bind to the AUT:

```ts
function bindView() {
  return cy.document().then((doc) => {
    const view = new CatalogHomeStoryTestObject();
    view.bindToRoot(doc.body);
    return view;
  });
}
```

Use **MSW-free** test objects and import paths that do not pull node MSW into the browser bundle.

## Which test objects to import

| Approach | Recommended? | Notes |
|----------|--------------|-------|
| `CypressComponentTestObject` + chainable getters | **Yes (E2E)** | Native `.should()` + semantic `userClick()` — see below |
| Import getters from `ComponentTestObject` only | **Yes** | Storybook / legacy `cy.wrap` hybrid |
| Import `BaseViewTestObject` subclasses | **No** | Pulls `@page-component-object/msw` node server into the browser bundle |
| Separate `*.story.to.tsx` export for Cypress/Storybook | Optional | When view TO mixes MSW + JSX in one class |

There is no separate “Cypress export” path — reuse the **DOM-only** test object class (or a thin subclass without MSW) from your `*.to.tsx` files.

## PCOChainable (`CypressComponentTestObject`)

**Option B (current):** use a separate Cypress base class so node runners keep `HTMLElement` getters.

```ts
import { CypressComponentTestObject } from '@page-component-object/adapter-cypress';

export class CatalogHomeCypressTestObject extends CypressComponentTestObject {
  get heading() {
    return this.findByRole('heading', { name: /items/i });
  }

  get firstItemLink() {
    return this.findAllByRoleAt('link', 0);
  }

  get demoSelect() {
    return this.findByLabelText(/demo select/i);
  }

  get selectedStatus() {
    return this.findByRole('status');
  }
}
```

After `bindToRoot`:

```ts
// Native Cypress on chainable getters
view.heading.should('contain.text', 'Items');

// PCO semantic (awaitable)
view.firstItemLink.userClick();

// PCO semantic select (native `<select>` only)
view.demoSelect.selectOptionByText('Option B');
view.selectedStatus.should('contain.text', 'Option B');
```

See demo: [`apps/cypress-demo/cypress/e2e/home.cy.ts`](../apps/cypress-demo/cypress/e2e/home.cy.ts) and [`CatalogHomeCypress.to.ts`](../apps/demo-shared/src/views/CatalogHomeCypress.to.ts).

### Query helpers (`@testing-library/cypress`)

`CypressComponentTestObject` exposes protected helpers that wrap `cy.findBy*` / `cy.findAllBy*`:

| Single | Indexed list |
|--------|----------------|
| `findByRole` | `findAllByRoleAt` |
| `findByLabelText` | `findAllByLabelTextAt` |
| `findByText` | `findAllByTextAt` |
| `findByAltText` | `findAllByAltTextAt` |
| `findByTestId` | `findAllByTestIdAt` |
| `findByTitle` | `findAllByTitleAt` |
| `findByPlaceholderText` | `findAllByPlaceholderTextAt` |
| `findByDisplayValue` | `findAllByDisplayValueAt` |

Use these in getters instead of sync `this.context.getBy*` — Cypress retries automatically. Legacy `chain()` / `chainAt()` remain for bridging sync RTL getters when needed.

## Hybrid interactions (HTMLElement getters)

Return Cypress commands from `.then()` so they enqueue correctly:

```ts
bindView().then((view) => cy.wrap(view.itemLinks[0]).click());
cy.url().should('include', '/items/1');
```

`createCypressUserAgent()` wraps `cy.*` in `Cypress.Promise` for `UserAgent` compatibility, but command-queue ordering is fragile for nested async — prefer `cy.wrap(element).click()` for navigation tests.

Element-centric primitives on `ComponentTestObject` also work when the test object root is bound:

```ts
bindView().then(async (view) => {
  await view.itemLinks[0].userClick();
});
```

## Legacy hybrid (`cy.wrap`)

Prefer `CypressComponentTestObject` for new specs. `ComponentTestObject` + `cy.wrap` still works:

```ts
bindView().then((view) => cy.wrap(view.itemLinks[0]).click());
```

## Routing in the demo app

`apps/cypress-demo` uses **`BrowserRouter`** (not `MemoryRouter`) so `cy.url()` reflects client-side navigation. The app must include routes for destinations you assert on (e.g. `/items/:id`).

The Cypress preprocessor resolves `@page-component-object/*` to **source** paths in this monorepo so specs compile without pre-built `dist` exports. When installed from npm, rely on package `exports` directly.

## What to assert

| Good | Avoid |
|------|--------|
| URL, visible headings, list content via getters | Re-implementing every query as raw `cy.get` |
| Same `itemLinks` getter as Storybook | Duplicating MSW setup in Cypress |
| `CypressComponentTestObject` + `cy.findBy*` (retry-aware) | Binding sync RTL getters before the UI is ready |
| Legacy: `cy.visit` + wait (`cy.get('h1')`) before `bindToRoot` | Importing MSW-backed view classes in Cypress |

## Example

Full spec: [`apps/cypress-demo/cypress/e2e/home.cy.ts`](../apps/cypress-demo/cypress/e2e/home.cy.ts).
