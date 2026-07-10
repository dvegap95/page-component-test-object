import { installPCOLifecycle } from '@page-component-object/adapter-vitest';
import { BaseAppManager, configureViewTestObjects } from '@page-component-object/react';

class FixtureAppManager extends BaseAppManager {
  constructor() {
    super({ wrapProviders: (children) => children });
  }
}

configureViewTestObjects({ createAppManager: () => new FixtureAppManager() });

installPCOLifecycle({ apiBaseUrl: 'http://localhost' });
