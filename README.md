# Page Component Object (`@pco/*`)

Environment-agnostic **Page Component Object** toolkit for behavioral testing with Vitest, Jest, Storybook, and Cypress.

See [PLAN.md](./PLAN.md) for architecture.

## Packages

| Package | Description |
|---------|-------------|
| `@pco/core` | Types, `ObjectFactory`, `App` singleton, runtime injection |
| `@pco/queries` | `ComponentTestObject` (RTL queries + user agent) |
| `@pco/msw` | MSW v2 API mock registry |
| `@pco/react` | `BaseViewTestObject`, `BaseAppManager` |
| `@pco/router-react` | React Router v5 test shell helpers |
| `@pco/adapter-vitest` | Vitest setup |
| `@pco/adapter-jest` | Jest setup |
| `@pco/adapter-storybook` | Storybook `play` helpers |

## Demo apps (not published)

Fictitious consumer under `apps/demo-shared` — **no proprietary project references**.

| App | Runner |
|-----|--------|
| `apps/vitest-demo` | Vitest + MSW |
| `apps/jest-demo` | Jest smoke tests |
| `apps/storybook-demo` | Storybook + play functions |

## Development

```bash
pnpm install
pnpm build
pnpm test
```
