import { expect } from '@storybook/test';

import { BaseViewTestObject } from '@pco/react';

export type StoryPlayContext = {
  canvasElement: HTMLElement;
};

export type StoryPlayFn<T extends BaseViewTestObject> = (
  view: T,
  context: StoryPlayContext,
) => Promise<void> | void;

/**
 * Binds a ViewTestObject to the Storybook canvas and runs play interactions.
 * The story must render the same UI the ViewTestObject targets.
 */
export function createStoryPlay<T extends BaseViewTestObject>(
  createView: () => T,
  playFn: StoryPlayFn<T>,
) {
  return async ({ canvasElement }: StoryPlayContext) => {
    const view = createView();
    view.bindToRoot(canvasElement);
    await playFn(view, { canvasElement });
  };
}

/** Re-export expect configured for Storybook test runner. */
export { expect };
