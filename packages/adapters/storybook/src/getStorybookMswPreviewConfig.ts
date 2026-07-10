import {
  initialize,
  mswLoader,
  type MswParameters,
} from 'msw-storybook-addon';

import { pcoViewLoader } from './pcoViewLoader';

export type StorybookMswPreviewOptions = Parameters<typeof initialize>[0] & {
  /** When true (default), include `pcoViewLoader` before `mswLoader` for `parameters.pco.view`. */
  pcoViewLoader?: boolean;
};

let mswInitialized = false;

/**
 * MSW wiring for `.storybook/preview.ts` when using `BaseViewTestObject.storyParameters` or `parameters.pco.view`.
 *
 * @example
 * ```ts
 * import { setupPCOStorybook, getStorybookMswPreviewConfig } from '@page-component-object/adapter-storybook';
 *
 * const msw = getStorybookMswPreviewConfig({ onUnhandledRequest: 'warn' });
 * setupPCOStorybook();
 * msw.initializeMsw();
 *
 * const preview: Preview = {
 *   loaders: msw.loaders,
 *   // …decorators, parameters
 * };
 * ```
 */
export function getStorybookMswPreviewConfig(
  options: StorybookMswPreviewOptions = { onUnhandledRequest: 'warn' },
) {
  const { pcoViewLoader: usePcoViewLoader = true, ...initializeOptions } = options;

  return {
    /** Call once at module scope in preview (before exporting `preview`). */
    initializeMsw() {
      if (!mswInitialized) {
        initialize(initializeOptions);
        mswInitialized = true;
      }
    },
    /** Spread onto `Preview.loaders` — required for `parameters.msw.handlers` and `parameters.pco.view`. */
    loaders: usePcoViewLoader ? ([pcoViewLoader, mswLoader] as const) : ([mswLoader] as const),
  };
}

export type { MswParameters };
