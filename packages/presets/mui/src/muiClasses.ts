export type MuiState = 'error' | 'disabled' | 'focused' | 'readOnly';

/** Pascal-case MUI component segment, e.g. `TextField` → `MuiTextField`. */
export function muiClassPrefix(component: string): string {
  const normalized = component.startsWith('Mui') ? component.slice(3) : component;
  return `Mui${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
}

/** Full class selector aligned with MUI's `generateUtilityClass` pattern. */
export function muiClass(component: string, slot = 'root'): string {
  return `.${muiClassPrefix(component)}-${slot}`;
}

export function hasMuiClass(
  element: Element | null | undefined,
  component: string,
  slot = 'root',
): boolean {
  return element?.classList.contains(`${muiClassPrefix(component)}-${slot}`) ?? false;
}

export function hasMuiState(element: Element | null | undefined, state: MuiState): boolean {
  if (!element) return false;

  switch (state) {
    case 'error':
      return element.classList.contains('Mui-error');
    case 'disabled':
      return (
        element.classList.contains('Mui-disabled') ||
        element.hasAttribute('disabled') ||
        element.getAttribute('aria-disabled') === 'true'
      );
    case 'focused':
      return element.classList.contains('Mui-focused');
    case 'readOnly':
      return element.classList.contains('Mui-readOnly') || element.hasAttribute('readonly');
    default:
      return false;
  }
}

/** Visible MUI popovers/menus (Select, Autocomplete, DatePicker, etc.). */
export const OPEN_POPOVER_SELECTOR = [
  `[id^="menu-"]:not([aria-hidden="true"])`,
  `.MuiPopover-root:not([aria-hidden="true"])`,
  `.MuiPopper-root:not([aria-hidden="true"])`,
  `.MuiMenu-root:not([aria-hidden="true"])`,
].join(',');
