# MSW in tests vs Storybook

PCO registers HTTP mocks through `ApiTestObject` on the **same handler instances** whether you run Vitest/Jest (node `setupServer`) or Storybook (`msw-storybook-addon` + browser worker).

## Shared mock setup per view

View test objects extend `MswViewTestObject` and implement `setupMockData()`:

```ts
class HomeViewTestObject extends MswViewTestObject {
  readonly mocks = { getItems: null as MockFn | null };

  setupMockData() {
    this.mocks.getItems = this.itemsApi.registerGetItems(() => this.items);
    return this.mocks;
  }
}
```

### Vitest / Jest

The view constructor calls `setupMockData()`. Handlers accumulate on `ApiTestObject.handlers`. `BaseAppManager` starts the node MSW server before render. Assert spies via `view.mocks.*`.

### Storybook

Storybook does **not** use the node server. Use an isolated session so handlers do not leak between stories:

```ts
const mswStory = defineMswViewStory(HomeViewTestObject, {
  play: async (view) => {
    await waitFor(() => expect(view.heading).toBeTruthy());
    expect(mswStory.mocks.getItems).toHaveBeenCalled();
  },
});

export const Default: Story = {
  parameters: mswStory.parameters, // → parameters.msw.handlers
  play: mswStory.play,
};
```

`createMockSession()` / `MswViewTestObject.createMockSession()` snapshot handlers after `setupMockData()` and reset the global registry so the next story starts clean.

Call `setupPCOStorybook()` once in `.storybook/preview.tsx` so handler spies use Storybook's `fn()`.

## API access from the view in both environments

| Concern | Vitest/Jest | Storybook |
|--------|-------------|-----------|
| DOM getters | `view.heading`, etc. | Same, after `bindToRoot(canvas)` in `play` |
| API test objects | `view.itemsApi` on the instance | Same on the session `view` |
| Handler spies | `view.mocks.getItems` | `mswStory.mocks.getItems` (same spy objects embedded in handlers) |

Props-only stories (no fetch) can keep a lightweight `ComponentTestObject` and skip MSW.

## Limitations

- **Cypress** does not use MSW; reuse getters/`UserAgent` against a real app.
- Storybook MSW runs in the **browser**; node-only handlers or custom server middleware need separate setup.
- Re-run `createMockSession` at module scope per story — not inside `play` — so `parameters.msw.handlers` matches the spies you assert on.
