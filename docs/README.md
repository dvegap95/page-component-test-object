# Documentation

**New here?** [Install](../README.md#install) from the README → [Getting started](./getting-started.md) (Level 1). Skim the README [What it is](../README.md#what-it-is) when you want context.

## Onboarding paths

**Hands-on (recommended):**

| Step | Guide |
|------|-------|
| 1 | [README](../README.md) — install + quick example |
| 2 | [Getting started](./getting-started.md) — Level 1 → 3 |
| 3 | [Project structure](./project-structure.md) — `__pco__` layout |
| 4 | [Cross-runner tutorial](./cross-runner-tutorial.md) — when you add a second runner |

**Understand the model first:**

| Step | Guide |
|------|-------|
| 1 | [README — What it is](../README.md#what-it-is) |
| 2 | [Vision](./vision.md) — booking-flow walkthrough |
| 3 | [Why PCO](./why-pco.md) — diagrams, when it pays off |
| 4 | [Getting started](./getting-started.md) |

## Reference

| Guide | Description |
|-------|-------------|
| [Install](./install.md) | npm packages, peers, compatibility matrix |
| [Vision](./vision.md) | Booking-flow walkthrough, design goals, shipped vs composed |
| [HTTP boundary](./http-boundary.md) | MSW, `ApiTestObject`, request vs response testing |
| [Design principles](./design-principles.md) | Runtime contracts, escape hatches |
| [When not to use](./when-not-to-use.md) | Honest scope boundaries |
| [Portability](./portability.md) | Portable vs runner-native |
| [Resolver model](./resolver-model.md) | `rootResolver`, `PCOTarget` |
| [Cypress adoption](./cypress-adoption.md) | Chainables, E2E, Playwright comparison |
| [Project structure](./project-structure.md) | `__pco__` layout, factories vs API mocks |
| [MSW in tests vs Storybook](./msw-storybook.md) | Shared handlers between runners |
| [Cypress integration](./cypress.md) | Legacy 0.1.x setup (`bindToRoot`) |
| [API matchers](./matchers.md) | MSW spy assertions |
| [Philosophy](./philosophy.md) | Query / primitive / intent model |
| [MUI preset](./presets/mui.md) | Widget test objects |
| [Preset authoring](./presets/authoring.md) | Portal/root policy |
| [Changelog](../CHANGELOG.md) | Version history |

Repository overview: [README](../README.md).

---

**Maintainers / doc authors:** [authoring-philosophy.md](./authoring-philosophy.md) — example constraints (not required for library consumers).
