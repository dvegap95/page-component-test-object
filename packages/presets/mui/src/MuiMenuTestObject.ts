import { MuiComponentTestObject } from './MuiComponentTestObject';
import { OPEN_POPOVER_SELECTOR } from './muiClasses';

export class MuiMenuOptionTestObject extends MuiComponentTestObject<HTMLLIElement> {
  isDisabled() {
    return (
      this.root?.getAttribute('aria-disabled') === 'true' ||
      this.hasState('disabled') ||
      this.root?.hasAttribute('disabled') === true
    );
  }

  isSelected() {
    return (
      this.root?.getAttribute('aria-selected') === 'true' ||
      this.root?.classList.contains('Mui-selected')
    );
  }

  get textContent() {
    return this.root?.textContent ?? undefined;
  }
}

export class MuiMenuTestObject extends MuiComponentTestObject {
  static instantiate<T extends typeof MuiMenuTestObject>(this: T): InstanceType<T> {
    return new this(
      document.body.querySelector<HTMLElement>(OPEN_POPOVER_SELECTOR),
    ) as InstanceType<T>;
  }

  isOpen() {
    return Boolean(this.root);
  }

  get backdrop() {
    return this.root?.querySelector('.MuiBackdrop-root') ?? null;
  }

  get options() {
    return Array.from(this.root?.querySelectorAll('li') ?? []).map(
      (li) => new MuiMenuOptionTestObject(li),
    );
  }

  getOptionByText(text: string | RegExp) {
    return new MuiMenuOptionTestObject(this.context.queryByText(text) as unknown as HTMLLIElement);
  }

  async close() {
    if (this.backdrop) {
      await this.getUser().click(this.backdrop);
    }
  }
}
