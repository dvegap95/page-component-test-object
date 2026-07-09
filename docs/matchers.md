# API matchers (semantic-matchers)

PCO ships **global matchers** for MSW API spies via [`@semantic-matchers/core`](https://www.npmjs.com/package/@semantic-matchers/core). Matcher definitions live in `@pco/msw`; Jest and Vitest adapters register them during `setupPCO()`.

## What ships today

| Runner | Status | Registration |
|--------|--------|--------------|
| **Vitest** | **Stable** | `installVitestSemanticExpect` + `extendGlobal(apiMockGlobalMatchers)` in `@pco/adapter-vitest` |
| **Jest** | **Stable** | `installSemanticExpect` + `extendGlobal(apiMockGlobalMatchers)` in `@pco/adapter-jest` |
| **Cypress** | **Planned** | Chainable `.should()` matchers on `PCOChainable` — not in `0.1.0` |

### Available matchers

```ts
expect(view.mocks.getItems).toHaveBeenLastCalledWithUrl('http://localhost/api/items');
expect(view.mocks.getItems).toHaveBeenLastCalledWithUrl(/\/api\/items$/);
```

Matchers inspect the **last MSW handler call** and compare `request.url` from `HttpHandlerInfo`.

## Consumer setup

`setupPCO()` / `installPCOLifecycle()` from `@pco/adapter-vitest` or `@pco/adapter-jest` registers matchers automatically. No extra `expect.extend` in consumer tests.

`setupPCO()` registers matchers automatically — TypeScript types ship with `@pco/adapter-vitest` / `@pco/adapter-jest` (no extra imports in consumer tests).

## Architecture

Matchers are authored **once** against `@semantic-matchers/core` (`defineMatcher`, `defineClassMatchers`). Runner adapters translate them to Jest/Vitest `expect.extend` without duplicating assertion logic.

```
@pco/msw/matchers          ← matcher definitions (runner-agnostic)
        ↓
@semantic-matchers/vitest  ← Vitest host adapter
@semantic-matchers/jest    ← Jest host adapter
        ↓
@pco/adapter-vitest        ← setupPCO() wires matchers + runtime
@pco/adapter-jest
```

### Future: Cypress chainable matchers

Cypress does not use `expect.extend`. The planned approach mirrors semantic-matchers’ **host adapter** model:

1. **Define** matchers in `@pco/msw` (or domain packs) using the same semantic shapes.
2. **Adapt** via a Cypress host that maps matcher results to `PCOChainable.should()` / custom Chai-style plugins.
3. **Register** in `setupPCOCypress()` alongside `@testing-library/cypress` query helpers.

Until that adapter exists, use native Cypress assertions on chainable getters or MSW assertions in Vitest/Jest/Storybook only.

## Adding matchers

Add to `packages/msw/src/apiMatchers.ts` with `defineMatcher`, export from `apiMockGlobalMatchers`. Runner-specific TypeScript augmentations live in `@pco/adapter-vitest` / `@pco/adapter-jest`. See [semantic-matchers matcher authoring](https://github.com/dvegap95/semantic-matchers/blob/main/docs/MATCHER_AUTHORING.md).

## Related

- [getting-started.md](./getting-started.md) — view tests + `mocks`
- [PLAN.md](../PLAN.md#phase-4--semantic-matchers) — phase status
- [@semantic-matchers/core on npm](https://www.npmjs.com/package/@semantic-matchers/core)
