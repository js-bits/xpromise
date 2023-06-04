'use strict';

var enumerate = require('@js-bits/enumerate');

const { Prefix } = enumerate;

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate.ts(`
  executor
  resolve
  reject
`);

const ERRORS = enumerate.ts(
  `
  InstantiationError
  ExecutionError
`,
  Prefix('ExtendablePromise|')
);

/**
 * @template T
 * @typedef {(value: T | PromiseLike<T>, ...rest:unknown[]) => void} Resolve
 */

/**
 * @typedef {(reason?: Error) => void} Reject
 */

/**
 * @template T
 * @extends {Promise<T>}
 */
class ExtendablePromise extends Promise {
  /** @type {'ExtendablePromise|InstantiationError'} */
  static InstantiationError = ERRORS.InstantiationError;

  /** @type {'ExtendablePromise|ExecutionError'} */
  static ExecutionError = ERRORS.ExecutionError;

  /**
   * @param {(resolve:Resolve<T>, reject:Reject, ...rest:unknown[]) => void} executor
   */
  constructor(executor) {
    /** @type {Resolve<T>} */
    let resolve;
    /** @type {Reject} */
    let reject;
    super((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this[ø.resolve] = resolve;
    this[ø.reject] = reject;

    if (typeof executor === 'function') {
      this[ø.executor] = executor;
    } else {
      const error = new Error(`Invalid executor type: ${executor === null ? 'null' : typeof executor}`);
      error.name = ERRORS.InstantiationError;
      throw error;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return 'ExtendablePromise';
  }

  /**
   * @param {...unknown} args
   * @returns {ExtendablePromise<T>}
   */
  execute(...args) {
    if (this[ø.executor]) {
      try {
        this[ø.executor](this.resolve.bind(this), this.reject.bind(this), ...args);
      } catch (cause) {
        const error = new Error('Promise execution failed. See "cause" property for details');
        error.cause = cause;
        error.name = ERRORS.ExecutionError;
        this.reject(error);
      }
      this[ø.executor] = undefined;
    }
    return this;
  }

  /**
   * @param {T} result
   * @returns {ExtendablePromise<T>}
   */
  resolve(result) {
    this[ø.resolve](result);
    return this;
  }

  /**
   * @param {Error} reason
   * @returns {ExtendablePromise<T>}
   */
  reject(reason) {
    this[ø.reject](reason);
    return this;
  }
}

// https://stackoverflow.com/a/60328122
Object.defineProperty(ExtendablePromise, Symbol.species, { get: () => Promise });

module.exports = ExtendablePromise;
