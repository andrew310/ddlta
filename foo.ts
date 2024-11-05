import { tokenize } from "./src/lexer";

const sample = `
  create table public.task (
    status                  text,
    completed_by_id         integer    references public.users,
    completed_at            timestamp  default now() not null,
    qa_id                   integer    references public.users,
    qa_completed_at         timestamp,
    qa_status               text       default 'qa pending',
    document_effective_date date,
    document_expiry_date    date,
    document_expired        boolean,
    task_id                 uuid       not null,
    workflow_id             uuid       references public.workflow,
    document_id             uuid       references public.document,
    target_id               bigint     not null
  );`;

import { Effect, Chunk, pipe } from "effect";
import * as P from "./src/prelude";

let tokens = Chunk.fromIterable(tokenize(sample));
let state = P.State([tokens, []]);
let result = Effect.runSync(P.DDL(state));

console.log(result);
