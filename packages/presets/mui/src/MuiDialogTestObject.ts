import { MuiComponentTestObject } from './MuiComponentTestObject';

export class MuiDialogTestObject extends MuiComponentTestObject {
  isOpen() {
    return this.root !== null;
  }

  get title() {
    return this.queryMui('DialogTitle');
  }

  static get modalRoot() {
    return (document.querySelector('.MuiDialog-root') as HTMLElement) || null;
  }

  static getInstanceByTitle<T extends typeof MuiDialogTestObject>(
    this: T,
    title: string | RegExp,
  ): InstanceType<T> {
    const root = this.globalContext.queryByRole('dialog', { name: title });
    return new this(root as unknown as HTMLElement) as InstanceType<T>;
  }
}
