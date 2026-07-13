# Why PCO?

Page Component Object (PCO) exists to answer one question:

> **Where does the application’s test-facing contract live — and who maintains it when the UI changes?**

Without a deliberate structure, that contract fragments across runners. The same date picker, modal, or catalog list gets re-described in Vitest specs, Storybook `play` functions, Cypress E2E, and sometimes manual QA scripts. Each surface uses different syntax, but the **knowledge** is identical: which role, which label, which steps to open the widget and confirm the outcome.

PCO centralizes that knowledge in **`__pco__`** test objects (`*.to.ts` / `*.to.tsx`) beside your features. Runners consume the description through **adapters**; they do not each own a copy of it.

## The duplication problem

```mermaid
flowchart TB
  subgraph without [Without PCO]
    C[Component change]
    V[Vitest selectors + flows]
    S[Storybook play]
    E[Cypress E2E]
    Q[Manual QA notes]
    C --> V
    C --> S
    C --> E
    C --> Q
  end

  subgraph with [With PCO]
    C2[Component change]
    TO["__pco__ TestObject"]
    A1[Vitest adapter]
    A2[Storybook adapter]
    A3[Cypress adapter]
    C2 --> TO
    TO --> A1
    TO --> A2
    TO --> A3
  end
```

| Concern | Three parallel copies | One `__pco__` surface + adapters |
|--------|------------------------|----------------------------------|
| Widget intents (date picker, select, dialog) | Copied per runner | One intent method; runner executes it |
| DOM queries (`getByRole`, labels) | Three getter sets | One getter definition |
| API boundary (MSW handlers) | Duplicated setup | `setupMockData()` shared with Storybook |
| Maintenance | Fix the same flow in three places | Fix once in preset or view TO |

## Knowledge centralization

PCO organizes test knowledge in layers — smallest reusable unit at the bottom, domain flows at the top:

```mermaid
flowchart BT
  Intent["Domain intents\nfillCheckout, openSettings"]
  Widget["Widget presets\nMUI Select, TimePicker"]
  Primitive["Primitives\nuserClick, userType"]
  Query["Queries\ngetByRole, getByLabelText"]
  Intent --> Widget
  Widget --> Primitive
  Primitive --> Query
```

| Layer | Owner | Example |
|-------|-------|---------|
| **Query** | Framework (`ComponentTestObject`) | `get email()` → role/label query |
| **Primitive** | Framework | `await field.userType('alice@example.com')` |
| **Widget intent** | `@page-component-object/preset-*` or your TO | `await datePicker.selectDate('2026-01-15')` |
| **Domain intent** | Your `*.to.*` | `await view.fillCheckout()` |

When a MUI `Select` changes from native `<select>` to a listbox portal, you update **one** preset — not every spec that touches a dropdown.

## What PCO is not

PCO is **not** a replacement for Testing Library, Cypress, or Vitest. It is a **structure layer** on top of them:

- **Not** hiding Cypress command chains — native `.should()`, `.click()`, and retry semantics stay available. See [cypress-adoption.md](./cypress-adoption.md).
- **Not** a DI framework or test harness monopoly — `App.get()` is a convenience singleton with a documented reset contract; see [getting-started.md](./getting-started.md#level-3--app-harness-msw-and-routing).
- **Not** asserting for you — `expect` (node), `cy.should` (Cypress), and [semantic-matchers](https://github.com/dvegap95/semantic-matchers) for API spies remain runner-native.

## HTTP assertions complement

UI test objects describe **what the user sees and does**. API contracts use MSW handlers in `setupMockData()` plus **semantic-matchers** for spy assertions (`toHaveBeenLastCalledWithUrl`, etc.). That split keeps DOM queries separate from HTTP shape checks. See [matchers.md](./matchers.md).

## When PCO pays off

PCO earns its folder structure when:

1. **The same view** is tested in Vitest/Jest, Storybook, and/or Cypress.
2. **Widget knowledge** (MUI, Radix, custom design system) repeats across screens.
3. **API + UI** triangulation matters — MSW handlers in node tests and Storybook share one definition.

If you only ever run a single runner on throwaway smoke tests, a thin RTL wrapper may be enough. See [when-not-to-use.md](./when-not-to-use.md).

## Portfolio thesis: triangulation

The strongest adoption story is **Vitest + Storybook + MSW**: behavioral specs and visual stories exercise the same HTTP contract and the same test object getters. Cypress (and future Playwright) extend that contract to a live browser without duplicating selector knowledge.

```mermaid
flowchart LR
  TO["__pco__ TestObject"]
  V[Vitest / Jest]
  SB[Storybook + MSW]
  E2E[Cypress / Playwright]
  TO --> V
  TO --> SB
  TO --> E2E
```

Cross-runner **definition** reuse (one class, three runners) is the `0.2.x` resolver goal. Today Cypress may still require a parallel DOM-only class for chainable getters — documented honestly in [cross-runner-tutorial.md](./cross-runner-tutorial.md) until migration completes.

## Next steps

| Level | Start here |
|-------|------------|
| 1 — Component objects only | [Getting started — Level 1](./getting-started.md#level-1--component-test-objects) |
| 2 — Same getters, multiple runners | [Cross-runner tutorial](./cross-runner-tutorial.md) |
| 3 — App harness + MSW | [Getting started — Level 3](./getting-started.md#level-3--app-harness-msw-and-routing) |

- [Design principles](./design-principles.md) — runtime contracts and escape hatches
- [Philosophy](./philosophy.md) — query → primitive → intent layers
- [Portability](./portability.md) — what travels vs what stays runner-native
