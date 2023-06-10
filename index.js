import enumerate from '@js-bits/enumerate';

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
 * Allows extension of JavaScript's standard, built-in `Promise` class.
 * Decouples an asynchronous operation that ties an outcome to a promise from the constructor.
 * @template T
 * @extends {Promise<T>}
 */
class ExtendablePromise extends Promise {
  /**
   * Creates new `ExtendablePromise` instance.
   * @param {(resolve:Resolve<T>, reject:Reject, ...rest:unknown[]) => void} executor - A function to be executed by the `.execute()` method
   * @throws {typeof ExtendablePromise.InstantiationError}
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

    /**
     * @readonly
     */
    this[ø.resolve] = resolve;

    /**
     * @readonly
     */
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
   * Executes `executor` function provided to `ExtendablePromise` constructor.
   * All arguments will be passed through to `executor` function.
   * @returns {this}
   * @throws {typeof ExtendablePromise.ExecutionError}
   */
  execute(/** @type {unknown[]} */ ...args) {
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
   * Resolves `ExtendablePromise`
   * @param result
   * @returns {this}
   */
  resolve(/** @type {T} */ result) {
    this[ø.resolve](result);
    return this;
  }

  /**
   * Rejects `ExtendablePromise`
   * @param reason
   * @returns {this}
   */
  reject(/** @type {Error} */ reason) {
    this[ø.reject](reason);
    return this;
  }
}

// https://stackoverflow.com/a/60328122
Object.defineProperty(ExtendablePromise, Symbol.species, { get: () => Promise });

// Assigning properties one by one helps typescript to declare the namespace properly
ExtendablePromise.ExecutionError = ERRORS.ExecutionError;
ExtendablePromise.InstantiationError = ERRORS.InstantiationError;

export default ExtendablePromise;
