import enumerate from '@js-bits/enumerate';

const { Prefix } = enumerate;

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate.ts(`
  executor
  resolve
  reject
`);

/**
 * @typedef {{
 *   InstantiationError: 'ExtendablePromise|InstantiationError',
 *   ExecutionError: 'ExtendablePromise|ExecutionError'
 * }} ErrorsEnum
 */

/** @type {ErrorsEnum} */
const ERRORS = enumerate.ts(
  `
  InstantiationError
  ExecutionError
`,
  Prefix('ExtendablePromise|')
);

class ExtendablePromise extends Promise {
  /**
   * @param {Function} executor
   */
  constructor(executor, /** @type {unknown[]} */ ...rest) {
    let resolve;
    let reject;
    super((...args) => {
      [resolve, reject] = args;
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
   * @param {...any} args
   * @returns {ExtendablePromise}
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
   * @param {unknown} result
   * @returns {ExtendablePromise}
   */
  resolve(result, /** @type {unknown[]} */ ...rest) {
    this[ø.resolve](result, ...rest);
    return this;
  }

  /**
   * @param {Error} reason
   * @returns {ExtendablePromise}
   */
  reject(reason, /** @type {unknown[]} */ ...args) {
    this[ø.reject](reason, ...args);
    return this;
  }
}

// https://stackoverflow.com/a/60328122
Object.defineProperty(ExtendablePromise, Symbol.species, { get: () => Promise });

export default Object.assign(ExtendablePromise, ERRORS);
