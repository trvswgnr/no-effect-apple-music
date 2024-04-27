export class Result<T, E> {
	private readonly _ok_value: T | null = null;
	private readonly _err_value: E | null = null;

	constructor(ok_value: any, err_value: any) {
		this._ok_value = ok_value ?? null;
		this._err_value = err_value ?? null;
	}

	isOk(): this is Result<NonNullable<T>, null> {
		return this._ok_value !== null;
	}

	isErr(): this is Result<null, NonNullable<E>> {
		return this._err_value !== null;
	}

	unwrap(): T {
		if (this._ok_value) {
			return this._ok_value;
		}
		throw new Error(`called \`Result.unwrap()\` on \`Err\` value: ${this._err_value}`);
	}

	unwrapErr(): E {
		if (this._err_value) {
			return this._err_value;
		}
		throw new Error(`called \`Result.unwrapErr()\` on \`Ok\` value: ${this._ok_value}`);
	}

	unwrapOr<U>(defaultValue: U): T | U {
		if (this.isOk()) {
			return this._ok_value!;
		}
		return defaultValue;
	}

	unwrapOrElse(fn: (err: E) => T): T;
	unwrapOrElse<U>(fn: (err: E) => U): T | U;
	unwrapOrElse(fn: (err: any) => any) {
		if (this.isOk()) {
			return this._ok_value!;
		}
		return fn(this._err_value!);
	}

	map<U>(fn: (value: T) => U): Result<U, E> {
		if (this.isOk()) {
			return Ok(fn(this._ok_value!));
		}
		return Err(this._err_value!);
	}

	mapOr<U>(fn: (value: T) => U, defaultValue: U): U {
		if (this.isOk()) {
			return fn(this._ok_value!);
		}
		return defaultValue;
	}

	mapOrElse<U>(_default: (e: E) => U, fn: (t: T) => U): U {
		if (this.isOk()) {
			return fn(this._ok_value!);
		}
		return _default(this._err_value!);
	}

	err(): Option<E & {}> {
		if (this.isErr()) {
			return Option.Some(this._err_value!);
		}
		return Option.None();
	}

	static Ok<T, E>(value: T): Result<T, E> {
		return new Result(value, null);
	}

	static Err<T, E>(value: E): Result<T, E> {
		return new Result(null, value);
	}

	static of<T>(fn: () => T): Result<T, Error> {
		try {
			return Ok(fn());
		} catch (e) {
			const err = e instanceof Error ? e : new Error(String(e));
			return Err(err);
		}
	}
}

declare const error: unique symbol;

export function Ok<T, E>(value: T): Result<T, E> {
	return new Result(value, null);
}

export function Err<T, E>(value: E): Result<T, E> {
	return new Result(null, value);
}

export function Try<T, E>(fn: () => T): Result<T, E> {
	try {
		return Ok(fn());
	} catch (e) {
		return Err(e as E);
	}
}

export class Option<T extends {}> {
	private readonly _value: T | null = null;

	constructor(value: T | null) {
		this._value = value;
	}

	isSome(): boolean {
		return this._value !== null;
	}

	isNone(): boolean {
		return this._value === null;
	}

	okOr<E>(e: E): Result<T, E> {
		if (this.isSome()) {
			return Result.Ok(this._value!);
		}
		return Result.Err(e);
	}

	unwrap(): T {
		if (this._value !== null) {
			return this._value;
		}
		throw new Error("called `Option.unwrap()` on a `None` value");
	}

	unwrapOr<U>(defaultValue: U): T | U {
		return this.isSome() ? this._value! : defaultValue;
	}

	unwrapOrElse<U>(fn: () => U): T | U {
		return this.isSome() ? this._value! : fn();
	}

	map<U extends {}>(fn: (value: T) => U): Option<U> {
		if (this.isSome()) {
			return new Option(fn(this._value!));
		}
		return new Option<U>(null);
	}

	mapOr<U>(fn: (value: T) => U, defaultValue: U): U {
		if (this.isSome()) {
			return fn(this._value!);
		}
		return defaultValue;
	}

	mapOrElse<U>(fn: (value: T) => U, defaultFn: () => U): U {
		if (this.isSome()) {
			return fn(this._value!);
		}
		return defaultFn();
	}

	static Some<T extends {}>(value: T): Option<T> {
		return new Option(value);
	}

	static None<T extends {}>(): Option<T> {
		return new Option<T>(null);
	}

	static of<T extends {}>(value: Nullable<T>): Option<T> {
		if (value === null || value === undefined) {
			return Option.None();
		}
		return Option.Some(value);
	}
}

export function Some<T extends {}>(value: T): Option<T> {
	return Option.Some(value);
}

export function None<T extends {}>(): Option<T> {
	return Option.None();
}

type Nullable<T> = T | null | undefined;
