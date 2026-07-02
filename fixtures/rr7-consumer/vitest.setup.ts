import { installPCOLifecycle } from '@pco/adapter-vitest';
import { BaseAppManager, configureViewTestObjects } from '@pco/react';

class FixtureAppManager extends BaseAppManager {
  constructor() {
    super({ wrapProviders: (children) => children });
  }
}

configureViewTestObjects({ createAppManager: () => new FixtureAppManager() });

installPCOLifecycle({ apiBaseUrl: 'http://localhost' });
