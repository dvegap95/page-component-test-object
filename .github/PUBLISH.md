# Publishing `@page-component-object/*` to npm

> **Maintainer doc** — release workflow for this monorepo. Consumers install from npm per [docs/install.md](../docs/install.md).

npm scope **`@page-component-object`** (org [page-component-object](https://www.npmjs.com/org/page-component-object)). **CI proves the tree**, **tags or manual dispatch trigger publish**, **`scripts/release-version.json` is the single version source**.

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **npm organization** | Scope in `package.json` must match your org (see `scripts/publish-config.json`) |
| **Trusted publisher** | Link this GitHub repo on npm ([trusted publishers](https://docs.npmjs.com/trusted-publishers)) — no `NPM_TOKEN` when configured |
| **Node 22 + npm 11.5+** | Required for OIDC trusted publishing in CI (see `publish.yml`) |
| **NPM_TOKEN (optional)** | Granular **Automation** publish token in repo secrets — fallback if trusted publisher is not linked yet |
| **First publish** | Manual from your machine (`pnpm publish:packages`) to register packages; CI takes over after |
| **Node 20+ / pnpm 9+** | Same as local development |

## Trusted publisher (recommended)

On [npm](https://www.npmjs.com) → **Packages** → `@page-component-object/core` → **Settings** → **Trusted publishing** → **GitHub Actions**:

| Field | Value |
|-------|--------|
| Organization or user | `dvegap95` |
| Repository | `page-component-test-object` |
| Workflow filename | `publish.yml` |
| Allowed actions | `npm publish` |

Repeat for each package in the org (or link at org level if your npm plan supports it). The workflow filename must match exactly — not `test.yml`.

Include **`@page-component-object/page`** (org landing package) in the first publish batch so [npmjs.com/org/page-component-object](https://www.npmjs.com/org/page-component-object) is not empty.

If CI still returns `404 Not Found` on `PUT`, either trusted publishing is not linked for that package, or add a granular **Automation** publish token as the `NPM_TOKEN` repository secret (CI uses OIDC first, then falls back to the token).

## How releases run

```text
push/PR ──► CI (reusable test.yml) ──► build + test + consumer-smoke
                                              │
tag v*  ──► Publish workflow ────────────────┤ same test gate
       or manual dispatch ───────────────────┘
                    │
                    ▼
         verify-release-version.mjs
                    │
                    ▼
         prepare-publish.mjs → pnpm -r publish
```

| Trigger | When to use |
|---------|-------------|
| **`v*` tag push** | Normal release — `git tag v0.1.1 && git push origin v0.1.1` |
| **workflow_dispatch** | Re-publish or hotfix without a new tag — enter version matching `release-version.json` |

Workflows: [ci.yml](./workflows/ci.yml) · [test.yml](./workflows/test.yml) · [publish.yml](./workflows/publish.yml)

## Version management

| File | Purpose |
|------|---------|
| [`scripts/release-version.json`](../scripts/release-version.json) | Canonical semver |
| [`scripts/publish-config.json`](../scripts/publish-config.json) | npm scope, repo URLs, license |
| `pnpm version:sync` | Align all `packages/**/package.json` versions |

**Release checklist:**

1. Edit `scripts/release-version.json`
2. Run `pnpm version:sync` and commit
3. Push tag: `git tag v0.1.1 && git push origin v0.1.1`  
   — or run **Publish** workflow manually with version `0.1.1`

Tag / input version must match `release-version.json` exactly.

## What ships

| Surface | Status |
|---------|--------|
| Vitest + MSW | Stable |
| Jest + MSW | Stable |
| Storybook + MSW addon | Stable |
| Cypress | Experimental — see [docs/cypress.md](../docs/cypress.md) |

## Manual publish (local)

From the **monorepo root** — not `npm publish` (the root package is private).

```bash
pnpm install
pnpm build
pnpm test
pnpm publish:packages
```

`publish:packages` runs `prepare-publish.mjs` then `pnpm -r publish` for each `@page-component-object/*` package under `packages/`.

Tarball packs (`pnpm pack:dist`) are for **CI consumer-smoke** only — not documented for end users.
