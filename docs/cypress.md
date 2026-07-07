# Cypress integration

Cypress runs against a **real app** with **no MSW**. PCO’s role is to **reuse TestObject getters** and optional `UserAgent` bridging — not to duplicate Cypress’s strengths (network, screenshots, real navigation).

> **Stability (`0.1.0`):** Cypress support is **experimental**. DOM getter reuse, `setupPCOCypress()`, and the **`PCOChainable` spike** (`CypressComponentTestObject`) work today. See [PCOChainable](#pcochainable-cypresscomponenttestobject) below.

> **Important:** Cypress never uses the node MSW server or `BaseViewTestObject` constructors. Share **DOM getters** from `ComponentTestObject` subclasses; keep API mock setup in Vitest/Storybook only.

## Consumer install

```bash
yarn add file:./vendor/pco/pco-core-0.1.0-dev.N.tgz \
  file:./vendor/pco/pco-queries-0.1.0-dev.N.tgz \
  file:./vendor/pco/pco-adapter-cypress-0.1.0-dev.N.tgz
```

Replace `0.1.0-dev.N` with the version from `dist/packs/manifest.json` after `pnpm pack:dist`.

You do **not** need `pco-msw` or `pco-react` in Cypress specs unless you import MSW-backed view classes (avoid that — see [import paths](#which-test-objects-to-import)).

Peer dependency: `cypress` ^13 or ^14.

## Setup

In support or spec entry:

```ts
import { setupPCOCypress } from '@pco/adapter-cypress';

setupPCOCypress({ resetUserAgentEachTest: false });
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
| Import `BaseViewTestObject` subclasses | **No** | Pulls `@pco/msw` node server into the browser bundle |
| Separate `*.story.to.tsx` export for Cypress/Storybook | Optional | When view TO mixes MSW + JSX in one class |

There is no separate “Cypress export” path — reuse the **DOM-only** test object class (or a thin subclass without MSW) from your `*.to.tsx` files.

## PCOChainable (`CypressComponentTestObject`)

**Option B (shipped in `0.1.0` spike):** use a separate Cypress base class so node runners keep `HTMLElement` getters.

```ts
import { CypressComponentTestObject } from '@pco/adapter-cypress';

export class CatalogHomeCypressTestObject extends CypressComponentTestObject {
  get heading() {
    return this.chain(() => this.context.getByRole('heading', { name: /items/i }));
  }

  get firstItemLink() {
    return this.chainAt(() => this.context.getAllByRole('link'), 0);
  }
}
```

After `bindToRoot`:

```ts
// Native Cypress on chainable getters
view.heading.should('contain.text', 'Items');

// PCO semantic (awaitable)
view.firstItemLink.userClick();
```

See demo: [`apps/cypress-demo/cypress/e2e/home.cy.ts`](../apps/cypress-demo/cypress/e2e/home.cy.ts) and [`CatalogHomeCypress.to.ts`](../apps/demo-shared/src/views/CatalogHomeCypress.to.ts).

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

The Cypress preprocessor resolves `@pco/*` to **source** paths so specs compile without pre-built `dist` exports. When using tarballs, point aliases at `node_modules/@pco/*/dist` or rely on package exports directly.

## What to assert

| Good | Avoid |
|------|--------|
| URL, visible headings, list content via getters | Re-implementing every query as raw `cy.get` |
| Same `itemLinks` getter as Storybook | Duplicating MSW setup in Cypress |
| `cy.visit` + wait for stable UI (`cy.get('h1')`) | Binding before the app has rendered |

## Example

Full spec: [`apps/cypress-demo/cypress/e2e/home.cy.ts`](../apps/cypress-demo/cypress/e2e/home.cy.ts).
