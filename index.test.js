/* eslint-disable max-classes-per-file, import/no-extraneous-dependencies, no-unused-vars */
import { jest } from '@jest/globals';
import ExtendablePromise from './index.js';
// import ExtendablePromise from './dist/index.cjs';
// const ExtendablePromise = require('./dist/index.cjs');

describe('ExtendablePromise', () => {
  let executorFunc;
  let promise;
  beforeEach(() => {
    executorFunc = jest.fn();
    promise = new ExtendablePromise(executorFunc);
    jest.resetAllMocks();
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
      describe('when null is passed', () => {
        test('should throw a sync error', () => {
          expect.assertions(3);
          promise = undefined;
          try {
            promise = new ExtendablePromise(null);
          } catch (error) {
            expect(error.name).toEqual('ExtendablePromise|InstantiationError');
            expect(error.message).toEqual('Invalid executor type: null');
          }
          expect(promise).toBeUndefined();
        });
      });
      describe('when invalid type is passed', () => {
        test('should throw a sync error', () => {
          expect.assertions(3);
          promise = undefined;
          try {
            promise = new ExtendablePromise(123);
          } catch (error) {
            expect(error.name).toEqual('ExtendablePromise|InstantiationError');
            expect(error.message).toEqual('Invalid executor type: number');
          }
          expect(promise).toBeUndefined();
        });
      });

      describe('when extended', () => {
        describe('when rejected in a constructor', () => {
          test('should throw an async error', async () => {
            expect.assertions(3);
            class MyPromise extends ExtendablePromise {
              constructor() {
                super((resolve, reject) => {
                  reject('async error');
                });
                this.execute();
              }
            }
            promise = undefined;
            let result = 'unchanged';
            try {
              promise = new MyPromise();
              result = await promise;
            } catch (error) {
              expect(error).toEqual('async error');
            }
            expect(promise).toEqual(expect.any(ExtendablePromise));
            expect(result).toEqual('unchanged');
          });
        });
        describe('when resolved in a constructor', () => {
          test('should return resolved value', async () => {
            expect.assertions(2);
            class MyPromise extends ExtendablePromise {
              constructor() {
                super(resolve => {
                  resolve('async value');
                });
                this.execute();
              }
            }
            promise = undefined;
            promise = new MyPromise();
            const result = await promise;
            expect(promise).toEqual(expect.any(MyPromise));
            expect(result).toEqual('async value');
          });
        });
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

    describe('when executed with error', () => {
      test('should reject the promise', async () => {
        expect.assertions(3);
        expect(executorFunc).not.toHaveBeenCalled();
        executorFunc.mockImplementation(() => {
          throw new Error('Executor error');
        });
        promise.execute();
        await expect(promise).rejects.toThrow('Promise execution failed. See "cause" property for details');
        expect(executorFunc).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
      });

      describe('try/catch', () => {
        test('should reject the promise', async () => {
          expect.assertions(7);
          expect(executorFunc).not.toHaveBeenCalled();
          executorFunc.mockImplementation(() => {
            throw new Error('Executor error');
          });
          let result;
          try {
            result = await promise.execute();
          } catch (error) {
            expect(error.name).toEqual('ExtendablePromise|ExecutionError');
            expect(error.message).toEqual('Promise execution failed. See "cause" property for details');
            expect(error.cause).toEqual(expect.any(Error));
            expect(error.cause.message).toEqual('Executor error');
          }
          expect(result).toBeUndefined();
          expect(executorFunc).toHaveBeenCalledWith(expect.any(Function), expect.any(Function));
        });
      });
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
    test('should return promise instance', () => {
      expect(promise.resolve(123)).toBe(promise);
    });
    test('should return only first argument', () => {
      expect.assertions(1);
      return promise.resolve(11, 22, 33).then((...args) => {
        expect(args).toEqual([11]);
      });
    });
    describe('when bound to another promise', () => {
      test('should return resolved promise', async () => {
        expect.assertions(3);
        const anotherPromise = Promise.resolve(234);
        const result = await anotherPromise.then(promise.resolve.bind(promise));
        await expect(anotherPromise).resolves.toEqual(234);
        await expect(promise).resolves.toEqual(234);
        expect(result).toEqual(234);
      });
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
    test('should return promise instance', async () => {
      expect.assertions(2);
      expect(promise.reject('async error')).toBe(promise);
      try {
        await promise;
      } catch (error) {
        expect(error).toEqual('async error');
      }
    });
    describe('when bound to another promise', () => {
      test('should return rejected promise', async () => {
        expect.assertions(4);
        let reject;
        const anotherPromise = new Promise((...args) => {
          [, reject] = args;
        });
        reject('error');
        let result;
        try {
          result = await anotherPromise.catch(promise.reject.bind(promise));
        } catch (reason) {
          expect(reason).toEqual('error');
        }
        await expect(anotherPromise).rejects.toEqual('error');
        await expect(promise).rejects.toEqual('error');
        expect(result).toBeUndefined();
      });
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

describe('Promise', () => {
  describe('immediately resoled', () => {
    test('should return async value', async () => {
      expect.assertions(1);
      const promise = new Promise(resolve => {
        resolve(12345);
      });
      const result = await promise;
      expect(result).toEqual(12345);
    });
  });
  describe('immediately rejected', () => {
    test('should throw an error', async () => {
      expect.assertions(3);
      const promise = new Promise((resolve, reject) => {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('async error');
      });
      let result = 'unchanged';
      try {
        result = await promise;
      } catch (error) {
        expect(error).toEqual('async error');
      }
      expect(promise).toBeInstanceOf(Promise);
      expect(result).toEqual('unchanged');
    });
  });
  describe('Promise.resolve', () => {
    test('should return async value', async () => {
      expect.assertions(1);
      const promise = Promise.resolve(9876);
      const result = await promise;
      expect(result).toEqual(9876);
    });
    test('should return only first argument', () => {
      expect.assertions(1);
      const promise = Promise.resolve(1, 2, 3);
      return promise.then((...args) => {
        expect(args).toEqual([1]);
      });
    });
  });
  describe('Promise.reject', () => {
    test('should throw an error', async () => {
      expect.assertions(3);
      // eslint-disable-next-line prefer-promise-reject-errors
      const promise = Promise.reject('async error');
      let result = 'unchanged';
      try {
        result = await promise;
      } catch (error) {
        expect(error).toEqual('async error');
      }
      expect(promise).toBeInstanceOf(Promise);
      expect(result).toEqual('unchanged');
    });
  });
});
