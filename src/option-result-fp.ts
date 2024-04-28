/*
```ocaml
type ('a, 'e) t = ('a, 'e) result = 
|Ok of 'a
|Error of 'e
```
*/

namespace Result {
    export type Result<T, E> = Ok<T> | Err<E>;
    type Ok<T> = { type: "Ok"; value: T };
    type Err<E> = { type: "Error"; value: E };

    export function of<T>(fn: () => T): Result<T, Error> {
        try {
            return Ok(fn());
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            return Err(err);
        }
    }

    export function Ok<T, E>(value: T): Result<T, E> {
        return { type: "Ok", value };
    }

    export function Err<T, E>(value: E): Result<T, E> {
        return { type: "Error", value };
    }
}
