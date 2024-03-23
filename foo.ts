import { Chunk, Effect, pipe } from "effect";

import * as P from "./src/prelude";
import * as T from "./src/tokens";

const ddl =
  `create table public.task (id serial, name text not null,done boolean, completedAt timestamp);`;

const CreateTable = P.rule(P.consume(T.Create), P.consume(T.Table));
const TableNameWithSchema = P.rule(
  P.consume(T.Identifier),
  P.consume(T.Dot),
  P.consume(T.Identifier),
);

const TableName = P.consume(T.Identifier);

const Table = P.alt(TableNameWithSchema, TableName);

const ColumnName = P.consume(T.Identifier);

export { CreateTable, Table };

/* -------------------------------------------------------------------------------------------------
 * Scratch
 * -----------------------------------------------------------------------------------------------*/

// const tokens = Chunk.fromIterable(ddl.split(/\s+/));
const tokens = [
  "create",
  "table",
  "foo.bar",
  "(",
  "id",
  "serial",
  "primary",
  "key",
  "not",
  "null",
  ",",
  "name",
  "text",
  "not",
  "null",
  "done",
  "boolean",
  "completedAt",
  "timestamp",
  ")",
];
const state = P.State([Chunk.fromIterable(tokens), []]);

const Column = P.rule(ColumnName, P.consume(T.DataType), P.many(P.Constraint), {
  _kind: "Column",
});

const Columns = P.many(Column);

const result = Effect.runSync(
  CreateTable(state).pipe(
    Effect.flatMap(Table),
    Effect.flatMap(P.consume(T.OpenParen)),
    Effect.flatMap(Columns),
  ),
);

console.log(result);
