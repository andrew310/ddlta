import { Lexer } from "chevrotain";

import * as tokens from "./tokens";

const CreateTableLexer = new Lexer([
  tokens.WhiteSpace,
  tokens.CreateTable,
  tokens.SemiColon,
  tokens.Lparen,
  tokens.Rparen,
  tokens.Comma,
  tokens.Dot,

  tokens.Now,
  tokens.UuidGenerateV4,
  tokens.Function,

  tokens.Int,
  tokens.Text,
  tokens.Serial,
  tokens.Bigint,
  tokens.Date,
  tokens.Timestamp,
  tokens.Boolean,
  tokens.Uuid,
  tokens.ColumnType,

  // constraints in any order
  tokens.NotNull,
  tokens.Null,
  tokens.PrimaryKey,
  tokens.Constraint,

  // more constraints that will require a subrule
  tokens.Default,
  tokens.References,

  tokens.Identifier,
], { ensureOptimizations: true });

export { CreateTableLexer };
