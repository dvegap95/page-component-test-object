# @page-component-object/page

**Page Component Object (PCO)** — shared TestObjects for React UI tests across Vitest, Jest, Storybook, and Cypress.

> This package exists so the [@page-component-object npm org](https://www.npmjs.com/org/page-component-object) has a landing README. **Do not add it as a runtime dependency** — install the packages you need from the table below.

## Problem

Cross-runner suites often duplicate selectors and interaction flows: the same getters in Vitest, again in Storybook `play`, again in Cypress. PCO centralizes **queries**, **primitives**, and **intents** in `TestObjects` (`*.to.ts` / `*.to.tsx`) under `__pco__`, then runs them through **adapters**.

## Quick install (Vitest + MSW views)

```bash
pnpm add @page-component-object/core @page-component-object/queries @page-component-object/msw \
  @page-component-object/react @page-component-object/router-react \
  @page-component-object/adapter-vitest
```

## Packages

| Package | Role |
|---------|------|
| [`@page-component-object/core`](https://www.npmjs.com/package/@page-component-object/core) | Types, `App` singleton, `ObjectFactory` |
| [`@page-component-object/queries`](https://www.npmjs.com/package/@page-component-object/queries) | `ComponentTestObject` — RTL queries + primitives |
| [`@page-component-object/msw`](https://www.npmjs.com/package/@page-component-object/msw) | MSW API mocks + spy matchers |
| [`@page-component-object/react`](https://www.npmjs.com/package/@page-component-object/react) | `BaseViewTestObject`, `BaseAppManager` |
| [`@page-component-object/router-react`](https://www.npmjs.com/package/@page-component-object/router-react) | React Router v6/v7 test shell |
| [`@page-component-object/preset-mui`](https://www.npmjs.com/package/@page-component-object/preset-mui) | MUI widget test objects |
| [`@page-component-object/adapter-vitest`](https://www.npmjs.com/package/@page-component-object/adapter-vitest) | Vitest lifecycle |
| [`@page-component-object/adapter-jest`](https://www.npmjs.com/package/@page-component-object/adapter-jest) | Jest lifecycle |
| [`@page-component-object/adapter-storybook`](https://www.npmjs.com/package/@page-component-object/adapter-storybook) | Storybook MSW bridge |
| [`@page-component-object/adapter-cypress`](https://www.npmjs.com/package/@page-component-object/adapter-cypress) | Cypress E2E (experimental) |

## Documentation

- [**Repository README**](https://github.com/dvegap95/page-component-test-object#readme) — overview, quick example, demos
- [Install guide](https://github.com/dvegap95/page-component-test-object/blob/master/docs/install.md) — peers and runner bundles
- [Getting started](https://github.com/dvegap95/page-component-test-object/blob/master/docs/getting-started.md) — first behavioral test

## Status (`0.1.2`)

| Runner | Status |
|--------|--------|
| Vitest / Jest / Storybook + MSW | Stable |
| Cypress + `PCOChainable` | Experimental |
