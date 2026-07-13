import { describe, expect, it } from '@jest/globals';

import { setupPCO } from '@page-component-object/adapter-jest';
import { DataFactory, getRuntime } from '@page-component-object/core';

describe('Jest adapter smoke', () => {
  it('configures PCO runtime with jest.fn spy factory', () => {
    setupPCO();
    const spy = getRuntime().spyFactory.fn(() => 'ok');
    expect(spy()).toBe('ok');
    expect(spy.mock.calls).toHaveLength(1);
  });
});

describe('DataFactory', () => {
  it('builds frozen test data', () => {
    const item = new DataFactory({ id: '1', name: 'Test' }).build();
    expect(item.name).toBe('Test');
    expect(Object.isFrozen(item)).toBe(true);
  });
});
