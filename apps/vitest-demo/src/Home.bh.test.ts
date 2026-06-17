import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DemoAppViewTestObject, HomeViewTestObject } from '@pco/demo-shared';
import { resetDemoAppManager } from '@pco/demo-shared/testing';

describe('Home view (shallow)', () => {
  it('renders items from mocked API', async () => {
    const view = new HomeViewTestObject();
    await view.render();

    expect(view.heading).toBeTruthy();
    expect(view.itemLinks).toHaveLength(3);
    expect(view.mocks.getItems).toBeTruthy();
  });
});

describe('Demo app (full mount)', () => {
  afterEach(() => {
    resetDemoAppManager();
  });

  it('navigates between views using separate test objects', async () => {
    const app = new DemoAppViewTestObject();
    await app.renderApp();

    await waitFor(() => {
      expect(app.listHeading).toBeTruthy();
    });

    const firstLink = app.itemLinks[0];
    await app.getUser().click(firstLink);

    await waitFor(() => {
      expect(app.app.getHistory().location.pathname).toBe('/items/1');
    });
  });
});
