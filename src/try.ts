export class Try {
  static from<T, E extends Error>(fn: TryFn<T>): TryResult<T, E> {
    try {
      return [null, fn()];
    } catch (error) {
      return [new TryError(error as E), null];
    }
  }

  static async fromAsync<T, E extends Error>(
    fn: TryAsyncFn<T>
  ): Promise<TryResult<T, E>> {
    try {
      return [null, await fn()];
    } catch (error) {
      return [new TryError(error as E), null];
    }
  }
}

export class TryError<E extends Error> extends Error {
  cause: E;

  constructor(cause: E) {
    super("Try failed");
    this.name = "TryError";
    this.cause = cause;
  }
}

export type TryFn<T> = () => T;

export type TryAsyncFn<T> = () => Promise<T>;

export type TryResult<T, E extends Error> = [null, T] | [TryError<E>, null];
