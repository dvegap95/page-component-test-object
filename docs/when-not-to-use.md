# When not to use PCO

PCO is a structure investment. It pays off when test knowledge is **shared** across runners or **reused** across screens. It is not the right default for every test file.

## Skip PCO when

### One-off smoke tests

A single `render` + `screen.getByRole` + one `expect` does not need a test object class, `__pco__` folder, or adapter setup.

### Single runner, no reuse

If you **only** run Vitest and never Storybook or E2E, PCO still pays off when integration specs need **scoped queries and stable intent methods** — the adapter overhead is optional until you add a second runner.

Cross-runner reuse in [why-pco.md](./why-pco.md) is the extension of that central contract — not the only reason to adopt TestObjects.

### No duplicated widget knowledge

PCO presets and widget test objects shine when the same MUI `Select`, date picker, or modal appears on many screens. A one-field form with native `<input>` elements rarely needs a preset.

### Team prefers functions over classes

PCO demos use class-based test objects (`HomeViewTestObject`). The pattern works with factories and composition, but if your team standardizes on plain functions and `screen` queries, forcing classes adds friction without cross-runner benefit.

### Non-React surfaces

`ComponentTestObject` targets React DOM trees via Testing Library. Native mobile, canvas, or PDF UIs need different tools — PCO patterns may inspire structure, but the packages will not run there.

## Use PCO when

| Signal | Why PCO helps |
|--------|---------------|
| Same view in Vitest **and** Storybook **and/or** Cypress | One getter definition via adapters |
| Repeated MUI/Radix/custom widget flows | Presets encode widget pain once |
| MSW + Storybook + behavioral specs share HTTP contracts | `setupMockData()` → `storyParameters()` |
| Onboarding cost of selector drift | Central `__pco__` folder beside features |

## Middle ground

You can adopt PCO **progressively**:

1. **Level 1** — `ComponentTestObject` only for Storybook `play` (no `App`, no MSW). See [getting-started.md](./getting-started.md#level-1--component-test-objects).
2. **Level 2** — Share DOM getters with Cypress. See [cross-runner-tutorial.md](./cross-runner-tutorial.md).
3. **Level 3** — Full view harness with MSW and routing.

Stopping at Level 1 is valid if node behavioral tests are not in scope yet.

## Related

- [Why PCO](./why-pco.md)
- [Design principles](./design-principles.md)
- [Getting started](./getting-started.md)
