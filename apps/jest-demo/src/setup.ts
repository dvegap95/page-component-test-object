import { installPCOLifecycle } from '@page-component-object/adapter-jest';
import { configureViewTestObjects } from '@page-component-object/react';
import { createDemoAppManager } from '@page-component-object/demo-shared/testing';

configureViewTestObjects({ createAppManager: createDemoAppManager });

installPCOLifecycle({ apiBaseUrl: 'http://localhost' });
