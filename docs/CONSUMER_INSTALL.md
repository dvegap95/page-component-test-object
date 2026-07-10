# Consumer install manifest

Use this when installing PCO from `dist/packs/*.tgz` in an **external** monorepo (not the pnpm workspace).

## Release tiers (`0.1.0`)

| Surface | Stability | Packages |
|---------|-----------|----------|
| **Vitest** + MSW view tests | **Stable** | core, queries, msw, react, router-react, adapter-vitest |
| **Jest** + MSW view tests | **Stable** | same + adapter-jest |
| **Storybook** + MSW addon | **Stable** | same + adapter-storybook, `msw-storybook-addon` peer |
| **Cypress** E2E | **Experimental** | core, queries, adapter-cypress — getter reuse; [PCOChainable planned](../PLAN.md#phase-3--cypress-pcochainable-ongoing) |

npm publish (Phase 1) targets the **stable** rows first. Tarball workflow remains for pre-release testing. See [PUBLISH.md](./PUBLISH.md).

### npm (after `@pco` scope is claimed)

```bash
pnpm add @page-component-object/core @page-component-object/queries @page-component-object/msw @page-component-object/react @page-component-object/router-react @page-component-object/adapter-vitest
```

Add `@page-component-object/adapter-jest`, `@page-component-object/adapter-storybook`, or `@page-component-object/adapter-cypress` for other runners. Peer dependencies: see tables below.

Build packs from a PCO checkout:

```bash
pnpm install && pnpm pack:dist
```

Each `pack:dist` bumps **`0.1.0-dev.N`** (`scripts/pack-version.json` + `scripts/release-version.json`) and writes **`dist/packs/manifest.json`** with exact tarball filenames.

## Pack versions and Yarn lockfiles

**Do not reuse a fixed `0.0.0` filename.** Rebuilding tarballs with the same name changes bytes but not the path — Yarn records checksums in `yarn.lock` and `yarn install` can fail until they refresh.

**Preferred workflow**

1. `pnpm pack:dist` in PCO
2. Copy all of `dist/packs/*.tgz` + `manifest.json` into your consumer (e.g. `vendor/pco/`)
3. Update `file:` paths in consumer `package.json` to the new `0.1.0-dev.N` filenames (see manifest), or run from PCO:

   ```bash
   node scripts/apply-pack-manifest.mjs path/to/your-app/package.json path/to/vendor/pco/manifest.json
   ```

4. `yarn install`

**If you must overwrite tarballs without renaming** (not recommended):

| Yarn | Command |
|------|---------|
| Yarn 4 | `yarn install --refresh-lockfile` |
| Yarn 1 | Delete the `@page-component-object/*` resolution blocks in `yarn.lock`, then `yarn install` |

## Tarballs by use case

Use filenames from `manifest.json` (example version `0.1.0-dev.42`):

### Minimum (DOM-only Storybook / Cypress getters)

```bash
yarn add \
  file:./vendor/pco/pco-core-0.1.0-dev.42.tgz \
  file:./vendor/pco/pco-queries-0.1.0-dev.42.tgz
```

### Routed view tests (Vitest / Jest / Storybook MSW views)

Required — not optional for `BaseViewTestObject` / `BaseAppManager`:

```bash
yarn add \
  file:./vendor/pco/pco-core-0.1.0-dev.42.tgz \
  file:./vendor/pco/pco-queries-0.1.0-dev.42.tgz \
  file:./vendor/pco/pco-msw-0.1.0-dev.42.tgz \
  file:./vendor/pco/pco-router-react-0.1.0-dev.42.tgz \
  file:./vendor/pco/pco-react-0.1.0-dev.42.tgz
```

### Runner adapters (add what you use)

| Package | Tarball prefix |
|---------|----------------|
| `@page-component-object/adapter-vitest` | `pco-adapter-vitest-0.1.0-dev.N.tgz` |
| `@page-component-object/adapter-storybook` | `pco-adapter-storybook-0.1.0-dev.N.tgz` |
| `@page-component-object/adapter-cypress` | `pco-adapter-cypress-0.1.0-dev.N.tgz` |

## Peer dependencies (install in the consumer app)

Install these in the **same app package** that runs tests. PCO adapters declare **wide** peer ranges (e.g. Vitest 2 or 3); a Yarn “unmet peer” warning on a newer major you already use is usually safe if tests pass.

### All runners

| Package | Version | Used by |
|---------|---------|---------|
| `react` | `^18 \|\| ^19` | `@page-component-object/react`, `@page-component-object/router-react`, adapters |
| `react-dom` | `^18 \|\| ^19` | same |
| `@testing-library/dom` | `^10` | `@page-component-object/queries` |
| `@testing-library/react` | `^16` | `@page-component-object/queries`, `@page-component-object/react`, Storybook adapter |

### Routed + MSW view tests

| Package | Version | Used by |
|---------|---------|---------|
| `react-router-dom` | **`^6.4 \|\| ^7`** | `@page-component-object/router-react` |
| `msw` | `^2` | `@page-component-object/msw`, `@page-component-object/react`, Storybook adapter |

> **React Router v5 is not supported.**

### Vitest

| Package | Version |
|---------|---------|
| `vitest` | `^2 \|\| ^3` |
| `@testing-library/user-event` | `^14 \|\| ^15` |
| `@semantic-matchers/vitest` | `^0.1` (dependency of `@page-component-object/adapter-vitest`) |
| `@page-component-object/msw` | tarball (listed above) |

API spy matchers (`toHaveBeenLastCalledWithUrl`) register via `setupPCO()` — see [matchers.md](./matchers.md).

### Jest

| Package | Version |
|---------|---------|
| `jest` | `^29 \|\| ^30` |
| `@testing-library/user-event` | `^14 \|\| ^15` |
| `@semantic-matchers/jest` | `^0.1` (dependency of `@page-component-object/adapter-jest`) |

### Storybook

| Package | Version |
|---------|---------|
| `storybook` | `^8 \|\| ^9` |
| `@storybook/test` | `^8 \|\| ^9` |
| `msw-storybook-addon` | `^2` |

### Cypress

| Package | Version |
|---------|---------|
| `cypress` | `^13 \|\| ^14 \|\| ^15` |
| `@testing-library/cypress` | `^10` |

## One-shot install example (Vitest + routed MSW views, RR v7)

Replace `0.1.0-dev.42` with `version` from `manifest.json`:

```bash
yarn add \
  react react-dom react-router-dom@^7 \
  @testing-library/react @testing-library/dom @testing-library/user-event \
  msw vitest@^3 \
  file:./vendor/pco/pco-core-0.1.0-dev.42.tgz \
  file:./vendor/pco/pco-queries-0.1.0-dev.42.tgz \
  file:./vendor/pco/pco-msw-0.1.0-dev.42.tgz \
  file:./vendor/pco/pco-router-react-0.1.0-dev.42.tgz \
  file:./vendor/pco/pco-react-0.1.0-dev.42.tgz \
  file:./vendor/pco/pco-adapter-vitest-0.1.0-dev.42.tgz
```

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

// apiBaseUrl defaults to http://localhost; override if your API TOs use resolveApiUrl()
installPCOLifecycle({ apiBaseUrl: 'http://localhost:3000' });
```

`configureViewTestObjects` removes per-view `createAppManager()` boilerplate. View test objects only implement `setupMockData()` + getters.

## `apiBaseUrl`

`@page-component-object/adapter-vitest` / `@page-component-object/adapter-jest` set `ApiTestObject.apiBaseUrl` during `setupPCO()` (default **`http://localhost`**). Override when API test objects register paths via `resolveApiUrl()` instead of MSW wildcards (`*/api/items`).

## Full-app routing convention

`renderApp()` must receive the **route subtree** (`AppRoutes` with `<Routes>`), not `App` when `App` already wraps `BrowserRouter` / `RouterProvider`. See [getting-started.md](./getting-started.md#route-subtree-not-production-shell).

## Verify tarball install (CI / local)

From PCO repo root after `pnpm pack:dist`:

```bash
pnpm test:consumer-smoke
```

This installs all packs into `fixtures/rr7-consumer` (outside the workspace) on React Router v7 and runs a behavioral Vitest spec.
