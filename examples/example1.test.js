/* eslint-disable import/no-extraneous-dependencies, no-console */
import { jest } from '@jest/globals';

describe('Examples', () => {
  /** @type {any} */
  let consoleLog;
  beforeEach(() => {
    consoleLog = jest.spyOn(console, 'log');
  });
  afterEach(() => {
    jest.resetModules();
  });

  test('Example 1', async () => {
    expect.assertions(4);
    await import('./example1.js');
    // await require('./example1.js');
    expect(consoleLog).toHaveBeenCalledTimes(3);
    expect(consoleLog.mock.calls[0]).toEqual([true]);
    expect(consoleLog.mock.calls[1]).toEqual(['executed', expect.any(Function), expect.any(Function)]);
    expect(consoleLog.mock.calls[2]).toEqual([123]);
  });
});
