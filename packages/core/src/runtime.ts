import type { SpyFactory, UserAgent } from './types';

export interface RuntimeConfig {
  createUserAgent: () => UserAgent;
  spyFactory: SpyFactory;
}

let runtime: RuntimeConfig | null = null;

export function configureRuntime(config: RuntimeConfig): void {
  runtime = config;
}

export function getRuntime(): RuntimeConfig {
  if (!runtime) {
    throw new Error(
      'PCO runtime not configured. Call setupPCO() from @page-component-object/adapter-vitest or @page-component-object/adapter-jest.',
    );
  }
  return runtime;
}

export function resetRuntime(): void {
  runtime = null;
}

let sharedUserAgent: UserAgent | null = null;

/** One user agent per test — preserves keyboard/pointer state (userEvent.setup). */
export function getSharedUserAgent(): UserAgent {
  if (!sharedUserAgent) {
    sharedUserAgent = getRuntime().createUserAgent();
  }
  return sharedUserAgent;
}

export function resetSharedUserAgent(): void {
  sharedUserAgent = null;
}
