import React from 'react';

import { BaseAppManager } from '@pco/react';

let manager: DemoAppManager | null = null;

export class DemoAppManager extends BaseAppManager {
  constructor() {
    super({
      wrapProviders: (children) => <>{children}</>,
    });
  }
}

/** Creates a fresh AppManager and registers the `App` singleton for this test. */
export function createDemoAppManager(): DemoAppManager {
  manager = new DemoAppManager();
  return manager;
}

export function resetDemoAppManager(): void {
  manager = null;
}
