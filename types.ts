export type Resolve<T> = (value: T | PromiseLike<T>, ...rest: unknown[]) => void;

export type Reject = (reason?: Error) => void;

export type ExecutorFunc<T> = (resolve: Resolve<T>, reject: Reject, ...rest: unknown[]) => void;
