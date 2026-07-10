import { ComponentTestObject } from '@page-component-object/queries';

import { MuiComponentTestObject } from './MuiComponentTestObject';

export class MuiButtonTestObject<
  T extends HTMLElement = HTMLButtonElement,
> extends MuiComponentTestObject<T> {
  static getInstanceByName<T extends typeof MuiButtonTestObject>(
    this: T,
    name: string | RegExp,
    root: ComponentTestObject = new ComponentTestObject(),
  ) {
    const buttonRoot = root.context.queryByRole('button', { name, hidden: true });
    return new this(buttonRoot as HTMLButtonElement) as InstanceType<T>;
  }

  isDisabled() {
    return (
      !!this.root?.hasAttribute('disabled') ||
      this.root?.getAttribute('aria-disabled') === 'true' ||
      this.hasState('disabled')
    );
  }

  isLoading() {
    return this.context.queryByRole('progressbar') !== null;
  }
}
