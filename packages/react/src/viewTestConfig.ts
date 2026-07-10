import type { AppManager } from '@page-component-object/core';

export type ViewTestConfig = {
  createAppManager: () => AppManager;
};

let viewTestConfig: ViewTestConfig | null = null;

/**
 * Call once in Vitest/Jest setup so `BaseViewTestObject` subclasses
 * do not repeat `createAppManager()` in every constructor.
 */
export function configureViewTestObjects(config: ViewTestConfig): void {
  viewTestConfig = config;
}

export function getViewTestConfig(): ViewTestConfig | null {
  return viewTestConfig;
}

export function resetViewTestConfig(): void {
  viewTestConfig = null;
}
