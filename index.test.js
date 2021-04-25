import { jest } from '@jest/globals';
import { cyan } from '@js-bits/log-in-color';
import ExtendablePromise from './index.js';

const env = cyan(`[${typeof window === 'undefined' ? 'node' : 'jsdom'}]`);

describe(`ExtendablePromise: ${env}`, () => {
  let executorFunc;
  let promise;
  beforeEach(() => {
    executorFunc = jest.fn();
    promise = new ExtendablePromise(executorFunc);
  });

  describe('#constructor', () => {
    test('should create an instance of Promise', () => {
      expect(promise).toBeInstanceOf(Promise);
      expect(promise.then).toBe(Promise.prototype.then);
      expect(promise.catch).toBe(Promise.prototype.catch);
      expect(promise.finally).toBe(Promise.prototype.finally);
    });
    test('should create an extended instance of Promise', () => {
      expect(promise).toBeInstanceOf(ExtendablePromise);
      expect(typeof promise.execute).toEqual('function');
      expect(typeof promise.resolve).toEqual('function');
      expect(typeof promise.reject).toEqual('function');
      expect(String(promise)).toEqual('[object ExtendablePromise]');
    });
  });
});
