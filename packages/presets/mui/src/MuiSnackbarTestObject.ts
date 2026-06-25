import { within } from '@testing-library/react';

import { MuiComponentTestObject } from './MuiComponentTestObject';

export type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

/**
 * MUI Snackbar / Alert surfaces rendered in a portal (typically under `document.body`).
 */
export class MuiSnackbarTestObject extends MuiComponentTestObject {
  static get openSnackbars(): HTMLElement[] {
    return Array.from(
      document.body.querySelectorAll<HTMLElement>(
        '.MuiSnackbar-root:not([aria-hidden="true"])',
      ),
    );
  }

  get message() {
    return (
      this.queryMui('SnackbarContent')?.textContent?.trim() ??
      this.root?.textContent?.trim() ??
      ''
    );
  }

  get severity(): SnackbarSeverity | undefined {
    const alert = this.root?.querySelector('[class*="MuiAlert-standard"]');
    if (!alert) return undefined;
    if (alert.classList.contains('MuiAlert-standardSuccess')) return 'success';
    if (alert.classList.contains('MuiAlert-standardError')) return 'error';
    if (alert.classList.contains('MuiAlert-standardInfo')) return 'info';
    if (alert.classList.contains('MuiAlert-standardWarning')) return 'warning';
    return undefined;
  }

  hasMessage(text: string | RegExp): boolean {
    return within(this.root as HTMLElement).queryByText(text) !== null;
  }

  static getByMessage(
    text: string | RegExp,
    severity?: SnackbarSeverity,
  ): MuiSnackbarTestObject | null {
    const match = this.openSnackbars.find((snackbar) => {
      const instance = new MuiSnackbarTestObject(snackbar);
      if (severity && instance.severity !== severity) return false;
      return instance.hasMessage(text);
    });
    return match ? new MuiSnackbarTestObject(match) : null;
  }

  async waitForMessage(
    text: string | RegExp,
    severity?: SnackbarSeverity,
    timeout = 5000,
  ): Promise<MuiSnackbarTestObject> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const snackbar = MuiSnackbarTestObject.getByMessage(text, severity);
      if (snackbar) return snackbar;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error(
      `Snackbar with message "${String(text)}" (severity: ${severity ?? 'any'}) not found within ${timeout}ms`,
    );
  }

  async dismiss() {
    const close = this.root?.querySelector<HTMLButtonElement>('.MuiSnackbarContent-action button');
    if (close) {
      await this.getUser().click(close);
    }
  }
}
