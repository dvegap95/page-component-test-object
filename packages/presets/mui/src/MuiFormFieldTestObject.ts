import { ComponentTestObject } from '@page-component-object/queries';

import { MuiInputWrapperTestObject } from './MuiInputWrapperTestObject';
import { hasMuiState } from './muiClasses';

export class MuiFormFieldTestObject extends MuiInputWrapperTestObject {
  protected get inputBase() {
    return this.queryMui('InputBase');
  }

  get hasErrorState() {
    return hasMuiState(this.inputBase, 'error');
  }

  get helperText() {
    return this.queryMui('FormHelperText')?.textContent ?? undefined;
  }

  get errorText() {
    return this.hasErrorState ? this.helperText : undefined;
  }

  static fromInput<T extends typeof MuiFormFieldTestObject>(
    this: T,
    input: HTMLInputElement | null,
  ) {
    const root =
      (input?.closest('.MuiTextField-root') as HTMLElement) ||
      (input?.closest('.MuiFormControl-root') as HTMLElement) ||
      null;
    return new this(root) as InstanceType<T>;
  }

  static getInstanceByLabel<T extends typeof MuiFormFieldTestObject>(
    this: T,
    label: string | RegExp,
    parent: ComponentTestObject = new ComponentTestObject(),
  ) {
    let root = parent.context.queryByRole('textbox', { name: label });
    if (root) {
      return this.fromInput(root as HTMLInputElement) as InstanceType<T>;
    }
    root = parent.context.queryByLabelText(label);
    return new this(root as HTMLElement) as InstanceType<T>;
  }

  static byPlaceholder<T extends typeof MuiFormFieldTestObject>(
    this: T,
    placeholder: string | RegExp,
    parent: ComponentTestObject,
  ) {
    const inputNode = parent.context.queryByPlaceholderText(placeholder);
    return this.fromInput(inputNode as HTMLInputElement) as InstanceType<T>;
  }
}
