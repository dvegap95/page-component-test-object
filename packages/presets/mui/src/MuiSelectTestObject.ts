import { ComponentTestObject } from '@page-component-object/queries';

import { MuiFormFieldTestObject } from './MuiFormFieldTestObject';
import { MuiMenuTestObject } from './MuiMenuTestObject';

export class MuiSelectTestObject extends MuiFormFieldTestObject {
  protected get hiddenInput() {
    return this.root?.querySelector<HTMLInputElement>('input');
  }

  get menu() {
    return MuiMenuTestObject.instantiate();
  }

  get value() {
    return this.hiddenInput?.value ?? '';
  }

  get valueText() {
    return this.select?.textContent?.trim() ?? '';
  }

  get options() {
    return this.menu.options;
  }

  get select() {
    return (
      this.root?.querySelector<HTMLButtonElement>('.MuiSelect-select') ??
      this.root?.querySelector<HTMLInputElement>('input[type="text"]') ??
      this.root?.querySelector<HTMLButtonElement>('.MuiInputBase-input')
    );
  }

  isOpen() {
    return this.menu.isOpen();
  }

  getOptionByText(text: string | RegExp) {
    return this.menu.getOptionByText(text);
  }

  async open() {
    if (!this.select) {
      throw new Error('Select not found');
    }
    await this.getUser().click(this.select);
  }

  async close() {
    await this.menu.close();
  }

  async selectOptionByText(text: string | RegExp) {
    if (!this.isOpen()) {
      await this.open();
    }
    const option = this.getOptionByText(text);
    let ret = null;
    if (option.root) {
      ret = await option.userClick();
    }
    await this.close();
    return ret;
  }

  async selectOptionByIndex(index: number) {
    if (!this.isOpen()) {
      await this.open();
    }
    const option = this.options[index];
    let ret = null;
    if (option?.root) {
      ret = await option.userClick();
    }
    await this.close();
    return ret;
  }

  async userType(
    text: string,
    options?: Parameters<ComponentTestObject['userType']>[1],
  ) {
    if (!this.hiddenInput) {
      throw new Error('Select input not found');
    }
    await this.getUser().type(this.hiddenInput, text, options);
  }

  static fromSelectInput<T extends typeof MuiSelectTestObject>(
    this: T,
    input: HTMLInputElement | null,
  ): InstanceType<T> {
    const root =
      input?.closest('[class*="MuiSelect-root"]') ??
      input?.closest('[class*="MuiAutocomplete-root"]') ??
      input?.closest('[class*="MuiInputBase-root"]') ??
      input;
    return new this(root as HTMLElement) as InstanceType<T>;
  }

  static selectByLabel(
    parent: ComponentTestObject,
    label: string | RegExp,
  ): MuiSelectTestObject {
    const input =
      parent.context.queryByRole('combobox', { name: label, hidden: true }) ??
      parent.context.queryByLabelText(label);
    return this.fromSelectInput(input as HTMLInputElement);
  }

  static selectByPlaceholder(
    parent: ComponentTestObject,
    placeholder: string | RegExp,
  ): MuiSelectTestObject {
    const input = parent.context.queryByPlaceholderText(placeholder);
    return this.fromSelectInput(input as HTMLInputElement);
  }
}
