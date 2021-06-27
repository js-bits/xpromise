# Extendable Promise

Allows extension of JavaScript's standard, built-in `Promise` class and decouples an asynchronous operation that ties an outcome to a promise from the constructor.

## Installation

Install with npm:

```
npm install @js-bits/xpromise
```

Install with yarn:

```
yarn add @js-bits/xpromise
```

Import where you need it:

```javascript
import ExtendablePromise from '@js-bits/xpromise';
```

## How to use

```javascript
class MyPromise extends ExtendablePromise {
  // do whatever you need
}

const myPromise = new MyPromise((resolve, reject) => {
  console.log('executed', resolve, reject);
});
console.log(myPromise instanceof Promise); // true
myPromise.execute(); // 'executed' [Function (anonymous)] [Function (anonymous)]
myPromise.then(result => {
  console.log(result); // 123
});
myPromise.resolve(123);
```

## Notes

- Does not include any polyfills, which means that Internet Explorer is not supported.
- Requires [ECMAScript modules](https://nodejs.org/api/esm.html) to be enabled in Node.js environment. Otherwise, compile into a CommonJS module.
- [Alternative solution](https://stackoverflow.com/questions/48158730/extend-javascript-promise-and-resolve-or-reject-it-inside-constructor)
