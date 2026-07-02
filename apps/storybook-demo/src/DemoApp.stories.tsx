import type { Meta, StoryObj } from '@storybook/react';
import { waitFor } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';
import {
  createViewAssertionPlay,
  expect,
} from '@pco/adapter-storybook';
import { DemoApp, DemoAppViewTestObject } from '@pco/demo-shared';

const meta: Meta<typeof DemoApp> = {
  title: 'Catalog/DemoApp (MSW)',
  component: DemoApp,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof DemoApp>;

export const WithMockedApi: Story = {
  parameters: DemoAppViewTestObject.storyParameters(),
};

export const EmptyList: Story = {
  parameters: DemoAppViewTestObject.storyParameters((view) => {
    view.items = [];
  }),
};

export const EmptyListViaPcoView: Story = {
  parameters: {
    pco: {
      view: DemoAppViewTestObject,
      setupMocks: (view) => {
        view.items = [];
      },
    },
  },
  play: createViewAssertionPlay(async ({ view, mocks }) => {
    await waitFor(() => {
      expect(view.listHeading).toBeTruthy();
    });
    expect(view.itemLinks).toHaveLength(0);
    expect(mocks.getItems).toHaveBeenCalled();
  }),
};
