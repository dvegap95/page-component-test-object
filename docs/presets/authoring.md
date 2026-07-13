# Preset authoring

Guide for building `@page-component-object/preset-*` packages or local widget test objects in your app.

## Anatomy of a preset class

```ts
import { ComponentTestObject } from '@page-component-object/queries';

export class MyWidgetTestObject extends ComponentTestObject {
  get trigger() {
    return this.context.getByRole('button', { name: /open/i });
  }

  async open() {
    await this.trigger.userClick();
  }
}
```

Presets own **widget intents** (`open`, `selectOptionByText`) — not domain workflows (`submitOrder`).

## Scoping: parent root

Factory methods receive a parent scope:

```ts
static byLabel(parent: ComponentTestObject, label: string) {
  const input = parent.context.queryByLabelText(label);
  return new MyWidgetTestObject(input ?? undefined);
}
```

Prefer `this.context` queries over `this.root.querySelector` — see [resolver-model.md](../resolver-model.md).

## Portal and document root policy

MUI menus, dialogs, selects, and snackbars often render into **`document.body`** portals — outside the parent component subtree.

### When to query `document.body`

| Widget | Portal? | Query scope |
|--------|---------|-------------|
| TextField | No | Parent `context` |
| Select listbox | Often yes | `document.body` or `screen` for menu items |
| Dialog | Yes | `document.body` for dialog paper |
| Menu | Yes | `MuiMenuTestObject.instantiate()` uses `document.body` |
| Snackbar | Yes | Global `screen` / role query |

Example from `MuiMenuTestObject`:

```ts
static instantiate() {
  return new MuiMenuTestObject(document.body);
}
```

**Document why** in your preset when using global scope — future readers need to know it is intentional portal escape, not accidental `screen` leakage.

### Portal checklist

1. Can the widget be found within the parent `context`? If yes, stay scoped.
2. Does MUI render a portal? Use `within(document.body)` or a dedicated `ComponentTestObject(document.body)` for the menu/dialog phase only.
3. Close the portal before asserting parent scope again — avoid stale menu nodes.

## Static factories vs constructors

| Pattern | Use when |
|---------|----------|
| `new Preset(root)` | You already have the root element |
| `Preset.getInstanceByLabel(label, parent)` | Label-driven discovery |
| `Preset.fromInput(inputEl)` | Walk DOM from a known input |

Keep factories **pure** — no side effects, no MSW, no `App.get()`.

## Primitives only in presets

Presets call `userClick`, `userType`, `fireChange` — not raw `fireEvent` unless Testing Library lacks coverage (drag-and-drop uses `ComponentTestObject.dndTo`).

## Testing your preset

1. **Storybook `play`** — fastest feedback; bind canvas via `createStoryPlay`.
2. **Vitest** — optional isolated render if Storybook is not available.

Do not require `BaseViewTestObject` to test a widget preset.

## Package structure

Follow monorepo preset layout:

```
packages/presets/my-ui/
  src/
    MyWidgetTestObject.ts
    index.ts
  package.json   # peers: queries, react, your UI lib
```

Publish as `@page-component-object/preset-my-ui` or keep as app-local `__pco__/presets/`.

## Anti-patterns

| Avoid | Prefer |
|-------|--------|
| `this.root.querySelector('.foo')` | `this.context.getByRole` / `getByLabelText` |
| Domain intents in preset | Consumer view TO composes preset |
| MSW in preset | View TO `setupMockData()` |
| Storing elements in fields | Resolver / getter re-query |

## Related

- [MUI preset](./mui.md)
- [Philosophy](../philosophy.md)
- [Design principles](../design-principles.md)
