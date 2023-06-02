declare const _default: typeof ExtendablePromise & ErrorsEnum;
export default _default;
export type ErrorsEnum = {
    InstantiationError: 'ExtendablePromise|InstantiationError';
    ExecutionError: 'ExtendablePromise|ExecutionError';
};
declare class ExtendablePromise extends Promise<any> {
    /**
     * @param {Function} executor
     */
    constructor(executor: Function, ...rest: unknown[]);
    /**
     * @param {...any} args
     * @returns {ExtendablePromise}
     */
    execute(...args: any[]): ExtendablePromise;
    /**
     * @param {unknown} result
     * @returns {ExtendablePromise}
     */
    resolve(result: unknown, ...rest: unknown[]): ExtendablePromise;
    /**
     * @param {Error} reason
     * @returns {ExtendablePromise}
     */
    reject(reason: Error, ...args: unknown[]): ExtendablePromise;
}
