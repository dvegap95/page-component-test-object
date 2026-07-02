import { applyRequestHandlers } from 'msw-storybook-addon';

import type { MockSession } from '@pco/msw';
import { BaseViewTestObject } from '@pco/react';

export type PcoViewConfig<T extends BaseViewTestObject = BaseViewTestObject> = {
  view: ViewTestObjectClass<T>;
  setupMocks?: (view: T) => void;
};

export type PcoStoryParameters = {
  pco?: PcoViewConfig;
};

type ViewMockSession<T extends BaseViewTestObject> = MockSession<T> & { view: T };

type ViewTestObjectClass<T extends BaseViewTestObject> = {
  new (): T;
  mockSession(setupMocks?: (view: T) => void): ViewMockSession<T>;
};

/**
 * Storybook loader: resolves `parameters.pco` into MSW handlers before render.
 * No-op when `pco.view` is absent. Pair with `getStorybookMswPreviewConfig()`.
 */
export async function pcoViewLoader({
  parameters,
}: {
  parameters: PcoStoryParameters;
}): Promise<{ pco?: { session: ViewMockSession<BaseViewTestObject> } }> {
  const config = parameters.pco;
  if (!config?.view) {
    return {};
  }

  const session = config.view.mockSession(config.setupMocks);
  await applyRequestHandlers({ handlers: session.handlers });

  return { pco: { session } };
}

export type ViewAssertionContext<T extends BaseViewTestObject> = {
  view: T;
  mocks: ReturnType<T['setupMockData']>;
  canvasElement: HTMLElement;
};

/**
 * Optional test-runner play that asserts against spies from `pcoViewLoader`.
 */
export function createViewAssertionPlay<T extends BaseViewTestObject>(
  fn: (ctx: ViewAssertionContext<T>) => Promise<void> | void,
) {
  return async ({
    canvasElement,
    loaded,
  }: {
    canvasElement: HTMLElement;
    loaded: { pco?: { session: MockSession<T> & { view: T } } };
  }) => {
    const session = loaded.pco?.session;
    if (!session) {
      throw new Error(
        'createViewAssertionPlay requires parameters.pco.view and pcoViewLoader in preview loaders',
      );
    }
    session.view.bindToRoot(canvasElement);
    await fn({ view: session.view, mocks: session.mocks, canvasElement });
  };
}
