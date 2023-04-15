// https://github.com/OliverBrotchie/optionals

export const NONE = Symbol("None");

export function Some<T>(input: T): Option<T> {
  return new Option<T>(input);
}

export function None<T>(): Option<T> {
  return new Option<T>(NONE);
}

Object.defineProperty(Some, Symbol.hasInstance, {
  value: (instance: unknown) => instance instanceof Option && instance.isSome(),
});

Object.defineProperty(None, Symbol.hasInstance, {
  value: (instance: unknown) => instance instanceof Option && instance.isNone(),
});

export class Option<T> {
  static from<T>(fn: OptionFromFn<T>): Option<T> {
    const value = fn();
    return value === null || value === undefined ? None() : Some(value);
  }

  static async fromAsync<T>(fn: OptionFromAsyncFn<T>): Promise<Option<T>> {
    const value = await fn();
    return value === null || value === undefined ? None() : Some(value);
  }

  #value: T | typeof NONE;

  constructor(input: T | typeof NONE) {
    this.#value = input;
  }

  get [Symbol.toStringTag]() {
    return this.isNone() ? "Option(None)" : `Option(${this.#value as T})`;
  }

  isNone(): boolean {
    return this.#value === NONE;
  }

  isSome(): boolean {
    return !this.isNone();
  }

  expect(message: string): T {
    if (this.isNone()) throw new Error(message);
    return this.#value as T;
  }

  unwrap(): T {
    if (this.isNone()) throw new OptionUnwrapError();
    return this.#value as T;
  }

  unwrapOr(value: T): T {
    return this.isNone() ? value : (this.#value as T);
  }

  unwrapOrElse(fn: OptionOrElseFn<T>): T {
    return this.isNone() ? fn() : (this.#value as T);
  }

  map<U>(fn: OptionMapFn<T, U>): Option<U> {
    return this.isSome() ? Some(fn(this.#value as T)) : None();
  }

  mapOr<U>(value: U, fn: OptionMapFn<T, U>): U {
    return this.isSome() ? fn(this.#value as T) : value;
  }

  or(option: Option<T>): Option<T> {
    return this.isSome() ? this : option;
  }

  peek(): T | typeof NONE {
    return this.#value;
  }
}

export class OptionUnwrapError extends Error {
  constructor() {
    super("Unwrap called on None");
    this.name = "OptionUnwrapError";
  }
}

export type OptionFromFn<T> = () => T | null | undefined;

export type OptionFromAsyncFn<T> = () => Promise<T | null | undefined>;

export type OptionOrElseFn<T> = () => T;

export type OptionMapFn<T, U> = (value: T) => U;
