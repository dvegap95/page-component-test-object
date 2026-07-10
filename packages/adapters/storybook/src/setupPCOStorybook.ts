import { fn, userEvent } from '@storybook/test';

import { configureRuntime, type UserAgent } from '@page-component-object/core';

export function setupPCOStorybook(): void {
  configureRuntime({
    spyFactory: { fn: (impl) => fn(impl) as never },
    createUserAgent: (): UserAgent => userEvent as unknown as UserAgent,
  });
}
