// https://github.com/vercel/vercel/tree/main/packages/error-utils

export const isObject = (object: unknown): object is Record<string, unknown> =>
  typeof object === "object" && object !== null;

export const isErrorLike = (error: unknown): error is ErrorLike =>
  isObject(error) && "message" in error;

export const isError = (error: unknown): error is Error => {
  if (!isObject(error)) return false;

  // Check for `Error` objects instantiated within the current global context.
  if (error instanceof Error) return true;

  // Walk the prototype tree until we find a matching object.
  while (error) {
    if (Object.prototype.toString.call(error) === "[object Error]") return true;
    error = Object.getPrototypeOf(error);
  }

  return false;
};

export const isErrnoException = (error: unknown): error is ErrnoException =>
  isError(error) && "code" in error;

export const isSpawnError = (error: unknown): error is SpawnError =>
  isErrnoException(error) && "spawnargs" in error;

export const errorToString = (error: unknown, fallback?: string): string => {
  if (isError(error) || isErrorLike(error)) return error.message;

  if (typeof error === "string") return error;

  return fallback ?? "An unknown error has ocurred.";
};

export const normalizeError = (error: unknown): Error => {
  if (isError(error)) return error;
  const errorMessage = errorToString(error);
  return isErrorLike(error)
    ? Object.assign(new Error(errorMessage), error)
    : new Error(errorMessage);
};

export interface ErrorLike {
  message: string;
  name?: string;
  stack?: string;
}

export interface ErrnoException extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
}

export interface SpawnError extends ErrnoException {
  spawnargs: string[];
}
