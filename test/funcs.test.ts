import { expect, test } from "bun:test";
import { Chunk, Effect } from "effect";

import * as P from "../src/prelude";
import * as T from "../src/tokens";

const Digimon = T.createToken(/digimon/i, "CardGame");
const Pokemon = T.createToken(/pokemon/i, "CardGame");

test("consume", () => {
	const tokens = Chunk.fromIterable(["digimon"]);
	const state = P.State([tokens, []]);

	const result = Effect.runSync(P.consume(Digimon)(state));

	expect(result[1]).toEqual([{ _kind: "CardGame", value: "digimon" }]);

	expect(() => Effect.runSync(P.consume(Pokemon)(state))).toThrow(
		new Error("Unexpected token: digimon"),
	);
});

test("alt", () => {
	const tokens = Chunk.fromIterable(["digimon"]);
	const state = P.State([tokens, []]);

	const result = Effect.runSync(
		P.alt(P.consume(Pokemon), P.consume(Digimon))(state),
	);

	expect(result[1]).toEqual([{ _kind: "CardGame", value: "digimon" }]);
});

test("rule", () => {
	const tokens = Chunk.fromIterable(["digimon", "pokemon"]);
	const state = P.State([tokens, []]);

	const result = Effect.runSync(
		P.rule(P.consume(Digimon), P.consume(Pokemon))(state),
	);

	expect(result[1]).toEqual([
		{
			_kind: "rule",
			value: [
				{ _kind: "CardGame", value: "digimon" },
				{ _kind: "CardGame", value: "pokemon" },
			],
		},
	]);
});

test("rule -- with label", () => {
	const tokens = Chunk.fromIterable(["digimon", "pokemon"]);
	const state = P.State([tokens, []]);

	const result = Effect.runSync(
		P.rule(
			{ _kind: "card-games" },
			P.consume(Digimon),
			P.consume(Pokemon),
		)(state),
	);

	expect(result[1]).toEqual([
		{
			_kind: "card-games",
			value: [
				{ _kind: "CardGame", value: "digimon" },
				{ _kind: "CardGame", value: "pokemon" },
			],
		},
	]);
});

test("opt", () => {
	const tokens = Chunk.fromIterable(["digimon"]);
	const state = P.State([tokens, []]);

	const result = Effect.runSync(
		P.rule(P.consume(Digimon), P.opt(P.consume(Pokemon)))(state),
	);

	expect(result[1]).toEqual([
		{
			_kind: "rule",
			value: [{ _kind: "CardGame", value: "digimon" }],
		},
	]);

	const result2 = Effect.runSync(P.opt(P.consume(Pokemon))(state));

	expect(result2[1]).toEqual([]);
});

test("many", () => {
	const tokens = ["foo", "bar", "baz", "1"];

	const state = P.State([Chunk.fromIterable(tokens), []]);

	const fn = P.consume(T.Identifier);

	const result = Effect.runSync(P.many(fn)(state));

	expect(result[1]).toEqual([
		{ _kind: "Identifier", value: "foo" },
		{ _kind: "Identifier", value: "bar" },
		{ _kind: "Identifier", value: "baz" },
	]);
});

test("manySep", () => {
	const tokens = ["foo", ",", "bar", ",", "baz"];
	const state = P.State([Chunk.fromIterable(tokens), []]);
	const fn = P.consume(T.Identifier);
	const result = Effect.runSync(P.manySep(fn, P.consume(T.Comma))(state));

	expect(result[1]).toEqual([
		{
			_kind: "rule",
			value: [
				{ _kind: "Identifier", value: "foo" },
				{
					_kind: "rule",
					value: [
						{ _kind: "Comma", value: "," },
						{ _kind: "Identifier", value: "bar" },
					],
				},
				{
					_kind: "rule",
					value: [
						{ _kind: "Comma", value: "," },
						{ _kind: "Identifier", value: "baz" },
					],
				},
			],
		},
	]);
});
