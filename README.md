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

- [Alternative solution](https://stackoverflow.com/questions/48158730/extend-javascript-promise-and-resolve-or-reject-it-inside-constructor)
- Internet Explorer is not supported.
