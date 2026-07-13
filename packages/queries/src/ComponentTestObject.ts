import { act, fireEvent } from '@testing-library/react';

import {
  getPcoAdapter,
  getSharedUserAgent,
  type ContextResolver,
  type PCOContext,
  type QueryContext,
} from '@page-component-object/core';

import { createPcoContext } from './pco';

export type TestObjectContext = PCOContext;

/**
 * DOM-scoped test object base. Scope is resolver-driven — no stored HTMLElement.
 * Default scope is `screen` / document body so view TOs work after router navigation.
 */
export default class ComponentTestObject<T extends HTMLElement = HTMLElement> {
  protected _rootResolver: ContextResolver<HTMLElement> | null;
  protected _pcoContext: PCOContext | null;
  static verbose = false;
  /** Document-level PCOContext — presets/dialogs that query portals. */
  static readonly globalContext: PCOContext = createPcoContext(() => document.body);

  constructor(root?: T | null | undefined) {
    if (root === undefined) {
      this._rootResolver = () => document.body as T;
      this._pcoContext = createPcoContext(this._rootResolver);
    } else if (root === null) {
      this._rootResolver = null;
      this._pcoContext = null;
    } else {
      const el = root;
      this._rootResolver = () => el;
      this._pcoContext = createPcoContext(this._rootResolver);
    }
  }

  get rootResolver(): ContextResolver<HTMLElement> {
    if (!this._rootResolver) {
      throw new Error(
        `Element of type ${this.constructor.name} has no valid root resolver.`,
      );
    }
    return this._rootResolver;
  }

  /** Materializes `rootResolver` on access — RTL convenience. */
  get root(): T | null {
    if (!this._rootResolver) return null;
    const adapter = getPcoAdapter();
    const materialized = adapter?.materializeRoot(this._rootResolver) ?? this._rootResolver();
    return materialized as T;
  }

  get context(): PCOContext {
    if (!this._pcoContext) {
      throw new Error(
        `Element of type ${this.constructor.name} has no valid root in the DOM.`,
      );
    }
    return this._pcoContext;
  }

  /** Preferred: bind a sync scope resolver (canvas, mounted subtree, cy chain factory). */
  bindResolver(resolver: ContextResolver<HTMLElement>): this {
    this._rootResolver = resolver;
    this._pcoContext = createPcoContext(resolver);
    return this;
  }

  /** @deprecated Use `bindResolver(() => element)`. */
  bindToRoot(root: HTMLElement): this {
    return this.bindResolver(() => root as T);
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

  /**
   * Child test object with composed resolver.
   * @example this.child(RowTO, (p) => p.context.findByRole('row', { name: /x/i }))
   */
  child<TO extends ComponentTestObject>(
    ChildCtor: new (root?: HTMLElement | null) => TO,
    compose: (parent: this) => { rootResolver: ContextResolver<HTMLElement> },
  ): TO {
    const { rootResolver } = compose(this);
    const child = new ChildCtor(null);
    child.bindResolver(rootResolver);
    return child;
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

/** @deprecated Use `this.context` (PCOContext). Legacy RTL shape for interop. */
export function bindQueries(root: HTMLElement): QueryContext {
  return createPcoContext(() => root) as unknown as QueryContext;
}
