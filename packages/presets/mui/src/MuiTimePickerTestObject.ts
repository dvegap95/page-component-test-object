import { MuiFormFieldTestObject } from './MuiFormFieldTestObject';

export class MuiTimePickerTestObject extends MuiFormFieldTestObject {
  async setTime(timeString: string): Promise<void> {
    const input = this.input.root;
    if (!input) {
      throw new Error('TimePicker input not found');
    }
    await this.getUser().click(input);
    await this.getUser().type(input, timeString, {
      initialSelectionStart: 0,
      initialSelectionEnd: Number.POSITIVE_INFINITY,
    });
    await this.getUser().tab();
  }
}
