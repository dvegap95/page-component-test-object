import { ComponentTestObject } from '@page-component-object/queries';

import { hasMuiClass, hasMuiState, muiClass, type MuiState } from './muiClasses';

/**
 * Base for Material UI widget test objects.
 * Presets for other libraries can mirror this pattern (`@page-component-object/preset-*`).
 */
export class MuiComponentTestObject<
  T extends HTMLElement = HTMLElement,
> extends ComponentTestObject<T> {
  protected queryMui<K extends keyof HTMLElementTagNameMap = 'div'>(
    component: string,
    slot = 'root',
  ): HTMLElementTagNameMap[K] | null {
    return this.root?.querySelector(muiClass(component, slot)) ?? null;
  }

  protected closestMui(component: string, slot = 'root'): HTMLElement | null {
    return this.root?.closest(muiClass(component, slot)) ?? null;
  }

  hasMuiClass(component: string, slot = 'root'): boolean {
    return hasMuiClass(this.root, component, slot);
  }

  hasState(state: MuiState): boolean {
    return hasMuiState(this.root, state);
  }
}
