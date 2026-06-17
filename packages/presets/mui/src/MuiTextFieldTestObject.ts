import { MuiFormFieldTestObject } from './MuiFormFieldTestObject';

export class MuiTextFieldTestObject extends MuiFormFieldTestObject {
  type(...args: Parameters<MuiFormFieldTestObject['input']['userType']>) {
    return this.input.userType(...args);
  }
}
