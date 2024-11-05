import { expect, test } from "bun:test";
import { Chunk, Effect } from "effect";

import * as P from "../src/prelude";
import * as T from "../src/tokens";
import { createToken } from "../src/tokens";

test("column default -- number", () => {
	const _default = "default 4";

	const tokens = Chunk.fromIterable(_default.split(" "));
	const state = P.State([tokens, []]);
	const result = Effect.runSync(P.Default(state));

	// @todo: fix this
	expect(result[1]).toEqual([
		{
			_kind: "ColumnDefault",
			value: [
				{
					_kind: "Default",
					value: "default",
				},
				// @ts-expect-error
				4,
			],
		},
	]);
});

test("column default -- now()", () => {
	const tokens = Chunk.fromIterable(["default", "now", "(", ")"]);
	const state = P.State([tokens, []]);

	const result = Effect.runSync(P.Default(state));

	expect(result[1]).toEqual([
		{
			_kind: "ColumnDefault",
			value: [
				{
					_kind: "Default",
					value: "default",
				},
				{
					_kind: "Function",
					value: [
						{
							_kind: "Identifier",
							value: "now",
						},
						{
							_kind: "OpenParen",
							value: "(",
						},
						{
							_kind: "CloseParen",
							value: ")",
						},
					],
				},
			],
		},
	]);
});

test("Column -- int not null unique", () => {
	const tokens = ["foo", "int", "not", "null", "unique"];
	const state = P.State([Chunk.fromIterable(tokens), []]);
	const result = Effect.runSync(P.Column(state));

	expect(result[1]).toEqual([
		{
			_kind: "Column",
			value: [
				{ _kind: "Identifier", value: "foo" },
				{ _kind: "DataType", value: "int" },
				{
					_kind: "NotNull",
					value: [
						{ _kind: "Not", value: "not" },
						{ _kind: "Null", value: "null" },
					],
				},
				{ _kind: "Unique", value: "unique" },
			],
		},
	]);
});

test("Columns", () => {
	const tokens = [
		"id",
		"serial",
		"primary",
		"key",
		",",
		"foo",
		"int",
		"not",
		"null",
		"unique",
		",",
		"bar",
		"text",
	];
	const state = P.State([Chunk.fromIterable(tokens), []]);
	const result = Effect.runSync(P.Columns(state));

	expect(result[1]).toEqual([
		{
			_kind: "Columns",
			value: [
				{
					_kind: "rule",
					value: [
						{
							_kind: "Column",
							value: [
								{
									_kind: "Identifier",
									value: "id",
								},
								{
									_kind: "DataType",
									value: "serial",
								},
								{
									_kind: "PrimaryKey",
									value: [
										{
											_kind: "Primary",
											value: "primary",
										},
										{
											_kind: "Key",
											value: "key",
										},
									],
								},
							],
						},
						{
							_kind: "rule",
							value: [
								{
									_kind: "Comma",
									value: ",",
								},
								{
									_kind: "Column",
									value: [
										{
											_kind: "Identifier",
											value: "foo",
										},
										{
											_kind: "DataType",
											value: "int",
										},
										{
											_kind: "NotNull",
											value: [
												{
													_kind: "Not",
													value: "not",
												},
												{
													_kind: "Null",
													value: "null",
												},
											],
										},
										{
											_kind: "Unique",
											value: "unique",
										},
									],
								},
							],
						},
						{
							_kind: "rule",
							value: [
								{
									_kind: "Comma",
									value: ",",
								},
								{
									_kind: "Column",
									value: [
										{
											_kind: "Identifier",
											value: "bar",
										},
										{
											_kind: "DataType",
											value: "text",
										},
									],
								},
							],
						},
					],
				},
			],
		},
	]);
});

test("CreateTable", () => {
	const tokens = ["create", "table", "("];
	const state = P.State([Chunk.fromIterable(tokens), []]);
	const result = Effect.runSync(P.CreateTable(state));
	expect(result[1]).toEqual([
		{
			_kind: "CreateTable",
			value: [
				{ _kind: "Create", value: "create" },
				{ _kind: "Table", value: "table" },
			],
		},
	]);
});
