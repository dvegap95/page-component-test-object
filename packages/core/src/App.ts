import type { AppManager } from './types';

let appManager: AppManager | null = null;

/**
 * Static entry point for the app shell singleton.
 * ViewTestObjects use `App.get()` for render/history — they do not own the manager.
 */
export const App = {
  register(manager: AppManager): void {
    appManager = manager;
  },

  get(): AppManager {
    if (!appManager) {
      throw new Error(
        'AppManager not registered. Call App.register(yourAppManager) in test setup.',
      );
    }
    return appManager;
  },

  reset(): void {
    appManager?.cleanup();
    appManager = null;
  },
};
