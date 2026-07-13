# Changelog

All notable changes to `@page-component-object/*` packages are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Documentation: `why-pco`, `design-principles`, `when-not-to-use`, `portability`, `resolver-model`, `cypress-adoption`, `cross-runner-tutorial`, preset guides
- `CHANGELOG.md` and compatibility matrix in `install.md`
- Resolver architecture (`PCOContext`, `PCOTargetBase`, `ContextResolver`) in `@page-component-object/core` and `@page-component-object/queries`
- `DataFactory` rename (`ObjectFactory` deprecated alias)
- Playwright adapter research spike (`@page-component-object/adapter-playwright`)
- Re-render behavioral demo spec (`ReRender.bh.test.ts`)
- Unified `CatalogHomeTestObject` for cross-runner getters (Vitest/Storybook/Cypress)

### Changed

- `ComponentTestObject` uses `rootResolver` instead of stored `_root`
- `bindResolver()` preferred over `bindToRoot()` (alias retained)
- README doc links reordered — Why PCO before Install
- Enriched npm package README metadata via `package-readmes.json`

### Deprecated

- `ObjectFactory` → use `DataFactory` (removed in a future minor)

## [0.1.2] - 2025

### Added

- Published `@page-component-object/*` packages on npm
- Vitest, Jest, Storybook adapters with MSW v2 bridge
- Experimental Cypress adapter: `CypressComponentTestObject`, `PCOChainable`, `@testing-library/cypress` integration
- `@page-component-object/preset-mui` widget test objects
- Consumer smoke CI (`pnpm test:consumer-smoke`)
- semantic-matchers integration for API spy assertions

### Fixed

- React Router v6/v7 test shell (`@page-component-object/router-react`)
- `configureViewTestObjects` to reduce AppManager boilerplate

[Unreleased]: https://github.com/dvegap95/page-component-test-object/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/dvegap95/page-component-test-object/releases/tag/v0.1.2
