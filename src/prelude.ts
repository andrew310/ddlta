import { Schema } from "@effect/schema";
import { Chunk, Data, Effect, Option, pipe, Tuple } from "effect";
import { isObject } from "effect/Predicate";
import * as Tokens from "./tokens";

/* -------------------------------------------------------------------------------------------------
 * State
 * -----------------------------------------------------------------------------------------------*/

export type State = [Chunk.Chunk<string>, Tokens.Node[]];
export const State = Data.case<State>();

/* -------------------------------------------------------------------------------------------------
 *  parse token
 * -----------------------------------------------------------------------------------------------*/

const parseToken =
	<T>(schema: Schema.Schema<T, string>) =>
	(token: string) =>
		pipe(
			token,
			Schema.decodeUnknownOption(schema),
			Option.match({
				onSome: (x) => Effect.succeed(x),
				onNone: () => Effect.fail(new Error(`Unexpected token: ${token}`)),
			}),
		);

class UnexpectedEndOfInput extends Error {
	readonly _tag = "UnexpectedEndOfInput";
}

/**
 * Statefully consume a token from the input
 * @param schema
 * @returns
 */
export const consume =
	<T>(schema: Schema.Schema<T, string>) =>
	(state: State) =>
		Effect.gen(function* () {
			const tokens = Tuple.getFirst(state);
			const nodes = Tuple.getSecond(state);

			const token = yield* Chunk.head(tokens).pipe(
				Effect.match({
					onSuccess: (x) => Effect.succeed(x),
					onFailure: () => Effect.fail(new Error("Unexpected end of input")),
				}),
				Effect.flatten,
			);
			const node = yield* parseToken(schema)(token);

			return State([Chunk.drop(1)(tokens), [...nodes, node] as Tokens.Node[]]);
		});

type ConsumeFn<T> = (state: State) => Effect.Effect<State, Error, never>;

interface RuleConfig {
	_kind: string;
}

type RuleArgs1 = ConsumeFn<unknown>[];
type RuleArgs2 = [RuleConfig, ...ConsumeFn<unknown>[]];
type RuleArgs = RuleArgs1 | RuleArgs2;

/**
 * Create a single node from n consume functions
 * @param fns
 * @returns
 */
export const rule = <T, R extends RuleArgs>(...fns: R) => {
	const config =
		isObject(fns[0]) && "_kind" in fns[0]
			? (fns.shift() as RuleConfig)
			: { _kind: "rule" };

	return (state: State) =>
		Effect.gen(function* () {
			const tokens = Tuple.getFirst(state);
			const nodes = Tuple.getSecond(state);

			let bufferState = State([tokens, []]);

			for (const fn of fns as ConsumeFn<T>[]) {
				bufferState = yield* fn(bufferState);
			}

			const node = { ...config, value: Tuple.getSecond(bufferState) };

			return State([Tuple.getFirst(bufferState), [...nodes, node]]);
		});
};

/**
 * Match one of any number of consume functions
 * @param fns
 * @returns
 */
export const alt =
	<T>(...fns: ConsumeFn<T>[]) =>
	(state: State) =>
		Effect.gen(function* () {
			for (const fn of fns) {
				const result = yield* fn(state).pipe(
					Effect.match({
						onSuccess: (x) => Option.some(x),
						onFailure: () => Option.none(),
					}),
				);

				if (Option.isSome(result)) return result;
			}
			return Option.none<State>();
		}).pipe(
			Effect.map(
				Option.match({
					onSome: (x) => Effect.succeed(x),
					onNone: () => Effect.fail(new Error("No matching token")),
				}),
			),
			Effect.flatten,
		);

/**
 * Maybe consume a token
 * @param fn
 * @returns
 */
export const opt =
	<T>(fn: ConsumeFn<T>) =>
	(state: State) =>
		Effect.gen(function* () {
			return yield* fn(state).pipe(
				Effect.match({
					onSuccess: (x) => x,
					onFailure: () => state,
				}),
			);
		});

type Many = <T>(
	fn: ConsumeFn<T>,
) => (
	state: State,
) => Effect.Effect<State, never, never> | Effect.Effect<State, Error, never>;

export const many: Many =
	<T>(fn: ConsumeFn<T>) =>
	(state: State) =>
		Effect.gen(function* () {
			return yield* fn(state).pipe(
				Effect.match({
					onSuccess: (x) => many(fn)(x),
					onFailure: () => Effect.succeed(state),
				}),
				Effect.flatten,
			);
		});

export const manySep =
	<T>(fn: ConsumeFn<T>, sep: ConsumeFn<T>) =>
	(state: State) =>
		Effect.gen(function* () {
			const sepRule = rule(sep, fn);
			const _rule = rule(fn, many(sepRule));
			return yield* _rule(state);
		});

/* -------------------------------------------------------------------------------------------------
 * SQL DDL
 * -----------------------------------------------------------------------------------------------*/

export const CreateTable = rule(
	{
		_kind: "CreateTable",
	},
	consume(Tokens.Create),
	consume(Tokens.Table),
);

const TableNameBare = consume(Tokens.Identifier);
const TableNameWithSchema = rule(
	{ _kind: "TableNameWithSchema" },
	consume(Tokens.Identifier),
	consume(Tokens.Dot),
	consume(Tokens.Identifier),
);
const TableName = alt(TableNameWithSchema, TableNameBare);

export const NotNull = rule(
	{
		_kind: "NotNull",
	},
	consume(Tokens.Not),
	consume(Tokens.Null),
);

export const PrimaryKey = rule(
	{
		_kind: "PrimaryKey",
	},
	consume(Tokens.Primary),
	consume(Tokens.Key),
);

export const Unique = consume(Tokens.Unique);

export const Func = rule(
	{ _kind: "Function" },
	consume(Tokens.Identifier),
	consume(Tokens.OpenParen),
	consume(Tokens.CloseParen),
);

export const DefaultArgs = alt(
	consume(Tokens.SingleQuotedValue),
	consume(Tokens.NumberValue),
	Func,
);

export const Default = rule(
	{ _kind: "ColumnDefault" },
	consume(Tokens.Default),
	DefaultArgs,
);

export const Constraint = alt(NotNull, PrimaryKey, Unique, Default);
export const ColumnDef = rule(
	consume(Tokens.Identifier),
	consume(Tokens.DataType),
);

const ColumnName = consume(Tokens.Identifier);

export const Column = rule(
	{ _kind: "Column" },
	ColumnName,
	consume(Tokens.DataType),
	many(Constraint),
);

export const Columns = rule(
	{ _kind: "Columns" },
	manySep(Column, consume(Tokens.Comma)),
);

export const DDL = rule(
	{ _kind: "DDL" },
	CreateTable,
	TableName,
	consume(Tokens.OpenParen),
	Columns,
	consume(Tokens.CloseParen),
);
