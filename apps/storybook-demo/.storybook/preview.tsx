import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { initialize, mswLoader } from 'msw-storybook-addon';

import { setupPCOStorybook } from '@pco/adapter-storybook';

setupPCOStorybook();
initialize({ onUnhandledRequest: 'warn' });

const theme = createTheme();

const preview: Preview = {
  loaders: [mswLoader],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default preview;
