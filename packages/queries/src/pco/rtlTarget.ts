import { getSharedUserAgent } from '@page-component-object/core';
import type {
  ContextResolver,
  PCOClickOptions,
  PCOTargetBase,
  PCOTypeOptions,
} from '@page-component-object/core';

const TARGET_METHODS = new Set([
  'userClick',
  'userType',
  'userClear',
  'userHover',
  'rootResolver',
  'then',
  'catch',
  'finally',
]);

export type RtlElementTarget = HTMLElement & PCOTargetBase<HTMLElement>;

export function createSyncTarget(
  rootResolver: ContextResolver<HTMLElement>,
  elementResolver: () => HTMLElement,
): RtlElementTarget {
  const actions = {
    rootResolver: () => elementResolver(),
    userClick: async (options?: PCOClickOptions) => {
      await getSharedUserAgent().click(elementResolver(), options);
    },
    userType: async (text: string, options?: PCOTypeOptions) => {
      await getSharedUserAgent().type(elementResolver(), text, options);
    },
    userClear: async () => {
      await getSharedUserAgent().type(elementResolver(), '{selectall}{backspace}');
    },
    userHover: async () => {
      await getSharedUserAgent().hover(elementResolver());
    },
  };

  return new Proxy(actions, {
    get(target, prop, receiver) {
      if (typeof prop === 'symbol') return Reflect.get(target, prop, receiver);
      if (TARGET_METHODS.has(prop)) {
        return (target as Record<string, unknown>)[prop];
      }
      const el = elementResolver();
      const value = (el as unknown as Record<string, unknown>)[prop];
      if (typeof value === 'function') {
        return value.bind(el);
      }
      return value;
    },
  }) as unknown as RtlElementTarget;
}

export function createAsyncTarget(
  rootResolver: ContextResolver<HTMLElement>,
  elementResolver: () => Promise<HTMLElement>,
): PCOTargetBase<HTMLElement> {
  const actions = {
    rootResolver,
    userClick: async (options?: PCOClickOptions) => {
      await getSharedUserAgent().click(await elementResolver(), options);
    },
    userType: async (text: string, options?: PCOTypeOptions) => {
      await getSharedUserAgent().type(await elementResolver(), text, options);
    },
    userClear: async () => {
      await getSharedUserAgent().type(
        await elementResolver(),
        '{selectall}{backspace}',
      );
    },
    userHover: async () => {
      await getSharedUserAgent().hover(await elementResolver());
    },
    then<TResult1 = HTMLElement, TResult2 = never>(
      onfulfilled?: ((value: HTMLElement) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return elementResolver().then(onfulfilled, onrejected);
    },
  };

  return actions as PCOTargetBase<HTMLElement>;
}
