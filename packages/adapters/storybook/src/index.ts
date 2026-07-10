import type { HttpHandler } from '@page-component-object/msw';
import { BaseViewTestObject } from '@page-component-object/react';
import { ComponentTestObject } from '@page-component-object/queries';

export type StoryPlayContext = {
  canvasElement: HTMLElement;
};

export type StoryPlayFn<T extends ComponentTestObject> = (
  view: T,
  context: StoryPlayContext,
) => Promise<void> | void;

/**
 * Binds a ViewTestObject to the Storybook canvas and runs play interactions.
 * The story must render the same UI the ViewTestObject targets.
 */
export function createStoryPlay<T extends ComponentTestObject>(
  createView: () => T,
  playFn: StoryPlayFn<T>,
) {
  return async ({ canvasElement }: StoryPlayContext) => {
    const view = createView();
    view.bindToRoot(canvasElement);
    await playFn(view, { canvasElement });
  };
}

export type ViewMockSession<T extends BaseViewTestObject> = {
  handlers: HttpHandler[];
  view: T;
  mocks: ReturnType<T['setupMockData']>;
};

type ViewTestObjectClass<T extends BaseViewTestObject> = {
  new (): T;
  mockSession(setupMocks?: (view: T, mocks: ReturnType<T['setupMockData']>) => void): ViewMockSession<T>;
};

/**
 * One-time mock session for a story: share handlers in `parameters.msw` and `mocks` in optional `play`.
 * Call at module scope when defining the story (not inside `play`).
 */
export function createViewMockSession<T extends BaseViewTestObject>(
  ViewClass: ViewTestObjectClass<T>,
  setupMocks?: (view: T, mocks: ReturnType<T['setupMockData']>) => void,
): ViewMockSession<T> {
  return ViewClass.mockSession(setupMocks);
}

export type DefineViewStoryOptions<T extends BaseViewTestObject> = {
  setupMocks?: (view: T, mocks: ReturnType<T['setupMockData']>) => void;
};

/**
 * Storybook helpers from a ViewTestObject class — parameters and session only (no bundled `play`).
 */
export function defineViewStory<T extends BaseViewTestObject>(
  ViewClass: ViewTestObjectClass<T>,
  options: DefineViewStoryOptions<T> = {},
) {
  const session = createViewMockSession(ViewClass, options.setupMocks);

  return {
    parameters: { msw: { handlers: session.handlers } },
    mocks: session.mocks,
    view: session.view,
  };
}

/** Re-export expect configured for Storybook test runner. */
export { expect } from '@storybook/test';
export { setupPCOStorybook } from './setupPCOStorybook';
export {
  getStorybookMswPreviewConfig,
  type StorybookMswPreviewOptions,
  type MswParameters,
} from './getStorybookMswPreviewConfig';
export {
  pcoViewLoader,
  createViewAssertionPlay,
  type PcoViewConfig,
  type PcoStoryParameters,
  type ViewAssertionContext,
} from './pcoViewLoader';
