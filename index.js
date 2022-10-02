import enumerate from '@js-bits/enumerate';

const { Prefix } = enumerate;

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate`
  executor
  resolve
  reject
`;

const ERRORS = enumerate(Prefix('ExtendablePromise|'))`
  InstantiationError
  ExecutionError
`;

/**
 * @class
 * @extends {Promise}
 */
class ExtendablePromise extends Promise {
  /**
   * @param {Function} executor
   */
  constructor(executor) {
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
   * @returns {Promise}
   */
  execute(...args) {
    if (this[ø.executor]) {
      this[ø.executor](this.resolve.bind(this), this.reject.bind(this), ...args);
      this[ø.executor] = undefined;
    }
    return this;
  }

  /**
   * @param {any} result
   * @returns {Promise}
   */
  resolve(...args) {
    this[ø.resolve](...args);
    // return this; // don't do this
  }

  /**
   * @param {Error} reason
   * @returns {Promise}
   */
  reject(...args) {
    this[ø.reject](...args);
    // returning anything can lead to a subsequent exceptions
    // for cases like promise.catch(xpromise.reject.bind(xpromise))
    // return this; // don't do this
  }
}

Object.assign(ExtendablePromise, ERRORS);

// https://stackoverflow.com/a/60328122
Object.defineProperty(ExtendablePromise, Symbol.species, { get: () => Promise });

export default ExtendablePromise;
