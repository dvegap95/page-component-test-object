import '@semantic-matchers/core';

import type {
  MatchersForInstance,
  SemanticClassMatchers,
  SemanticMatchers,
} from '@semantic-matchers/core';

declare module 'vitest' {
  interface Assertion<T = any>
    extends SemanticMatchers<Promise<void>>,
      MatchersForInstance<T, Promise<void>>,
      SemanticClassMatchers<Promise<void>, T> {}
}

declare global {
  namespace Chai {
    interface Assertion {
      toHaveBeenLastCalledWithUrl(expected: string | RegExp): void;
    }
  }
}

export {};
