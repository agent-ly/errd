// https://github.com/OliverBrotchie/optionals

export function Ok<T, E extends Error = Error>(input?: T): Result<T, E> {
  return new Result<T, E>(input as T);
}

export function Err<T, E extends Error = Error>(
  input: E | string
): Result<T, E> {
  if (typeof input === "string") input = new Error(input) as E;
  return new Result<T, E>(input);
}

Object.defineProperty(Ok, Symbol.hasInstance, {
  value: (instance: unknown) => instance instanceof Result && instance.isOk(),
});

Object.defineProperty(Err, Symbol.hasInstance, {
  value: (instance: unknown) => instance instanceof Result && instance.isErr(),
});

export class Result<T, E extends Error = Error> {
  static from<T, E extends Error = Error>(fn: ResultFromFn<T>): Result<T, E> {
    try {
      return new Result<T, E>(fn());
    } catch (error) {
      return new Result<T, E>(error as E);
    }
  }

  static async fromAsync<T, E extends Error = Error>(
    fn: ResultFromAsyncFn<T>
  ): Promise<Result<T, E>> {
    try {
      return new Result<T, E>(await fn());
    } catch (error) {
      return new Result<T, E>(error as E);
    }
  }

  #value: T | E;

  constructor(input: T | E) {
    this.#value = input;
  }

  get [Symbol.toStringTag]() {
    return this.isOk()
      ? `Result(${this.#value})`
      : `Result(${(this.#value as E).name})`;
  }

  isErr(): boolean {
    return this.#value instanceof Error;
  }

  isOk(): boolean {
    return !this.isErr();
  }

  expect(message: string): T {
    if (this.isErr()) throw new Error(message);
    return this.#value as T;
  }

  expectErr(message: string): E {
    if (this.isOk()) throw new Error(message);
    return this.#value as E;
  }

  unwrap(): T {
    if (this.isErr())
      throw new ResultUnwrapError<T, E>(
        `Unwrap called on ${(this.#value as E).name}`,
        this.#value as E
      );
    return this.#value as T;
  }

  unwrapErr(): E {
    if (this.isOk())
      throw new ResultUnwrapError<T, E>(
        "UnwrapErr called on a non-error value",
        this.#value as T
      );
    return this.#value as E;
  }

  unwrapOr(value: T): T {
    return this.isErr() ? value : (this.#value as T);
  }

  unwrapOrElse(fn: ResultOrElseFn<T, E>): T {
    return this.isErr() ? fn(this.#value as E) : (this.#value as T);
  }

  map<U>(fn: ResultMapFn<T, U>): Result<U, E> {
    return this.isOk()
      ? new Result<U, E>(fn(this.#value as T))
      : (this as unknown as Result<U, E>);
  }

  mapErr<F extends Error>(fn: ResultMapErrFn<E, F>): Result<T, F> {
    return this.isErr()
      ? new Result<T, F>(fn(this.#value as E))
      : (this as unknown as Result<T, F>);
  }

  mapOr<U>(value: U, fn: ResultMapFn<T, U>): U {
    return this.isOk() ? fn(this.#value as T) : value;
  }

  or(result: Result<T, E>): Result<T, E> {
    return this.isOk() ? this : result;
  }

  peek(): T | E {
    return this.#value;
  }

  throw(): void {
    if (this.isErr()) throw this.#value;
  }
}

export class ResultUnwrapError<T, E extends Error = Error> extends Error {
  cause: T | E;

  constructor(message: string, cause: T | E) {
    super(message);
    this.name = "ResultUnwrapError";
    this.cause = cause;
  }
}

export type ResultFromFn<T> = () => T;

export type ResultFromAsyncFn<T> = () => Promise<T>;

export type ResultOrElseFn<T, E extends Error = Error> = (error: E) => T;

export type ResultMapFn<T, U> = (value: T) => U;

export type ResultMapErrFn<E extends Error = Error, F extends Error = Error> = (
  error: E
) => F;

export default Result;
