import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';

import { setupPCOStorybook } from '@pco/adapter-storybook';

setupPCOStorybook();
initialize({ onUnhandledRequest: 'warn' });

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    layout: 'centered',
  },
};

export default preview;
