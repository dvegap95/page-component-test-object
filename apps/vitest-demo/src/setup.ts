import { installPCOLifecycle } from '@pco/adapter-vitest';
import { configureViewTestObjects } from '@pco/react';
import { createDemoAppManager } from '@pco/demo-shared/testing';

configureViewTestObjects({ createAppManager: createDemoAppManager });

installPCOLifecycle({ apiBaseUrl: 'http://localhost' });
