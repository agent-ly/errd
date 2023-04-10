# errd

> Collection of error handling utilities for JavaScript and TypeScript.

## Usage

```ts
import { Ok /* Err, type Result */ } from "errd/result";
const result = Ok(42);
if (result.isOk()) console.log(result.unwrap());
else console.error(result.unwrapErr());
```

```ts
import { Some /* None, type Option */ } from "errd/option";
const maybe = Some(1);
if (maybe.isSome()) console.log(result.unwrap());
else console.log("none");
```

```ts
import Try from "errd/try";
const [err, result] = Try.from(() => 42);
const [err2, result2] = Try.fromAsync(() => fetch("https://..."));
```

```ts
import {
  normalizeError /* isError, isErrnoException, isErrorLike, */,
} from "errd/util";
try {
  throw new Error("oops");
} catch (error) {
  normalized = normalizeError(error);
  console.error(error);
}
```
