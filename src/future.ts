export class Future<T, E> implements Promise<T> {
    [Symbol.toStringTag]: string = "Future";
    private promise: Promise<T>;
    // @ts-expect-error - ts doesn't think it's defined, but it is
    public resolve: (value: T | PromiseLike<T>) => void;
    // @ts-expect-error - ts doesn't think it's defined, but it is
    public reject: (reason?: E | PromiseLike<E>) => void;

    constructor(
        executor?: (
            resolve: (value: T | PromiseLike<T>) => void,
            reject: (reason?: E | PromiseLike<E>) => void,
        ) => void,
    ) {
        if (executor) {
            this.promise = new Promise(executor);
            this.resolve = Promise.resolve;
            this.reject = Promise.reject;
        } else {
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
        }
    }

    then<TResult1 = T, TResult2 = E>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: E) => TResult2 | PromiseLike<TResult2>) | null | undefined,
    ): Promise<TResult1 | TResult2> {
        return this.promise.then(onfulfilled, onrejected);
    }

    catch<TResult = E>(
        onrejected?: ((reason: E) => TResult | PromiseLike<TResult>) | null | undefined,
    ): Promise<T | TResult> {
        return this.promise.catch(onrejected);
    }

    finally(onfinally?: (() => void) | null | undefined): Promise<T> {
        return this.promise.finally(onfinally);
    }
}
