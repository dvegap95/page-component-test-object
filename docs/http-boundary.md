# HTTP boundary — MSW, `ApiTestObject`, and request assertions

PCO treats the network as a **contract boundary**, not a black box to stub blindly. View test objects describe what the user sees; **`ApiTestObject`** (`*Api.to.ts`) describes what the client sends and receives over HTTP.

## MSW-first, round-trip aware

Vitest, Jest, and Storybook share MSW handler definitions through `setupMockData()` and `storyParameters()`. PCO **encourages** mocking at that boundary and **discourages** treating every UI test as a full client–server round trip — especially when the goal is to assert a final DOM state, not the request the client actually made.

That does not mean round trips are wrong. Sometimes confidence requires exercising client–server contracts end to end, or at least **asserting** the outbound request as part of the flow. PCO supports both modes without duplicating setup.

## The two mocking traps

| Approach | What you gain | What you miss |
|----------|---------------|---------------|
| **Fixed mock response** — handler always returns the same payload | Stable UI state; fast, deterministic view tests | You are not verifying that the UI sent the correct request body, URL, or method |
| **Request-dependent mock** — handler branches on `request` | Closer to server behavior | Server-side complexity lands in test code; harder to maintain |

PCO's split between **data factories**, **API test objects**, and **spy assertions** avoids both extremes.

## Best of both worlds

1. **Mock the response you expect** — register handlers in `*Api.to.ts` with payloads from `DataFactory` (or whatever your view test object connects in `setupMockData()`). No server logic in the test.
2. **Assert what was sent** — `registerGet*` / `registerPost*` return MSW-backed spies on `view.mocks.*`. Use [semantic-matchers](./matchers.md) (`toHaveBeenLastCalledWithUrl`, …) to verify the client request without standing up a real backend.

```ts
// ItemsApi.to.ts — HTTP contract lives here
export class ItemsApiTestObject extends ApiTestObject {
  registerGetItems(handler: () => Item[]) {
    return this.registerRestHandler('get', '*/api/items', () => handler());
  }
}

// CatalogHome.to.tsx — view wires data + mocks
setupMockData() {
  this.mocks.getItems = this.itemsApi.registerGetItems(() => this.items);
  return this.mocks;
}

// CatalogHome.bh.test.ts — UI outcome + request contract
await view.render();
await view.refreshButton.userClick();
expect(view.mocks.getItems).toHaveBeenLastCalledWithUrl(/\/api\/items$/);
```

The UI test proves the user-visible outcome; the spy assertion proves the **product of the interaction** — the request — without importing server implementation into the suite.

## File roles (keep them separate)

| Artifact | Role |
|----------|------|
| `*.factory.ts` | Domain data only — strip fields irrelevant to the scenario |
| `*Api.to.ts` | Route registration, response shape, spy handles |
| `*View.to.tsx` | `setupMockData()`, render strategy, getters, intents |

See [project-structure.md](./project-structure.md) for layout and import boundaries.

## Storybook reuse

The same handler definitions power node behavioral tests and Storybook stories via `storyParameters()` / `mockSession()` — one HTTP contract, two runners. See [msw-storybook.md](./msw-storybook.md).

## Cypress E2E

Cypress runs against a real app build — **no MSW in the browser**. Reuse **DOM getters** from DOM-only test objects; HTTP assertions belong in Vitest/Jest/Storybook. See [cypress-adoption.md](./cypress-adoption.md).

## Related

- [matchers.md](./matchers.md) — `toHaveBeenLastCalledWithUrl` and semantic-matchers integration
- [philosophy.md](./philosophy.md) — query → primitive → intent layering
- [getting-started.md](./getting-started.md#level-3--app-harness-msw-and-routing) — Level 3 MSW + routing setup
