# Install

Install **`@page-component-object/*`** from [npm](https://www.npmjs.com/org/page-component-object). The pattern alias **PCO** (`__pco__`, `*.to.ts`) is separate from the npm scope.

> **Status (`0.1.2`):** Vitest, Jest, and Storybook (MSW-backed view tests) are **stable**. Cypress: **`PCOChainable` / `findBy*` shipped**; unified cross-runner TestObjects land in **`0.2.x`** — see [cypress-adoption.md](./cypress-adoption.md).

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

## Compatibility matrix

Versions below match the repo's `0.1.2` release and current peer ranges. Patch/minor updates within these ranges are expected to work; open an issue if a peer major breaks.

| Dependency | Supported versions | Required for |
|------------|-------------------|--------------|
| `react` / `react-dom` | `^18 \|\| ^19` | All runners |
| `react-router-dom` | `^6.4 \|\| ^7` | Level 3 view tests (not v5) |
| `@testing-library/react` | `^16` | Vitest, Jest, Storybook |
| `@testing-library/dom` | `^10` | All runners |
| `@testing-library/user-event` | `^14 \|\| ^15` | Vitest, Jest |
| `@testing-library/cypress` | `^10` | Cypress E2E |
| `vitest` | `^2 \|\| ^3` | Vitest adapter |
| `jest` | `^29 \|\| ^30` | Jest adapter |
| `storybook` / `@storybook/test` | `^8 \|\| ^9` | Storybook adapter |
| `cypress` | `^13 \|\| ^14 \|\| ^15` | Cypress adapter |
| `msw` | `^2` | Vitest, Jest, Storybook MSW |
| `msw-storybook-addon` | `^2` | Storybook MSW bridge |
| `@mui/material` | `^5 \|\| ^6` (app peer) | `preset-mui` demos |
| `@semantic-matchers/core` | bundled via adapter | API spy matchers (Vitest/Jest) |

**PCO packages (`0.1.2`):** all `@page-component-object/*` packages release in lockstep — see [CHANGELOG.md](../CHANGELOG.md).

**Playwright:** research spike only — not required for production use.

## Packages by use case

| Goal | Packages |
|------|----------|
| DOM-only getters (Storybook canvas, Cypress) | `core`, `queries` |
| MSW-backed view tests | above + `msw`, `react`, `router-react` |
| MUI widget presets | `preset-mui` (optional) |
| **Vitest** | `adapter-vitest` |
| **Jest** | `adapter-jest` |
| **Storybook** | `adapter-storybook` + `msw-storybook-addon` peer |
| **Cypress** E2E | `adapter-cypress` — chainables shipped; cross-runner TO unification in `0.2.x` |

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

### Cypress


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
