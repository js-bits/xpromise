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
     * @param {(resolve:Resolve<T>, reject:Reject, ...rest:unknown[]) => void} executor
     */
    constructor(executor: (resolve: Resolve<T>, reject: Reject, ...rest: unknown[]) => void);
    /**
     * @param {...unknown} args
     * @returns {ExtendablePromise<T>}
     */
    execute(...args: unknown[]): ExtendablePromise<T>;
    /**
     * @param {T} result
     * @returns {ExtendablePromise<T>}
     */
    resolve(result: T): ExtendablePromise<T>;
    /**
     * @param {Error} reason
     * @returns {ExtendablePromise<T>}
     */
    reject(reason: Error): ExtendablePromise<T>;
}
