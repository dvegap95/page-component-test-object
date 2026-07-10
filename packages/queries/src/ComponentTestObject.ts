import { act, fireEvent, screen, within, queries, type BoundFunctions } from '@testing-library/react';

import { getSharedUserAgent, type QueryContext } from '@page-component-object/core';

export type TestObjectContext = BoundFunctions<typeof queries>;

/**
 * DOM-scoped test object base. Only for elements in the tree — not APIs or factories.
 * Default context is `screen` so ViewTestObjects work after router navigation without binding.
 */
export default class ComponentTestObject<T extends HTMLElement = HTMLElement> {
  protected _context: TestObjectContext | null;
  protected _root: T | null;
  static verbose = false;
  static readonly globalContext: TestObjectContext = screen;

  constructor(root?: T | null | undefined) {
    if (root === undefined) {
      this._context = screen;
      this._root = document.body as T;
    } else if (root === null) {
      this._context = null;
      this._root = null;
    } else {
      this._context = within(root);
      this._root = root;
    }
  }

  get root(): T | null {
    return this._root;
  }

  get context(): TestObjectContext {
    if (!this._context) {
      throw new Error(
        `Element of type ${this.constructor.name} has no valid root in the DOM.`,
      );
    }
    return this._context;
  }

  /** Optional: scope queries to a Storybook canvas or mounted subtree. */
  bindToRoot(root: HTMLElement): this {
    this._context = within(root);
    this._root = root as T;
    return this;
  }

  protected getUser() {
    return getSharedUserAgent();
  }

  async userClick(): Promise<void> {
    if (!this.root) throw new Error('Cannot click null root');
    await this.getUser().click(this.root);
  }

  async userType(
    text: string,
    options: Record<string, unknown> = {
      initialSelectionStart: 0,
      initialSelectionEnd: Number.POSITIVE_INFINITY,
    },
  ): Promise<void> {
    if (!this.root) throw new Error('Cannot type on null root');
    await this.getUser().type(this.root, text, options);
  }

  async userHover(): Promise<void> {
    if (!this.root) throw new Error('Cannot hover null root');
    await this.getUser().hover(this.root);
  }

  fireChange(value: string, { blurAfter = true }: { blurAfter?: boolean } = {}): void {
    if (!this.root) throw new Error('Cannot fire change on null root');
    fireEvent.change(this.root, { target: { value } });
    if (blurAfter) fireEvent.blur(this.root);
  }

  static async dndTo(
    dragSource: HTMLElement,
    dropTarget: HTMLElement,
  ): Promise<void> {
    const transfer = ComponentTestObject.createMutableHtml5DataTransfer();
    await act(async () => {
      fireEvent.dragStart(dragSource, { dataTransfer: transfer });
      fireEvent.dragOver(dropTarget, { dataTransfer: transfer });
      fireEvent.drop(dropTarget, { dataTransfer: transfer });
    });
  }

  static createMutableHtml5DataTransfer(): DataTransfer {
    const store = new Map<string, string>();
    const dt = {
      dropEffect: 'none' as DataTransfer['dropEffect'],
      effectAllowed: 'all' as DataTransfer['effectAllowed'],
      setData(format: string, data: string) {
        store.set(format, data);
      },
      getData(format: string) {
        return store.get(format) ?? '';
      },
      clearData() {
        store.clear();
      },
      get types() {
        return [...store.keys()] as unknown as DataTransfer['types'];
      },
    };
    return dt as unknown as DataTransfer;
  }
}

export function bindQueries(root: HTMLElement): QueryContext {
  return within(root) as unknown as QueryContext;
}
