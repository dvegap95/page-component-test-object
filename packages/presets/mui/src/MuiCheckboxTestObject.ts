import { ComponentTestObject } from '@page-component-object/queries';

import { MuiInputWrapperTestObject } from './MuiInputWrapperTestObject';

export class MuiCheckboxTestObject extends MuiInputWrapperTestObject {
  get checked() {
    return this.input.root?.checked ?? false;
  }

  async setChecked(checked: boolean) {
    if (checked !== this.checked) {
      await this.input.userClick();
    }
  }

  static fromInput<T extends typeof MuiCheckboxTestObject>(
    this: T,
    input: HTMLInputElement | null,
  ) {
    const root =
      input?.closest('.MuiFormControlLabel-root') ?? input?.closest('.MuiCheckbox-root');
    return new this(root as HTMLElement) as InstanceType<T>;
  }

  static getInstanceByLabel<T extends typeof MuiCheckboxTestObject>(
    this: T,
    label: string | RegExp,
    parent: ComponentTestObject = new ComponentTestObject(),
  ) {
    const input = parent.context.queryByRole('checkbox', { name: label });
    return this.fromInput(input as HTMLInputElement) as InstanceType<T>;
  }
}
