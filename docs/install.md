# Install

Install **`@page-component-object/*`** from [npm](https://www.npmjs.com/org/page-component-object). The pattern alias **PCO** (`__pco__`, `*.to.ts`) is separate from the npm scope.

> **Status (`0.1.2`):** Vitest, Jest, and Storybook (MSW-backed view tests) are **stable**. Cypress support is **experimental** — getter reuse and `PCOChainable` work today; see [cypress.md](./cypress.md).

## Quick install (Vitest + routed MSW views)

```bash
pnpm add @page-component-object/core @page-component-object/queries @page-component-object/msw \
  @page-component-object/react @page-component-object/router-react \
  @page-component-object/adapter-vitest
```

Peers (install in the same app package that runs tests):

```bash
pnpm add react react-dom react-router-dom@^7 \
  @testing-library/react @testing-library/dom @testing-library/user-event \
  msw vitest@^3
```

Then follow [getting-started.md](./getting-started.md) for adapter setup and your first view test object.

## Packages by use case

| Goal | Packages |
|------|----------|
| DOM-only getters (Storybook canvas, Cypress) | `core`, `queries` |
| MSW-backed view tests | above + `msw`, `react`, `router-react` |
| MUI widget presets | `preset-mui` (optional) |
| **Vitest** | `adapter-vitest` |
| **Jest** | `adapter-jest` |
| **Storybook** | `adapter-storybook` + `msw-storybook-addon` peer |
| **Cypress** E2E | `adapter-cypress` (experimental) |

Full package list and descriptions: [README — Packages](../README.md#packages).

## Runner-specific installs

### Jest

```bash
pnpm add @page-component-object/core @page-component-object/queries @page-component-object/msw \
  @page-component-object/react @page-component-object/router-react \
  @page-component-object/adapter-jest
```

Peers: `jest` ^29 or ^30, `@testing-library/user-event` ^14 or ^15.

### Storybook

```bash
pnpm add @page-component-object/core @page-component-object/queries @page-component-object/msw \
  @page-component-object/react @page-component-object/router-react \
  @page-component-object/adapter-storybook msw msw-storybook-addon
```

Peers: `storybook` and `@storybook/test` ^8 or ^9. Preview wiring: [msw-storybook.md](./msw-storybook.md).

### Cypress (experimental)

```bash
pnpm add @page-component-object/core @page-component-object/queries @page-component-object/adapter-cypress
```

Peers: `cypress` ^13–^15, `@testing-library/cypress` ^10. Do **not** add `msw` or `react` adapters to Cypress specs unless you know you need them — see [cypress.md](./cypress.md).

## Peer dependencies

Install these in the **same app package** that runs tests. Adapters declare wide peer ranges; a warning on a newer major you already use is usually fine if tests pass.

### All runners

| Package | Version |
|---------|---------|
| `react` | `^18 \|\| ^19` |
| `react-dom` | `^18 \|\| ^19` |
| `@testing-library/dom` | `^10` |
| `@testing-library/react` | `^16` |

### Routed + MSW view tests

| Package | Version |
|---------|---------|
| `react-router-dom` | **`^6.4 \|\| ^7`** |
| `msw` | `^2` |

> React Router v5 is not supported.

### Vitest

| Package | Version |
|---------|---------|
| `vitest` | `^2 \|\| ^3` |
| `@testing-library/user-event` | `^14 \|\| ^15` |

API spy matchers register via `setupPCO()` — see [matchers.md](./matchers.md).

### Jest

| Package | Version |
|---------|---------|
| `jest` | `^29 \|\| ^30` |
| `@testing-library/user-event` | `^14 \|\| ^15` |

## Required test setup (Vitest)

```ts
// vitest.setup.ts
import { installPCOLifecycle } from '@page-component-object/adapter-vitest';
import { BaseAppManager, configureViewTestObjects } from '@page-component-object/react';

class AppManager extends BaseAppManager {
  constructor() {
    super({ wrapProviders: (children) => children });
  }
}

configureViewTestObjects({ createAppManager: () => new AppManager() });

// apiBaseUrl defaults to http://localhost; override if your API test objects use resolveApiUrl()
installPCOLifecycle({ apiBaseUrl: 'http://localhost:3000' });
```

`configureViewTestObjects` removes per-view `createAppManager()` boilerplate. View test objects only implement `setupMockData()` + getters.

## `apiBaseUrl`

`@page-component-object/adapter-vitest` / `@page-component-object/adapter-jest` set `ApiTestObject.apiBaseUrl` during `setupPCO()` (default **`http://localhost`**). Override when API test objects register paths via `resolveApiUrl()` instead of MSW wildcards (`*/api/items`).

## Monorepo workspace (this repo)

```json
{
  "dependencies": {
    "@page-component-object/core": "workspace:*",
    "@page-component-object/queries": "workspace:*",
    "@page-component-object/react": "workspace:*",
    "@page-component-object/router-react": "workspace:*",
    "@page-component-object/msw": "workspace:*"
  },
  "devDependencies": {
    "@page-component-object/adapter-vitest": "workspace:*"
  }
}
```

## Next steps

- [Getting started](./getting-started.md) — TestObject hierarchy, first behavioral test
- [Project structure](./project-structure.md) — `__pco__` layout
- [Philosophy](./philosophy.md) — query → primitive → intent
