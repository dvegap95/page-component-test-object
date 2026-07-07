# Publishing `@pco/*` to npm

## Prerequisites

1. **Claim the `@pco` npm organization** — create at [npmjs.com/org/create](https://www.npmjs.com/org/create) (unscoped `pco` exists but is unrelated).
2. **Node 20+** and **pnpm 9+** in this monorepo.
3. **`NPM_TOKEN`** with publish access to `@pco`, stored as a GitHub Actions secret for [`.github/workflows/publish.yml`](../.github/workflows/publish.yml).

## Version management

| File | Purpose |
|------|---------|
| [`scripts/release-version.json`](../scripts/release-version.json) | Canonical semver (e.g. `0.1.0`) |
| `pnpm version:sync` | Align all `packages/**/package.json` versions |
| `pnpm pack:dist` | Tarballs at `{version}-dev.N` for local consumers |

Bump release version:

1. Edit `scripts/release-version.json`
2. Run `pnpm version:sync`
3. Commit and tag: `git tag v0.1.0 && git push origin v0.1.0`

The publish workflow runs on `v*` tags.

## What ships in `0.1.0`

| Surface | Status |
|---------|--------|
| Vitest + MSW | Stable |
| Jest + MSW | Stable |
| Storybook + MSW addon | Stable |
| Cypress | Experimental — getter reuse + `PCOChainable` spike; see [cypress.md](./cypress.md) |

## Manual publish (local)

```bash
pnpm install
pnpm build
pnpm test
node scripts/prepare-publish.mjs
pnpm -r publish --access public
```

## After publish

Update [CONSUMER_INSTALL.md](./CONSUMER_INSTALL.md) consumers to use registry installs:

```bash
pnpm add @pco/core @pco/queries @pco/msw @pco/react @pco/router-react @pco/adapter-vitest
```

Tarball workflow remains valid for pre-release testing.
