import { expect, test } from "bun:test";

import { CreateTableLexer } from "../src/lex";
import { CreateTableParser } from "../src/parse";

const ddl = `create table public.task
(
    id                      uuid       default uuid_generate_v4() not null primary key,
    status                  text,
    completed_by_id         integer    references public.users,
    completed_at            timestamp  default now() not null,
    qa_id                   integer    references public.users,
    qa_completed_at         timestamp,
    qa_status               text,
    document_effective_date date,
    document_expiry_date    date,
    document_expired        boolean,
    task_id                 uuid       not null,
    workflow_id             uuid       references public.workflow,
    document_id             uuid       references public.document,
    target_id               bigint     not null
);`;

test("parse", () => {
  const lexResult = CreateTableLexer.tokenize(ddl);
  const parser = new CreateTableParser();
  parser.input = lexResult.tokens;

  const cst = parser.createTable();

  expect(parser.errors).toStrictEqual([]);

  // @ts-expect-error
  expect(cst.children.table[0].children.Identifier.map((x) => x.image))
    .toStrictEqual([
      "public",
      "task",
    ]);

  expect(
    // @ts-expect-error
    cst.children.columnDefinitions.map((x) => x.children.Identifier[0].image),
  )
    .toStrictEqual([
      "id",
      "status",
      "completed_by_id",
      "completed_at",
      "qa_id",
      "qa_completed_at",
      "qa_status",
      "document_effective_date",
      "document_expiry_date",
      "document_expired",
      "task_id",
      "workflow_id",
      "document_id",
      "target_id",
    ]);
});
