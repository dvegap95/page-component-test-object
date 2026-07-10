import { ComponentTestObject } from '@page-component-object/queries';

import { MuiComponentTestObject } from './MuiComponentTestObject';
import { MuiSelectTestObject } from './MuiSelectTestObject';
import { MuiTextFieldTestObject } from './MuiTextFieldTestObject';

/** MUI Autocomplete — composes text-field and select behaviors. */
export class MuiComboBoxTestObject extends MuiComponentTestObject {
  private readonly text: MuiTextFieldTestObject;
  private readonly select: MuiSelectTestObject;

  constructor(root: HTMLElement) {
    super(root);
    this.text = new MuiTextFieldTestObject(root);
    this.select = new MuiSelectTestObject(root);
  }

  get input() {
    return this.text.input;
  }

  get value() {
    return this.text.inputValue ?? '';
  }

  async userType(
    text: string,
    options?: Parameters<MuiTextFieldTestObject['userType']>[1],
  ) {
    return this.text.type(text, options);
  }

  get valueText() {
    return this.select.valueText;
  }

  get options() {
    return this.select.options;
  }

  get backdrop() {
    return this.select.menu.backdrop;
  }

  isOpen() {
    return this.select.isOpen();
  }

  getOptionByText(text: string | RegExp) {
    return this.select.getOptionByText(text);
  }

  async open() {
    return this.select.open();
  }

  async close() {
    return this.select.close();
  }

  async selectOptionByText(text: string | RegExp) {
    return this.select.selectOptionByText(text);
  }

  async selectOptionByIndex(index: number) {
    return this.select.selectOptionByIndex(index);
  }

  static comboByLabel(
    parent: ComponentTestObject,
    label: string | RegExp,
  ): MuiComboBoxTestObject {
    const input = parent.context.queryByLabelText(label) as HTMLInputElement;
    return this.fromInput(input);
  }

  static comboByPlaceholder(
    parent: ComponentTestObject,
    placeholder: string | RegExp,
  ): MuiComboBoxTestObject {
    const input = parent.context.queryByPlaceholderText(placeholder) as HTMLInputElement;
    return this.fromInput(input);
  }

  static fromInput(input: HTMLInputElement | null): MuiComboBoxTestObject {
    const textField = MuiTextFieldTestObject.fromInput(input);
    return new MuiComboBoxTestObject(textField.root as HTMLElement);
  }
}
