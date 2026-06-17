import { MuiComponentTestObject } from './MuiComponentTestObject';

export class MuiInputWrapperTestObject extends MuiComponentTestObject {
  get input() {
    return new MuiComponentTestObject<HTMLInputElement>(
      this.root?.querySelector('input') as HTMLInputElement,
    );
  }

  get inputValue() {
    return this.input.root?.value;
  }
}
