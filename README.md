# Page Component Object (`@pco/*`)

**Environment-agnostic Page Component Object toolkit** for behavioral UI tests. Write view-level test objects once and reuse them across **Vitest**, **Jest**, **Storybook `play`**, and **Cypress** — with shared MSW mocks where the runner supports them.

> **Status:** Early development — install via `pnpm pack:dist` tarballs until npm publish.

## Why PCO?

Teams that maintain **unit/behavioral tests**, **Storybook interaction tests**, and **Cypress E2E** often duplicate the same DOM queries and user flows in three places. PCO centralizes that logic in **TestObjects** (`*.to.ts` / `*.to.tsx`):

| Concern | Without PCO | With PCO |
|--------|-------------|----------|
| DOM queries | Copy-pasted `getByRole` in every runner | Getters on `HomeViewTestObject` |
| API mocks | Separate MSW setup per runner | `setupMockData()` + shared handler spies |
| Navigation flows | Re-implement clicks/assertions | Same getters; runner-specific interaction |

PCO sits **on top of** [Testing Library](https://testing-library.com/) — it does not replace accessible queries or behavioral testing principles.

## Quick example

```ts
// Home.to.tsx — one test object, many runners
export class HomeViewTestObject extends BaseViewTestObject {
  get heading() {
    return this.context.getByRole('heading', { name: /items/i });
  }

  get itemLinks() {
    return this.context.getAllByRole('link');
  }

  async render() {
    return this.app.renderView(<Home items={this.items} loading={false} />, {
      route: '/',
      routePath: '/',
    });
  }
}
```

```ts
// Vitest behavioral test
const view = new HomeViewTestObject();
await view.render();
expect(view.itemLinks).toHaveLength(3);
await view.getUser().click(view.itemLinks[0]);
```

See [docs/getting-started.md](./docs/getting-started.md) for the full walkthrough.

## Packages

| Package | Description |
|---------|-------------|
| [`@pco/core`](./packages/core) | Types, `ObjectFactory`, `App` singleton, runtime injection |
| [`@pco/queries`](./packages/queries) | `ComponentTestObject` — RTL queries + user agent |
| [`@pco/msw`](./packages/msw) | MSW v2 API mock registry and session helpers |
| [`@pco/react`](./packages/react) | `BaseViewTestObject`, `BaseAppManager` |
| [`@pco/router-react`](./packages/router-react) | React Router v6/v7 test shell (`MemoryRouter`, `Routes`, `useNavigate`) |
| [`@pco/preset-mui`](./packages/presets/mui) | MUI widget test objects (Button, Select, Snackbar, TimePicker, TableRow, …) |
| [`@pco/adapter-vitest`](./packages/adapters/vitest) | Vitest lifecycle + user agent |
| [`@pco/adapter-jest`](./packages/adapters/jest) | Jest lifecycle + user agent |
| [`@pco/adapter-storybook`](./packages/adapters/storybook) | `createStoryPlay`, `storyParameters`, `pcoViewLoader`, MSW bridge |
| [`@pco/adapter-cypress`](./packages/adapters/cypress) | Cypress runtime + `UserAgent` over `cy.*` |

## Demo apps (not published)

Fictitious catalog domain under [`apps/demo-shared`](./apps/demo-shared) — **no proprietary project references**.

| App | Runner | What it demonstrates |
|-----|--------|----------------------|
| [`apps/vitest-demo`](./apps/vitest-demo) | Vitest + MSW | Shallow view + full-app navigation |
| [`apps/jest-demo`](./apps/jest-demo) | Jest + MSW | Same behavioral specs as Vitest |
| [`apps/storybook-demo`](./apps/storybook-demo) | Storybook | MSW stories + MUI preset `play` demos |
| [`apps/cypress-demo`](./apps/cypress-demo) | Cypress E2E | TestObject getters bound to a live app |

## Documentation

| Doc | Topic |
|-----|-------|
| [Getting started](./docs/getting-started.md) | Adapters, TestObject hierarchy, first test |
| [Project structure](./docs/project-structure.md) | `__pco__` layout, factories vs API mocks |
| [Consumer install manifest](./docs/CONSUMER_INSTALL.md) | Tarballs + full peer dependency list |
| [Architecture plan](./PLAN.md) | Monorepo layout, `App` singleton, render modes |
| [MSW in tests vs Storybook](./docs/msw-storybook.md) | Shared handlers, `createMockSession`, story parameters |
| [Cypress integration](./docs/cypress.md) | `bindToRoot`, hybrid `cy` + getter patterns |
| [Philosophy](./docs/philosophy.md) | Behavioral tests, Testing Trophy, RTL alignment |

## Development

**Requirements:** Node 20+, pnpm 9+

```bash
pnpm install
pnpm build
pnpm test                    # Vitest + Jest demos (excludes slow Cypress E2E)
pnpm --filter @pco/cypress-demo test   # Cypress E2E
pnpm test:consumer-smoke   # tarball install smoke test (RR v7 fixture)
pnpm --filter @pco/storybook-demo storybook
```

Monorepo tooling: **pnpm workspaces**, **Turborepo**, **tsup** for package builds.

### Consumer install (tarballs)

Packages are not on npm yet. After cloning, build and pack tarballs for external monorepos:

```bash
pnpm install
pnpm pack:dist   # bumps 0.0.0-dev.N, writes dist/packs/manifest.json
```

Copy `dist/packs/` into your consumer repo, update `file:` paths from **`manifest.json`** (or run `node scripts/apply-pack-manifest.mjs`), then `yarn install`. Each repack gets a new `dev.N` suffix so Yarn lockfile checksums stay valid.

See [Consumer install manifest](./docs/CONSUMER_INSTALL.md) for the full peer list, checksum refresh workflow, and install examples.



## Roadmap

See [PLAN.md](./PLAN.md) checklist. Next steps include claiming the `@pco` npm scope and optional presets beyond MUI.

## Related

- [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles)
- [semantic-matchers](https://github.com/dvegap95/semantic-matchers) — planned matcher integration for API assertions
