import enumerate from '@js-bits/enumerate';

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate.ts(`
  executor
  resolve
  reject
`);

/**
 * Allows extension of JavaScript's standard, built-in `Promise` class.
 * Decouples an asynchronous operation that ties an outcome to a promise from the constructor.
 * @template T
 * @extends {Promise<T>}
 */
class ExtendablePromise extends Promise {
  /**
   * Creates new `ExtendablePromise` instance.
   * @param {import('./types').ExecutorFunc<T>} executor - A function to be executed by the `.execute()` method
   * @throws {typeof ExtendablePromise.InstantiationError}
   */
  constructor(executor) {
    /** @type {import('./types').Resolve<T>} */
    let resolve;
    /** @type {import('./types').Reject} */
    let reject;
    super((res, rej) => {
      resolve = res;
      reject = rej;
    });

    /**
     * @readonly
     */
    // @ts-expect-error ts(2454)
    this[ø.resolve] = resolve;

    /**
     * @readonly
     */
    // @ts-expect-error ts(2454)
    this[ø.reject] = reject;

    if (typeof executor === 'function') {
      /** @type {import('./types').ExecutorFunc<T> | undefined} */
      this[ø.executor] = executor;
    } else {
      const error = new Error(`Invalid executor type: ${executor === null ? 'null' : typeof executor}`);
      // eslint-disable-next-line no-use-before-define
      error.name = ERRORS.InstantiationError;
      throw error;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get [Symbol.toStringTag]() {
    return ExtendablePromise.name;
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
        /** @type {import('./types').ExecutorFunc<T>} */ (this[ø.executor])(
          this.resolve.bind(this),
          this.reject.bind(this),
          ...args
        );
      } catch (cause) {
        const error = new Error('Promise execution failed. See "cause" property for details');
        error.cause = cause;
        // eslint-disable-next-line no-use-before-define
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

const ERRORS = enumerate.ts(
  `
  InstantiationError
  ExecutionError
`,
  `${ExtendablePromise.name}|`
);

// https://stackoverflow.com/a/60328122
Object.defineProperty(ExtendablePromise, Symbol.species, { get: () => Promise });

// Assigning properties one by one helps typescript to declare the namespace properly
ExtendablePromise.ExecutionError = ERRORS.ExecutionError;
ExtendablePromise.InstantiationError = ERRORS.InstantiationError;

export default ExtendablePromise;
