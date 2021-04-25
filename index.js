import enumerate from '@js-bits/enumerate';

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate`
  executor
  resolve
  reject
`;

class ExtendablePromise extends Promise {
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

  execute(...args) {
    if (this[ø.executor]) {
      this[ø.executor](this[ø.resolve], this[ø.reject], ...args);
      this[ø.executor] = undefined;
    }
    return this;
  }

  resolve(...args) {
    this[ø.resolve](...args);
    return this;
  }

  reject(...args) {
    this[ø.reject](...args);
    return this;
  }
}

// https://stackoverflow.com/a/60328122
Object.defineProperty(ExtendablePromise, Symbol.species, { get: () => Promise });

export default ExtendablePromise;
