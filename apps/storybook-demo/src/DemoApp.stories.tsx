import type { Meta, StoryObj } from '@storybook/react';
import { waitFor } from '@storybook/test';
import { MemoryRouter } from 'react-router-dom';
import { defineMswViewStory, expect } from '@pco/adapter-storybook';
import { DemoApp, DemoAppViewTestObject } from '@pco/demo-shared';

const mswStory = defineMswViewStory(DemoAppViewTestObject);

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
  parameters: mswStory.parameters,
  play: async (context) => {
    mswStory.view.bindToRoot(context.canvasElement);
    await waitFor(() => {
      expect(mswStory.view.listHeading).toBeTruthy();
    });
    expect(mswStory.view.itemLinks).toHaveLength(3);
    expect(mswStory.mocks.getItems).toHaveBeenCalled();
  },
};
