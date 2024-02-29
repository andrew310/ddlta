import { expect, test } from "bun:test";
import { CreateTableLexer } from "../src/lex";

test("lex", () => {
  const ddl =
    `create table public.task (id serial, name text not null,done boolean, completedAt timestamp);`;
  const lexResult = CreateTableLexer.tokenize(ddl);
  expect(lexResult.errors).toStrictEqual([]);
  const tokens = lexResult.tokens.map((t) => t.tokenType.name);
  expect(tokens).toStrictEqual([
    "CreateTable",
    "Identifier",
    "Dot",
    "Identifier",
    "Lparen",
    "Identifier",
    "Serial",
    "Comma",
    "Identifier",
    "Text",
    "NotNull",
    "Comma",
    "Identifier",
    "Boolean",
    "Comma",
    "Identifier",
    "Timestamp",
    "Rparen",
    "SemiColon",
  ]);
});
