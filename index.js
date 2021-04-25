import enumerate from '@js-bits/enumerate';

// pseudo-private properties emulation in order to avoid source code transpiling
// TODO: replace with #privateField syntax when it gains wide support
const ø = enumerate`
  executor
  resolve
  reject
`;

// https://stackoverflow.com/questions/6598945/detect-if-function-is-native-to-browser
const isNativeFunction = func =>
  typeof func === 'function' && /\{\s+\[native code\]/.test(Function.prototype.toString.call(func));

class ExtendablePromise extends Promise {
  constructor(...args) {
    const lastArg = args[args.length - 1];
    if (isNativeFunction(lastArg)) {
      // internal promise call
      // eslint-disable-next-line constructor-super
      return super(lastArg);
    }

    let resolve;
    let reject;
    super((...funcs) => {
      [resolve, reject] = funcs;
    });
    this[ø.resolve] = resolve;
    this[ø.reject] = reject;

    const [executor] = args;
    this[ø.executor] = executor;
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

export default ExtendablePromise;
