import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  setupPCOStorybook,
  getStorybookMswPreviewConfig,
} from '@pco/adapter-storybook';

const msw = getStorybookMswPreviewConfig({ onUnhandledRequest: 'warn' });

setupPCOStorybook();
msw.initializeMsw();

const theme = createTheme();

const preview: Preview = {
  loaders: [...msw.loaders],
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
