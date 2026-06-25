# Cypress integration

Cypress runs against a **real Vite app** with no MSW. PCO’s role is to **reuse TestObject getters** and optional `UserAgent` bridging — not to duplicate Cypress’s strengths (network, screenshots, real navigation).

## Setup

In support or spec entry:

```ts
import { setupPCOCypress } from '@pco/adapter-cypress';

setupPCOCypress({ resetUserAgentEachTest: false });
```

Register the adapter in the **same bundle** as your spec (webpack may duplicate modules; support-file-only setup is not always enough).

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

Use **MSW-free** test objects and import paths that do not pull node MSW into the browser bundle:

- `@pco/demo-shared/story-objects` — lightweight `ComponentTestObject`
- `@pco/demo-shared/views` — React views without fetch/MSW

## Hybrid interactions

Return Cypress commands from `.then()` so they enqueue correctly:

```ts
bindView().then((view) => cy.wrap(view.itemLinks[0]).click());
cy.url().should('include', '/items/1');
```

`createCypressUserAgent()` wraps `cy.*` in `Cypress.Promise` for `UserAgent` compatibility, but command-queue ordering is fragile for nested async — prefer `cy.wrap(element).click()` for navigation tests.

## Routing in the demo app

`apps/cypress-demo` uses **`BrowserRouter`** (not `MemoryRouter`) so `cy.url()` reflects client-side navigation. The app must include routes for destinations you assert on (e.g. `/items/:id`).

## Webpack aliases (cypress-demo)

The Cypress preprocessor resolves `@pco/*` to **source** paths so specs compile without pre-built `dist` exports. Mirror this in your consumer if you import workspace packages from `cypress/e2e`.

## What to assert

| Good | Avoid |
|------|--------|
| URL, visible headings, list content via getters | Re-implementing every query as raw `cy.get` |
| Same `itemLinks` getter as Storybook | Duplicating MSW setup in Cypress |
| `cy.visit` + wait for stable UI (`cy.get('h1')`) | Binding before the app has rendered |

## Example

Full spec: [`apps/cypress-demo/cypress/e2e/home.cy.ts`](../apps/cypress-demo/cypress/e2e/home.cy.ts).
