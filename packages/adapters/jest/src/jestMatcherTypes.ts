import '@semantic-matchers/jest/register-types';

declare module 'expect' {
  interface ClassMatchers<R, T> {
    toHaveBeenLastCalledWithUrl(expected: string | RegExp): R;
  }
}

export {};
