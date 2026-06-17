import { describe, expect, it } from '@jest/globals';

import { setupPCO } from '@pco/adapter-jest';
import { ObjectFactory, getRuntime } from '@pco/core';

describe('Jest adapter smoke', () => {
  it('configures PCO runtime with jest.fn spy factory', () => {
    setupPCO();
    const spy = getRuntime().spyFactory.fn(() => 'ok');
    expect(spy()).toBe('ok');
    expect(spy.mock.calls).toHaveLength(1);
  });
});

describe('ObjectFactory', () => {
  it('builds frozen test data', () => {
    const item = new ObjectFactory({ id: '1', name: 'Test' }).build();
    expect(item.name).toBe('Test');
    expect(Object.isFrozen(item)).toBe(true);
  });
});
