import type { HttpHandler } from '@pco/msw';
import { createMockSession } from '@pco/msw';
import { MswViewTestObject } from '@pco/react';
import { ComponentTestObject } from '@pco/queries';

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

export type MswStorySession<T extends MswViewTestObject> = {
  handlers: HttpHandler[];
  view: T;
  mocks: ReturnType<T['setupMockData']>;
};

/**
 * One-time mock session for a story: share handlers in `parameters.msw` and `mocks` in `play`.
 * Call at module scope when defining the story (not inside `play`).
 */
export function createMswStorySession<T extends MswViewTestObject>(
  ViewClass: new () => T,
  configure?: (view: T) => void,
): MswStorySession<T> {
  const session = createMockSession(() => {
    const view = new ViewClass();
    configure?.(view);
    return view;
  });
  return { handlers: session.handlers, view: session.instance, mocks: session.mocks };
}

export type DefineMswViewStoryOptions<T extends MswViewTestObject> = {
  configure?: (view: T) => void;
  play?: StoryPlayFn<T>;
};

/**
 * Storybook helpers from a ViewTestObject class:
 * - `parameters` → pass to story (`msw.handlers` for msw-storybook-addon)
 * - `play` → binds the session view to the canvas (reuses the same mock spies)
 */
export function defineMswViewStory<T extends MswViewTestObject>(
  ViewClass: new () => T,
  options: DefineMswViewStoryOptions<T> = {},
) {
  const session = createMswStorySession(ViewClass, options.configure);

  return {
    parameters: { msw: { handlers: session.handlers } },
    mocks: session.mocks,
    view: session.view,
    play: options.play
      ? async (context: StoryPlayContext) => {
          session.view.bindToRoot(context.canvasElement);
          await options.play!(session.view, context);
        }
      : undefined,
  };
}

/** Re-export expect configured for Storybook test runner. */
export { expect } from '@storybook/test';
export { setupPCOStorybook } from './setupPCOStorybook';
