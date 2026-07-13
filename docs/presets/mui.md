# MUI preset

`@page-component-object/preset-mui` provides reusable test objects for common Material UI widgets. Use them inside view test objects, Storybook `play` functions, and (after 0.2.x) Cypress specs via the resolver model.

## Supported widgets

| Test object | Covers |
|-------------|--------|
| `MuiButtonTestObject` | Button click, disabled state |
| `MuiFormFieldTestObject` | TextField / FormControl by label |
| `MuiSelectTestObject` | Native and listbox select flows |
| `MuiMenuTestObject` | Menu / portal interactions |
| `MuiDialogTestObject` | Modal open/close |
| `MuiSnackbarTestObject` | Alert / snackbar text |
| `MuiTimePickerTestObject` | Time selection flow |
| `MuiTableRowTestObject` | Table row queries and cells |
| `MuiInputWrapperTestObject` | Shared input base |

Source: [`packages/presets/mui`](../packages/presets/mui).

## MUI version

The preset targets **MUI v5+** class names (`MuiTextField-root`, `MuiFormControl-root`, etc.) as used in [`apps/storybook-demo`](../apps/storybook-demo). Test against your MUI major in Storybook before adopting in production suites.

## Install

```bash
pnpm add @page-component-object/preset-mui @page-component-object/queries
```

Peers: `react`, `@testing-library/react`, `@mui/material` (in your app).

## Storybook play index

Live examples in [`apps/storybook-demo/src/mui/`](../apps/storybook-demo/src/mui/):

| Story | Demonstrates |
|-------|--------------|
| `MuiPlayground.stories.tsx` | TextField, Select, Button, Snackbar, Table, TimePicker |
| Individual widget stories | Focused plays per component |

Run Storybook:

```bash
pnpm --filter @page-component-object/storybook-demo storybook
```

## Basic usage

```ts
import { MuiFormFieldTestObject } from '@page-component-object/preset-mui';
import { ComponentTestObject } from '@page-component-object/queries';

const root = new ComponentTestObject(canvasElement);
const field = MuiFormFieldTestObject.getInstanceByLabel('Name', root);

await field.input.userType('Alice');
expect(field.inputValue).toBe('Alice');
```

`getInstanceByLabel` walks from a parent `ComponentTestObject` scope — pass the story canvas or view root.

## Compose in view test objects

```tsx
// YourView.to.tsx
export class SettingsViewTestObject extends BaseViewTestObject {
  get nameField() {
    return MuiFormFieldTestObject.getInstanceByLabel('Name', this);
  }

  async fillProfile(name: string) {
    await this.nameField.input.userType(name);
    await this.saveButton.userClick();
  }
}
```

## Cypress path (0.2.x)

Today presets use sync RTL queries on `ComponentTestObject`. Chainable Cypress subclasses or unified `PCOContext` targets are planned — see [cypress-adoption.md](../cypress-adoption.md).

## Planned widgets

Tracked in [`.github/PLAN.md`](../.github/PLAN.md): Autocomplete, DatePicker, Tabs, DataGrid.

## Related

- [Preset authoring](./authoring.md) — portal and root policy
- [Philosophy](../philosophy.md) — widget intents vs domain intents
- [Getting started — Level 1](../getting-started.md#level-1--component-test-objects)
