export default ExtendablePromise;
export type Resolve<T> = (value: T | PromiseLike<T>, ...rest: unknown[]) => void;
export type Reject = (reason?: Error) => void;
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
declare class ExtendablePromise<T> extends Promise<T> {
    /**
     * @type {'ExtendablePromise|InstantiationError'}
     * @readonly
     */
    static readonly InstantiationError: 'ExtendablePromise|InstantiationError';
    /**
     * @type {'ExtendablePromise|ExecutionError'}
     * @readonly
     */
    static readonly ExecutionError: 'ExtendablePromise|ExecutionError';
    /**
     * Creates new `ExtendablePromise` instance.
     * @param {(resolve:Resolve<T>, reject:Reject, ...rest:unknown[]) => void} executor - A function to be executed by the `.execute()` method
     * @throws {typeof ExtendablePromise.InstantiationError}
     */
    constructor(executor: (resolve: Resolve<T>, reject: Reject, ...rest: unknown[]) => void);
    /**
     * Executes `executor` function provided to `ExtendablePromise` constructor.
     * All arguments will be passed through to `executor` function.
     * @returns {this}
     * @throws {typeof ExtendablePromise.ExecutionError}
     */
    execute(...args: unknown[]): this;
    /**
     * Resolves `ExtendablePromise`
     * @param result
     * @returns {this}
     */
    resolve(result: T): this;
    /**
     * Rejects `ExtendablePromise`
     * @param reason
     * @returns {this}
     */
    reject(reason: Error): this;
    [UniqueSymbols.UNIQUE_SYMBOL1]: Resolve<T>;
    [UniqueSymbols.UNIQUE_SYMBOL2]: Reject;
    [UniqueSymbols.UNIQUE_SYMBOL0]: (resolve: Resolve<T>, reject: Reject, ...rest: unknown[]) => void;
}

import * as UniqueSymbols from '@js-bits/enumerate/types/unique-symbols';
