import { describe, expect, it } from 'vitest';

import { AppRoutesViewTestObject, HomeViewTestObject } from './Home.to';

describe('tarball consumer on react-router-dom v7', () => {
  it('renders a shallow view through @pco/react', async () => {
    const view = new HomeViewTestObject();
    await view.render();

    expect(view.heading).toBeTruthy();
    expect(view.mocks.getItems).toBeTruthy();
  });

  it('renders AppRoutes via renderApp (no nested router)', async () => {
    const view = new AppRoutesViewTestObject();
    await view.renderApp();

    expect(view.heading).toBeTruthy();
  });
});
