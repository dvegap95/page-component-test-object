# Consumer install manifest

Use this when installing PCO from `dist/packs/*.tgz` in an **external** monorepo (not the pnpm workspace).

Build packs from a PCO checkout:

```bash
pnpm install && pnpm pack:dist
```

Each `pack:dist` bumps **`0.0.0-dev.N`** (`scripts/pack-version.json`) and writes **`dist/packs/manifest.json`** with exact tarball filenames.

## Pack versions and Yarn lockfiles

**Do not reuse a fixed `0.0.0` filename.** Rebuilding tarballs with the same name changes bytes but not the path — Yarn records checksums in `yarn.lock` and `yarn install` can fail until they refresh.

**Preferred workflow**

1. `pnpm pack:dist` in PCO
2. Copy all of `dist/packs/*.tgz` + `manifest.json` into your consumer (e.g. `vendor/pco/`)
3. Update `file:` paths in consumer `package.json` to the new `0.0.0-dev.N` filenames (see manifest), or run from PCO:

   ```bash
   node scripts/apply-pack-manifest.mjs path/to/your-app/package.json path/to/vendor/pco/manifest.json
   ```

4. `yarn install`

**If you must overwrite tarballs without renaming** (not recommended):

| Yarn | Command |
|------|---------|
| Yarn 4 | `yarn install --refresh-lockfile` |
| Yarn 1 | Delete the `@pco/*` resolution blocks in `yarn.lock`, then `yarn install` |

## Tarballs by use case

Use filenames from `manifest.json` (example version `0.0.0-dev.42`):

### Minimum (DOM-only Storybook / Cypress getters)

```bash
yarn add \
  file:./vendor/pco/pco-core-0.0.0-dev.42.tgz \
  file:./vendor/pco/pco-queries-0.0.0-dev.42.tgz
```

### Routed view tests (Vitest / Jest / Storybook MSW views)

Required — not optional for `BaseViewTestObject` / `BaseAppManager`:

```bash
yarn add \
  file:./vendor/pco/pco-core-0.0.0-dev.42.tgz \
  file:./vendor/pco/pco-queries-0.0.0-dev.42.tgz \
  file:./vendor/pco/pco-msw-0.0.0-dev.42.tgz \
  file:./vendor/pco/pco-router-react-0.0.0-dev.42.tgz \
  file:./vendor/pco/pco-react-0.0.0-dev.42.tgz
```

### Runner adapters (add what you use)

| Package | Tarball prefix |
|---------|----------------|
| `@pco/adapter-vitest` | `pco-adapter-vitest-0.0.0-dev.N.tgz` |
| `@pco/adapter-storybook` | `pco-adapter-storybook-0.0.0-dev.N.tgz` |
| `@pco/adapter-cypress` | `pco-adapter-cypress-0.0.0-dev.N.tgz` |

## Peer dependencies (install in the consumer app)

Install these in the **same app package** that runs tests. PCO adapters declare **wide** peer ranges (e.g. Vitest 2 or 3); a Yarn “unmet peer” warning on a newer major you already use is usually safe if tests pass.

### All runners

| Package | Version | Used by |
|---------|---------|---------|
| `react` | `^18 \|\| ^19` | `@pco/react`, `@pco/router-react`, adapters |
| `react-dom` | `^18 \|\| ^19` | same |
| `@testing-library/dom` | `^10` | `@pco/queries` |
| `@testing-library/react` | `^16` | `@pco/queries`, `@pco/react`, Storybook adapter |

### Routed + MSW view tests

| Package | Version | Used by |
|---------|---------|---------|
| `react-router-dom` | **`^6.4 \|\| ^7`** | `@pco/router-react` |
| `msw` | `^2` | `@pco/msw`, `@pco/react`, Storybook adapter |

> **React Router v5 is not supported.**

### Vitest

| Package | Version |
|---------|---------|
| `vitest` | `^2 \|\| ^3` |
| `@testing-library/user-event` | `^14 \|\| ^15` |
| `@pco/msw` | tarball (listed above) |

### Jest

| Package | Version |
|---------|---------|
| `jest` | `^29 \|\| ^30` |
| `@testing-library/user-event` | `^14 \|\| ^15` |

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

## One-shot install example (Vitest + routed MSW views, RR v7)

Replace `0.0.0-dev.42` with `version` from `manifest.json`:

```bash
yarn add \
  react react-dom react-router-dom@^7 \
  @testing-library/react @testing-library/dom @testing-library/user-event \
  msw vitest@^3 \
  file:./vendor/pco/pco-core-0.0.0-dev.42.tgz \
  file:./vendor/pco/pco-queries-0.0.0-dev.42.tgz \
  file:./vendor/pco/pco-msw-0.0.0-dev.42.tgz \
  file:./vendor/pco/pco-router-react-0.0.0-dev.42.tgz \
  file:./vendor/pco/pco-react-0.0.0-dev.42.tgz \
  file:./vendor/pco/pco-adapter-vitest-0.0.0-dev.42.tgz
```

## Required test setup (Vitest)
```ts
// vitest.setup.ts
import { installPCOLifecycle } from '@pco/adapter-vitest';
import { BaseAppManager, configureViewTestObjects } from '@pco/react';

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

`@pco/adapter-vitest` / `@pco/adapter-jest` set `ApiTestObject.apiBaseUrl` during `setupPCO()` (default **`http://localhost`**). Override when API test objects register paths via `resolveApiUrl()` instead of MSW wildcards (`*/api/items`).

## Full-app routing convention

`renderApp()` must receive the **route subtree** (`AppRoutes` with `<Routes>`), not `App` when `App` already wraps `BrowserRouter` / `RouterProvider`. See [getting-started.md](./getting-started.md#route-subtree-not-production-shell).

## Verify tarball install (CI / local)

From PCO repo root after `pnpm pack:dist`:

```bash
pnpm test:consumer-smoke
```

This installs all packs into `fixtures/rr7-consumer` (outside the workspace) on React Router v7 and runs a behavioral Vitest spec.
