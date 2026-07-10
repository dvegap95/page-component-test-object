# Publishing `@pco/*` to npm

Release automation for this monorepo: **CI proves the tree**, **tags or manual dispatch trigger publish**, **`scripts/release-version.json` is the single version source**.

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **npm organization** | Scope in `package.json` must match your org (see `scripts/publish-config.json`) |
| **Trusted publisher** | Link this GitHub repo on npm ([trusted publishers](https://docs.npmjs.com/trusted-publishers)) — no `NPM_TOKEN` |
| **First publish** | Manual from your machine (`pnpm -r publish --access public`) to register packages; CI takes over after |
| **Node 20+ / pnpm 9+** | Same as local development |

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
| **`v*` tag push** | Normal release — `git tag v0.1.0 && git push origin v0.1.0` |
| **workflow_dispatch** | Re-publish or hotfix without a new tag — enter version matching `release-version.json` |

Workflows: [ci.yml](../.github/workflows/ci.yml) · [test.yml](../.github/workflows/test.yml) · [publish.yml](../.github/workflows/publish.yml)

## Version management

| File | Purpose |
|------|---------|
| [`scripts/release-version.json`](../scripts/release-version.json) | Canonical semver (e.g. `0.1.0`) |
| [`scripts/publish-config.json`](../scripts/publish-config.json) | npm scope, repo URLs, license |
| `pnpm version:sync` | Align all `packages/**/package.json` versions |

**Release checklist:**

1. Edit `scripts/release-version.json`
2. Run `pnpm version:sync` and commit
3. Push tag: `git tag v0.1.0 && git push origin v0.1.0`  
   — or run **Publish** workflow manually with version `0.1.0`

Tag / input version must match `release-version.json` exactly.

## What ships in `0.1.0`

| Surface | Status |
|---------|--------|
| Vitest + MSW | Stable |
| Jest + MSW | Stable |
| Storybook + MSW addon | Stable |
| Cypress | Experimental — see [cypress.md](./cypress.md) |

## Manual publish (local)

```bash
pnpm install
pnpm build
pnpm test
node scripts/prepare-publish.mjs
pnpm -r publish --access public
```

## After first npm publish

```bash
pnpm add @pco/core @pco/queries @pco/msw @pco/react @pco/router-react @pco/adapter-vitest
```

Tarball workflow (`pnpm pack:dist`) remains for pre-release testing — see [CONSUMER_INSTALL.md](./CONSUMER_INSTALL.md).
