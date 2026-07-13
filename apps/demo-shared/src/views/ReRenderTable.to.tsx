import { ComponentTestObject } from '@page-component-object/queries';

export class ReRenderTableTestObject extends ComponentTestObject {
  get rerenderButton() {
    return this.context.getByRole('button', { name: /re-render rows/i });
  }

  get status() {
    return this.context.getByRole('status');
  }

  get rowButtons() {
    return this.context.getAllByRole('button', { name: /^Row / });
  }

  cellButton(rowIndex: number) {
    return this.rowButtons[rowIndex];
  }
}
