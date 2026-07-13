import userEvent from '@testing-library/user-event';

import type { UserAgent } from '@page-component-object/core';

import { resolvePcoElement } from './resolveElement';

type UserEventSetup = ReturnType<typeof userEvent.setup>;

/** RTL user agent that unwraps PCOTarget proxies for native user-event APIs. */
export function createRtlUserAgent(): UserAgent {
  const base: UserEventSetup = userEvent.setup();
  const el = (target: Element) => resolvePcoElement(target) as HTMLElement;

  return {
    click: (target, options) =>
      (base.click as (t: HTMLElement, o?: Record<string, unknown>) => ReturnType<UserEventSetup['click']>)(
        el(target),
        options,
      ),
    dblClick: (target, options) =>
      (base.dblClick as (t: HTMLElement, o?: Record<string, unknown>) => ReturnType<UserEventSetup['dblClick']>)(
        el(target),
        options,
      ),
    hover: (target, options) =>
      (base.hover as (t: HTMLElement, o?: Record<string, unknown>) => ReturnType<UserEventSetup['hover']>)(
        el(target),
        options,
      ),
    type: (target, text, options) =>
      (base.type as (
        t: HTMLElement,
        text: string,
        o?: Record<string, unknown>,
      ) => ReturnType<UserEventSetup['type']>)(el(target), text, options),
    keyboard: (text, options) =>
      (base.keyboard as (t: string, o?: Record<string, unknown>) => ReturnType<UserEventSetup['keyboard']>)(
        text,
        options,
      ),
    tab: (options) =>
      (base.tab as (o?: Record<string, unknown>) => ReturnType<UserEventSetup['tab']>)(options),
    upload: (target, files) => base.upload(el(target), files),
  };
}
