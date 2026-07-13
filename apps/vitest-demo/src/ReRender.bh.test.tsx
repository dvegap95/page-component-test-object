import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ReRenderTable } from '@page-component-object/demo-shared/views/ReRenderTable';
import { ReRenderTableTestObject } from '@page-component-object/demo-shared/views/ReRenderTable.to';

describe('ReRender table (PCOTarget re-resolution)', () => {
  it('cellButton.userClick() works after intentional re-render', async () => {
    const rows = [
      { id: '1', label: 'Row A' },
      { id: '2', label: 'Row B' },
      { id: '3', label: 'Row C' },
      { id: '4', label: 'Row D' },
    ];

    const { container } = render(<ReRenderTable rows={rows} />);
    const view = new ReRenderTableTestObject(container);

    const cell = view.cellButton(3);
    await view.rerenderButton.userClick();

    await cell.userClick();
    expect(view.status.textContent).toContain('version:1');
  });
});
