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

  describe('#execute', () => {
    test('should execute the executor', () => {
      expect(executorFunc).not.toHaveBeenCalled();
      promise.execute();
      expect(executorFunc).toHaveBeenCalled();
    });
    test('should return the promise', () => {
      expect(promise.execute()).toBe(promise);
    });
  });

  describe('#resolve', () => {
    describe('should resolve the promise', () => {
      test('.then()', async () => {
        expect.assertions(2);
        setTimeout(() => {
          promise.resolve(123);
        }, 100);
        return promise
          .then(result => {
            expect(result).toEqual(123);
          })
          .finally(result => {
            expect(result).toBeUndefined();
          });
      });
      test('await', async () => {
        expect.assertions(1);
        setTimeout(() => {
          promise.resolve(123);
        }, 100);
        const result = await promise;
        expect(result).toEqual(123);
      });
    });
    test('should return the promise', () => {
      expect(promise.resolve(123)).toBe(promise);
    });
  });

  describe('#reject', () => {
    describe('should reject the promise', () => {
      test('.catch()', async () => {
        expect.assertions(1);
        setTimeout(() => {
          promise.reject(new Error('rejected'));
        }, 100);
        await expect(promise).rejects.toThrow('rejected');
      });
      test('try/catch', async () => {
        expect.assertions(2);
        setTimeout(() => {
          promise.reject(new Error('rejected'));
        }, 100);
        try {
          await promise;
        } catch (error) {
          expect(error.message).toEqual('rejected');
        } finally {
          expect(promise).rejects.toThrow('rejected');
        }
      });
    });
    test('should return the promise', () => {
      promise.catch(() => {});
      expect(promise.reject(123)).toBe(promise);
    });
  });

  describe('Promise static methods', () => {
    test('Promise.all()', async () => {
      expect.assertions(1);
      const promise1 = Promise.resolve('abc');
      const promise2 = true;
      setTimeout(() => {
        promise.resolve(234);
      }, 100);
      await expect(Promise.all([promise, promise1, promise2])).resolves.toEqual([234, 'abc', true]);
    });
    test('Promise.race()', async () => {
      expect.assertions(1);
      const promise1 = new Promise(() => {});
      setTimeout(() => {
        promise.reject(new Error('race rejected'));
      }, 100);
      await expect(Promise.race([promise, promise1])).rejects.toThrow('race rejected');
    });
  });
});
