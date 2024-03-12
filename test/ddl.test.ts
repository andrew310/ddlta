import { expect, test } from "bun:test";
import { Chunk, Effect } from "effect";

import * as P from "../src/prelude";
import * as T from "../src/tokens";
import { createToken } from "../src/tokens";

test("column default -- single quoted value", () => {
  const _default = "default 'foo'";

  const tokens = Chunk.fromIterable(_default.split(" "));
  const state = P.State([tokens, []]);

  const result = Effect.runSync(
    P.Default(state),
  );

  expect(result[1]).toEqual([
    {
      _kind: "ColumnDefault",
      value: [
        {
          _kind: "Default",
          value: "default",
        },
        {
          _kind: "SingleQuotedValue",
          value: "foo",
        },
      ],
    },
  ]);
});

test("column default -- number", () => {
  const _default = "default 4";

  const tokens = Chunk.fromIterable(_default.split(" "));
  const state = P.State([tokens, []]);

  const result = Effect.runSync(
    P.Default(state),
  );

  // @todo: fix this
  expect(result[1]).toEqual([
    {
      _kind: "rule",
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
