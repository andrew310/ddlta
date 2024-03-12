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

const parseToken = <T>(schema: Schema.Schema<T, string>) => (token: string) =>
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
  <T>(schema: Schema.Schema<T, string>) => (state: State) =>
    Effect.gen(function* (_) {
      const tokens = Tuple.getFirst(state);
      const nodes = Tuple.getSecond(state);

      const token = yield* _(
        Chunk.head(tokens).pipe(
          Effect.match({
            onSuccess: (x) => Effect.succeed(x),
            onFailure: () => Effect.fail(new Error("Unexpected end of input")),
          }),
          Effect.flatten,
        ),
      );
      const node = yield* _(parseToken(schema)(token));

      return State([Chunk.drop(1)(tokens), [...nodes, node] as Tokens.Node[]]);
    });

type ConsumeFn<T> = (state: State) => Effect.Effect<State, Error, never>;

interface RuleConfig {
  _kind: string;
}

type RuleArgs1 = ConsumeFn<any>[];
type RuleArgs2 = [...ConsumeFn<any>[], RuleConfig];
type RuleArgs = RuleArgs1 | RuleArgs2;

/**
 * Create a single node from n consume functions
 * @param fns
 * @returns
 */
export const rule = <T, R extends RuleArgs>(
  ...fns: R
) =>
(state: State) =>
  Effect.gen(function* (_) {
    // f last item in fns is a config object
    const config =
      isObject(fns[fns.length - 1]) && "_kind" in fns[fns.length - 1]
        ? fns.pop() as RuleConfig
        : { _kind: "rule" };

    const tokens = Tuple.getFirst(state);
    const nodes = Tuple.getSecond(state);

    let bufferState = State([tokens, []]);

    for (const fn of fns as ConsumeFn<any>[]) {
      bufferState = yield* _(fn(bufferState));
    }

    const node = { ...config, value: Tuple.getSecond(bufferState) };

    return State([Tuple.getFirst(bufferState), [...nodes, node]]);
  });

/**
 * Match one of any number of consume functions
 * @param fns
 * @returns
 */
export const alt = <T>(...fns: ConsumeFn<T>[]) => (state: State) =>
  Effect.gen(function* (_) {
    for (const fn of fns) {
      const result = yield* _(
        fn(state).pipe(
          Effect.match({
            onSuccess: (x) => Option.some(x),
            onFailure: () => Option.none(),
          }),
        ),
      );

      if (Option.isSome(result)) return result.value;
    }
    throw new Error("No alternative matched");
  });

/**
 * Maybe consume a token
 * @param fn
 * @returns
 */
export const opt = <T>(fn: ConsumeFn<T>) => (state: State) =>
  Effect.gen(function* (_) {
    return yield* _(
      fn(state).pipe(
        Effect.match({
          onSuccess: (x) => x,
          onFailure: () => state,
        }),
      ),
    );
  });

type Many = <T>(
  fn: ConsumeFn<T>,
) => (
  state: State,
) => Effect.Effect<State, never, never> | Effect.Effect<State, Error, never>;

export const many: Many = <T>(fn: ConsumeFn<T>) => (state: State) =>
  Effect.gen(function* (_) {
    return yield* _(
      fn(state).pipe(
        Effect.match({
          onSuccess: (x) => many(fn)(x),
          onFailure: () => Effect.succeed(state),
        }),
        Effect.flatten,
      ),
    );
  });

/* -------------------------------------------------------------------------------------------------
 * SQL DDL
 * -----------------------------------------------------------------------------------------------*/

export const CreateTable = rule(consume(Tokens.Create), consume(Tokens.Table), {
  _kind: "CreateTable",
});

export const NotNull = rule(consume(Tokens.Not), consume(Tokens.Null), {
  _kind: "NotNull",
});

export const PrimaryKey = rule(consume(Tokens.Primary), consume(Tokens.Key), {
  _kind: "PrimaryKey",
});

export const Unique = consume(Tokens.Unique);

export const Func = rule(
  consume(Tokens.Identifier),
  consume(Tokens.OpenParen),
  consume(Tokens.CloseParen),
);

export const DefaultArgs = alt(
  consume(Tokens.SingleQuotedValue),
  consume(Tokens.NumberValue),
  Func,
);

export const Default = rule(consume(Tokens.Default), DefaultArgs, {
  _kind: "ColumnDefault",
});
export const Constraint = alt(NotNull, PrimaryKey, Unique, Default);
export const ColumnDef = rule(
  consume(Tokens.Identifier),
  consume(Tokens.DataType),
);
