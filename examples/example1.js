import ExtendablePromise from '../index.js';
// const ExtendablePromise = require('../dist/index.cjs');

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
