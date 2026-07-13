# Cross-runner tutorial

This tutorial shows the **same catalog home view** tested in three runners using PCO test objects from [`apps/demo-shared`](../apps/demo-shared). It is the five-minute proof that selector knowledge can be centralized.

> **Honest constraint (0.1.2):** Cypress chainable getters still require a **second** test object class (`CatalogHomeCypressTestObject`) because sync RTL `getBy*` does not enqueue retry commands. After the `0.2.x` resolver migration, this tutorial targets **one class, three runners**. See [resolver-model.md](./resolver-model.md).

## What we test

The catalog home lists items from (mocked) API data. Assertions:

- Heading shows "Items"
- Three item links render
- Clicking the first link navigates to `/items/1`

## Shared source layout

```
apps/demo-shared/src/views/
  CatalogHomeStory.to.ts      # Storybook + legacy Cypress sync path
  CatalogHomeCypress.to.ts    # Cypress PCOChainable path (0.1.2)
  Home.to.tsx                 # Full BaseViewTestObject (Vitest/Jest + MSW)
```

## Runner 1: Vitest (Level 3 — MSW + routing)

Full view test with API mocks and `render()`:

```ts
// apps/vitest-demo/src/Home.bh.test.ts
import { HomeViewTestObject } from '@page-component-object/demo-shared';

const view = new HomeViewTestObject();
await view.render();

expect(view.heading).toBeTruthy();
expect(view.itemLinks).toHaveLength(3);
expect(view.mocks.getItems).toBeTruthy();
```

**Packages:** `adapter-vitest`, `react`, `msw`, `router-react`. Setup: [install.md](./install.md).

**Run:**

```bash
pnpm --filter @page-component-object/vitest-demo test
```

## Runner 2: Storybook `play` (Level 1 — DOM only)

DOM-only test object — no `App`, no MSW in the play function:

```ts
// apps/demo-shared/src/views/CatalogHomeStory.to.ts
export class CatalogHomeStoryTestObject extends ComponentTestObject {
  get heading() {
    return this.context.getByRole('heading', { name: /items/i });
  }

  get itemLinks() {
    return this.context.getAllByRole('link');
  }
}
```

```ts
// apps/storybook-demo/src/Home.stories.tsx
play: createStoryPlay(
  () => new HomeViewTestObject(),
  async (root, view) => {
    expect(view.heading).toBeTruthy();
    expect(view.itemLinks).toHaveLength(3);
    await userEvent.click(view.itemLinks[0]);
  },
),
```

`createStoryPlay` binds the canvas to the test object. MSW handlers come from `storyParameters()` — no duplicate handler setup in `play`.

**Run:**

```bash
pnpm --filter @page-component-object/storybook-demo storybook
```

MUI widget plays without any view harness: [MuiPlayground.stories.tsx](../apps/storybook-demo/src/mui/MuiPlayground.stories.tsx).

## Runner 3: Cypress E2E (Level 2 — getters, no MSW)

Cypress visits a live Vite app — real HTTP, no MSW.

### Path A: PCOChainable (recommended)

```ts
// CatalogHomeCypress.to.ts
export class CatalogHomeCypressTestObject extends CypressComponentTestObject {
  get heading() {
    return this.findByRole('heading', { name: /items/i });
  }

  get firstItemLink() {
    return this.findAllByRoleAt('link', 0);
  }
}
```

```ts
// apps/cypress-demo/cypress/e2e/home.cy.ts
bindCypressView().then((view) => {
  view.heading.should('contain.text', 'Items');
  view.firstItemLink.userClick();
});
cy.url().should('include', '/items/1');
```

### Path B: Sync getters (legacy — shows the tax)

```ts
// Reuses CatalogHomeStoryTestObject — sync getByRole, no retry
bindView().then((view) => cy.wrap(view.itemLinks[0]).click());
```

This works in the demo but flakes easily after navigation — it illustrates why duplicate TO classes exist today.

**Run:**

```bash
pnpm --filter @page-component-object/cypress-demo test
```

## Side-by-side comparison

| Concern | Vitest | Storybook | Cypress |
|---------|--------|-----------|---------|
| Test object | `HomeViewTestObject` | `HomeViewTestObject` or `CatalogHomeStoryTestObject` | `CatalogHomeCypressTestObject` (chainable) |
| API mocking | MSW `setupMockData()` | `storyParameters()` | Real app / server |
| Assertions | `expect()` | `expect()` from adapter | `cy.should()` on chainables |
| Navigation | `getUser().click(link)` | `userEvent.click(link)` | `userClick()` or `.click()` chain |

## The duplication tax (today)

| Getter | `CatalogHomeStoryTestObject` | `CatalogHomeCypressTestObject` |
|--------|------------------------------|--------------------------------|
| Heading | `this.context.getByRole(...)` | `this.findByRole(...)` |
| Links | `this.context.getAllByRole('link')` | `this.findAllByRoleAt('link', 0)` |

Same **intent**, two **bodies** — maintenance cost the resolver model removes in 0.2.x.

## External consumer shape

[`fixtures/rr7-consumer`](../fixtures/rr7-consumer) installs published tarballs and runs a minimal Vitest spec — CI gate via `pnpm test:consumer-smoke`.

## Re-render exercise (0.2.x goal)

After resolver migration, a demo spec will:

1. Render a table with dynamic rows
2. Re-render with updated data
3. Call `tables[1].cells[3].userClick()` without stale references

See `apps/vitest-demo/src/ReRender.bh.test.ts` (added in 0.2.x).

## Next steps

- [Getting started](./getting-started.md) — progressive levels 1–3
- [Why PCO](./why-pco.md) — central thesis
- [Cypress adoption](./cypress-adoption.md) — chainables vs unified class
- [Portability](./portability.md) — what travels across runners
