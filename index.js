import enumerate from '@js-bits/enumerate';

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate`
  executor
  resolve
  reject
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
    super((...funcs) => {
      [resolve, reject] = funcs;
    });
    this[ø.resolve] = resolve;
    this[ø.reject] = reject;

    if (typeof executor === 'function') {
      this[ø.executor] = executor;
    } else {
      throw new Error('Invalid executor type');
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
      this[ø.executor](this[ø.resolve], this[ø.reject], ...args);
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
    return this;
  }

  /**
   * @param {Error} reason
   * @returns {Promise}
   */
  reject(...args) {
    this[ø.reject](...args);
    return this;
  }
}

// https://stackoverflow.com/a/60328122
Object.defineProperty(ExtendablePromise, Symbol.species, { get: () => Promise });

export default ExtendablePromise;
