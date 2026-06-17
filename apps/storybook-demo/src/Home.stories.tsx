import type { Meta, StoryObj } from '@storybook/react';
import { createStoryPlay, expect } from '@pco/adapter-storybook';
import { userEvent } from '@storybook/test';
import {
  CatalogHomeStoryTestObject,
  Home,
  ItemFactory,
} from '@pco/demo-shared';

const items = ItemFactory.defaultList(3);

const meta: Meta<typeof Home> = {
  title: 'Catalog/Home',
  component: Home,
};

export default meta;

type Story = StoryObj<typeof Home>;

export const Default: Story = {
  args: {
    items,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    items: [],
    loading: true,
  },
};

export const PlayWithTestObject: Story = {
  args: {
    items,
    loading: false,
  },
  play: createStoryPlay(
    () => new CatalogHomeStoryTestObject(),
    async (view) => {
      expect(view.heading).toBeTruthy();
      expect(view.itemLinks).toHaveLength(3);
      await userEvent.click(view.itemLinks[0]);
    },
  ),
};
