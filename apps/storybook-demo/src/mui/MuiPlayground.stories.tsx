import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor } from '@storybook/test';
import { createStoryPlay, expect } from '@page-component-object/adapter-storybook';
import {
  MuiButtonTestObject,
  MuiFormFieldTestObject,
  MuiSelectTestObject,
  MuiSnackbarTestObject,
  MuiTableRowTestObject,
  MuiTimePickerTestObject,
} from '@page-component-object/preset-mui';
import { ComponentTestObject } from '@page-component-object/queries';

import { MuiPlayground } from './MuiPlayground';

const meta: Meta<typeof MuiPlayground> = {
  title: 'MUI/Playground',
  component: MuiPlayground,
};

export default meta;

type Story = StoryObj<typeof MuiPlayground>;

export const Default: Story = {};

export const TextFieldPlay: Story = {
  play: createStoryPlay(
    () => new ComponentTestObject(),
    async (root) => {
      const nameField = MuiFormFieldTestObject.getInstanceByLabel('Name', root);
      await nameField.input.userType('Al');
      expect(nameField.hasErrorState).toBe(true);
      await nameField.input.userType('ice');
      expect(nameField.inputValue).toBe('Alice');
    },
  ),
};

export const SelectPlay: Story = {
  play: createStoryPlay(
    () => new ComponentTestObject(),
    async (root) => {
      const select = MuiSelectTestObject.selectByLabel(root, 'Role');
      await select.selectOptionByText('Editor');
      expect(select.valueText).toBe('Editor');
    },
  ),
};

export const TimePickerPlay: Story = {
  play: createStoryPlay(
    () => new ComponentTestObject(),
    async (root) => {
      const time = MuiTimePickerTestObject.getInstanceByLabel('Shift start', root);
      await time.setTime('10:30');
      expect(time.inputValue).toBe('10:30');
    },
  ),
};

export const TableRowPlay: Story = {
  play: createStoryPlay(
    () => new ComponentTestObject(),
    async (root) => {
      const table = root.context.getByRole('table', { name: /team members/i });
      const rows = MuiTableRowTestObject.rowsIn(new ComponentTestObject(table));
      const firstRole = rows[1]?.getByHeaderId('col-role');
      expect(firstRole?.root?.textContent).toBe('Editor');
    },
  ),
};

export const SnackbarPlay: Story = {
  play: async ({ canvasElement }) => {
    const root = new ComponentTestObject(canvasElement);
    const saveButton = MuiButtonTestObject.getInstanceByName('Save', root);
    await userEvent.click(saveButton.root!);

    await waitFor(() => {
      const snackbar = MuiSnackbarTestObject.getByMessage('Saved successfully', 'success');
      expect(snackbar).toBeTruthy();
    });
  },
};
