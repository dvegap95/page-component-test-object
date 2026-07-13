import type { PCOTargetBase } from '@page-component-object/core';

/** Unwrap PCOTarget proxy for runner APIs that require native Element (e.g. user-event). */
export function resolvePcoElement(target: Element | PCOTargetBase): Element {
  if (target instanceof Element) {
    return target;
  }
  if (target && typeof (target as PCOTargetBase).rootResolver === 'function') {
    return (target as PCOTargetBase).rootResolver() as unknown as Element;
  }
  return target as unknown as Element;
}
