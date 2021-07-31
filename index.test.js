/* eslint-disable max-classes-per-file */
// eslint-disable-next-line import/no-extraneous-dependencies
import { jest } from '@jest/globals';
import ExtendablePromise from './index.js';
// import ExtendablePromise from './dist/index.cjs';
// const ExtendablePromise = require('./dist/index.cjs');

describe(`ExtendablePromise`, () => {
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
    describe('when an invalid executor is passed', () => {
      test('should throw an error', () => {
        expect(() => {
          promise = new ExtendablePromise();
        }).toThrow('Invalid executor type');
      });
    });
  });

  describe('#execute', () => {
    test('should execute the executor', () => {
      expect(executorFunc).not.toHaveBeenCalled();
      promise.execute();
      expect(executorFunc).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
    });
    test('should execute once', () => {
      expect(executorFunc).not.toHaveBeenCalled();
      promise.execute();
      promise.execute();
      promise.execute();
      promise.execute();
      expect(executorFunc).toHaveBeenCalledTimes(1);
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
    test('should return nothing', () => {
      expect(promise.resolve(123)).toBeUndefined();
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
    test('should return nothing', () => {
      promise.catch(() => {});
      expect(promise.reject(123)).toBeUndefined();
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

  describe('resolve/reject binding', () => {
    test('resolve', async () => {
      expect.assertions(3);
      const resolveFunc = jest.fn();
      class ResolvedPromise extends ExtendablePromise {
        constructor(...args) {
          super((resolve, reject) => {
            resolve(true);
          }, ...args);
          this.execute();
        }

        resolve(...args) {
          resolveFunc(...args);
          super.resolve(...args);
        }
      }
      const resolvedPromise = new ResolvedPromise();
      return resolvedPromise.then(result => {
        expect(result).toEqual(true);
        expect(resolveFunc).toHaveBeenCalledWith(true);
        expect(resolveFunc).toHaveBeenCalledTimes(1);
      });
    });

    test('reject', async () => {
      expect.assertions(2);
      const rejectFunc = jest.fn();
      class RejectedPromise extends ExtendablePromise {
        constructor(...args) {
          super((resolve, reject) => {
            reject(new Error('Rejected Promise'));
          }, ...args);
          this.execute();
        }

        reject(...args) {
          rejectFunc(...args);
          super.reject(...args);
        }
      }
      const rejectedPromise = new RejectedPromise();
      return rejectedPromise.catch(reason => {
        expect(reason.message).toEqual('Rejected Promise');
        expect(rejectFunc).toHaveBeenCalledTimes(1);
      });
    });
  });
});
