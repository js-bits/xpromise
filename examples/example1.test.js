// eslint-disable-next-line import/no-extraneous-dependencies
import { jest } from '@jest/globals';

describe('Examples', () => {
  beforeEach(() => {
    console = { log: jest.fn() };
  });
  afterEach(() => {
    jest.resetModules();
  });

  test('Example 1', async () => {
    expect.assertions(4);
    await import('./example1.js');
    // await require('./example1.js');
    expect(console.log).toHaveBeenCalledTimes(3);
    expect(console.log.mock.calls[0]).toEqual([true]);
    expect(console.log.mock.calls[1]).toEqual(['executed', expect.any(Function), expect.any(Function)]);
    expect(console.log.mock.calls[2]).toEqual([123]);
  });
});
